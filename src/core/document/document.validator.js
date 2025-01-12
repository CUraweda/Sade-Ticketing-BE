import Joi from "joi";

export const DocumentValidator = {
  create: Joi.object({
    title: Joi.string().max(50).required(),
    content: Joi.string().required(),
  }),
  update: Joi.object({
    title: Joi.string().max(50).required(),
    content: Joi.string().required(),
  }),
};

export default DocumentValidator;
