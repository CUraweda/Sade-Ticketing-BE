import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import ServiceRecommendationController from "./servicerecommendation.controller.js";
import ServiceRecommendationValidator from "./servicerecommendation.validator.js";
import { baseValidator } from "../../base/validator.base.js";
const r = Router(),
  validator = ServiceRecommendationValidator,
  controller = new ServiceRecommendationController();

r.get(
  "/show-all",
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
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

r.get("/recommendation-by-booking/:booking_id", controller.findByBookingId);

const servicerecommendationRouter = r;
export default servicerecommendationRouter;
