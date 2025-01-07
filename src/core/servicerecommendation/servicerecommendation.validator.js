import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";
import { WeeklyFrequency } from "../booking/booking.validator.js";

export const ServiceRecommendationValidator = {
  create: Joi.object({
    booking_id: Joi.string().external(relationExist("booking")).optional(),
    client_id: Joi.string().external(relationExist("clientProfile")).required(),
    service_id: Joi.string().external(relationExist("service")).required(),
    note: Joi.string().max(150).optional(),
    quantity: Joi.number().integer().min(1).required(),
    weekly_frequency: Joi.string()
      .valid(...Object.values(WeeklyFrequency))
      .optional(),
  }),
  update: Joi.object({
    booking_id: Joi.string().external(relationExist("booking")).optional(),
    client_id: Joi.string().external(relationExist("clientProfile")).optional(),
    service_id: Joi.string().external(relationExist("service")).optional(),
    note: Joi.string().max(150).optional(),
    quantity: Joi.number().integer().min(1).optional(),
    weekly_frequency: Joi.string()
      .valid(...Object.values(WeeklyFrequency))
      .optional(),
  }),
};

export default ServiceRecommendationValidator;
