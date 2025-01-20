import Joi from "joi";
import { TimeCycle } from "../../base/validator.base.js";

export const DaycarePriceValidator = {
  create: Joi.object({
    title: Joi.string().max(20).required(),
    description: Joi.string().max(150).optional(),
    price: Joi.number().required(),
    invoice_cycle: Joi.string()
      .valid(...Object.values(TimeCycle))
      .required(),
    is_available: Joi.boolean().optional(),
  }),
  update: Joi.object({
    title: Joi.string().max(20).optional(),
    description: Joi.string().max(150).optional(),
    price: Joi.number().optional(),
    invoice_cycle: Joi.string()
      .valid(...Object.values(TimeCycle))
      .optional(),
    is_available: Joi.boolean().optional(),
  }),
};

export default DaycarePriceValidator;
