import Joi from "joi";

export const UserChatValidator = {
  create: Joi.object({
    sender_id: Joi.string().required(),
    receiver_id: Joi.string().required(),
  }),
  update: Joi.object({
    sender_id: Joi.string().required(),
    receiver_id: Joi.string().required(),
  }),
};

export default UserChatValidator;
