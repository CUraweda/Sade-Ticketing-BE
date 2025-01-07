import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import RescheduleRequestController from "./reschedulerequest.controller.js";
import RescheduleRequestValidator from "./reschedulerequest.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const r = Router(),
  validator = RescheduleRequestValidator,
  controller = new RescheduleRequestController();

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

r.put(
  "/update/:id",
  authMiddleware(["USR"]),
  validatorMiddleware({ body: validator.update }),
  controller.update
);

r.put(
  "/admin-response/:id",
  authMiddleware(["ADM"]),
  validatorMiddleware({ body: validator.adminResponse }),
  controller.adminResponse
);

r.delete("/delete/:id", authMiddleware(), controller.delete);

const reschedulerequestRouter = r;
export default reschedulerequestRouter;
