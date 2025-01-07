import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const RescheduleRequestValidator = {
  create: Joi.object({
    reason: Joi.string().required(),
    attendee_id: Joi.string()
      .external(relationExist("scheduleAttendee"))
      .required(),
    new_schedule_id: Joi.string()
      .external(relationExist("schedule"))
      .required(),
  }),
  update: Joi.object({
    reason: Joi.string().required(),
    attendee_id: Joi.string()
      .external(relationExist("scheduleAttendee"))
      .required(),
    new_schedule_id: Joi.string()
      .external(relationExist("schedule"))
      .required(),
  }),
  adminResponse: Joi.object({
    response: Joi.string().optional(),
    is_approved: Joi.boolean().allow(null).optional(),
    direct_to_new: Joi.boolean().optional(),
  }),
};

export default RescheduleRequestValidator;
