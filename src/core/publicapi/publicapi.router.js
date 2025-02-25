import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import PublicApiController from "./publicapi.controller.js";
import PublicApiValidator from "./publicapi.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import publicApiMiddleware from "../../middlewares/publicapi.middleware.js";
const r = Router(),
  validator = PublicApiValidator,
  controller = new PublicApiController();

r.get(
  "/services",
  publicApiMiddleware(),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.getServices
);

r.get(
  "/count-services-grouped",
  publicApiMiddleware(),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.countServicesGrouped
);

const publicapiRouter = r;
export default publicapiRouter;
