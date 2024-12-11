import Joi from "joi";

export const privilegeValidator = {
  create: Joi.object({
    title: Joi.string().max(50).required(),
    image_path: Joi.string().max(50).optional(),
  }),
  update: Joi.object({
    title: Joi.string().max(50).required(),
    image_path: Joi.string().max(50).optional(),
  }),
};

export default privilegeValidator;
