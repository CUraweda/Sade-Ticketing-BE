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

r.post(
  "/create",
  authMiddleware(["ADM", "SDM"]),
  validatorMiddleware({ body: validator.create }),
  controller.create
);

r.post(
  "/create-by-doctor",
  authMiddleware(["ASR", "PSI", "TRS"]),
  validatorMiddleware({ body: validator.createByDoctor }),
  controller.createByDoctor
);

r.put(
  "/update/:id",
  authMiddleware(),
  validatorMiddleware({ body: validator.update }),
  controller.update
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

const scheduleRouter = r;
export default scheduleRouter;
