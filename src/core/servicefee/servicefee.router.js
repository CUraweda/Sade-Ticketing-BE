import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import ServiceFeeController from "./servicefee.controller.js";
import ServiceFeeValidator from "./servicefee.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const r = Router(),
  validator = ServiceFeeValidator,
  controller = new ServiceFeeController();

r.get(
  "/show-all",
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get("/show-one/:id", controller.findById);

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

r.delete("/delete/:id", authMiddleware(["ADM", "SDM"]), controller.delete);

const servicefeeRouter = r;
export default servicefeeRouter;
