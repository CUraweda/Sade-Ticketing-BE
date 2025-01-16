import { Router } from "express";
import validatorMiddleware from "../../middlewares/validator.middleware.js";
import BookingController from "./booking.controller.js";
import BookingValidator from "./booking.validator.js";
import { baseValidator } from "../../base/validator.base.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import uploader from "../../middlewares/multer.middleware.js";
const r = Router(),
  validator = BookingValidator,
  controller = new BookingController();

r.get(
  "/show-all",
  authMiddleware(),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAll
);

r.get("/show-one/:id", authMiddleware(), controller.findById);

r.get("/documents/:id", authMiddleware(), controller.getDocuments);

r.get(
  "/show-one/:id/que-responses",
  authMiddleware(),
  validatorMiddleware({ query: baseValidator.browseQuery }),
  controller.findAllQueResponses
);

r.get(
  "/invoice-simulation/:ids",
  authMiddleware(),
  controller.invoiceSimulation
);

r.get("/current-schedule/:id", authMiddleware(), controller.getCurrentSchedule);

r.post(
  "/create",
  authMiddleware(["USR"]),
  validatorMiddleware({ body: validator.create }),
  controller.create
);

r.post(
  "/create-report-response",
  authMiddleware(["ASR", "PSI", "TRS", "ADM", "SDM"]),
  validatorMiddleware({ body: validator.createReportResponse }),
  controller.createReportResponse
);

r.put("/confirm/:ids", authMiddleware(["USR"]), controller.userConfirm);

r.put(
  "/admin-confirm/:id",
  authMiddleware(["ADM", "SDM"]),
  controller.adminConfirm
);

r.put(
  "/update/:id/agreement-document/:document_id",
  authMiddleware(),
  validatorMiddleware({ body: validator.updateAgreementDocument }),
  controller.updateAgreementDocument
);

r.put(
  "/update/:id",
  authMiddleware(),
  validatorMiddleware({ body: validator.update }),
  controller.update
);

r.delete("/delete/:id", authMiddleware(), controller.delete);

r.put(
  "/set-file/:id/:file_id",
  authMiddleware(),
  uploader("/booking-files", "file", 3000000).single("file"),
  controller.setFile
);

r.get("/download-file/:id/:file_id", authMiddleware(), controller.downloadFile);

const bookingRouter = r;
export default bookingRouter;
