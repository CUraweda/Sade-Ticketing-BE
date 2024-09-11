import Joi from "joi";

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
};

export default PaymentsValidator;
