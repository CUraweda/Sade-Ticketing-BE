import Joi from "joi";
import constant from "../../config/constant.js";

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
      .regex(/^[A-Za-z]+$/)
      .optional()
      .messages({
        "string.pattern.base": "Name must contain only letters",
      }),
    email: Joi.string().email().optional(),
    password: Joi.string().max(constant.MAX_LEN_PW).optional(),
    status: Joi.boolean().optional(),
    email_verified: Joi.boolean().optional(),
  }),
};

export default UserValidator;
