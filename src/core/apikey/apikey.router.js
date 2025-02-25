import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import ApiKeyController from "./apikey.controller.js";
import ApiKeyValidator from "./apikey.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const r = Router(),
  validator = ApiKeyValidator,
  controller = new ApiKeyController();

r.get(
  "/show-all",
  authMiddleware(["SDM"]),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get("/show-one/:id", authMiddleware(["SDM"]), controller.findById);

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

const apikeyRouter = r;
export default apikeyRouter;
