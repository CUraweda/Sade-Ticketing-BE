import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import DashboardController from "./dashboard.controller.js";
import DashboardValidator from "./dashboard.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const r = Router(),
  validator = DashboardValidator,
  controller = new DashboardController();

r.get(
  "/top-services",
  authMiddleware(["ADM", "SDM"]),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.topServices
);

const dashboardRouter = r;
export default dashboardRouter;