import Joi from "joi";

export const NotifType = {
  SCHEDULE_REMINDER: "schedule_reminder",
  BROADCAST: "broadcast",
  NONE: "none",
};

export const NotificationValidator = {
  create: Joi.object({
    title: Joi.string().max(50).required(),
    message: Joi.string().max(230).required(),
    type: Joi.string()
      .valid(...Object.values(NotifType))
      .default(NotifType.NONE),
    color: Joi.string().hex().optional(),
    payload: Joi.object().optional(),
    roles: Joi.array().items(Joi.string()).optional(),
    users: Joi.array()
      .items(
        Joi.object({
          user_id: Joi.string().required(),
        })
      )
      .optional(),
  }),
  update: Joi.object({
    title: Joi.string().max(50).optional(),
    message: Joi.string().max(230).optional(),
    type: Joi.string()
      .valid(...Object.values(NotifType))
      .default(NotifType.NONE),
    color: Joi.string().hex().optional(),
    payload: Joi.object().optional(),
    roles: Joi.array().items(Joi.string()).optional(),
    users: Joi.array()
      .items(
        Joi.object({
          user_id: Joi.string().required(),
        })
      )
      .optional(),
  }),
};

export default NotificationValidator;
