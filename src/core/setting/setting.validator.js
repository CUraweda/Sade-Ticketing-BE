import Joi from "joi";
import { relationExist } from "../../base/validator.base.js";

export const SettingKeys = {
  DAYCARE_SITIN_QUESTIONNAIRE_IDS: "daycare-sitin-questionnaire-ids",
  DAYCARE_REPORT_QUESTIONNAIRE_IDS: "daycare-report-questionnaire-ids",
  DAYCARE_AGREE_DOC_IDS: "daycare-agree-doc-ids",
  DAYCARE_SITIN_COST: "daycare-sitin-cost",
  DAYCARE_ENTRY_FEES: "daycare-entry-fees",
};

export const SettingValidator = {
  setDaycareSitInForms: Joi.object({
    questionnaire_ids: Joi.array()
      .items(Joi.string().external(relationExist("questionnaire")))
      .required(),
  }),
  setDaycareReportForms: Joi.object({
    questionnaire_ids: Joi.array()
      .items(Joi.string().external(relationExist("questionnaire")))
      .required(),
  }),
  setDaycareAgreeDocs: Joi.object({
    document_ids: Joi.array()
      .items(Joi.string().external(relationExist("document")))
      .required(),
  }),
  setDaycareSitInCost: Joi.object({
    price: Joi.number().required(),
  }),
  setDaycareEntryFees: Joi.object({
    fee_ids: Joi.array()
      .items(Joi.number().external(relationExist("fee")))
      .required(),
  }),
};

export default SettingValidator;
