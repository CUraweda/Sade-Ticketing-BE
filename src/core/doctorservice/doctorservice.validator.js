import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const DoctorServiceValidator = {
  create: Joi.object({
    doctor_id: Joi.string().external(relationExist("doctorProfile")).required(),
    service_id: Joi.string().external(relationExist("service")).required(),
    salary: Joi.number().required(),
  }),
  update: Joi.object({
    doctor_id: Joi.string().external(relationExist("doctorProfile")).optional(),
    service_id: Joi.string().external(relationExist("service")).optional(),
    salary: Joi.number().optional(),
  }),
};

export default DoctorServiceValidator;
