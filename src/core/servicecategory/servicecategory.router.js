import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import ServicecategoryController from "./servicecategory.controller.js";
import ServicecategoryValidator from "./servicecategory.validator.js";
import { baseValidator } from "../../base/validator.base.js";
const r = Router(),
  validator = ServicecategoryValidator,
  controller = new ServicecategoryController();

r.get(
  "/show-all",
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get("/show-one/:id", controller.findById);

// r.post(
//   "/create",
//   validatorMiddleware({ body: validator.create }),
//   controller.create
// );

r.put(
  "/update/:id",
  validatorMiddleware({ body: validator.update }),
  controller.update
);

// r.delete("/delete/:id", controller.delete);

const servicecategoryRouter = r;
export default servicecategoryRouter;
