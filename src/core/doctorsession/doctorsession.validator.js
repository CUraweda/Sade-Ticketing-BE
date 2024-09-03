import Joi from "joi";
import { isTimeString, relationExist } from "../../base/validator.base.js";

export const doctorsessionValidator = {
  create: Joi.object({
    doctor_id: Joi.string().external(relationExist("doctorProfile")).required(),
    service_id: Joi.string().external(relationExist("service")).required(),
    date: Joi.date().required(),
    time_start: Joi.string().custom(isTimeString).required(),
    time_end: Joi.string().custom(isTimeString).required(),
    note: Joi.string().max(50).optional(),
    is_locked: Joi.bool().default(false),
  }),
  update: Joi.object({
    doctor_id: Joi.string().external(relationExist("doctorProfile")).optional(),
    service_id: Joi.string().external(relationExist("service")).optional(),
    date: Joi.date().optional(),
    time_start: Joi.string().custom(isTimeString).optional(),
    time_end: Joi.string().custom(isTimeString).optional(),
    note: Joi.string().max(50).optional(),
    is_locked: Joi.bool().optional(),
  }),
};

export default doctorsessionValidator;
