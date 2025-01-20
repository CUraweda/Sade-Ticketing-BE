import Joi from "joi";
import { relationExist, TimeCycle } from "../../base/validator.base.js";

export const DaycareShortReportValidator = {
  create: Joi.object({
    booking_id: Joi.string()
      .external(relationExist("daycareBooking"))
      .required(),
    cycle: Joi.string()
      .valid(...Object.values(TimeCycle))
      .required(),
    weight: Joi.number().optional(),
    height: Joi.number().optional(),
  }),
  update: Joi.object({
    booking_id: Joi.string()
      .external(relationExist("daycareBooking"))
      .optional(),
    cycle: Joi.string()
      .valid(...Object.values(TimeCycle))
      .optional(),
    weight: Joi.number().optional(),
    height: Joi.number().optional(),
  }),
};

export default DaycareShortReportValidator;
