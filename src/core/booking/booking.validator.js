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
};

export default BookingValidator;
