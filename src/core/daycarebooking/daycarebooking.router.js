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
  validatorMiddleware({ body: validator.update }),
  controller.update
);

r.delete("/delete/:id", controller.delete);

const daycarebookingRouter = r;
export default daycarebookingRouter;
