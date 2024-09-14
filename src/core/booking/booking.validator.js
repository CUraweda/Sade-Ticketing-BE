import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const BookingStatus = {
  DRAFT: "draft",
  NEED_CONFIRM: "need_confirm",
  NEED_PAYMENT: "need_payment",
  NEED_APPROVAL: "need_approval",
  ONGOING: "ongoing",
  COMPLETED: "completed",
};

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
      schedules: Joi.array()
        .items(Joi.string().external(relationExist("schedule")).required())
        .length(Joi.ref("quantity")),
    })
  ),
  bookingConfirm: Joi.object({
    bank_account_id: Joi.number()
      .external(relationExist("bankAccount"))
      .required(),
  }),
};

export default BookingValidator;
