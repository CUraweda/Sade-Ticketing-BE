import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const DaycareLinkBookStatus = {
  PRESENT: "present",
  SICK: "sick",
  PERMITTED: "permitted",
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
    // no-data
  }),
};

export default DaycareLinkBookValidator;
