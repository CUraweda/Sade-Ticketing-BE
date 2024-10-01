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
  authMiddleware(["ADM"]),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get("/show-one/:id", authMiddleware(), controller.findById);

r.get(
  "/user",
  authMiddleware(),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAllByUser
);

r.post(
  "/create",
  authMiddleware(),
  validatorMiddleware({ body: validator.create }),
  controller.create
);

r.put(
  "/update/:id",
  authMiddleware(),
  validatorMiddleware({ body: validator.update }),
  controller.update
);

r.put("/approve/:id", authMiddleware(["ADM"]), controller.approveReschedule);

r.delete("/delete-user/:id", authMiddleware(), controller.deleteByUser);

r.delete("/delete/:id", authMiddleware(["ADM"]), controller.delete);

const reschedulerequestRouter = r;
export default reschedulerequestRouter;
