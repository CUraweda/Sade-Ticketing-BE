import Joi from "joi";

export const ServicecategoryValidator = {
  create: Joi.object({
    description: Joi.string().max(150).optional(),
    hex_color: Joi.string().optional(),
  }),
  update: Joi.object({
    description: Joi.string().max(150).optional(),
    hex_color: Joi.string().optional(),
  }),
};

export default ServicecategoryValidator;
