import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const ChatValidator = {
  create: Joi.object({
    chatroom_id: Joi.string().external(relationExist("chatRoom")).required(),
    parent_id: Joi.string().external(relationExist("chat")).optional(),
    message: Joi.string().required(),
  }),
  update: Joi.object({
    // no-data
  }),
};

export default ChatValidator;
