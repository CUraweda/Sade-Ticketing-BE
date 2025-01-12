import Joi from "joi";

export const BankAccountValidator = {
  create: Joi.object({
    title: Joi.string().max(50).required(),
    in_name: Joi.string().max(50).required(),
    account_number: Joi.string().max(20).required(),
    provider: Joi.string().max(20).required(),
  }),
  update: Joi.object({
    title: Joi.string().max(50).optional(),
    in_name: Joi.string().max(50).optional(),
    account_number: Joi.string().max(20).optional(),
    provider: Joi.string().max(20).optional(),
  }),
};

export default BankAccountValidator;
