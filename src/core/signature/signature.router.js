import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import SignatureController from "./signature.controller.js";
import SignatureValidator from "./signature.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import uploader from "../../middlewares/multer.middleware.js";

const r = Router(),
  validator = SignatureValidator,
  controller = new SignatureController();

r.get(
  "/show-all",
  authMiddleware(),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get("/show-one/:id", authMiddleware(), controller.findById);

r.get("/image", authMiddleware(), controller.download);

r.post(
  "/create",
  authMiddleware(),
  uploader("/signatures", "image", 3000000).single("image"),
  validatorMiddleware({ body: validator.create }),
  controller.create
);

r.put(
  "/update/:id",
  authMiddleware(),
  uploader("/signatures", "image", 3000000).single("image"),
  validatorMiddleware({ body: validator.update }),
  controller.update
);

r.delete("/delete/:id", authMiddleware(), controller.delete);

const signatureRouter = r;
export default signatureRouter;
