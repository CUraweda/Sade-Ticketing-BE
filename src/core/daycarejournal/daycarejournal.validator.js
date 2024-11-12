import Joi from "joi";

export const daycarejournalValidator = {
  create: Joi.object({
    client_id: Joi.string().required(),
    booking_id: Joi.string().required(),
    date: Joi.date().required(),
    bed_time: Joi.date().required(),
    wakeup_time: Joi.date().required(),
    body_temperatur: Joi.number().required(),
    breakfast_menu: Joi.string().required(),
    is_poop: Joi.boolean().required(),
    parent_note: Joi.string().allow(null),

    is_present: Joi.boolean().allow(null),
    morning_snack: Joi.string().allow(null),
    noon_snack: Joi.string().allow(null),
    afternoon_snack: Joi.string().allow(null),
    is_sleep_soundly: Joi.boolean().allow(null),
    poop_count: Joi.number().integer().allow(null),
    fav_activity: Joi.string().allow(null),
    daily_progress_report: Joi.string().allow(null),
    facilitator_note: Joi.string().allow(null),
    today_feeling: Joi.string().allow(null),
  }),
  update: Joi.object({
    date: Joi.date().required(),
    bed_time: Joi.date().required(),
    wakeup_time: Joi.date().required(),
    body_temperatur: Joi.number().required(),
    breakfast_menu: Joi.string().required(),
    is_poop: Joi.boolean().required(),
    parent_note: Joi.string().allow(null),

    is_present: Joi.boolean().allow(null),
    morning_snack: Joi.string().allow(null),
    noon_snack: Joi.string().allow(null),
    afternoon_snack: Joi.string().allow(null),
    is_sleep_soundly: Joi.boolean().allow(null),
    poop_count: Joi.number().integer().allow(null),
    fav_activity: Joi.string().allow(null),
    daily_progress_report: Joi.string().allow(null),
    facilitator_note: Joi.string().allow(null),
    today_feeling: Joi.string().allow(null),
  }),
};

export default daycarejournalValidator;
