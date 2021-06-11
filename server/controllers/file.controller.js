import APIError from '../helpers/APIError';
import db from '../models';
import fs from 'fs-extra';
import { writeFile } from 'fs';
import path from 'path';
import replaceSpecialChars from "../helpers/textNormalize";

const { File, Institution, sequelize } = db;

/**
 * Get file list.
 * @returns {File[]}
 */
const listAll = async (req, res, next) => {
  const { user } = req;
  const { limit = 20, page = 1 } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não tem permissão para acessar este local.");
    }

    const files = await File.findAndCountAll({
      attributes: ['id', 'name', 'type', 'UserId', 'InstitutionId'],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    })

    return res.json({
      success: true,
      files: files.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: files.count,
        nextPage: offset + limit <= files.count
      }
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

/**
 * Get file list by UserId.
 * @returns {File[]}
 */
const list = async (req, res, next) => {
  const { user } = req;
  const { limit = 20, page = 1 } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {

    const files = await File.findAndCountAll({
      where: {
        UserId: user.id
      },
      attributes: ['id', 'name', 'type', 'UserId', 'InstitutionId'],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    })

    return res.json({
      success: true,
      files: files.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: files.count,
        nextPage: offset + limit <= files.count
      }
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

/**
 * create file.
 * @body file
 * @body fieldIds -> (index) 0 - Area, 1 - Level, 2 - Course, 3 - Grade, 4 - Subject
 * @body folder -> "feed", "activity", "classroom"
 * @body ClassroomId
 */
const create = async (req, res, next) => {
  const { folder, ClassroomId, fieldIds } = req.body
  const { file, user } = req;
  const t = await sequelize.transaction();
  let filePath = "";
  try {
    if (!fieldIds) {
      throw new APIError("Campo \"fields\" obrigatório.");
    }
    let fields = JSON.parse(fieldIds)

    if (fields.length != 5) {
      throw new APIError("Campo \"fields\" com tamanho incorreto.");
    }
    if (!folder) {
      throw new APIError("Campo \"folder\" obrigatório.");
    }

    let timestamp = new Date;
    const filename = Date.now() + '_' + replaceSpecialChars(path.basename(file.originalname)) + path.extname(file.originalname);
    switch (folder) {
      case "feed":
      case "study_group":
      case "question":
        filePath = 'static/files/' + timestamp.getFullYear() + '/' + timestamp.getMonth() + '/' + folder + '/' + filename;
        break;
      case "classroom":
      case "workshop_class":
        filePath = 'static/files/' + timestamp.getFullYear() + '/' + timestamp.getMonth() + '/' + folder + '/' + filename;
        break;
      case "answer":
        if (!ClassroomId) {
          throw new APIError("Campo \"classroomId\" obrigatório.");
        }
        const institution = await Institution.findOne({ where: user.InstitutionId })
        if (!institution) {
          throw new APIError("Instituição não existe.");
        }
        filePath = 'static/files/' + timestamp.getFullYear() + '/' + timestamp.getMonth() + '/' + institution.id + '_' + replaceSpecialChars(institution.name) + '/' + ClassroomId + '/' + folder + '/' + filename;
        break;
      default:
        throw new APIError("Campo \"folder\" deve ser 'classroom', 'feed', 'question', 'study_group','answer' ou 'workshop_class'.");
    }
    fs.ensureDir((process.env.NODE_ENV === 'production' ? '/var/www/api.teachlearn.com.br/' : '') + path.dirname(filePath), { mode: 0o2775 }, (err) => {
      if (err) throw new APIError("Erro ao gerar pastas para salvar arquivo.");
      writeFile((process.env.NODE_ENV === 'production' ? '/var/www/api.teachlearn.com.br/' : '') + filePath, file.buffer, (err) => {
        if (err) {
          throw new APIError("Erro ao gravar arquivo.");
        }

      })
    });

    const createFile = await File.create({
      name: path.basename(file.originalname),
      type: path.extname(file.originalname),
      folder,
      path_storage: filePath,
      url_storage: (process.env.NODE_ENV === 'production' ? 'https' : req.protocol) + '://' + req.get('host') + '/' + filePath,
      InstitutionId: user.InstitutionId,
      schemaname: !!user.schemaname ? user.schemaname : '',
      UserId: user.id,
      areas: JSON.stringify(fields[0]),
      levels: JSON.stringify(fields[1]),
      courses: JSON.stringify(fields[2]),
      grades: JSON.stringify(fields[3]),
      subjects: JSON.stringify(fields[4]),
    }, { transaction: t });

    if (!createFile) {
      throw new APIError("Houve um erro ao criar arquivo.");
    }

    await t.commit();
    return res.json({
      success: true,
      data: createFile,
      message: 'Arquivo criado com sucesso!'
    })

  } catch (err) {
    await t.rollback();
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const get = async (req, res) => {
  const { fileId } = req.params;
  const { user } = req;

  try {
    const fileFound = await File.findOne({
      where: {
        id: fileId
      },
      attributes: ['id', 'name', 'type', 'path_storage', 'url_storage', 'InstitutionId', 'UserId', 'areas', 'subjects', 'levels', 'grades', 'courses'],
    })

    if (!fileFound) {
      throw new APIError("Arquivo não encontrado.");
    }

    if ((user.id != fileFound.UserId) && !user.isAdmin) {
      throw new APIError("Não é possível visualizar um arquivo de outro usuário.");
    }

    return res.json({
      user: fileFound,
      success: true
    });
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const update = async (req, res, next) => {
  const { fileId } = req.params;
  const { name } = req.body;
  const { user } = req;
  const u = await sequelize.transaction();
  let oldPath = "";
  let newPath = "";
  try {
    const fileFound = await File.findByPk(fileId);
    if (!fileFound) {
      throw new APIError("Arquivo não encontrado.");
    }
    if (fileFound.UserId != user.id && !user.isAdmin) {
      throw new APIError("Você não possui permissão para atualizar arquivo.");
    }

    let fileName = Date.now() + '_' + replaceSpecialChars(path.basename(name)) + path.extname(fileFound.path_storage);
    oldPath = fileFound.path_storage;
    newPath = path.dirname(fileFound.path_storage) + '/' + fileName
    console.log(newPath)
    const updatedFile = await fileFound.update({
      name,
      path_storage: newPath,
      url_storage: (process.env.NODE_ENV === 'production' ? 'https' : req.protocol) + '://' + req.get('host') + '/' + newPath,
    }, { transaction: u });

    if (!updatedFile) {
      throw new APIError("Houve um erro ao atualizar o arquivo.");
    }

    if (fs.existsSync(oldPath)) {
      fs.rename(oldPath, newPath, (err) => {
        if (err) throw new APIError("Houve um erro ao tentar renomear arquivo.");
      })
    } else {
      throw new APIError("Arquivo não encontrado no sistema.");
    }

    u.commit();

    return res.json({
      success: true,
      message: "Arquivo atualizado com sucesso!"
    });
  } catch (err) {
    u.rollback();
    if (fs.existsSync(newPath)) {
      fs.renameSync(newPath, oldPath)
    }
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const remove = async (req, res, next) => {
  const { fileId } = req.params;
  const { user } = req;

  const r = await sequelize.transaction();
  try {
    const fileFound = await File.findByPk(fileId);
    if (!fileFound) {
      throw new APIError("Arquivo não encontrado.");
    }
    if (fileFound.UserId != user.id && !user.isAdmin) {
      throw new APIError("Você não possui permissão para excluir arquivo.");
    }

    let removePath = fileFound.path_storage
    const removeFile = await fileFound.destroy({}, { transaction: r });

    if (!removeFile) {
      throw new APIError("Houve um erro ao excluir o arquivo.");
    }


    r.commit();
    fs.unlink(removePath, (err) => {
      if (err) throw new APIError("Houve um erro ao remover o arquivo.");
    })

    return res.json({
      success: true,
      message: "Arquivo removido com sucesso!"
    });
  } catch (err) {
    r.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

export default {
  listAll, list, create, get, update, remove
};
