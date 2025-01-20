import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import FeeTagController from "./feetag.controller.js";
import FeeTagValidator from "./feetag.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const r = Router(),
  validator = FeeTagValidator,
  controller = new FeeTagController();

r.get(
  "/show-all",
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get("/show-one/:id", controller.findById);

r.post(
  "/create",
  authMiddleware(["SDM"]),
  validatorMiddleware({ body: validator.create }),
  controller.create
);

r.put(
  "/update/:id",
  authMiddleware(["SDM"]),
  validatorMiddleware({ body: validator.update }),
  controller.update
);

r.delete("/delete/:id", authMiddleware(["SDM"]), controller.delete);

const feetagRouter = r;
export default feetagRouter;
