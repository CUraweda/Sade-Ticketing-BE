import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import DaycareBookingController from "./daycarebooking.controller.js";
import DaycareBookingValidator from "./daycarebooking.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const r = Router(),
  validator = DaycareBookingValidator,
  controller = new DaycareBookingController();

r.get(
  "/show-all",
  authMiddleware(),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get("/show-one/:id", authMiddleware(), controller.findById);

r.post(
  "/create",
  authMiddleware(["USR"]),
  validatorMiddleware({ body: validator.create }),
  controller.create
);

r.post(
  "/create-report-response/:id",
  authMiddleware(["ADM"]),
  validatorMiddleware({ body: validator.createReportResponse }),
  controller.createReportResponse
);

r.put(
  "/update/:id",
  authMiddleware(),
  validatorMiddleware({ body: validator.update }),
  controller.update
);

r.put(
  "/update-agree-doc/:id",
  authMiddleware(),
  validatorMiddleware({ body: validator.updateAgreeDoc }),
  controller.updateAgreeDoc
);

r.delete("/delete/:id", authMiddleware(), controller.delete);

const daycarebookingRouter = r;
export default daycarebookingRouter;
