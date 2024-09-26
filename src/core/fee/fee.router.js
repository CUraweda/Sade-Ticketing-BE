import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import FeeController from "./fee.controller.js";
import FeeValidator from "./fee.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const r = Router(),
  validator = FeeValidator,
  controller = new FeeController();

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

const feeRouter = r;
export default feeRouter;
