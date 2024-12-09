import Joi from "joi";

export const QuestionTyp = {
  TEXT: "text",
  TIME: "time",
  SELECT: "select",
  CHECKBOX: "checkbox",
  RADIO: "radio",
  FILE: "file",
  COLOR: "color",
  EMAIL: "email",
  TEL: "tel",
  TEXTAREA: "textarea",
  NUMBER: "number",
  DATE: "date",
  DATETIME: "datetime",
  WYSIWYG: "wysiwyg",
};

export const QuestionValidator = {
  create: Joi.object({
    // no-data
  }),
  update: Joi.object({
    // no-data
  }),
};

export default QuestionValidator;
