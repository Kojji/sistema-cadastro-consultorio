import cron from 'node-cron';
import db from '../models';
import { add, sub, isBefore } from 'date-fns';

export function fileCleaningScript() {
  cron.schedule("40 2 7,21 * *", async () => {
    const { Activity_Question, Activity_Question_Student_File, Activity_Question_Database, File, Feed, Classroom_Feed, Question_Database, sequelize } = db;

    console.log("Iniciando script de limpeza para arquivos")
    const foundFiles = await File.findAll({
      attributes: ['id', 'folder', 'path_storage', 'schemaname', 'createdAt']
    });
    if (!foundFiles) {
      console.log("erro ao procurar arquivos")
    } else {

      foundFiles.forEach(async (file) => {
        let yearTimeout = add(file.createdAt, {
          years: 2
        })
  
        if (isBefore(yearTimeout, Date.now())) {
          console.log("2 year expiration - deleting File: " + file.path_storage)
          File.deleteAndDestroy(file)
        } else {
          switch (file.folder) {
            case "feed":
              const foundFeed = await Feed.findOne({
                where: { FileId: file.id },
                attributes: ['id']
              })
              if (!foundFeed) {
                let timeout = add(file.createdAt, {
                  days: 1
                })
  
                if (isBefore(timeout, Date.now())) {
                  console.log("deleting File: " + file.path_storage)
                  File.deleteAndDestroy(file)
                }
              }
              break;
            case "classroom":
              const foundClassroomFeed = await Classroom_Feed.schema(file.schemaname).findOne({
                where: { FileId: file.id },
                attributes: ['id']
              })
              if (!foundClassroomFeed) {
                let timeout = add(file.createdAt, {
                  days: 1
                })
  
                if (isBefore(timeout, Date.now())) {
                  console.log("deleting File: " + file.path_storage)
                  File.deleteAndDestroy(file)
                }
              }
              break;
            case "question":
              const foundQuestionDatabase = await Question_Database.findOne({
                where: { FileId: file.id },
                attributes: ['id']
              })
              if (!!foundQuestionDatabase) break;
              const fountActivityQuestionDatabase = await Activity_Question_Database.findOne({
                where: { FileId: file.id },
                attributes: ['id']
              })
              if (!!fountActivityQuestionDatabase) break;
  
              const queryInterface = sequelize.getQueryInterface();
              const schemas = await queryInterface.showAllSchemas();
              let found = false;
              for (const schema of schemas) {
                const foundQuestion = await Activity_Question.schema(schema).findOne({
                  where: { FileId: file.id },
                  attributes: ['id']
                })
                if (!!foundQuestion) {
                  found = true;
                  break;
                }
              }
              if (found) break;
  
              let timeout = add(file.createdAt, {
                days: 1
              })
  
              if (isBefore(timeout, Date.now())) {
                console.log("deleting File: " + file.path_storage)
                File.deleteAndDestroy(file)
              }
  
              break;
            case "answer":
              const foundActivityAnswer = await Activity_Question_Student_File.schema(file.schemaname).findOne({
                where: { FileId: file.id },
                attributes: ['id']
              })
              if (!foundActivityAnswer) {
                let timeout = add(file.createdAt, {
                  days: 1
                })
  
                if (isBefore(timeout, Date.now())) {
                  console.log("Removendo arquivo: " + file.path_storage)
                  File.deleteAndDestroy(file)
                }
              }
              break;
            default:
              File.deleteAndDestroy(file)
              break;
          }
        }
      })
    }
  });
} 

export function ClassroomCodeCleaningScript() {
  cron.schedule("20 1 * * *", async () => {
    const { Classroom_Code, sequelize } = db;

    console.log("Iniciando script de limpeza para códigos de acesso a sala de aula")
    const queryInterface = sequelize.getQueryInterface();
    const schemas = await queryInterface.showAllSchemas();
    let timeout = sub(Date.now(), {
      days: 2
    })

    for (const schema of schemas) {
      const foundCodes = await Classroom_Code.schema(schema).findAll({
        attributes: ['id', 'createdAt']
      })
      if(!foundCodes) {
        console.log("Problema ao listar códigos no schema " + schema)
        continue;
      }
      foundCodes.forEach((element)=>{
        if (isBefore(element.createdAt, timeout)) {
          console.log("removendo código de acesso da sala, id: " + element.id)
          element.destroy({}).catch(()=>{
            console.log("erro ao remover código, id: " + element.id)
          })
        }
      })
    }
  });
}

export function StudyGroupDeactivateScript() {
  cron.schedule("40 2 14,29 * *", async () => {
    const { Study_Group, Study_Group_Message, sequelize } = db;

    console.log("Iniciando script de desativação de grupos ociosos.")

    const foundGroups = await Study_Group.findAll({
      where: {active: true},
      attributes: ['id', 'active', 'createdAt']
    })
    if(!foundGroups) {
      console.log("erro ao procurar grupos de estudos")
    } else {
      let timeout = sub(Date.now(), {
        months: 3
      })
      foundGroups.forEach(async (element)=>{
        const foundLastMessage = await Study_Group_Message.findOne({
          where: {StudyGroupId: element.id},
          attributes: ['createdAt'],
          order:[['createdAt', 'DESC']]
        })
        if(!foundLastMessage) {
          console.log("not found")
          if(isBefore(element.createdAt, timeout)) {
            console.log("removendo grupo de estudos ocioso, sem mensagens, id: " + element.id)
            element.destroy({}).catch(()=>{
              console.log("erro ao remover código, id: " + element.id)
            })
          }
        } else {
          if (isBefore(foundLastMessage.createdAt, timeout)) {
            console.log("inativando grupo de estudos , id: " + element.id)
            element.update({
              active: false
            }).catch(()=>{
              console.log("erro ao inativar grupo de estudos, id: " + element.id)
            })
          }
        }
      })
    }
  });
}