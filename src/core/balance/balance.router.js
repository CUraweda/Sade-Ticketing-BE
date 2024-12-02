import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import BalanceController from "./balance.controller.js";
import BalanceValidator from "./balance.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const r = Router(),
  validator = BalanceValidator,
  controller = new BalanceController();

r.get(
  "/show-all",
  authMiddleware(["ADM", "SDM", "TRS", "PSI", "ASR"]),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

// r.get("/show-one/:id", controller.findById);

// r.post(
//   "/create",
//   validatorMiddleware({ body: validator.create }),
//   controller.create
// );

// r.put(
//   "/update/:id",
//   validatorMiddleware({ body: validator.update }),
//   controller.update
// );

// r.delete("/delete/:id", controller.delete);

const balanceRouter = r;
export default balanceRouter;
