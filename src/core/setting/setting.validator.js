import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const SettingKeys = {
  DAYCARE_SITIN_QUESTIONNAIRE_IDS: "daycare-sitin-questionnaire-ids",
  DAYCARE_REPORT_QUESTIONNAIRE_IDS: "daycare-report-questionnaire-ids",
};

export const SettingValidator = {
  setDaycareSitInForms: Joi.object({
    questionnaire_ids: Joi.array()
      .items(Joi.string().external(relationExist("questionnaire")).required())
      .required(),
  }),
  setDaycareReportForms: Joi.object({
    questionnaire_ids: Joi.array()
      .items(Joi.string().external(relationExist("questionnaire")).required())
      .required(),
  }),
};

export default SettingValidator;
