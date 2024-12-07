import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const clientPrivilegeValidator = {
  create: Joi.object({
    title: Joi.string().max(50).required(),
    image_path: Joi.string().max(50).optional(),
    client_id: Joi.string().external(relationExist("clientProfile")).required(),
  }),
  update: Joi.object({
    title: Joi.string().max(50).required(),
    image_path: Joi.string().max(50).optional(),
    client_id: Joi.string().external(relationExist("clientProfile")).required(),
  }),
};

export default clientPrivilegeValidator;
