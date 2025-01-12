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

r.get(
  "/admin-stats",
  authMiddleware(["ADM", "SDM"]),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.adminStats
);

r.get("/admin-charts", authMiddleware(["ADM", "SDM"]), controller.adminCharts);

r.get("/user-stats", authMiddleware(["USR"]), controller.userStats);

r.get(
  "/doctor-stats/:doctor_id",
  authMiddleware(["PSI", "TRS", "ASR", "ADM", "SDM"]),
  controller.doctorStats
);

r.get(
  "/doctor-services-stat/:doctor_id",
  authMiddleware(["PSI", "TRS", "ASR", "ADM", "SDM"]),
  controller.doctorServicesStat
);

r.get("/stats", authMiddleware(), controller.stats);

r.get(
  "/finance-stats",
  authMiddleware(["ADM", "SDM"]),
  controller.financeStats
);

r.get(
  "/finance-bank-chart",
  authMiddleware(["ADM", "SDM"]),
  controller.bankChart
);

const dashboardRouter = r;
export default dashboardRouter;
