import Joi from "joi";

export const FeeValidator = {
  create: Joi.object({
    title: Joi.string().max(50).required(),
    description: Joi.string().max(230).optional(),
    price: Joi.number().required(),
    tags: Joi.array().items(Joi.number()).optional(),
    is_available: Joi.boolean().optional(),
  }),
  update: Joi.object({
    title: Joi.string().max(50).optional(),
    description: Joi.string().max(230).optional(),
    price: Joi.number().optional(),
    tags: Joi.array().items(Joi.number()).optional(),
    is_available: Joi.boolean().optional(),
  }),
};

export default FeeValidator;
