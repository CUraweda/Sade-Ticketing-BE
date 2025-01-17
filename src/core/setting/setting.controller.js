import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import { filterDuplicate } from "../../utils/array.js";
import DocumentService from "../document/document.service.js";
import QuestionnaireService from "../questionnaire/questionnaire.service.js";
import SettingService from "./setting.service.js";
import { SettingKeys } from "./setting.validator.js";

class SettingController extends BaseController {
  #service;
  #questionnaireService;
  #documentService;

  constructor() {
    super();
    this.#service = new SettingService();
    this.#questionnaireService = new QuestionnaireService();
    this.#documentService = new DocumentService();
  }

  getDaycareSitInQuestionnaires = this.wrapper(async (req, res) => {
    let data = [];

    const setting = await this.#service.getValue(
      SettingKeys.DAYCARE_SITIN_QUESTIONNAIRE_IDS
    );
    if (setting)
      data = await this.#questionnaireService.findAll({
        paginate: false,
        in_: `id:${setting.value}`,
      });

    return this.ok(res, data);
  });

  setDaycareSitInQuestionnaires = this.wrapper(async (req, res) => {
    const ids = filterDuplicate(req.body.questionnaire_ids);

    await this.#service.setValue(
      SettingKeys.DAYCARE_SITIN_QUESTIONNAIRE_IDS,
      ids.join(",")
    );
    return this.ok(res);
  });

  getDaycareReportQuestionnaires = this.wrapper(async (req, res) => {
    let data = [];

    const setting = await this.#service.getValue(
      SettingKeys.DAYCARE_REPORT_QUESTIONNAIRE_IDS
    );
    if (setting)
      data = await this.#questionnaireService.findAll({
        paginate: false,
        in_: `id:${setting.value}`,
      });

    return this.ok(res, data);
  });

  setDaycareReportQuestionnaires = this.wrapper(async (req, res) => {
    const ids = filterDuplicate(req.body.questionnaire_ids);
    await this.#service.setValue(
      SettingKeys.DAYCARE_REPORT_QUESTIONNAIRE_IDS,
      ids.join(",")
    );
    return this.ok(res);
  });

  getDaycareAgreeDocs = this.wrapper(async (req, res) => {
    let data = [];

    const setting = await this.#service.getValue(
      SettingKeys.DAYCARE_AGREE_DOC_IDS
    );
    if (setting)
      data = await this.#documentService.findAll({
        paginate: false,
        in_: `id:${setting.value}`,
      });

    return this.ok(res, data);
  });

  setDaycareAgreeDocs = this.wrapper(async (req, res) => {
    const ids = filterDuplicate(req.body.document_ids);

    await this.#service.setValue(
      SettingKeys.DAYCARE_AGREE_DOC_IDS,
      ids.join(",")
    );
    return this.ok(res);
  });

  getDaycareSitInCost = this.wrapper(async (req, res) => {
    let price = 0;
    const setting = await this.#service.getValue(
      SettingKeys.DAYCARE_SITIN_COST
    );
    if (setting?.value) price = parseFloat(setting.value);
    return this.ok(res, price);
  });

  setDaycareSitInCost = this.wrapper(async (req, res) => {
    await this.#service.setValue(
      SettingKeys.DAYCARE_SITIN_COST,
      req.body.price.toString()
    );
    return this.ok(res);
  });
}

export default SettingController;
