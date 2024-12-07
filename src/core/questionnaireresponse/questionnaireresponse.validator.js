import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const QuestionnaireResponseValidator = {
  create: Joi.object({
    // no-data
  }),
  update: Joi.object({
    // no-data
  }),
  addSignature: Joi.object({
    signature_id: Joi.string().external(relationExist("signature")).required(),
    signed_place: Joi.string().max(50).optional(),
  }),
};

export default QuestionnaireResponseValidator;
