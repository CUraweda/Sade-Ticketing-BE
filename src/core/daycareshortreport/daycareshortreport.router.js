import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import DaycareShortReportController from "./daycareshortreport.controller.js";
import DaycareShortReportValidator from "./daycareshortreport.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const r = Router(),
  validator = DaycareShortReportValidator,
  controller = new DaycareShortReportController();

r.get(
  "/show-all",
  authMiddleware(),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get("/show-one/:id", authMiddleware(), controller.findById);

r.post(
  "/create",
  authMiddleware(["ADM"]),
  validatorMiddleware({ body: validator.create }),
  controller.create
);

r.put(
  "/update/:id",
  authMiddleware(["ADM"]),

  validatorMiddleware({ body: validator.update }),
  controller.update
);

r.delete("/delete/:id", authMiddleware(["ADM"]), controller.delete);

const daycareshortreportRouter = r;
export default daycareshortreportRouter;
