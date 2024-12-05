import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import daycarelogtimeController from "./daycarelogtime.controller.js";
import daycarelogtimeValidator from "./daycarelogtime.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const r = Router(),
  validator = daycarelogtimeValidator,
  controller = new daycarelogtimeController();

r.get(
  "/show-all",
  authMiddleware(),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get("/show-one/:id", authMiddleware(), controller.findById);

r.post(
  "/create",
  authMiddleware(),
  validatorMiddleware({ body: validator.create }),
  controller.create
);

r.put(
  "/update/:id",
  authMiddleware(),
  validatorMiddleware({ body: validator.update }),
  controller.update
);

r.delete("/delete/:id", authMiddleware(), controller.delete);

const daycarelogtimeRouter = r;
export default daycarelogtimeRouter;
