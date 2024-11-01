import Joi from "joi";

export const UserFileValidator = {
  create: Joi.object({
    user_id: Joi.string().required()
  }),
  update: Joi.object({
    filename: Joi.string().optional(),
    mimetype: Joi.string().optional(),
    size: Joi.number().optional(),
    url: Joi.string().optional(),
    user_id: Joi.string().optional()
  }),
};

export default UserFileValidator;
