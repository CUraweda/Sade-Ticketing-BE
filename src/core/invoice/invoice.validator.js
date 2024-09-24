import Joi from "joi";

export const InvoiceStatus = {
  ISSUED: "issued",
  PAID: "paid",
  OVERDUE: "overdue",
};

export const InvoiceValidator = {
  create: Joi.object({
    // no-data
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
