import { Joi } from 'express-validation'
import { allow, valid } from 'joi/lib/types/lazy';

export default {
    // POST /api/users
    createUser: {
        body: Joi.object({
          name: Joi.string().required(),
          email: Joi.string().required(),
          phone: Joi.string().required(),
          username: Joi.string().required(),
          active: Joi.boolean().required(),
          roleId: Joi.number().required(),
      }),
    },

    // UPDATE /api/users/:userId
    updateUser: {
      body: Joi.object({
        name: Joi.string(),
        email: Joi.string(),
        phone: Joi.string().allow(""),
        username: Joi.string(),
        dtbirth: Joi.string(),
        cpf: Joi.string().allow("").allow(null),
        rg: Joi.string().allow("").allow(null),
        profession: Joi.string().allow("").allow(null),
      }),
      params: Joi.object({
        userId: Joi.string().hex().required(),
      }),
    },

    // UPDATE /api/institutions/:institutionId
    updateInstitution: {
      body: Joi.object({
        name: Joi.string().required(),
        phone: Joi.string().allow("").required(),
        cep: Joi.string().required(),
        district: Joi.string().required(),
        address: Joi.string().required(),
        number: Joi.string().required(),
        complement: Joi.string().allow("").required(),
      }),
      params: Joi.object({
        institutionId: Joi.string().hex().required(),
      }),
    },

    // UPDATE /api/users/change-password/:userId
    changePassword: {
        body: Joi.object({
          oldPassword: Joi.string().required(),
          newPassword: Joi.string().required(),
          repeatPassword: Joi.string().required(),
          sure: Joi.boolean().required()
      }),
        params: Joi.object({
          userId: Joi.string().hex().required(),
      }),
    },

    // POST /api/users/confirm-account/:key
    confirmAccount: {
        body: Joi.object({
            confirmed: Joi.boolean().required()
        }),
        params: Joi.object({
            key: Joi.string().required(),
        }),
    },

    // POST /api/auth/login
    login: {
        body: Joi.object({
          username: Joi.string().required().messages({
            'string.empty': 'Este campo não pode ser vazio',
            'any.required': 'Este campo não pode ser vazio'
          }),
          password: Joi.string().required().messages({
            'string.empty': 'Este campo não pode ser vazio',
            'any.required': 'Este campo não pode ser vazio'
          }),
        }),
    },

    // POST /api/auth/askResetPassword
    askResetPassword: {
        body: Joi.object({
          username: Joi.string().required()
        }),
    },

    // POST /api/auth/resetPassword
    resetPassword: {
        body: Joi.object({
            key: Joi.string().required()
        }),
    },

    // POST /api/auth/postResetPassword
    postResetPassword: {
        body: Joi.object({
            password: Joi.string().required(),
            repeatPassword: Joi.string().required(),
            UserId: Joi.number().required(),
            key: Joi.string().required()
        }),
    },

    // POST /api/register
    postRegister: {
      body: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
        phone: Joi.string().required(),
        username: Joi.string().required(),
        role: Joi.string().valid("professor", "aluno").required()
      })
    },

    // POST /api/courses
    createCourse: {
      body: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required().allow(""),
        active: Joi.boolean().required(),
        LevelId: Joi.number().required()
      })
    },

    // PUT /api/courses/:courseId
    updateCourse: {
      body: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required().allow(""),
        active: Joi.boolean().required(),
        LevelId: Joi.number().required()
      }),
      params: Joi.object({
        courseId: Joi.string().hex().required(),
      }),
    },

    // POST /api/subjects
    createSubject: {
      body: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required().allow(""),
        active: Joi.boolean().required(),
        GradeId: Joi.number().required()
      })
    },

    // PUT /api/subjects/:subjectId
    updateSubject: {
      body: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required().allow(""),
        active: Joi.boolean().required(),
        GradeId: Joi.number().required()
      }),
      params: Joi.object({
        subjectId: Joi.string().hex().required(),
      }),
    },

    // POST /api/grades
    createGrade: {
      body: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required().allow(""),
        active: Joi.boolean().required(),
        LevelId: Joi.number().required()
      })
    },

    // PUT /api/grades/:gradeId
    updateGrade: {
      body: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required().allow(""),
        active: Joi.boolean().required(),
        LevelId: Joi.number().required()
      }),
      params: Joi.object({
        gradeId: Joi.string().hex().required(),
      }),
    },

    // POST /api/levels
    createLevel: {
      body: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required().allow(""),
        active: Joi.boolean().required()
      })
    },

    // PUT /api/levels/:levelId
    updateLevel: {
      body: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required().allow(""),
        active: Joi.boolean().required()
      }),
      params: Joi.object({
        levelId: Joi.string().hex().required(),
      }),
    },

    // POST /api/roles
    createRole: {
      body: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required().allow(""),
        active: Joi.boolean().required()
      })
    },

    // PUT /api/roles/:roleId
    updateRole: {
      body: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required().allow("")
      }),
      params: Joi.object({
        roleId: Joi.string().hex().required(),
      }),
    },

    // POST /api/areas
    createArea: {
      body: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required().allow(""),
        active: Joi.boolean().required(),
        father: Joi.number().required().allow(null)
      })
    },

    // PUT /api/areas/:areaId
    updateArea: {
      body: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required().allow(""),
        active: Joi.boolean().required()
      }),
      params: Joi.object({
        areaId: Joi.string().hex().required(),
      }),
    },

    // POST /api/classrooms
    createClassroom: {
      body: Joi.object({
        active: Joi.boolean().required(),
        description: Joi.string().allow(null).allow(""),
        LevelId: Joi.number().required(),
        SubjectId: Joi.number().allow(null),
        CourseId: Joi.number().allow(null),
        courseName: Joi.string().allow(""),
        ProfessorId: Joi.number().required(),
        StudentIds: Joi.array().items(Joi.number()).allow(null)
      })
    },

    // PUT /api/classrooms/:classroomId
    updateClassroom: {
      body: Joi.object({
        description: Joi.string().allow(""),
        LevelId: Joi.number().required(),
        SubjectId: Joi.number().allow(null),
        CourseId: Joi.number().allow(null),
        courseName: Joi.string().allow(""),
        active: Joi.boolean()
      }),
      params: Joi.object({
        classroomId: Joi.string().hex().required(),
      }),
    },

    // PUT /api/classroom-students/:classroomStudentId
    updateClassroomStudent: {
      body: Joi.object({
        active: Joi.boolean(),
        absences: Joi.number(),
        attendance: Joi.number(),
        status: Joi.string()
      }),
      params: Joi.object({
        classroomStudentId: Joi.string().hex().required(),
      }),
    },

    // POST /api/classrooms/:classroomId/feeds
    createClassroomFeed: {
      body: Joi.object({
        content_type: Joi.string().valid("video/youtube", "video/vimeo", "pesquisa", "texto", "foto", "documento").required(),
        title: Joi.string().required(),
        content: Joi.string().allow(null).allow(""),
        video_url: Joi.string().allow(null),
        FileId: Joi.number().allow(null),
        inquiry: Joi.object({
          question: Joi.string().required(),
          type: Joi.string().valid("votacao", "resposta").required(),
          options: Joi.array().items(Joi.object({
            option: Joi.string().required(),
            correct: Joi.boolean().required()
          })).allow(null)
        }).allow(null),
      }),
      params: Joi.object({
        classroomId: Joi.string().hex().required(),
      }),
    },

    // UPDATE /api/classrooms/:classroomId/feeds/:feedId
    updateClassroomFeed: {
      body: Joi.object({
        title: Joi.string().allow(null),
        content: Joi.string().allow(null),
        video_url: Joi.string().allow(null),
        FileId: Joi.number().allow(null),
        inquiry: Joi.object({
          question: Joi.string().required()
        }).allow(null)
      }),
      params: Joi.object({
        feedId: Joi.string().hex().required()
      }),
    },

    // POST /api/classrooms/comments/:feedId
    createClassroomFeedComment: {
      body: Joi.object({
        content: Joi.string().required(),
        CommentId: Joi.number().allow(null),
      }),
      params: Joi.object({
        feedId: Joi.string().hex().required()
      }),
    },

    // POST /api/database/questions
    createDBQuestion: {
      body: Joi.object({
        active: Joi.boolean(),
        title: Joi.string().allow(""),
        description: Joi.string().allow(""),
        justification: Joi.string().allow(""),
        question: Joi.string().required(),
        FileId: Joi.number().allow(null),
        LevelId: Joi.number().allow(null),
        GradeId: Joi.number().allow(null),
        CourseId: Joi.number().allow(null),
        SubjectId: Joi.number().allow(null),
        options: Joi.array().items(
          Joi.object({
            option: Joi.string().required(),
            correct: Joi.boolean().required(),
            description: Joi.string().allow(null).allow('')
          }).required()
        ).required(),
        tags: Joi.array().required(),
        flags: Joi.array().required()
      })
    },

    // PUT /api/database/questions/:questionId
    updateDBQuestion: {
      body: Joi.object({
        active: Joi.boolean(),
        title: Joi.string(),
        description: Joi.string().allow(''),
        justification: Joi.string().allow(''),
        question: Joi.string(),
        FileId: Joi.number().allow(null),
        LevelId: Joi.number().allow(null),
        GradeId: Joi.number().allow(null),
        CourseId: Joi.number().allow(null),
        SubjectId: Joi.number().allow(null),
        tags: Joi.array(),
        flags: Joi.array(),
        options: Joi.array().items(
          Joi.object({
            id: Joi.number(),
            option: Joi.string(),
            correct: Joi.boolean(),
            description: Joi.string().allow(null).allow('')
          }).required()
        )
      })
    },

    // POST /api/database/question-options/:questionId
    createDBQuestionOption: {
      body: Joi.object({
        description: Joi.string().allow(null),
        option: Joi.string().required(),
        correct: Joi.boolean().required()
      }),
      params: Joi.object({
        questionId: Joi.string().hex().required(),
      }),
    },

    // POST /api/database/activities
    createDBActivity: {
      body: Joi.object({
        type: Joi.string().valid("exercicio", "teste", "trabalho").required(),
        title: Joi.string().allow(""),
        timer: Joi.string().allow(null),
        total_score: Joi.number().allow(null),
        description: Joi.string().required().allow('')
      }),
    },

    // UPDATE /api/database/activities/:activityId
    updateDBActivity: {
      body: Joi.object({
        title: Joi.string().allow(null),
        timer: Joi.string().allow(null),
        total_score: Joi.number().allow(null).max(10),
        description: Joi.string().allow('')
      }),
    },

    // POST /api/database/activity-questions/:activityId
    createDBActivityQuestion: {
      body: Joi.object({
        type: Joi.string().valid("envio", "escolha", "escrita").required(),
        question: Joi.string().allow(null),
        FileId: Joi.number().allow(null),
        score: Joi.number().allow(null).max(10),
        options: Joi.array().items(
          Joi.object({
            option: Joi.string().required(),
            correct: Joi.boolean().required()
          }).required()
        ).allow(null)
      }),
      params: Joi.object({
        activityId: Joi.string().hex().required()
      }),
    },

    // UPDATE /api/database/activity-questions/:questionId
    updateDBActivityQuestion: {
      body: Joi.object({
        question: Joi.string().allow(null),
        FileId: Joi.number().allow(null),
        score: Joi.number().allow(null).max(10),
        options: Joi.array().required()
      }),
      params: Joi.object({
        questionId: Joi.string().hex().required()
      }),
    },

    // POST /api/database/activity-options/:questionId
    createDBActivityOption: {
      body: Joi.object({
        option: Joi.string().required(),
        correct: Joi.boolean().allow(null)
      }),
      params: Joi.object({
        questionId: Joi.string().hex().required()
      }),
    },

    // POST /api/classrooms/:activityId/database/question/:databaseQuestionId
    copyDBQuestion: {
      body: Joi.object({
        score: Joi.number().required().max(10).allow('')
      }),
      params: Joi.object({
        activityId: Joi.string().hex().required(),
        databaseQuestionId: Joi.string().hex().required()
      }),
    },

    // POST /api/classrooms/:classroomId/database/activity/:databaseActivityId
    copyDBToActivity: {
      body: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().allow(""),
        deadline: Joi.string().required(),
        active: Joi.boolean().allow(null)
      }),
      params: Joi.object({
        databaseActivityId: Joi.string().hex().required(),
        classroomId: Joi.string().hex().required()
      }),
    },
    
    // POST /api/database/activities/copy/:classroomActivityId
    copyActivityToDB: {
      body: Joi.object({
        title: Joi.string().required()
      }),
      params: Joi.object({
        classroomActivityId: Joi.string().hex().required()
      }),
    },

    // POST /api/classrooms/:classroomId/activities
    createClassroomActivity: {
      body: Joi.object({
        type: Joi.string().valid("exercicio", "teste", "trabalho").required(),
        active: Joi.boolean().allow(null),
        title: Joi.string().required(),
        deadline: Joi.string().required(),
        timer: Joi.string().allow(null),
        description: Joi.string().allow(""),
        total_score: Joi.number().allow(null).max(10),
        ActivityDatabaseId: Joi.number().allow(null).required()
      }),
      params: Joi.object({
        classroomId: Joi.string().hex().required(),
      }),
    },

    // UPDATE /api/classrooms/activities/:activityId
    updateClassroomActivity: {
      body: Joi.object({
        active: Joi.boolean().allow(null),
        title: Joi.string().allow(null),
        deadline: Joi.string().allow(null),
        timer: Joi.string().allow(null),
        description: Joi.string().allow(null),
        total_score: Joi.number().allow(null).max(10),
      }),
      params: Joi.object({
        activityId: Joi.string().hex().required(),
      }),
    },

    // UPDATE /api/classrooms/activities/results/:resultId
    updateActivityResult: {
      body: Joi.object({
        revised: Joi.boolean().allow(null),
        student_score: Joi.number().allow(null),
      }),
      params: Joi.object({
        resultId: Joi.string().hex().required(),
      }),
    },

    // POST /api/classrooms/activity-questions/:activityId
    createActivityQuestion: {
      body: Joi.object({
        type: Joi.string().valid("envio", "escolha", "escrita").required(),
        question: Joi.string().allow(""),
        timer: Joi.string().allow(null),
        score: Joi.number().allow(null).max(10),
        FileId: Joi.number().allow(null),
        options: Joi.array().items(
          Joi.object({
            option: Joi.string().required(),
            correct: Joi.boolean().required()
          })
        ).allow(null)
      }),
      params: Joi.object({
        activityId: Joi.string().hex().required(),
      }),
    },

    finishActivityQuestion: {
      body: Joi.object({
        optionId: Joi.number().required()
      }),
      params: Joi.object({
        activityId: Joi.string().hex().required(),
        questionId: Joi.string().hex().required(),
      }),
    },

    // UPDATE /api/classrooms/activity-questions/:activityQuestionId
    updateActivityQuestion: {
      body: Joi.object({
        question: Joi.string().allow(null),
        score: Joi.number().allow(null).max(10),
        timer: Joi.string().allow(null),
        FileId: Joi.number().allow(null),
        options: Joi.array().items(
          Joi.object()
        ).allow(null)
      }),
      params: Joi.object({
        activityQuestionId: Joi.string().hex().required(),
      }),
    },

    // POST /api/classrooms/activity-options/:questionId
    createActivityOption: {
      body: Joi.object({
        option: Joi.string().required(),
        correct: Joi.boolean().required()
      }),
      params: Joi.object({
        questionId: Joi.string().hex().required(),
      }),
    },

    // POST /api/classrooms/activity-options/:questionId
    createAnswerFiles: {
      body: Joi.object({
        FileIds: Joi.array().items(Joi.number())
      }),
      params: Joi.object({
        questionId: Joi.string().hex().required(),
      }),
    },

    // POST /api/classrooms/activity-file/:questionId
    createActivityAnswer: {
      body: Joi.object({
        ActivityOptionId: Joi.number().allow(null),
        answer: Joi.string().allow("")
      }),
      params: Joi.object({
        questionId: Joi.string().hex().required(),
      }),
    },

    // UPDATE /api/classrooms/activity-answers/:answerId
    reviseActivityAnswer: {
      body: Joi.object({
        revised: Joi.number().allow(null).max(2),
        correct: Joi.boolean().allow(null),
        question_score: Joi.number().allow(null)
      }),
      params: Joi.object({
        answerId: Joi.string().hex().required(),
      }),
    },

    // UPDATE /api/users/files/:fileId
    updateFile: {
      body: Joi.object({
        name: Joi.string().required()
      }),
      params: Joi.object({
        fileId: Joi.string().hex().required(),
      }),
    },

    // POST /api/feeds
    createFeed:{
      body: Joi.object({
        type: Joi.string().valid("professor", "aluno").required(),
        content_type: Joi.string().valid("video/youtube", "video/vimeo", "pesquisa", "texto", "foto", "documento").required(),
        title: Joi.string().required(),
        content: Joi.string().allow(null).allow(""),
        video_url: Joi.string().allow(null).allow(""),
        FileId: Joi.number().allow(null),
        inquiry: Joi.object({
          question: Joi.string().required(),
          type: Joi.string().valid("votacao", "resposta").required(),
          options: Joi.array().items(Joi.object({
            option: Joi.string().required(),
            correct: Joi.boolean().required()
          })).allow(null)
        }).allow(null),
        fieldIds: Joi.string().required()
      }),
    },

    // UPDATE /api/feeds
    updateFeed:{
      body: Joi.object({
        title: Joi.string().allow(null),
        content: Joi.string().allow(null),
        video_url: Joi.string().allow(null),
        FileId: Joi.number().allow(null),
        inquiry: Joi.object({
          question: Joi.string().required()
        }).allow(null),
        fieldIds: Joi.string().required()
      }),
      params: Joi.object({
        feedId: Joi.string().hex().required()
      }),
    },

    // POST /api/feeds/comments
    createComment:{
      body: Joi.object({
        content: Joi.string().required(),
        CommentId: Joi.number().allow(null),
      }),
      params: Joi.object({
        feedId: Joi.string().hex().required()
      }),
    },

    // UPDATE /api/feeds/comments
    updateComment:{
      body: Joi.object({
        content: Joi.string().required(),
      }),
      params: Joi.object({
        commentId: Joi.string().hex().required()
      }),
    },
    
    // POST /api/feeds/inquiry-option
    createInquiryOption:{
      body: Joi.object({
        option: Joi.string().required(),
        correct: Joi.boolean().required(),
      }),
      params: Joi.object({
        inquiryId: Joi.string().hex().required()
      }),
    },

    // POST /api/feeds/inquiry-answer
    createInquiryAnswer:{
      params: Joi.object({
        optionId: Joi.string().hex().required()
      }),
    },

    // POST /api/feeds/approve
    updateStatusFeed:{
      body: Joi.object({
        FeedId: Joi.number().required(),
        approved: Joi.number().required(),
        type: Joi.string().required(),
        fieldIds: Joi.string().required()
      }),
    },

    // POST /api/favorites
    createFavorite:{
      body: Joi.object({
        FeedId: Joi.number().required()
      }),
    },

    // POST /api/tags
    createTag:{
      body: Joi.object({
        title: Joi.string().required()
      }),
    },

    // PUT /api/tags
    updateTag:{
      body: Joi.object({
        title: Joi.string().required()
      }),
      params: Joi.object({
        tagId: Joi.string().hex().required()
      }),
    },

    // POST /api/flags
    createFlag:{
      body: Joi.object({
        title: Joi.string().required()
      }),
    },

    // PUT /api/flags
    updateFlag:{
      body: Joi.object({
        title: Joi.string().required()
      }),
      params: Joi.object({
        flagId: Joi.string().hex().required()
      }),
    },

    // POST /api/class-plans
    createclassPlan:{
      body: Joi.object({
        active: Joi.boolean().required(),
        title: Joi.string().required(),
        AreaId: Joi.number().allow(null),
        SubjectId: Joi.number().allow(null),
        LevelId: Joi.number().required().allow(null),
        GradeId: Joi.number().allow(null),
        CourseId: Joi.number().allow(null)
      }),
    },

    // PUT /api/class-plans
    updateclassPlan:{
      body: Joi.object({
        active: Joi.boolean(),
        title: Joi.string(),
        AreaId: Joi.number().allow(null),
        SubjectId: Joi.number().allow(null),
        LevelId: Joi.number().allow(null),
        GradeId: Joi.number().allow(null),
        CourseId: Joi.number().allow(null)
      }),
      params: Joi.object({
        classPlanId: Joi.string().hex().required()
      }),
    },

    // POST /api/class-plans/contents
    createclassPlanContent:{
      body: Joi.object({
        title: Joi.string().required(),
        ClassPlanId: Joi.number().required(),
      }),
    },

    // PUT /api/class-plans/contents
    updateclassPlanContent:{
      body: Joi.object({
        title: Joi.string().required()
      }),
      params: Joi.object({
        classPlanContentId: Joi.string().hex().required()
      }),
    },

    // POST /api/class-plans/contents/pages
    createclassPlanContentPage:{
      body: Joi.object({
        title: Joi.string().required(),
        active: Joi.boolean().required(),
        ClassPlanContentId: Joi.number().required(),
      }),
    },

    // PUT /api/class-plans/contents/pages
    updateclassPlanContentPage:{
      body: Joi.object({
        title: Joi.string(),
        active: Joi.boolean()
      }),
      params: Joi.object({
        classPlanContentPageId: Joi.string().hex().required()
      }),
    },

    // POST /api/class-plans/contents/pages/items
    createclassPlanContentPageItem:{
      body: Joi.object({
        title: Joi.string().required(),
        active: Joi.boolean().required(),
        content: Joi.string().required(),
        url_video: Joi.string().required().allow(null).allow(''),
        source_video: Joi.string().required().allow(null).allow(''),
        ClassPlanContentPageId: Joi.number().required(),
      }),
    },

    // PUT /api/class-plans/contents/pages/items
    updateclassPlanContentPageItem:{
      body: Joi.object({
        title: Joi.string(),
        active: Joi.boolean(),
        content: Joi.string(),
        url_video: Joi.string().allow(null).allow(''),
        source_video: Joi.string().allow(null).allow('')
      }),
      params: Joi.object({
        classPlanContentPageItemId: Joi.string().hex().required()
      }),
    },

    // POST /api/supports
    createSupport:{
      body: Joi.object({
        title: Joi.string().required(),
        active: Joi.boolean().required(),
        description: Joi.string().allow(null).allow(''),
        url_video: Joi.string().allow(null).allow('')
      }),
    },

    // PUT /api/supports
    updateSupport:{
      body: Joi.object({
        title: Joi.string(),
        active: Joi.boolean(),
        description: Joi.string().allow(null).allow(''),
        url_video: Joi.string().allow(null).allow('')
      }),
      params: Joi.object({
        supportId: Joi.string().hex().required()
      }),
    },

    // POST /api/workshops/courses
    createWorkshop:{
      body: Joi.object({
        active: Joi.boolean().required(),
        title: Joi.string().required(),
        description: Joi.string().allow(null).allow(''),
        url_external: Joi.string().allow(null).allow(''),
        type: Joi.string().valid("professor", "aluno").required()
      }),
    },

    // PUT /api/workshops/courses
    updateWorkshop:{
      body: Joi.object({
        active: Joi.boolean(),
        title: Joi.string(),
        description: Joi.string().allow(null).allow(''),
        url_external: Joi.string().allow(null).allow(''),
        type: Joi.string().valid("professor", "aluno")
      }),
      params: Joi.object({
        workshopId: Joi.string().hex().required()
      }),
    },

    // POST /api/workshops/modules
    createWorkshopModule: {
      body: Joi.object({
        active: Joi.boolean().required(),
        title: Joi.string().required(),
        available_in: Joi.number().required(),
        WorkshopId: Joi.number().required()
      }),
    },

    // PUT /api/workshops/modules
    updateWorkshopModule: {
      body: Joi.object({
        active: Joi.boolean(),
        title: Joi.string(),
        available_in: Joi.number()
      }),
      params: Joi.object({
        workshopModuleId: Joi.string().hex().required()
      }),
    },

    // POST /api/workshops/classes
    createWorkshopModuleClasses: {
      body: Joi.object({
        active: Joi.boolean().required(),
        title: Joi.string().required(),
        description: Joi.string().required(),
        source_video: Joi.string().required(),
        url_video: Joi.string().required(),
        WorkshopModuleId: Joi.number().required(),
        fileIds: Joi.array().required()
      }),
    },

    // PUT /api/workshops/classes
    updateWorkshopModuleClasses: {
      body: Joi.object({
        active: Joi.boolean(),
        title: Joi.string(),
        description: Joi.string(),
        source_video: Joi.string(),
        url_video: Joi.string(),
        fileIds: Joi.array().required()
      }),
      params: Joi.object({
        workshopModuleClassId: Joi.string().hex().required()
      }),
    },

    // PUT /api/workshops/classes
    createWorkshopModuleClassAnnotation: {
      body: Joi.object({
        content: Joi.string().required(),
      }),
      params: Joi.object({
        workshopModuleClassAnnotationId: Joi.string().hex().required()
      }),
    },

    // POST /api/entrance-exam/enem
    createEntranceExam: {
      body: Joi.object({
        active: Joi.boolean().required(),
        title: Joi.string().required(),
        description: Joi.string().required()
      }),
    },

    // PUT /api/entrance-exam/enem
    updateEntranceExam: {
      body: Joi.object({
        active: Joi.boolean(),
        title: Joi.string(),
        description: Joi.string()
      }),
      params: Joi.object({
        entranceExamId: Joi.string().hex().required()
      }),
    },

    // POST /api/entrance-exam/contents
    createEntranceExamContent: {
      body: Joi.object({
        active: Joi.boolean().required(),
        title: Joi.string().required(),
        content: Joi.string().required().allow(''),
        source_video: Joi.string().required(),
        url_video: Joi.string().required().allow(null).allow(''),
        EntranceExamId: Joi.number().required(),
        type: Joi.string().valid('enem')
      }),
    },

    // PUT /api/entrance-exam/contents
    updateEntranceExamContent: {
      body: Joi.object({
        active: Joi.boolean(),
        title: Joi.string(),
        content: Joi.string().allow(''),
        url_video: Joi.string().allow(null).allow(''),
        source_video: Joi.string().allow(''),
      }),
      params: Joi.object({
        entranceExamContentId: Joi.string().hex().required()
      }),
    },

    // PUT /api/entrance-exam/annotations
    createEntranceExamContentAnnotation: {
      body: Joi.object({
        content: Joi.string().required(),
      }),
      params: Joi.object({
        entranceExamContentAnnotationId: Joi.string().hex().required()
      }),
    },

    // POST /api/study-materials/items
    createStudyMaterial: {
      body: Joi.object({
        active: Joi.boolean().required(),
        title: Joi.string().required(),
        description: Joi.string().required(),
        type: Joi.string().required().valid('professor', 'aluno')
      }),
    },

    // PUT /api/study-materials/items
    updateStudyMaterial: {
      body: Joi.object({
        active: Joi.boolean(),
        title: Joi.string(),
        description: Joi.string()
      }),
      params: Joi.object({
        studyMaterialId: Joi.string().hex().required()
      }),
    },

    // POST /api/study-materials/contents
    createStudyMaterialContent: {
      body: Joi.object({
        active: Joi.boolean().required(),
        title: Joi.string().required(),
        content: Joi.string().required().allow(''),
        url_video: Joi.string().required().allow(null).allow(''),
        source_video: Joi.string().allow('').required(),
        StudyMaterialId: Joi.number().required()
      }),
    },

    // PUT /api/study-materials/contents
    updateStudyMaterialContent: {
      body: Joi.object({
        active: Joi.boolean(),
        title: Joi.string(),
        content: Joi.string().allow(''),
        source_video: Joi.string().allow(''),
        url_video: Joi.string().allow(null).allow('')
      }),
      params: Joi.object({
        studyMaterialContentId: Joi.string().hex().required()
      }),
    },

    // PUT /api/study-materials/annotations
    createStudyMaterialContentAnnotation: {
      body: Joi.object({
        content: Joi.string().required(),
      }),
      params: Joi.object({
        studyMaterialContentAnnotationId: Joi.string().hex().required()
      }),
    },

    // PUT /api/class-plans/annotations
    createClassPlanContentPageItemAnnotation: {
      body: Joi.object({
        content: Joi.string().required(),
      }),
      params: Joi.object({
        classPlanContentPageItemAnnotationId: Joi.string().hex().required()
      }),
    },

    randomQuestionDb: {
      body: Joi.object({
        OptionId: Joi.number().required(),
        type: Joi.string().required().valid('enem', 'classroom'),
        ClassroomId: Joi.number()
      }),
      params: Joi.object({
        questionId: Joi.string().hex().required()
      })
    },

    createActivityTeachClass: {
      body: Joi.object({
        description: Joi.string().allow(''), 
        active: Joi.boolean().allow(null), 
        title: Joi.string().allow(''),
        deadline: Joi.string().allow(null), 
        StudentIds: Joi.array().items(Joi.number()).allow(null)
      }),
      params: Joi.object({
        classroomId: Joi.string().hex().required()
      })
    },

    editActivityTeachClass: {
      body: Joi.object({
        description: Joi.string().allow(null), 
        active: Joi.boolean().allow(null), 
        title: Joi.string().allow(null),
        deadline: Joi.string().allow(null)
      }),
      params: Joi.object({
        activityId: Joi.string().hex().required()
      })
    },

    addStudentsActivityTeachClass: {
      body: Joi.object({
        StudentIds: Joi.array().items(Joi.number().required()).required()
      }),
      params: Joi.object({
        activityId: Joi.string().hex().required()
      })
    },

    removeStudentsActivityTeachClass: {
      params: Joi.object({
        studentId: Joi.string().hex().required(),
        activityId: Joi.string().hex().required()
      })
    },

    answerActivityTeachClass: {
      body: Joi.object({
        type: Joi.string().required().valid('video/vimeo', 'video/youtube', 'audio'), 
        FileId: Joi.number().allow(null).min(1), 
        video_url: Joi.string().allow(null)
      }),
      params: Joi.object({
        answerId: Joi.string().hex().required()
      })
    },

    reviseAnswerActivityTeachClass: {
      body: Joi.object({
        approved: Joi.boolean().required()
      }),
      params: Joi.object({
        answerId: Joi.string().hex().required()
      })
    },

    updateAnswerActivityTeachClass: {
      body: Joi.object({
        type: Joi.string().allow(null).valid('video/vimeo', 'video/youtube', 'audio'), 
        FileId: Joi.number().allow(null).min(1), 
        video_url: Joi.string().allow(null)
      }),
      params: Joi.object({
        answerId: Joi.string().hex().required()
      })
    },

    createStudyGroup: {
      body: Joi.object({
        title: Joi.string().required(), 
        description: Joi.string().allow("").allow(null)
      })
    },

    editStudyGroup: {
      body: Joi.object({
        title: Joi.string().allow(null), 
        description: Joi.string().allow(null)
      }),
      params: Joi.object({
        groupId: Joi.string().hex().required()
      })
    },

    addAdminStudyGroup: {
      body: Joi.object({
        userId: Joi.number().required()
      }),
      params: Joi.object({
        groupId: Joi.string().hex().required()
      })
    },

    shareStudyGroupContent: {
      body: Joi.object({
        title: Joi.string().required(),
        type: Joi.string().valid("imagem", "texto", "video/vimeo", "video/youtube", "arquivo").required(),
        FileId: Joi.number().allow(null),
        message: Joi.string().allow(null).allow(""),
        video_url: Joi.string().allow(null).allow("")
      }),
      params: Joi.object({
        groupId: Joi.string().hex().required()
      })
    },

    sendStudyGroupMessage: {
      body: Joi.object({
        message: Joi.string().required()
      }),
      params: Joi.object({
        groupId: Joi.string().hex().required()
      })
    },

    updateStudyGroupNotes: {
      body: Joi.object({
        notes: Joi.string().allow("").required()
      }),
      params: Joi.object({
        groupId: Joi.string().hex().required()
      })
    },
};
