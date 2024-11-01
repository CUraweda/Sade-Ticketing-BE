import Joi from "joi";
import constant from "../../config/constant.js";
import { relationExist } from "../../base/validator.base.js";

export const UserValidator = {
  create: Joi.object({
    full_name: Joi.string()
      .max(50)
      .regex(/^[A-Za-z\s]+$/)
      .required()
      .messages({
        "string.pattern.base": "Name must contain only letters and spaces",
      }),
    email: Joi.string().email().required(),
    password: Joi.string()
      // .pattern(
      //   new RegExp(
      //     "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
      //   )
      // )
      .max(constant.MAX_LEN_PW)
      .required(),
    status: Joi.boolean().default(true),
    email_verified: Joi.boolean().default(true),
  }),
  update: Joi.object({
    full_name: Joi.string()
      .max(50)
      .regex(/^[A-Za-z\s]+$/)
      .optional()
      .messages({
        "string.pattern.base": "Name must contain only letters and spaces",
      }),
    email: Joi.string().email().optional(),
    password: Joi.string().max(constant.MAX_LEN_PW).optional(),
    status: Joi.boolean().optional(),
    email_verified: Joi.boolean().optional(),
  }),
  assignRole: Joi.array().items(
    Joi.object({
      role_id: Joi.string().external(relationExist("role")).required(),
      is_active: Joi.boolean().required(),
    })
  ),
};

export default UserValidator;
