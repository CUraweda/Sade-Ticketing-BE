import { Router } from "express";
import roleRouter from "./core/role/role.router.js";

const r = Router();

r.use("/role", roleRouter);

const appRouter = r;
export default appRouter;
