import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import BookingController from "./booking.controller.js";
import BookingValidator from "./booking.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const r = Router(),
  validator = BookingValidator,
  controller = new BookingController();

r.get(
  "/show-all",
  authMiddleware(),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get("/show-one/:id", controller.findById);

r.get(
  "/questionnaires/:id",
  authMiddleware(["USR"]),
  controller.findQuestionnaires
);

r.post(
  "/create",
  validatorMiddleware({ body: validator.create }),
  controller.create
);

r.post(
  "/book",
  authMiddleware(["USR"]),
  validatorMiddleware({ body: validator.book }),
  controller.book
);

r.put(
  "/update/:id",
  validatorMiddleware({ body: validator.update }),
  controller.update
);

r.delete("/delete/:id", controller.delete);

const bookingRouter = r;
export default bookingRouter;
