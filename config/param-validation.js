import { Joi } from 'express-validation'
import { allow, valid } from 'joi/lib/types/lazy';

export default {
    // POST /api/users/register
    registerUser: {
        body: Joi.object({
          name: Joi.string().required(),
          email: Joi.string().required(),
          password: Joi.string().required(),
          username: Joi.string().required(),
          cpf: Joi.string().required(),
          birthday: Joi.string().required(),
      }),
    },

    // POST /api/users
    createUser: {
        body: Joi.object({
          name: Joi.string().required(),
          email: Joi.string().required(),
          username: Joi.string().required(),
          birthday: Joi.string().required(),
          cpf: Joi.string().required(),
          role: Joi.number().valid(1,2).required()
      }),
    },

    // UPDATE /api/users/:userId
    updateUser: {
      body: Joi.object({
        name: Joi.string().required(),
        cpf: Joi.string().required(),
        birthday: Joi.string().required()
      }),
      params: Joi.object({
        userId: Joi.string().hex().required(),
      }),
    },

    // UPDATE /api/users/edit/:userId
    editUser: {
      body: Joi.object({
        name: Joi.string().required(), 
        username: Joi.string().required(), 
        birthday: Joi.string().required(), 
        email: Joi.string().required(), 
        cpf: Joi.string().required(), 
        role: Joi.number().allow(null), 
        confirmed: Joi.boolean().required(), 
        active: Joi.boolean().required(), 
      }),
      params: Joi.object({
        userId: Joi.string().hex().required(),
      }),
    },

    // POST /api/users/change-password
    changePassword: {
      body: Joi.object({
        oldPassword: Joi.string().required(),
        password: Joi.string().required()
      })
    },

    // POST /api/users/change-login
    changeLogin: {
      body: Joi.object({
        oldPassword: Joi.string().required(),
        username: Joi.string().required(),
        email: Joi.string().required()
      })
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

    // POST /api/patients/
    createPatient: {
        body: Joi.object({
          name: Joi.string().required(),
          externalFile: Joi.string().required().allow(''),
          phone: Joi.string().required().allow(''),
          cpf: Joi.string().required().allow(''),
          postalCode: Joi.string().required().allow(''),
          state: Joi.string().required().allow(''),
          city: Joi.string().required().allow(''),
          block: Joi.string().required().allow(''),
          street: Joi.string().required().allow(''),
          number: Joi.number().required().allow(null),
          extra: Joi.string().required().allow(''),
          email: Joi.string().required().allow(''),
          emitReceipt: Joi.boolean().required(),
          active: Joi.boolean().required()
        }),
    },

    // POST /api/patients/
    updatePatient: {
        body: Joi.object({
          name: Joi.string().required(),
          externalFile: Joi.string().required().allow(''),
          phone: Joi.string().required().allow(''),
          cpf: Joi.string().required().allow(''),
          postalCode: Joi.string().required().allow(''),
          state: Joi.string().required().allow(''),
          city: Joi.string().required().allow(''),
          block: Joi.string().required().allow(''),
          street: Joi.string().required().allow(''),
          number: Joi.number().required().allow(null),
          extra: Joi.string().required().allow(''),
          email: Joi.string().required().allow(''),
          emitReceipt: Joi.boolean().required(),
          active: Joi.boolean().required(),
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
};
