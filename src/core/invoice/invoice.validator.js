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
    // no-data
  }),
};

export default InvoiceValidator;
