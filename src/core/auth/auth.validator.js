import Joi from "joi";
import constant from "../../config/constant.js";

export const AuthValidator = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().max(constant.MAX_LEN_PW).required(),
  }),
  register: Joi.object({
    full_name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().max(constant.MAX_LEN_PW).required(),
    confirm_password: Joi.string()
      .max(constant.MAX_LEN_PW)
      .valid(Joi.ref("password"))
      .messages({
        "any.only": "Konfirmasi password tidak cocok dengan password",
      })
      .required(),
  }),
  resetPass: Joi.object({
    encoded_email: Joi.string().required(),
    new_password: Joi.string().max(constant.MAX_LEN_PW).required(),
    confirm_password: Joi.string()
      .max(constant.MAX_LEN_PW)
      .valid(Joi.ref("new_password"))
      .messages({
        "any.only": "Konfirmasi password tidak cocok dengan password baru",
      })
      .required(),
  }),
};

export default AuthValidator;
