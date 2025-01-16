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

const settingRouter = r;
export default settingRouter;
