import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import DaycarePriceController from "./daycareprice.controller.js";
import DaycarePriceValidator from "./daycareprice.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const r = Router(),
  validator = DaycarePriceValidator,
  controller = new DaycarePriceController();

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

const daycarepriceRouter = r;
export default daycarepriceRouter;
