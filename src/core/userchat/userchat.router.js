import { Router } from "express";
import { baseValidator } from "../../base/validator.base.js";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import UserChatController from "./userchat.controller.js";
import UserChatValidator from "./userchat.validator.js";
const r = Router(),
  validator = UserChatValidator,
  controller = new UserChatController();

r.get(
  "/show-all",
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get(
  "/show-by-user/:id",
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findByUser
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

const userchatRouter = r;
export default userchatRouter;
