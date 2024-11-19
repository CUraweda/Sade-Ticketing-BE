import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const ClientScheduleStatus = {
  PRESENT: "present",
  SICK: "sick",
  PERMITTED: "permitted",
};

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
    max_bookings: Joi.number().min(1).optional(),
  }),
  createByDoctor: Joi.object({
    service_id: Joi.string().external(relationExist("service")).optional(),
    start_date: Joi.date().required(),
    end_date: Joi.date().greater(Joi.ref("start_date")).optional(),
    title: Joi.string().max(50).required(),
    description: Joi.string().max(230).optional(),
    max_bookings: Joi.number().min(1).optional(),
  }),
  setOvertime: Joi.object({
    minutes: Joi.number().min(1).required(),
  }),
  update: Joi.object({
    service_id: Joi.string().external(relationExist("service")).optional(),
    start_date: Joi.date().optional(),
    end_date: Joi.date().greater(Joi.ref("start_date")).optional(),
    title: Joi.string().max(50).optional(),
    description: Joi.string().max(230).optional(),
    max_bookings: Joi.number().min(1).optional(),
  }),
  setClient: Joi.object({
    client_id: Joi.string().external(relationExist("clientProfile")).required(),
    set: Joi.string().valid("add", "remove").required(),
  }),
  setDoctor: Joi.object({
    doctor_id: Joi.string().external(relationExist("doctorProfile")).required(),
    set: Joi.string().valid("add", "remove").required(),
  }),
  setClientStatus: Joi.object({
    client_id: Joi.string().external(relationExist("clientProfile")).required(),
    status: Joi.string()
      .valid(...Object.values(ClientScheduleStatus))
      .required(),
    note: Joi.string().max(50).optional(),
  }),
};

export default ScheduleValidator;
