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
    confirm_password: Joi.string().max(constant.MAX_LEN_PW).required()
  }),
  resetPass: Joi.object({
    encoded_email: Joi.string().required(),
    new_password: Joi.string().max(constant.MAX_LEN_PW).required(),
    confirm_password: Joi.string().max(constant.MAX_LEN_PW).required(),
  })
};

export default AuthValidator;
