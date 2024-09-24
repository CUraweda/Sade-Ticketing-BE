import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import PaymentsController from "./payments.controller.js";
import PaymentsValidator from "./payments.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import uploader from "../../middlewares/multer.middleware.js";

const r = Router(),
  validator = PaymentsValidator,
  controller = new PaymentsController();

r.get(
  "/show-all",
  authMiddleware(),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get("/show-by-id/:id", authMiddleware(), controller.findById);

r.get("/show-by-booking-id/:id", controller.findByBookingId);

r.post(
  "/create",
  authMiddleware(["SDM"]),
  validatorMiddleware({ body: validator.create }),
  controller.create
);

r.put(
  "/upload-payment/:id",
  authMiddleware(),
  uploader("./uploads/payments/", "image", 5000000).single("file"),
  controller.uploadPayment
);

r.put(
  "/update/:id",
  authMiddleware(["ADM", "SDM"]),
  validatorMiddleware({ body: validator.update }),
  controller.update
);

r.delete("/delete/:id", authMiddleware(["ADM", "SDM"]), controller.delete);

r.get("/download/:id", controller.downloadPaymentProof);

r.post(
  "/manual-transfer",
  authMiddleware(["USR"]),
  uploader("/payment-proofs", "image", 3000000).single("proof_file"),
  validatorMiddleware({ body: validator.payManualTransfer }),
  controller.payManualTransfer
);

const paymentsRouter = r;
export default paymentsRouter;
