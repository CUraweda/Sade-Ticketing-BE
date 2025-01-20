import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const DaycareActivityValidator = {
  create: Joi.object({
    linkbook_id: Joi.string()
      .external(relationExist("daycareLinkBook"))
      .required(),
    date: Joi.date().required(),
    title: Joi.string().max(50).required(),
    description: Joi.string().max(150).optional(),
    fee_id: Joi.number().external(relationExist("fee")).optional(),
  }),
  update: Joi.object({
    linkbook_id: Joi.string()
      .external(relationExist("daycareLinkBook"))
      .optional(),
    date: Joi.date().optional(),
    title: Joi.string().max(50).optional(),
    description: Joi.string().max(150).optional(),
    fee_id: Joi.number().external(relationExist("fee")).optional(),
  }),
};

export default DaycareActivityValidator;
