import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import DoctorController from "./doctor.controller.js";
import DoctorValidator from "./doctor.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const r = Router(),
  validator = DoctorValidator,
  controller = new DoctorController();

r.get(
  "/show-all",
  authMiddleware(),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get("/show-mine", authMiddleware(), controller.findMine);

r.get("/show-one/:id", authMiddleware(), controller.findById);

r.get("/specialisms/:id", controller.findSpecialisms);

r.get("/services/:id", controller.findServices);

r.post(
  "/create",
  authMiddleware(["ADM", "SDM"]),
  validatorMiddleware({ body: validator.create }),
  controller.create
);

r.put(
  "/update/:id",
  authMiddleware(["ADM", "SDM"]),
  validatorMiddleware({ body: validator.update }),
  controller.update
);

r.put(
  "/set-specialism/:id",
  authMiddleware(["ADM", "SDM"]),
  validatorMiddleware({ body: validator.setSpecialism }),
  controller.setSpecialism
);

r.put(
  "/set-service/:id",
  authMiddleware(["ADM", "SDM"]),
  validatorMiddleware({ body: validator.setService }),
  controller.setService
);

r.delete("/delete/:id", authMiddleware(["ADM", "SDM"]), controller.delete);

const doctorRouter = r;
export default doctorRouter;
