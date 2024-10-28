import Joi from "joi";

export const RoleCode = {
  SUPERADMIN: "SDM",
  ADMIN: "ADM",
  USER: "USR",
  PSIKOLOG: "PSI",
  ASESOR: "ASR",
  TERAPIS: "TRS",
};

export const RoleValidator = {
  create: Joi.object({
    code: Joi.string().max(4).required(),
    name: Joi.string().max(50).required(),
    is_active: Joi.boolean().default(true),
  }),
  update: Joi.object({
    code: Joi.string().max(4).optional(),
    name: Joi.string().max(50).optional(),
    is_active: Joi.boolean().optional(),
  }),
};

export default RoleValidator;
