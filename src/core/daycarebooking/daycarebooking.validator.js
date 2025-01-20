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
    price_id: Joi.string().external(relationExist("daycarePrice")).optional(),
    start_date: Joi.date().optional(),
    end_date: Joi.date().greater(Joi.ref("start_date")).optional(),
    note: Joi.string().max(150).optional(),
    is_locked: Joi.boolean().optional(),
  }),
  updateAgreeDoc: Joi.object({
    document_id: Joi.string().external(relationExist("document")).required(),
    is_agree: Joi.bool().required(),
  }),
  createReportResponse: Joi.object({
    questionnaire_id: Joi.string()
      .external(relationExist("questionnaire"))
      .required(),
  }),
};

export default DaycareBookingValidator;
