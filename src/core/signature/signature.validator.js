import Joi from "joi";

export const SignatureRole = {
  ORANG_TUA: "orang_tua",
  KLIEN: "klien",
  PSI: "psikolog",
  ASR: "asesor",
  TRS: "terapis",
  ADM: "admin",
};

export const SignatureValidator = {
  create: Joi.object({
    name: Joi.string().max(50).required(),
    role: Joi.string()
      .valid(...Object.values(SignatureRole))
      .required(),
    detail: Joi.string().max(50).optional(),
  }),
  update: Joi.object({
    name: Joi.string().max(50).optional(),
    role: Joi.string()
      .valid(...Object.values(SignatureRole))
      .optional(),
    detail: Joi.string().max(50).optional(),
  }),
};

export default SignatureValidator;
