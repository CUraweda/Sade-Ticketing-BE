import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const ScheduleValidator = {
  create: Joi.object({
    service_id: Joi.string().external(relationExist("service")).optional(),
    start_date: Joi.date().required(),
    end_date: Joi.date().greater(Joi.ref("start_date")).optional(),
    title: Joi.string().max(50).required(),
    description: Joi.string().max(230).optional(),
    doctors: Joi.array()
      .items(Joi.string().external(relationExist("doctorProfile")).required())
      .optional(),
    clients: Joi.array()
      .items(Joi.string().external(relationExist("clientProfile")).required())
      .optional(),
  }),
  createByDoctor: Joi.object({
    service_id: Joi.string().external(relationExist("service")).optional(),
    start_date: Joi.date().required(),
    end_date: Joi.date().greater(Joi.ref("start_date")).optional(),
    title: Joi.string().max(50).required(),
    description: Joi.string().max(230).optional(),
  }),
  update: Joi.object({
    service_id: Joi.string().external(relationExist("service")).optional(),
    start_date: Joi.date().optional(),
    end_date: Joi.date().greater(Joi.ref("start_date")).optional(),
    title: Joi.string().max(50).optional(),
    description: Joi.string().max(230).optional(),
  }),
  setClient: Joi.object({
    client_id: Joi.string().external(relationExist("clientProfile")).required(),
    set: Joi.string().valid("add", "remove").required(),
  }),
  setDoctor: Joi.object({
    doctor_id: Joi.string().external(relationExist("doctorProfile")).required(),
    set: Joi.string().valid("add", "remove").required(),
  }),
};

export default ScheduleValidator;
