import { Router } from "express";
import { baseValidator } from "../../base/validator.base.js";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import ChatMessageController from "./chatmessage.controller.js";
import ChatMessageValidator from "./chatmessage.validator.js";
const r = Router(),
  validator = ChatMessageValidator,
  controller = new ChatMessageController();

r.get(
  "/show-all",
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get("/show-one/:id", controller.findById);

r.get("/show-chat/:id", controller.findByUniqueId);

r.post(
  "/create",
  validatorMiddleware({ body: validator.create }),
  controller.create
);

r.post(
  "/reply/:id",
  validatorMiddleware({ body: validator.create }),
  controller.reply
);

r.post(
  "/reply",
  validatorMiddleware({ body: validator.create }),
  controller.reply
);

r.put(
  "/update/:id",
  validatorMiddleware({ body: validator.update }),
  controller.update
);

r.put(
  "/read/:id", controller.updateRead
);

r.delete("/delete/:id", controller.delete);

const chatmessageRouter = r;
export default chatmessageRouter;
