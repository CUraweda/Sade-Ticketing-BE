import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const DaycareLinkBookStatus = {
  PRESENT: "present",
  SICK: "sick",
  PERMITTED: "permitted",
};

export const DaycareLinkBookFeeling = {
  HAPPY: "happy",
  FUN: "fun",
  NEUTRAL: "neutral",
};

export const DaycareLinkBookValidator = {
  create: Joi.object({
    booking_id: Joi.string()
      .external(relationExist("daycareBooking"))
      .required(),
    date: Joi.date().required(),
    status: Joi.string()
      .valid(...Object.values(DaycareLinkBookStatus))
      .required(),
  }),
  update: Joi.object({
    bed_time: Joi.date().optional(),
    wakeup_time: Joi.date().optional(),
    is_poop: Joi.boolean().optional(),
    body_temp: Joi.number().optional(),
    breakfast_menu: Joi.string().optional(),
    parent_note: Joi.string().max(150).optional(),
  }),
  updateByFacilitator: Joi.object({
    status: Joi.string()
      .valid(...Object.values(DaycareLinkBookStatus))
      .optional(),
    today_feeling: Joi.string()
      .valid(...Object.values(DaycareLinkBookFeeling))
      .optional(),
    morning_snack: Joi.string().max(50).optional(),
    noon_snack: Joi.string().max(50).optional(),
    afternoon_snack: Joi.string().max(50).optional(),
    fav_activity: Joi.string().max(50).optional(),
    is_sleep_soundly: Joi.boolean().optional(),
    poop_count: Joi.number().optional(),
    daily_progress_report: Joi.string(),
    facilitator_note: Joi.string(),
  }),
};

export default DaycareLinkBookValidator;
