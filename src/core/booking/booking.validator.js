import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const BookingStatus = {
  DRAFT: "draft",
  NEED_PAYMENT: "need_payment",
  NEED_APPROVAL: "need_approval",
  ONGOING: "ongoing",
  COMPLETED: "completed",
};

export const BookingValidator = {
  create: Joi.object({
    client_id: Joi.string().external(relationExist("clientProfile")).required(),
    service_id: Joi.string().external(relationExist("service")).required(),
    compliant: Joi.string().max(100).optional(),
    quantity: Joi.number().precision(0).min(1).required(),
  }),
  update: Joi.object({
    compliant: Joi.string().max(100).optional(),
    status: Joi.valid(...Object.values(BookingStatus)).optional(),
    compliant: Joi.string().max(100).optional(),
    start_date: Joi.date().optional(),
    end_date: Joi.date().min(Joi.ref("start_date")).when("start_date", {
      is: Joi.date().required(),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  }),
  setSchedules: Joi.object({
    quantity: Joi.number().min(1).required(),
    compliant: Joi.string().max(100).optional(),
    schedule_ids: Joi.array()
      .items(Joi.string().external(relationExist("schedule")).required())
      .length(Joi.ref("quantity")),
  }),
  createReportResponse: Joi.object({
    booking_id: Joi.string().external(relationExist("booking")).required(),
    questionnaire_id: Joi.string()
      .external(relationExist("questionnaire"))
      .required(),
  }),
};

export default BookingValidator;
