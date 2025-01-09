import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import privilegeController from "./privilege.controller.js";
import privilegeValidator from "./privilege.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { uploadPublic } from "../../middlewares/multer.middleware.js";
const r = Router(),
  validator = privilegeValidator,
  controller = new privilegeController();

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
  uploadPublic("/privilege-image", "image", 3000000).single("image_file"),
  validatorMiddleware({ body: validator.create }),
  controller.create
);

r.put(
  "/update/:id",
  authMiddleware(["SDM"]),
  uploadPublic("/privilege-image", "image", 3000000).single("image_file"),
  validatorMiddleware({ body: validator.update }),
  controller.update
);

r.delete("/delete/:id", authMiddleware(["SDM"]), controller.delete);

const privilegeRouter = r;
export default privilegeRouter;
