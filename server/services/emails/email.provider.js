const sendPasswordReset = async (user) => {
    if (process.env.NODE_ENV !== "production") return true;

    try {
        // The provided authorization grant is invalid, expired, or revoked
        const nodemailer = require("nodemailer");

        let transporter = nodemailer.createTransport({
            host: process.env.MAILER_HOST,
            port: process.env.MAILER_PORT,
            secure: process.env.MAILER_SECURE, // true for 465, false for other ports
            auth: {
                user: process.env.MAILER_USER, // generated ethereal user
                pass: process.env.MAILER_PASSWORD, // generated ethereal password
            },
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: process.env.MAILER_USER,
            to: user.email,
            subject: "Teach Learn - Alteração da sua Senha",
            text: `
                Link de ${
                    user.confirmed ? "redefinição" : "ativação"
                } da sua senha: ${
                process.env.NODE_ENV === "production"
                    ? process.env.FRONTEND_URL
                    : "http://localhost:8080"
            }/recuperar/${user.key}
            `,
            html: `Link de ${
                user.confirmed ? "redefinição" : "ativação"
            } da sua senha: ${
                process.env.NODE_ENV === "production"
                    ? process.env.FRONTEND_URL
                    : "http://localhost:8080"
            }/recuperar/${user.key}`,
        });

        // console.log("Message sent: %s", info.messageId);
        return true;
    } catch (err) {
        console.log(err)
        return false;
    }
}

const sendResponseContact = async (user, response) => {
    // using Twilio SendGrid's v3 Node.js Library
    // https://github.com/sendgrid/sendgrid-nodejs
    if (vars.env !== "production") return true;

    try {
        // The provided authorization grant is invalid, expired, or revoked
        const nodemailer = require("nodemailer");

        let transporter = nodemailer.createTransport({
            host: process.env.MAILER_HOST,
            port: process.env.MAILER_PORT,
            secure: process.env.MAILER_SECURE, // true for 465, false for other ports
            auth: {
                user: process.env.MAILER_USER, // generated ethereal user
                pass: process.env.MAILER_PASSWORD, // generated ethereal password
            },
        });

        // send mail with defined transport object
        await transporter.sendMail({
            from: process.env.MAILER_USER,
            to: response.email,
            subject: "Teach Learn - Retorno do seu Contato",
            text: response.content,
            html: response.content,
        });

        return true;
    } catch (err) {
        console.log(err)
        return false;
    }
}

const sendUserConfirmation = async (user) => {
  try {
    if (process.env.NODE_ENV !== "production") return true;
    // The provided authorization grant is invalid, expired, or revoked
    const nodemailer = require("nodemailer");

    let transporter = nodemailer.createTransport({
        host: process.env.MAILER_HOST,
        port: process.env.MAILER_PORT,
        secure: process.env.MAILER_SECURE, // true for 465, false for other ports
        auth: {
            user: process.env.MAILER_USER, // generated ethereal user
            pass: process.env.MAILER_PASSWORD, // generated ethereal password
        },
    });

    // send mail with defined transport object
    await transporter.sendMail({
        from: process.env.MAILER_USER,
        to: user.email,
        subject: "Teach Learn - Ativação da sua Conta",
        text: `
            Bem-vindo a plataforma TeachLearn.
            Aqui estão os seus dados para finalização do cadastro:
            Usuário: ${user.username}
            E-mail: ${user.email}
            Link de Ativação da sua conta:
            ${process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "http://localhost:8080"}/registro/professor/${user.key}
        `,
        html: `
            Bem-vindo a plataforma TeachLearn.
            <br>
            Aqui estão os seus dados para finalização do cadastro:
            <br><br>
            Usuário: ${user.username}<br>
            E-mail: ${user.email}<br>
            <br>
            Link de Ativação da sua conta:<br>
            ${process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "http://localhost:8080"}/registro/professor/${user.key}
        `,
    });

    return true;
  } catch (err) {
      return false;
  }
}

const sendUserActivation = async (user) => {
  try {
    if (process.env.NODE_ENV !== "production") return true
    // The provided authorization grant is invalid, expired, or revoked
    const nodemailer = require("nodemailer");

    let transporter = nodemailer.createTransport({
        host: process.env.MAILER_HOST,
        port: process.env.MAILER_PORT,
        secure: process.env.MAILER_SECURE, // true for 465, false for other ports
        auth: {
            user: process.env.MAILER_USER, // generated ethereal user
            pass: process.env.MAILER_PASSWORD, // generated ethereal password
        },
    });

    // send mail with defined transport object
    await transporter.sendMail({
        from: process.env.MAILER_USER,
        to: user.email,
        subject: "Teach Learn - Confirmação da sua Conta",
        text: `
            Bem-vindo a plataforma TeachLearn.
            Aqui estão os seus dados para finalização do cadastro:
            Usuário: ${user.username}
            E-mail: ${user.email}
            Link de Confirmação da sua conta:
            ${process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "http://localhost:8080"}/registro/confirmar/${user.key}
        `,
        html: `
            Bem-vindo a plataforma TeachLearn.
            <br>
            Aqui estão os seus dados para finalização do cadastro:
            <br><br>
            Usuário: ${user.username}<br>
            E-mail: ${user.email}<br>
            <br>
            Link de Confirmação da sua conta:<br>
            ${process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "http://localhost:8080"}/registro/confirmar/${user.key}
        `,
    });

    return true;
  } catch (err) {
      return false;
  }
}

export default { sendPasswordReset, sendResponseContact, sendUserConfirmation, sendUserActivation };