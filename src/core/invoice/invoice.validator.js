import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const InvoiceStatus = {
  ISSUED: "issued",
  PAID: "paid",
  OVERDUE: "overdue",
};

export const InvoiceValidator = {
  create: Joi.object({
    title: Joi.string().max(50).optional(),
    status: Joi.valid(...Object.values(InvoiceStatus)).required(),
    expiry_date: Joi.date().optional(),
    note: Joi.string().max(100).optional(),
    user_id: Joi.string().external(relationExist("user")).required(),
    items: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().max(50).required(),
          quantity: Joi.string().min(1).required(),
          quantity_unit: Joi.string().optional(),
          price: Joi.number().required(),
          note: Joi.string().max(50).optional(),
        })
      )
      .optional(),
    fees: Joi.array()
      .items(
        Joi.object({
          fee_id: Joi.number().external(relationExist("fee")).required(),
          quantity: Joi.number().min(1).required(),
        })
      )
      .optional(),
  }),
  update: Joi.object({
    title: Joi.string().max(50).optional(),
    status: Joi.valid(...Object.values(InvoiceStatus)).optional(),
    expiry_date: Joi.date().optional(),
    note: Joi.string().max(100).optional(),
    // no-data
  }),
};

export default InvoiceValidator;
