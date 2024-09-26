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

r.get("/show-one/:id", authMiddleware(), controller.findById);

r.get(
  "/invoice-simulation/:ids",
  authMiddleware(),
  controller.invoiceSimulation
);

r.post(
  "/create",
  authMiddleware(["USR"]),
  validatorMiddleware({ body: validator.create }),
  controller.create
);

r.put(
  "/set-schedules/:id",
  authMiddleware(["USR"]),
  validatorMiddleware({ body: validator.setSchedules }),
  controller.setSchedules
);

r.put("/confirm/:ids", authMiddleware(["USR"]), controller.userConfirm);

r.put(
  "/update/:id",
  authMiddleware(),
  validatorMiddleware({ body: validator.update }),
  controller.update
);

r.delete("/delete/:id", authMiddleware(), controller.delete);

const bookingRouter = r;
export default bookingRouter;
