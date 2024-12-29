import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const ClientScheduleStatus = {
  PRESENT: "present",
  SICK: "sick",
  PERMITTED: "permitted",
};

export const ScheduleRepeat = {
  MONTHLY: "monthly",
  DAILY: "daily",
  WEEKLY: "weekly",
};

export const ScheduleValidator = {
  create: Joi.object({
    service_id: Joi.string().external(relationExist("service")).optional(),
    dates: Joi.array()
      .items(
        Joi.object({
          start_date: Joi.date().required(),
          end_date: Joi.date().greater(Joi.ref("start_date")).required(),
          repeat: Joi.string()
            .valid(...Object.values(ScheduleRepeat))
            .optional(),
          repeat_end: Joi.date().greater(Joi.ref("end_date")).optional(),
        })
      )
      .min(1)
      .required(),
    title: Joi.string().max(50).required(),
    description: Joi.string().max(230).optional(),
    doctors: Joi.array()
      .items(Joi.string().external(relationExist("doctorProfile")).required())
      .optional(),
    attendees: Joi.array()
      .items(
        Joi.string().external(relationExist("scheduleAttendee")).required()
      )
      .optional(),
    max_attendees: Joi.number().min(1).optional(),
  }),
  update: Joi.object({
    service_id: Joi.string().external(relationExist("service")).optional(),
    start_date: Joi.date().optional(),
    end_date: Joi.date().greater(Joi.ref("start_date")).optional(),
    title: Joi.string().max(50).optional(),
    description: Joi.string().max(230).optional(),
    repeat: Joi.string()
      .valid(...Object.values(ScheduleRepeat))
      .optional(),
    repeat_end: Joi.date().greater(Joi.ref("end_date")).optional(),
    max_attendees: Joi.number().min(1).optional(),
  }),
  detach: Joi.object({
    start_date: Joi.date().required(),
    end_date: Joi.date().greater(Joi.ref("start_date")).required(),
    mode: Joi.string().valid("with_parent", "leave_parent").required(),
  }),
  setDoctor: Joi.object({
    doctor_id: Joi.string().external(relationExist("doctorProfile")).required(),
    set: Joi.string().valid("add", "remove").required(),
  }),
  checkAvailability: Joi.array().items(
    Joi.object({
      schedule_id: Joi.string().external(relationExist("schedule")).required(),
    })
  ),
};

export default ScheduleValidator;
