import Joi from "joi";

export const QuestionnaireValidator = {
  create: Joi.object({
    title: Joi.string().max(50).required(),
    description: Joi.string().max(100).required(),
  }),
  update: Joi.object({
    title: Joi.string().max(50).optional(),
    description: Joi.string().max(100).optional(),
  }),
};

export default QuestionnaireValidator;
