import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const PaymentMethod = {
  MANUAL_TRANSFER: "manual_transfer",
  MANUAL_INPUT: "manual_input",
};

export const PaymentStatus = {
  UNPAID: "unpaid",
  PAID: "paid",
  SETTLED: "settled",
  EXPIRED: "expired",
  ACTIVE: "active",
  STOPPED: "stopped",
  COMPLETED: "completed",
};

export const PaymentType = {
  IN: "in",
  OUT: "out",
};

export const PaymentsValidator = {
  createManualInput: Joi.object({
    amount_paid: Joi.number().required(),
    bank_account_id: Joi.number()
      .external(relationExist("bankAccount"))
      .required(),
    note: Joi.string().max(150).optional(),
    type: Joi.string()
      .valid(...Object.values(PaymentType))
      .required(),
  }),
  update: Joi.object({
    status: Joi.string()
      .valid(...Object.values(PaymentStatus))
      .required(),
  }),
  payManualTransfer: Joi.object({
    invoice_ids: Joi.array()
      .items(Joi.string().external(relationExist("invoice")).required())
      .min(1)
      .required(),
    bank_account_id: Joi.number()
      .external(relationExist("bankAccount"))
      .optional(),
  }),
};

export default PaymentsValidator;
