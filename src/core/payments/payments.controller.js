import BaseController from "../../base/controller.base.js";
import { BadRequest, NotFound } from "../../lib/response/catch.js";
import PaymentsService from "./payments.service.js";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { PaymentMethod, PaymentStatus } from "./payments.validator.js";
import moment from "moment";

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

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "Payments berhasil diperbarui");
  });

  downloadPaymentProof = this.wrapper(async (req, res) => {
    const { id } = req.params;

    if (!this.isAdmin(req)) await this.#service.checkOwner(id, req.user.id);

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

  payManualTransfer = this.wrapper(async (req, res) => {
    if (!req.file)
      throw new BadRequest("Mohon lampirkan file bukti pembayaran");

    const { invoice_ids, ...payload } = req.body;
    payload.payment_method = PaymentMethod.MANUAL_TRANSFER;
    payload.payment_proof_path = req.file.path;
    payload.status = PaymentStatus.PAID;
    payload.transaction_id = uuidv4();
    payload.user_id = req.user.id;
    payload.payment_date = moment();

    await this.#service.create(payload, invoice_ids);

    return this.ok(res, `${invoice_ids?.length} tagihan berhasil dibayarkan`);
  });
}

export default PaymentsController;
