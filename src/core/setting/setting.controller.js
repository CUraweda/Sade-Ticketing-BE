import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import QuestionnaireService from "../questionnaire/questionnaire.service.js";
import SettingService from "./setting.service.js";
import { SettingKeys } from "./setting.validator.js";

class SettingController extends BaseController {
  #service;
  #questionnaireService;

  constructor() {
    super();
    this.#service = new SettingService();
    this.#questionnaireService = new QuestionnaireService();
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
    await this.#service.setValue(
      SettingKeys.DAYCARE_SITIN_QUESTIONNAIRE_IDS,
      req.body.questionnaire_ids.join(",")
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
    await this.#service.setValue(
      SettingKeys.DAYCARE_REPORT_QUESTIONNAIRE_IDS,
      req.body.questionnaire_ids.join(",")
    );
    return this.ok(res);
  });
}

export default SettingController;
