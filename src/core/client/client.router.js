import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import clientController from "./client.controller.js";
import clientValidator from "./client.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { uploadPublic } from "../../middlewares/multer.middleware.js";

const r = Router(),
  validator = clientValidator,
  controller = new clientController();

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
  authMiddleware(),
  validatorMiddleware({ body: validator.update }),
  controller.update
);

r.put(
  "/update-avatar/:id",
  authMiddleware(),
  uploadPublic("/client-avatar", "image", 3000000).single("image"),
  controller.updateAvatar
);

r.delete("/delete/:id", controller.delete);

const clientRouter = r;
export default clientRouter;
