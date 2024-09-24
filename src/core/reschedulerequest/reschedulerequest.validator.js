import Joi from "joi";

export const RescheduleRequestValidator = {
  create: Joi.object({
    reason: Joi.string().required(),
    schedule_id: Joi.string().uuid().required(),
    start_date: Joi.date().iso(),
    end_date: Joi.date().iso().min(Joi.ref("start_date")),
    new_schedule_id: Joi.string().uuid(),
    user_id: Joi.string().uuid().required(),
  }),
  update: Joi.object({
    reason: Joi.string(),
    start_date: Joi.date().iso(),
    end_date: Joi.date().iso().min(Joi.ref("start_date")),
    new_schedule_id: Joi.string().uuid(),
    is_approved: Joi.boolean(),
  }),
};

export default RescheduleRequestValidator;
