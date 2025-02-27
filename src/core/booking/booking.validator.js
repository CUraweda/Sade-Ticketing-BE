import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const BookingStatus = {
  DRAFT: "draft",
  NEED_PAYMENT: "need_payment",
  NEED_APPROVAL: "need_approval",
  ONGOING: "ongoing",
  COMPLETED: "completed",
};

export const WeeklyFrequency = {
  ONCE: "once",
  TWICE: "twice",
};

export const BookingValidator = {
  create: Joi.object({
    recommendation_id: Joi.string()
      .external(relationExist("serviceRecommendation"))
      .optional(),
    client_id: Joi.string().external(relationExist("clientProfile")).required(),
    service_id: Joi.string().external(relationExist("service")).required(),
    compliant: Joi.string().max(100).optional(),
    quantity: Joi.number().precision(0).min(1).required(),
    weekly_frequency: Joi.string()
      .valid(...Object.values(WeeklyFrequency))
      .optional(),
  }),
  update: Joi.object({
    compliant: Joi.string().max(100).optional(),
    quantity: Joi.number().precision(0).min(1).optional(),
    status: Joi.valid(...Object.values(BookingStatus)).optional(),
    title: Joi.string().max(100).optional(),
    is_locked: Joi.bool().optional(),
    weekly_frequency: Joi.string()
      .valid(...Object.values(WeeklyFrequency))
      .optional(),
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
  updateAgreementDocument: Joi.object({
    is_agreed: Joi.bool().required(),
  }),
};

export default BookingValidator;
