import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const ChatRoomValidator = {
  create: Joi.object({
    name: Joi.string().when("is_group", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    is_group: Joi.bool().default(false),
    members: Joi.when("is_group", {
      is: true,
      then: Joi.array()
        .items(
          Joi.object({
            user_id: Joi.string().external(relationExist("user")),
          })
        )
        .min(1),
      otherwise: Joi.array()
        .items(
          Joi.object({
            user_id: Joi.string().external(relationExist("user")),
          })
        )
        .length(1),
    }).required(),
  }),
  update: Joi.object({
    name: Joi.string().when("is_group", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    is_group: Joi.bool().default(false),
  }),
};

export default ChatRoomValidator;
