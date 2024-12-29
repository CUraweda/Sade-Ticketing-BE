import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import ScheduleAttendeeController from "./scheduleattendee.controller.js";
import ScheduleAttendeeValidator from "./scheduleattendee.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const r = Router(),
  validator = ScheduleAttendeeValidator,
  controller = new ScheduleAttendeeController();

r.get(
  "/show-all",
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

r.post(
  "/auto-create-by-booking/:booking_id",
  authMiddleware(),
  controller.autoCreate
);

r.put(
  "/update/:id",
  authMiddleware(["ADM", "SDM"]),
  validatorMiddleware({ body: validator.update }),
  controller.update
);

r.delete("/delete/:id", authMiddleware(), controller.delete);

const scheduleattendeeRouter = r;
export default scheduleattendeeRouter;
