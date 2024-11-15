import Joi from "joi";

export const daycarelogtimeValidator = {
  create: Joi.object({
    fee_id: Joi.number().integer().optional(),
    journal_id: Joi.string().required(),
    time: Joi.date().iso().required(),
    title: Joi.string().required(),
    description: Joi.string().optional(),
  }),
  update: Joi.object({
    fee_id: Joi.number().integer().optional(),
    journal_id: Joi.string().required(),
    time: Joi.date().iso().required(),
    title: Joi.string().required(),
    description: Joi.string().optional(),
  }),
};

export default daycarelogtimeValidator;
