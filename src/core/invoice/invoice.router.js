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

r.get("/show-one/:id", authMiddleware(), controller.findById);

r.get("/generate-simulation", authMiddleware(), controller.generateSimulation);

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

r.post(
  "/create-overtime",
  validatorMiddleware({ body: validator.createOvertime }),
  authMiddleware(["ADM", "SDM"]),
  controller.createOvertime
);

r.put(
  "/update-overtime/:id",
  authMiddleware(["ADM", "SDM"]),
  validatorMiddleware({ body: validator.updateOvertime }),
  controller.updateOvertime
);

r.delete("/delete/:id", authMiddleware(["ADM", "SDM"]), controller.delete);

r.get("/export/:id", authMiddleware(), controller.export);

const invoiceRouter = r;
export default invoiceRouter;
