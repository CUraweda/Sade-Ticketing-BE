import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const doctorCategory = ["TERAPIS", "PSIKOLOG", "ASESOR"];

export const doctorSexes = ["P", "L"];

export const DoctorValidator = {
  create: Joi.object({
    user_id: Joi.string().external(relationExist("user")).optional(),
    location_id: Joi.number().external(relationExist("location")).optional(),
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
    grade_id: Joi.number().external(relationExist("doctorGrade")).optional(),
  }),
  update: Joi.object({
    user_id: Joi.string().external(relationExist("user")).optional(),
    location_id: Joi.number().external(relationExist("location")).optional(),
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
    grade_id: Joi.number().external(relationExist("doctorGrade")).optional(),
  }),
  setSpecialism: Joi.object({
    specialism_id: Joi.number()
      .external(relationExist("specialism"))
      .required(),
    set: Joi.string().valid("add", "remove").required(),
  }),
  setService: Joi.object({
    service_id: Joi.string().external(relationExist("service")).required(),
    set: Joi.string().valid("add", "remove").required(),
  }),
};

export default DoctorValidator;
