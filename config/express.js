import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compress from 'compression';
import methodOverride from 'method-override';
import cors from 'cors';
import httpStatus from 'http-status';
import expressWinston from 'express-winston';
import expressValidation from 'express-validation';
import helmet from 'helmet';
import config from './vars';
import logger from './winston/get-default-logger';
import routes from '../server/routes/index.route';
import APIError from '../server/helpers/APIError';
import { fileCleaningScript, ClassroomCodeCleaningScript, StudyGroupDeactivateScript } from '../server/helpers/cronScript';
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import db from '../server/models';


// Define default HTTP logger instance (use default logger instance)
const winstonInstance = logger;

const app = express();

fileCleaningScript();
ClassroomCodeCleaningScript();
StudyGroupDeactivateScript();
// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(compress());
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
// app.use(cors());

// enable CORS - Cross Origin Resource Sharing
app.use(
    cors({
        exposedHeaders: ["Content-Type", "Accept"],
    })
);

// app.use(express.static("uploads"));
app.use('/static', express.static(process.env.NODE_ENV === 'production' ? '/var/www/api.teachlearn.com.br/static' : 'static'))

// This is really just a test output and should be the first thing you see
winstonInstance.info('The application is starting...');

// enable detailed API logging in dev env
if (config.env === 'development') {
    expressWinston.requestWhitelist.push('body');
    expressWinston.responseWhitelist.push('body');
    app.use(expressWinston.logger({
        winstonInstance,
        meta: true, // optional: log meta data about request (defaults to true)
        msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
        colorStatus: true, // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
    }));
}

// Get API Version from .env (or else assume 1.0)
const baseUrl = `/api/v${config.apiVersion}`;

// mount all routes on /api path
app.use(`${baseUrl}`, routes);

// if error is not an instanceOf APIError, convert it.
app.use((err, req, res, next) => {
  if (err instanceof expressValidation.ValidationError) {
      // validation error contains errors which is an array of error each containing message[]
      // const unifiedErrorMessage = err.errors.map((error) => error.messages.join('. ')).join(' and ');
      const error = new APIError(err.details, err.statusCode, true);
      return next(error);
  } if (!(err instanceof APIError)) {
      const apiError = new APIError(err.message, err.statusCode, err.isPublic);
      return next(apiError);
  }
  return next(err);
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new APIError('API not found', httpStatus.NOT_FOUND);
    return next(err);
});

// log error in winston transports except when executing test suite
if (config.env !== 'test') {
    app.use(expressWinston.errorLogger({
        winstonInstance,
    }));
}

// error handler, send stacktrace only during development
app.use((err, req, res, next) => res.status(err.status).json({ // eslint-disable-line no-unused-vars
    message: err.isPublic ? err.message : httpStatus[err.status],
    stack: config.env === 'development' ? err.stack : {},
}));

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: [process.env.FRONTEND_URL],
    },
});

io.use(function (socket, next) {
    if (!!socket.handshake.auth.token) {
        jwt.verify(socket.handshake.auth.token, config.jwtSecret, function (err, decoded) {
            if (err) return next(new Error('Authentication Error'));
            socket.userData = decoded;
            next();
        });
    } else {
        return next(new Error('Authentication Error'));
    }
}).on("connection",async (socket) => {
    const { User_Chat, Chat_Message, User_Chat_Conversation, Study_Group, Study_Group_User, Token_Control, sequelize } = db;
    const foundSession = await User_Chat.findOne({
        where: {UserId: socket.userData.id},
        attributes: ['id', 'session']
    })
    if(foundSession) {
        await foundSession.update({
            session: socket.id,
            connected: false
        })
    } else {
        await User_Chat.create({
            UserId: socket.userData.id,
            session: socket.id,
            connected: false
        })
    }
    socket.join(socket.userData.id);
    socket.on('message', async (data) => {
        const t = await sequelize.transaction();
        try {
            const createdMessage = await Chat_Message.create({
                to: data.to,
                from: data.from,
                message: data.message
            }, { transaction: t })
            if(!createdMessage) {
                throw new Error("Erro ao salvar mensagem no banco de dados")
            }

            const foundNotification = await User_Chat_Conversation.findOne({
                where: {
                    to: data.to,
                    from: data.from
                },
                attributes: ['id', 'unread_messages']
            })
            if(!foundNotification) {
                User_Chat_Conversation.create({
                    to: data.to,
                    from: data.from,
                    active: true,
                    unread_messages: 1
                })
                User_Chat_Conversation.create({
                    to: data.from,
                    from: data.to,
                    active: true,
                    unread_messages: 0
                })
                socket.to(data.to).emit("updateUsersList", {})
            } else {
                foundNotification.update({
                    active: true,
                    unread_messages: foundNotification.unread_messages+1
                })
            }
            
            socket.to(data.to).to(data.from).emit('message', {from: data.from, message: data.message, to: data.to})
            await t.commit();
        }catch(err) {
            console.log(err)
            socket.to(data.from).emit('error', {error: "Message Store error", message:"Houve um erro ao enviar mensagem."})
            await t.rollback();
        }
    })
    socket.on('removeUser', async(data) => {
        socket.to(data.code).emit("exitGroup", {UserId: data.UserId})
    })
    socket.on('joinChat', async(data) => {
        const foundSession = await User_Chat.findOne({
            where: {UserId: data.UserId},
            attributes: ['id']
        })
        if(foundSession) {
            await foundSession.update({
                connected: true
            })
            socket.broadcast.emit("updateUsers", {UserId: data.UserId, online: true})
        }
    })
    socket.on('leaveChat', async(data) => {
        const foundSession = await User_Chat.findOne({
            where: {UserId: data.UserId},
            attributes: ['id']
        })
        if(foundSession) {
            await foundSession.update({
                connected: false
            })
            socket.broadcast.emit("updateUsers", {UserId: data.UserId, online: false})
        }
    })
    socket.on('contentShare', async (data) => {
        const foundGroup = await Study_Group.findOne({
            where: {id: data.id},
            attributes: ['code']
        })
        if(foundGroup) {
            socket.to(foundGroup.code).emit("updateShare", {share: data.data, User: data.User})
        }
    })
    socket.on('joinGroup', async (data) => {
        const foundUser = await Study_Group_User.findOne({
            where: {
                UserId: data.UserId,
                StudyGroupId: data.id,
                active: true
            }, attributes: ['id']
        })
        if(!foundUser) {
            socket.emit('error', "Houve um erro ao acessar grupo")
        } else {
            socket.join(data.code)
            await foundUser.update({
                online: true
            })
            socket.to(data.code).emit("updateUsersGroup", {})
            // io.sockets.to(data.code).emit("updateUsers", {})
        }
    })
    socket.on('leaveGroup', async (data) => {
        if(!!data.id) {
            const foundUser = await Study_Group_User.findOne({
                where: {
                    UserId: data.UserId,
                    StudyGroupId: data.id
                }, attributes: ['id']
            })
            if(!foundUser) {
                socket.emit('error', "Houve um erro ao acessar grupo")
            } else {
                socket.leave(data.code)
                await foundUser.update({
                    online: false
                })
                socket.to(data.code).emit("updateUsersGroup", {})
            }
        }
    })
    socket.on('groupMessage', async (data) => {
        socket.to(data.code).emit('newGroupMessage', {User: data.user, message: data.message, createdAt: new Date()})
    })
});

export default httpServer;
