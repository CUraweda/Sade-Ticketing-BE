import { Router } from "express";
import roleRouter from "./core/role/role.router.js";
import userRouter from "./core/user/user.router.js";
import authRouter from "./core/auth/auth.router.js";
import doctorRouter from "./core/doctor/doctor.router.js";
import specialismRouter from "./core/specialism/specialism.router.js";

const r = Router();

r.use("/auth", authRouter);
r.use("/role", roleRouter);
r.use("/user", userRouter);
r.use("/doctor", doctorRouter);
r.use("/specialism", specialismRouter);

const appRouter = r;
export default appRouter;
