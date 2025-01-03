import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const AttendeeStatus = {
  PRESENT: "present",
  SICK: "sick",
  EXCUSED: "excused",
};

export const ScheduleAttendeeValidator = {
  create: Joi.object({
    booking_id: Joi.string().external(relationExist("booking")).required(),
    schedules: Joi.array().items(
      Joi.object({
        schedule_id: Joi.string()
          .external(relationExist("schedule"))
          .required(),
        group_label: Joi.string().optional(),
      })
    ),
  }),
  update: Joi.object({
    schedule_id: Joi.string().external(relationExist("schedule")).optional(),
    booking_id: Joi.string().external(relationExist("booking")).optional(),
    status: Joi.string()
      .valid(...Object.values(AttendeeStatus))
      .optional(),
    note: Joi.string().max(230).optional(),
    group_label: Joi.string().max(50).optional(),
    overtime: Joi.number().integer().optional(),
    is_active: Joi.boolean().optional(),
  }),
};

export default ScheduleAttendeeValidator;
