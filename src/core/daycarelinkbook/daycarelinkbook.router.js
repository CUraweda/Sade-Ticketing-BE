import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import DaycareLinkBookController from "./daycarelinkbook.controller.js";
import DaycareLinkBookValidator from "./daycarelinkbook.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const r = Router(),
  validator = DaycareLinkBookValidator,
  controller = new DaycareLinkBookController();

r.get(
  "/show-all",
  authMiddleware(),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get("/show-one/:id", authMiddleware(), controller.findById);

r.post(
  "/create",
  authMiddleware(),
  validatorMiddleware({ body: validator.create }),
  controller.create
);

r.put(
  "/update/:id",
  validatorMiddleware({ body: validator.update }),
  controller.update
);

r.delete("/delete/:id", controller.delete);

const daycarelinkbookRouter = r;
export default daycarelinkbookRouter;
