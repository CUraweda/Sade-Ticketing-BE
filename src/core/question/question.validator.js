import Joi from "joi";

const question_typ = [
  "text",
  "time",
  "select",
  "checkbox",
  "radio",
  "file",
  "color",
  "email",
  "tel",
  "textarea",
  "number",
  "date",
  "datetime",
  "wysiwyg",
];

export const QuestionValidator = {
  create: Joi.object({
    // no-data
  }),
  update: Joi.object({
    // no-data
  }),
};

export default QuestionValidator;
