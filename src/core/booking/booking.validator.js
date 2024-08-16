import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const BookingValidator = {
  create: Joi.object({
    // no-data
  }),
  update: Joi.object({
    // no-data
  }),
  book: Joi.object({
    profile_id: Joi.string()
      .external(relationExist("clientProfile"))
      .required(),
    compliant: Joi.string().max(100).required(),
    services: Joi.array()
      .items(
        Joi.object({
          quantity: Joi.number().min(1).required(),
          id: Joi.string().external(relationExist("service")).required(),
        })
      )
      .min(1)
      .required(),
  }),
  bookSchedule: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      quantity: Joi.number().min(1).required(),
      compliant: Joi.string().max(100).required(),
      sessions: Joi.array().items(
        Joi.string().external(relationExist("doctorSession")).required()
      ),
    })
  ),
};

export default BookingValidator;
