import { Router } from "express";
import roleRouter from "./core/role/role.router.js";
import userRouter from "./core/user/user.router.js";
import authRouter from "./core/auth/auth.router.js";

const r = Router();

r.use("/auth", authRouter);
r.use("/role", roleRouter);
r.use("/user", userRouter);

const appRouter = r;
export default appRouter;
