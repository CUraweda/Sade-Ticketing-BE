import Joi from "joi";

export const PaymentsValidator = {
  create: Joi.object({
    booking_id: Joi.string().required(),
    payment_method: Joi.string().required(),
  }),
  update: Joi.object({
    status: Joi.string()
      .valid(
        "unpaid",
        "paid",
        "settled",
        "expired",
        "active",
        "stopped",
        "completed"
      )
      .required(),
  }),
};

export default PaymentsValidator;
