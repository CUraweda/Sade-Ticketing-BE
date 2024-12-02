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
          service_id: Joi.string()
            .external(relationExist("service"))
            .optional(),
          name: Joi.string().max(50).required(),
          quantity: Joi.number().min(1).required(),
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
          name: Joi.string().max(50).required(),
          quantity: Joi.number().min(1).required(),
          price: Joi.number().required(),
        })
      )
      .optional(),
  }),
  update: Joi.object({
    title: Joi.string().max(50).optional(),
    status: Joi.valid(...Object.values(InvoiceStatus)).optional(),
    expiry_date: Joi.date().optional(),
    note: Joi.string().max(100).optional(),
    user_id: Joi.string().external(relationExist("user")).required(),
    items: Joi.array()
      .items(
        Joi.object({
          service_id: Joi.string()
            .external(relationExist("service"))
            .optional(),
          name: Joi.string().max(50).required(),
          quantity: Joi.number().min(1).required(),
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
          name: Joi.string().max(50).required(),
          quantity: Joi.number().min(1).required(),
          price: Joi.number().required(),
        })
      )
      .optional(),
  }),
  createOvertime: Joi.object({
    title: Joi.string().max(50).optional(),
    status: Joi.valid(...Object.values(InvoiceStatus)).required(),
    expiry_date: Joi.date().optional(),
    note: Joi.string().max(100).optional(),
    user_id: Joi.string().required(),
    booking_id: Joi.string().required(),
    fees: Joi.array()
      .items(
        Joi.object({
          fee_id: Joi.number().external(relationExist("fee")).required(),
          name: Joi.string().max(50).required(),
          quantity: Joi.number().min(1).required(),
          price: Joi.number().required(),
        })
      )
      .optional(),
  }),
  updateOvertime: Joi.object({
    title: Joi.string().max(50).optional(),
    status: Joi.valid(...Object.values(InvoiceStatus)).optional(),
    expiry_date: Joi.date().optional(),
    note: Joi.string().max(100).optional(),
    user_id: Joi.string().required(),
    booking_id: Joi.string().required(),
    fees: Joi.array()
      .items(
        Joi.object({
          fee_id: Joi.number().external(relationExist("fee")).required(),
          name: Joi.string().max(50).required(),
          quantity: Joi.number().min(1).required(),
          price: Joi.number().required(),
        })
      )
      .optional(),
  }),
};

export default InvoiceValidator;
