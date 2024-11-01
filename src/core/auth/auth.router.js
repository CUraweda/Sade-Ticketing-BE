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
); 

r.post("/register",
  validatorMiddleware({ body: validator.register }),
  controller.register
);

r.put("/verify-email",
  controller.verifyEmail
);

r.post("/forgot-password",
  controller.forgotPassword
);

r.put("/reset-pass",
  validatorMiddleware({ body: validator.resetPass }),
  controller.resetPass
);

const authRouter = r;
export default authRouter;