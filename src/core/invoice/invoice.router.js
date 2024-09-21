import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import InvoiceController from "./invoice.controller.js";
import InvoiceValidator from "./invoice.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const r = Router(),
  validator = InvoiceValidator,
  controller = new InvoiceController();

r.get(
  "/show-all",
  authMiddleware(),
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

const invoiceRouter = r;
export default invoiceRouter;
