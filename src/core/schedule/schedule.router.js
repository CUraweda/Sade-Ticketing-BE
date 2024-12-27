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
  controller.mine
);

r.get("/show-one/:id", authMiddleware(), controller.findById);

r.get(
  "/show-one/:id/questionnaires",
  authMiddleware(),
  controller.findQuestionnaires
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

r.put(
  "/detach/:id",
  authMiddleware(),
  validatorMiddleware({ body: validator.detach }),
  controller.detach
);

r.delete("/delete/:id", authMiddleware(), controller.delete);

r.put(
  "/toggle-lock/:id/:lock",
  authMiddleware(["ADM", "SDM"]),
  controller.toggleLock
);

r.put(
  "/set-client/:id",
  authMiddleware(),
  validatorMiddleware({ body: validator.setClient }),
  controller.setClient
);

r.put(
  "/set-doctor/:id",
  authMiddleware(),
  validatorMiddleware({ body: validator.setDoctor }),
  controller.setDoctor
);

r.put(
  "/set-overtime/:id",
  authMiddleware(["PSI", "ADM", "SDM"]),
  validatorMiddleware({ body: validator.setOvertime }),
  controller.setOvertime
);

r.put(
  "/set-client-status/:id",
  authMiddleware(["PSI", "ADM", "SDM"]),
  validatorMiddleware({ body: validator.setClientStatus }),
  controller.setClientStatus
);

const scheduleRouter = r;
export default scheduleRouter;
