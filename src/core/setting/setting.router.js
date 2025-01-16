import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import SettingController from "./setting.controller.js";
import SettingValidator from "./setting.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const r = Router(),
  validator = SettingValidator,
  controller = new SettingController();

r.get(
  "/daycare-sitin-questionnaires",
  authMiddleware(),
  controller.getDaycareSitInQuestionnaires
);

r.put(
  "/daycare-sitin-questionnaires",
  authMiddleware(["SDM"]),
  validatorMiddleware({ body: validator.setDaycareSitInForms }),
  controller.setDaycareSitInQuestionnaires
);

r.get(
  "/daycare-report-questionnaires",
  authMiddleware(),
  controller.getDaycareReportQuestionnaires
);

r.put(
  "/daycare-report-questionnaires",
  authMiddleware(["SDM"]),
  validatorMiddleware({ body: validator.setDaycareReportForms }),
  controller.setDaycareReportQuestionnaires
);

r.get(
  "/daycare-agree-documents",
  authMiddleware(),
  controller.getDaycareAgreeDocs
);

r.put(
  "/daycare-agree-documents",
  authMiddleware(["SDM"]),
  validatorMiddleware({ body: validator.setDaycareAgreeDocs }),
  controller.setDaycareAgreeDocs
);

const settingRouter = r;
export default settingRouter;
