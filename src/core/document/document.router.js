import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import DocumentController from "./document.controller.js";
import DocumentValidator from "./document.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const r = Router(),
  validator = DocumentValidator,
  controller = new DocumentController();

r.get(
  "/show-all",
  authMiddleware(),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get("/show-one/:id", authMiddleware(), controller.findById);

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

const documentRouter = r;
export default documentRouter;
