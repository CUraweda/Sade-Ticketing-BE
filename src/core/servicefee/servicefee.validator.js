import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const ServiceFeeType = {
  SITIN: "sit_in",
  ENTRY: "entry_tuition",
};

export const ServiceFeeValidator = {
  create: Joi.object({
    fee_id: Joi.number().external(relationExist("fee")).required(),
    service_id: Joi.string().external(relationExist("service")).required(),
    type: Joi.string()
      .valid(...Object.values(ServiceFeeType))
      .required(),
  }),
  update: Joi.object({
    fee_id: Joi.number().external(relationExist("fee")).optional(),
    service_id: Joi.string().external(relationExist("service")).optional(),
    type: Joi.string()
      .valid(...Object.values(ServiceFeeType))
      .optional(),
  }),
};

export default ServiceFeeValidator;
