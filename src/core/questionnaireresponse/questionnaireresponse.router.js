import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import QuestionnaireResponseController from "./questionnaireresponse.controller.js";
import QuestionnaireResponseValidator from "./questionnaireresponse.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const r = Router(),
  validator = QuestionnaireResponseValidator,
  controller = new QuestionnaireResponseController();

r.get(
  "/show-all",
  authMiddleware(),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get("/show-one/:id", authMiddleware(), controller.findById);

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

const questionnaireresponseRouter = r;
export default questionnaireresponseRouter;