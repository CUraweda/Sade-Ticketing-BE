import Joi from "joi";
import { relationExist } from "../../base/validator.base";

export const doctorCategory = ["TERAPIS", "PSIKOLOG", "ASESOR"];

export const doctorSexes = ["P", "L"];

export const DoctorValidator = {
  create: Joi.object({
    user_id: Joi.string().external(relationExist("user")).optional(),
    location_id: Joi.string().external(relationExist("location")).optional(),
    category: Joi.string()
      .valid(...doctorCategory)
      .required(),
    title: Joi.string().max(50).optional(),
    first_name: Joi.string().max(50).required(),
    last_name: Joi.string().max(50).optional(),
    email: Joi.string().email().required(),
    phone_number: Joi.string().max(24).optional(),
    pob: Joi.string().max(50).optional(),
    dob: Joi.date().optional(),
    address: Joi.string().max(50).optional(),
    sex: Joi.string()
      .valid(...doctorSexes)
      .optional(),
    is_active: Joi.bool().default(true),
  }),
  update: Joi.object({
    user_id: Joi.string().external(relationExist("user")).optional(),
    location_id: Joi.string().external(relationExist("location")).optional(),
    category: Joi.string()
      .valid(...doctorCategory)
      .optional(),
    title: Joi.string().max(50).optional(),
    first_name: Joi.string().max(50).optional(),
    last_name: Joi.string().max(50).optional(),
    email: Joi.string().email().optional(),
    phone_number: Joi.string().max(24).optional(),
    pob: Joi.string().max(50).optional(),
    dob: Joi.date().optional(),
    address: Joi.string().max(50).optional(),
    sex: Joi.string()
      .valid(...doctorSexes)
      .optional(),
    is_active: Joi.bool().default(true),
  }),
};

export default DoctorValidator;
