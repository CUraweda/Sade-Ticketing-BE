import Joi from "joi";

export const SpecialismValidator = {
  create: Joi.object({
    name: Joi.string().max(50).required(),
  }),
  update: Joi.object({
    name: Joi.string().max(50).optional(),
  }),
};

export default SpecialismValidator;
