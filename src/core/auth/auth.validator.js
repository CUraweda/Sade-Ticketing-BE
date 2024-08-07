import Joi from "joi";
import constant from "../../config/constant.js";

export const AuthValidator = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().max(constant.MAX_LEN_PW).required(),
  }),
  register: Joi.object({
    // no-data
  }),
};

export default AuthValidator;
