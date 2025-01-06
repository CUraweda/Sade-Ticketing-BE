import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import ServiceController from "./service.controller.js";
import ServiceValidator from "./service.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const r = Router(),
  validator = ServiceValidator,
  controller = new ServiceController();

r.get(
  "/show-all",
  authMiddleware(),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get(
  "/available-doctors/:id",
  authMiddleware(),
  controller.findAvailableDoctors
);

r.get("/show-one/:id", controller.findById);

r.post(
  "/create",
  validatorMiddleware({ body: validator.create }),
  controller.create
);

r.put(
  "/update/:id",
  validatorMiddleware({ body: validator.update }),
  controller.update
);

r.delete("/delete/:id", controller.delete);

r.put(
  "/set-questionnaire/:id",
  validatorMiddleware({ body: validator.setQuestionnaire }),
  controller.setQuestionnaire
);

r.put(
  "/set-report/:id",
  validatorMiddleware({ body: validator.setReport }),
  controller.setReport
);

r.put(
  "/set-entry-fee/:id",
  validatorMiddleware({ body: validator.setEntryFee }),
  controller.setEntryFee
);

r.put(
  "/set-agreement-doc/:id",
  validatorMiddleware({ body: validator.setAgreementDocument }),
  controller.setAgreementDocument
);

const serviceRouter = r;
export default serviceRouter;
