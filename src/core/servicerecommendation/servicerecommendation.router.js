import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import ServiceRecommendationController from "./servicerecommendation.controller.js";
import ServiceRecommendationValidator from "./servicerecommendation.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const r = Router(),
  validator = ServiceRecommendationValidator,
  controller = new ServiceRecommendationController();

r.get(
  "/show-all",
  authMiddleware(),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get("/show-one/:id", authMiddleware(), controller.findById);

r.post(
  "/create",
  authMiddleware(["SDM", "ASR", "PSI", "ADM", "TRS"]),
  validatorMiddleware({ body: validator.create }),
  controller.create
);

r.put(
  "/update/:id",
  authMiddleware(["SDM", "ASR", "PSI", "ADM", "TRS"]),
  validatorMiddleware({ body: validator.update }),
  controller.update
);

r.delete(
  "/delete/:id",
  authMiddleware(["SDM", "ASR", "PSI", "ADM", "TRS"]),
  controller.delete
);

r.get(
  "/recommendation-by-booking/:booking_id",
  authMiddleware(),
  controller.findByBookingId
);

r.put("/mark-as-read/:id", authMiddleware(), controller.markAsRead);

const servicerecommendationRouter = r;
export default servicerecommendationRouter;
