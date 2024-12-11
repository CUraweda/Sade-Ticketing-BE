import Joi from "joi";

export const servicePriceValidator = {
  create: Joi.object({
    privilege_id: Joi.string().required(),
    service_id: Joi.string().required(),
    price: Joi.number().required(),
  }),
  update: Joi.object({
    privilege_id: Joi.string().required(),
    service_id: Joi.string().required(),
    price: Joi.number().required(),
  }),
};

export default servicePriceValidator;
