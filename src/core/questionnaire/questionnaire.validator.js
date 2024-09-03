import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const QuestionnaireValidator = {
  create: Joi.object({
    title: Joi.string().max(50).required(),
    description: Joi.string().max(100).required(),
  }),
  update: Joi.object({
    title: Joi.string().max(50).optional(),
    description: Joi.string().max(100).optional(),
  }),
  saveAnswers: Joi.array().items({
    question_id: Joi.number().external(relationExist("question")).optional(),
    text: Joi.string().optional(),
    number: Joi.number().optional(),
    date: Joi.date().optional(),
  }),
};

export default QuestionnaireValidator;
