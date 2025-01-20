import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import DaycareActivityController from "./daycareactivity.controller.js";
import DaycareActivityValidator from "./daycareactivity.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const r = Router(),
  validator = DaycareActivityValidator,
  controller = new DaycareActivityController();

r.get(
  "/show-all",
  authMiddleware(),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get("/show-one/:id", authMiddleware(), controller.findById);

r.post(
  "/create",
  authMiddleware(),
  validatorMiddleware({ body: validator.create }),
  controller.create
);

r.put(
  "/update/:id",
  authMiddleware(["ADM", "SDM"]),
  validatorMiddleware({ body: validator.update }),
  controller.update
);

r.delete("/delete/:id", authMiddleware(["ADM", "SDM"]), controller.delete);

const daycareactivityRouter = r;
export default daycareactivityRouter;
