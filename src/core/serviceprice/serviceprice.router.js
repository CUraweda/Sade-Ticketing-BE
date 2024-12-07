import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import servicePriceController from "./serviceprice.controller.js";
import servicePriceValidator from "./serviceprice.validator.js";
import { baseValidator } from "../../base/validator.base.js";
const r = Router(),
  validator = servicePriceValidator,
  controller = new servicePriceController();

r.get(
  "/show-all",
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get("/show-one/:id", controller.findById);

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

r.delete("/delete/:id", controller.delete);

const servicepriceRouter = r;
export default servicepriceRouter;
