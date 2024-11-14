import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const ServiceBillingType = {
  ONE_TIME: "one_time",
  DAILY: "daily",
  MONTHLY: "monthly",
};

export const ServiceValidator = {
  create: Joi.object({
    location_id: Joi.number().external(relationExist("location")).required(),
    category_id: Joi.number()
      .external(relationExist("serviceCategory"))
      .required(),
    title: Joi.string().max(50).required(),
    description: Joi.string().optional(),
    duration: Joi.number().optional(),
    duration_description: Joi.string().max(24).optional(),
    price: Joi.number().required(),
    price_unit: Joi.string().required(),
    price_minimum: Joi.number().optional(),
    doctor_fee: Joi.number().optional(),
    is_active: Joi.bool().default(false),
    billing_type: Joi.valid(...Object.values(ServiceBillingType)).optional(),
  }),
  update: Joi.object({
    location_id: Joi.number().external(relationExist("location")).optional(),
    category_id: Joi.number()
      .external(relationExist("serviceCategory"))
      .optional(),
    title: Joi.string().max(50).optional(),
    description: Joi.string().optional(),
    duration: Joi.number().optional(),
    duration_description: Joi.string().max(24).optional(),
    price: Joi.number().optional(),
    price_unit: Joi.string().optional(),
    price_minimum: Joi.number().optional(),
    doctor_fee: Joi.number().optional(),
    is_active: Joi.bool().optional(),
    billing_type: Joi.valid(...Object.values(ServiceBillingType)).optional(),
  }),
  setQuestionnaire: Joi.object({
    que_id: Joi.string().external(relationExist("questionnaire")).required(),
    set: Joi.string().valid("add", "remove"),
  }),
  setReport: Joi.object({
    que_id: Joi.string().external(relationExist("questionnaire")).required(),
    set: Joi.string().valid("add", "remove"),
  }),
  setEntryFee: Joi.object({
    fee_id: Joi.string().external(relationExist("fee")).required(),
    set: Joi.string().valid("add", "remove"),
  }),
  setAgreementDocument: Joi.object({
    document_id: Joi.string().external(relationExist("document")).required(),
    set: Joi.string().valid("add", "remove"),
  }),
};

export default ServiceValidator;
