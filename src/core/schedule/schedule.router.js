import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import ScheduleController from "./schedule.controller.js";
import ScheduleValidator from "./schedule.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const r = Router(),
  validator = ScheduleValidator,
  controller = new ScheduleController();

r.get(
  "/show-all",
  authMiddleware(),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get(
  "/show-mine",
  authMiddleware(),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findMine
);

r.get("/show-one/:id", authMiddleware(), controller.findById);

r.post(
  "/create",
  authMiddleware(),
  validatorMiddleware({ body: validator.create }),
  controller.create
);

r.post(
  "/check-availability",
  authMiddleware(),
  validatorMiddleware({ body: validator.checkAvailability }),
  controller.checkAvailability
);

r.put(
  "/update/:id",
  authMiddleware(["ADM", "SDM"]),
  validatorMiddleware({ body: validator.update }),
  controller.update
);

r.put(
  "/detach/:id",
  authMiddleware(["ADM", "SDM"]),
  validatorMiddleware({ body: validator.detach }),
  controller.detach
);

r.delete("/delete/:id", authMiddleware(["ADM", "SDM"]), controller.delete);

r.put(
  "/set-doctor/:id",
  authMiddleware(["ADM", "SDM"]),
  validatorMiddleware({ body: validator.setDoctor }),
  controller.setDoctor
);

r.put(
  "/toggle-lock/:id",
  authMiddleware(["ADM", "SDM", "TRS", "ASR", "PSI"]),
  validatorMiddleware({ body: validator.toggleLock }),
  controller.toggleLock
);

const scheduleRouter = r;
export default scheduleRouter;
