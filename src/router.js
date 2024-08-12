import { Router } from "express";
import roleRouter from "./core/role/role.router.js";
import userRouter from "./core/user/user.router.js";
import authRouter from "./core/auth/auth.router.js";
import doctorRouter from "./core/doctor/doctor.router.js";
import specialismRouter from "./core/specialism/specialism.router.js";
import locationRouter from "./core/location/location.router.js";
import doctorsessionRouter from "./core/doctorsession/doctorsession.router.js";
import serviceRouter from "./core/service/service.router.js";
import servicecategoryRouter from "./core/servicecategory/servicecategory.router.js";
import clientRouter from "./core/client/client.router.js";

const r = Router();

r.use("/auth", authRouter);
r.use("/role", roleRouter);
r.use("/user", userRouter);
r.use("/doctor", doctorRouter);
r.use("/doctor-session", doctorsessionRouter);
r.use("/specialism", specialismRouter);
r.use("/location", locationRouter);
r.use("/service", serviceRouter);
r.use("/service-category", servicecategoryRouter);
r.use("/client", clientRouter);

const appRouter = r;
export default appRouter;
