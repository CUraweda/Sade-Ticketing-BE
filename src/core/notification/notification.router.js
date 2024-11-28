import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import NotificationController from "./notification.controller.js";
import NotificationValidator from "./notification.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const r = Router(),
  validator = NotificationValidator,
  controller = new NotificationController();

r.get(
  "/show-all",
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get("/show-one/:id", controller.findById);

r.get("/count", authMiddleware(), controller.count);

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

r.delete("/delete/:id", controller.delete);

const notificationRouter = r;
export default notificationRouter;
