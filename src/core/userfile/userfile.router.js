import { Router } from "express";
import { baseValidator } from "../../base/validator.base.js";
import uploader from "../../middlewares/multer.middleware.js";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import UserFileController from "./userfile.controller.js";
import UserFileValidator from "./userfile.validator.js";

const r = Router(),
  validator = UserFileValidator,
  controller = new UserFileController();

r.get(
  "/show-all",
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get("/show-one/:id", controller.findById);

r.post(
  "/create",
  uploader("./uploads/userfile/", "image", 5000000).single("filename"),
  controller.create
);

r.put(
  "/update/:id",
  validatorMiddleware({ body: validator.update }),
  controller.update
);

r.delete("/delete/:id", controller.delete);

r.get("/download/:id", controller.download)

const userfileRouter = r;
export default userfileRouter;
