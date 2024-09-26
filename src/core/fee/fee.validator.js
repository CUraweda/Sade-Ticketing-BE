import Joi from "joi";

export const FeeValidator = {
  create: Joi.object({
    title: Joi.string().max(50).required(),
    description: Joi.string().max(230).optional(),
    price: Joi.number().required(),
  }),
  update: Joi.object({
    title: Joi.string().max(50).optional(),
    description: Joi.string().max(230).optional(),
    price: Joi.number().optional(),
  }),
};

export default FeeValidator;
