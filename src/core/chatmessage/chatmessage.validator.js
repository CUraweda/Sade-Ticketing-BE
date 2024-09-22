import Joi from "joi";

export const ChatMessageValidator = {
  create: Joi.object({
    sender_id: Joi.string().required(),
    receiver_id: Joi.string().required(),
    message: Joi.string().required(),
    unique_id: Joi.string().required(),
  }),
  update: Joi.object({
    message: Joi.string().required()
  }),
};

export default ChatMessageValidator;
