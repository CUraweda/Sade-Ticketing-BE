import Joi from "joi";

export const ServicecategoryValidator = {
  create: Joi.object({
    name: Joi.string().max(50).required(),
  }),
  update: Joi.object({
    name: Joi.string().max(50).required(),
  }),
};

export default ServicecategoryValidator;
