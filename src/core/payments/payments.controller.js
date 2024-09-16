import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import PaymentsService from "./payments.service.js";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { PaymentStatus } from "./payments.validator.js";

class PaymentsController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new PaymentsService();
  }

  findAll = this.wrapper(async (req, res) => {
    const q =
      req.user.role_code != "SDM" && req.user.role_code != "ADM"
        ? this.joinBrowseQuery(req.query, "where", `user_id:${req.user.id}`)
        : req.query;
    const data = await this.#service.findAll(q);
    return this.ok(res, data, "Banyak Payments berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    if (req.user.role_code != "SDM" && req.user.role_code != "ADM") {
      await this.#service.checkOwner(req.params.id, req.user.id);
    }

    const data = await this.#service.findById(req.params.id);

    if (!data) throw new NotFound("Payments tidak ditemukan");

    return this.ok(res, data, "Payments berhasil didapatkan");
  });

  findByBookingId = this.wrapper(async (req, res) => {
    const data = await this.#service.findByBookingId(req.params.id);
    if (!data) throw new NotFound("Payments tidak ditemukan");

    return this.ok(res, data, "Paymantes berhasil di dapatkan");
  });

  create = this.wrapper(async (req, res) => {
    let payload = req.body;
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 30);

    payload.status = "unpaid";
    payload.transaction_id = uuidv4();
    payload.expiry_date = currentDate;

    const data = await this.#service.create(req.body);
    return this.created(res, data, "Payments berhasil dibuat");
  });

  uploadPayment = this.wrapper(async (req, res) => {
    await this.#service.checkOwner(req.params.id, req.user.id);

    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return this.badRequest(res, "No file uploaded");
    }

    const newFilePath = `../../../uploads/payments/${file.filename}`;

    const existingPayment = await this.#service.findById(id);

    if (!existingPayment) {
      return this.notFound(res, "Payment not found");
    }

    if (existingPayment.payment_proof_path) {
      const oldFilePath = existingPayment.payment_proof_path.replace(
        "../../../",
        ""
      );
      fs.unlink(oldFilePath, (err) => {
        if (err) {
          console.error("Error deleting old file:", err);
        }
      });
    }

    const updatedPayment = await this.#service.update(id, {
      payment_proof_path: newFilePath,
      status: PaymentStatus.PAID,
    });

    return this.created(res, updatedPayment, "Upload berhasil");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "Payments berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "Payments berhasil dihapus");
  });

  downloadPaymentProof = this.wrapper(async (req, res) => {
    const { id } = req.params;
    const payment = await this.#service.findById(id);

    if (!payment || !payment.payment_proof_path) {
      return this.notFound(res, "Payment proof not found");
    }

    const filePath = payment.payment_proof_path.replace("../../../", "");

    if (!fs.existsSync(filePath)) {
      return this.notFound(res, "File tidak ditemukan");
    }

    return res.download(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        return this.serverError(res, "Gagal mendownload file");
      }
    });
  });
}

export default PaymentsController;
