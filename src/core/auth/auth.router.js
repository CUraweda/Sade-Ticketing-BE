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

r.get("/refresh-token",
  controller.refreshToken
); // get refresh token, 

r.post("/register",
  validatorMiddleware({ body: validator.register }),
  controller.register
);

r.put("/verify-email",
  controller.verifyEmail
); //post status

r.post("/forgot-password",
  controller.forgotPassword
); // [ find unique email, sent message ke email, ubah jadi token ] hasil akhir: email di encrypt

r.put("/reset-pass",
  validatorMiddleware({ body: validator.resetPass }),
  controller.resetPass
); // [ get token, body password baru ] hasil akhir post matching password

const authRouter = r;
export default authRouter;