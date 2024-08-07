import { Router } from "express";
import roleRouter from "./core/role/role.router.js";
import userRouter from "./core/user/user.router.js";

const r = Router();

r.use("/role", roleRouter);
r.use("/user", userRouter);

const appRouter = r;
export default appRouter;
