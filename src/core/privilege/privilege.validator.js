import Joi from "joi";

export const privilegeValidator = {
  create: Joi.object({
    title: Joi.string().max(50).required(),
    description: Joi.string().max(190).optional(),
    image_path: Joi.string().max(50).optional(),
  }),
  update: Joi.object({
    title: Joi.string().max(50).optional(),
    description: Joi.string().max(190).optional(),
    image_path: Joi.string().max(50).optional(),
  }),
};

export default privilegeValidator;
