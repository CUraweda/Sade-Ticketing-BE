import Joi from "joi";

export const clientRelation = ["INDIVIDU", "ANAK", "TEMAN", "KEPONAKAN"];

export const clientCategory = ["ANAK", "REMAJA", "DEWASA"];

export const clientSexes = ["P", "L"];

export const clientBlood = ["A", "B", "AB", "O"];

export const clientValidator = {
  create: Joi.object({
    relation: Joi.string()
      .valid(...clientRelation)
      .required(),
    category: Joi.string()
      .valid(...clientCategory)
      .required(),
    first_name: Joi.string().max(50).required(),
    last_name: Joi.string().max(50).optional(),
    email: Joi.string().email().optional(),
    phone_number: Joi.string().max(24).optional(),
    pob: Joi.string().max(50).required(),
    dob: Joi.date().required(),
    address: Joi.string().max(50).optional(),
    sex: Joi.string()
      .valid(...clientSexes)
      .required(),
    blood_type: Joi.string().optional(),
    ethnic: Joi.string().max(24).optional(),
    nationality: Joi.string().max(24).optional(),
    is_active: Joi.bool().default(true),
  }),
  update: Joi.object({
    relation: Joi.string()
      .valid(...clientRelation)
      .optional(),
    category: Joi.string()
      .valid(...clientCategory)
      .optional(),
    first_name: Joi.string().max(50).optional(),
    last_name: Joi.string().max(50).optional(),
    email: Joi.string().email().optional(),
    phone_number: Joi.string().max(24).optional(),
    pob: Joi.string().max(50).optional(),
    dob: Joi.date().optional(),
    address: Joi.string().max(50).optional(),
    sex: Joi.string()
      .valid(...clientSexes)
      .optional(),
    blood_type: Joi.string().optional(),
    ethnic: Joi.string().max(24).optional(),
    nationality: Joi.string().max(24).optional(),
    is_active: Joi.bool().optional(),
  }),
};

export default clientValidator;
