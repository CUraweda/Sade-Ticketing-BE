import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import AuthController from "./auth.controller.js";
import AuthValidator from "./auth.validator.js";
const r = Router(),
  validator = AuthValidator,
  controller = new AuthController();

r.post(
  "/login",
  validatorMiddleware({ body: validator.login }),
  controller.login
);

r.post(
  "/refresh-token",
  validatorMiddleware({body: validator.refreshToken}),
  controller.refreshToken
);
 
r.post("/register");

r.post("/verify-email");

r.post("/forgot-password");

r.post("/reset-pass");

const authRouter = r;
export default authRouter;
