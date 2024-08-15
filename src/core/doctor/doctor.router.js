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

r.get("/show-one/:id", authMiddleware(), controller.findById);

r.get("/specialisms/:id", controller.findSpecialisms);

r.get("/services/:id", controller.findServices);

r.post(
  "/create",
  validatorMiddleware({ body: validator.create }),
  controller.create
);

r.put(
  "/update/:id",
  validatorMiddleware({ body: validator.update }),
  controller.update
);

r.put(
  "/assign-specialisms/:id",
  validatorMiddleware({ body: validator.assignSpecialisms }),
  controller.assignSpecialism
);

r.put(
  "/assign-services/:id",
  validatorMiddleware({ body: validator.assignServices }),
  controller.assignServices
);

r.delete("/delete/:id", controller.delete);

const doctorRouter = r;
export default doctorRouter;
