import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const ServiceValidator = {
  create: Joi.object({
    category_id: Joi.number()
      .external(relationExist("serviceCategory"))
      .required(),
    title: Joi.string().max(50).required(),
    description: Joi.string().max(100).optional(),
    price: Joi.number().required(),
    price_unit: Joi.string().required(),
    duration: Joi.number().optional(),
    is_active: Joi.bool().default(true),
    is_additional: Joi.bool().default(false),
  }),
  update: Joi.object({
    category_id: Joi.number()
      .external(relationExist("serviceCategory"))
      .optional(),
    title: Joi.string().max(50).optional(),
    description: Joi.string().max(100).optional(),
    price: Joi.number().optional(),
    price_unit: Joi.string().optional(),
    duration: Joi.number().optional(),
    is_active: Joi.bool().optional(),
    is_additional: Joi.bool().optional(),
  }),
};

export default ServiceValidator;
