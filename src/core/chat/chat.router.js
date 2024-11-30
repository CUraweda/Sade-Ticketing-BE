import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import ChatController from "./chat.controller.js";
import ChatValidator from "./chat.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const r = Router(),
  validator = ChatValidator,
  controller = new ChatController();

r.get(
  "/show-all/:chatroom_id",
  authMiddleware(),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get("/show-one/:id", controller.findById);

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

r.delete("/delete/:id", authMiddleware(), controller.delete);

const chatRouter = r;
export default chatRouter;
