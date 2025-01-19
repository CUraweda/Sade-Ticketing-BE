import Joi from "joi";

export const FeeTagValidator = {
  create: Joi.object({
    name: Joi.string().max(20).required(),
    description: Joi.string().max(150).optional(),
  }),
  update: Joi.object({
    name: Joi.string().max(20).optional(),
    description: Joi.string().max(150).optional(),
  }),
};

export default FeeTagValidator;
