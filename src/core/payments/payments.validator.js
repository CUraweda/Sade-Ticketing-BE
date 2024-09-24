import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const PaymentMethod = {
  MANUAL_TRANSFER: "manual_transfer",
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

export const PaymentsValidator = {
  create: Joi.object({
    booking_id: Joi.string().required(),
    payment_method: Joi.string().required(),
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
