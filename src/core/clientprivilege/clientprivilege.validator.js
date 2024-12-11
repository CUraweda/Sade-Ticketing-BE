import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const clientPrivilegeValidator = {
  create: Joi.object({
    client_id: Joi.string().external(relationExist("clientProfile")).required(),
    privilege_id: Joi.string().external(relationExist("privilege")).required(),
  }),
  update: Joi.object({
    client_id: Joi.string().external(relationExist("clientProfile")).required(),
    privilege_id: Joi.string().external(relationExist("privilege")).required(),
  }),
};

export default clientPrivilegeValidator;
