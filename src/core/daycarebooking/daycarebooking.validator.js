import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const DaycareBookingStatus = {
  DRAFT: "draft",
  ONGOING: "ongoing",
  COMPLETED: "completed",
};

export const DaycareBookingValidator = {
  create: Joi.object({
    client_id: Joi.string().external(relationExist("clientProfile")).required(),
    note: Joi.string().max(150).optional(),
  }),
  update: Joi.object({
    // no-data
  }),
};

export default DaycareBookingValidator;
