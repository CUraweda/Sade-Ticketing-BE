import moment from "moment";
import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import InvoiceService from "./invoice.service.js";
import { InvoiceStatus } from "./invoice.validator.js";

class InvoiceController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new InvoiceService();
  }

  findAll = this.wrapper(async (req, res) => {
    const q = this.isAdmin(req)
      ? req.query
      : this.joinBrowseQuery(req.query, "where", `user_id:${req.user.id}`);
    const data = await this.#service.findAll(q);
    return this.ok(res, data, "Banyak Invoice berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("Invoice tidak ditemukan");

    return this.ok(res, data, "Invoice berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "Invoice berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "Invoice berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "Invoice berhasil dihapus");
  });
  createOvertime = this.wrapper(async (req, res) => {
    const data = await this.#service.createOvertime(req.body);
    return this.created(res, data, "Overtime invoice berhasil dibuat");
  });
  updateOvertime = this.wrapper(async (req, res) => {
    const data = await this.#service.updateOvertime(req.params.id, req.body);
    return this.ok(res, data, "Update overtime invoice berhasil diperbarui");
  });

  export = this.wrapper(async (req, res) => {
    const result = await this.#service.export(req.params.id);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${`${result?.data?.title}-${result?.data?.user?.full_name}` ?? "Invoice"}.pdf`
    );
    result.doc.getBuffer((buffer) => {
      res.send(Buffer.from(buffer));
    });
  });

  generateSimulation = this.wrapper(async (req, res) => {
    const data = {};
    const { booking_ids, start_date, end_date } = req.body;

    // items, main
    const items = await this.#service.generateItems(req.user.id, booking_ids, {
      startDate: start_date,
      endDate: end_date,
    });
    data["items"] = items.items;
    data["items_total"] = items.total;

    // fees, additional
    const fees = await this.#service.generateFees(req.user.id, booking_ids);
    data["fees"] = fees.items;
    data["fees_total"] = fees.total;

    // accumulation
    data["total"] = data.fees_total.price + data.items_total.price;

    if (data["total"] <= 0) return this.noContent(res, "Tidak ada invoice");

    return this.ok(res, data, "Simulasi invoice berhasil didapatkan");
  });

  generateCreate = this.wrapper(async (req, res) => {
    const { booking_ids, start_date, end_date } = req.body;

    const payload = {
      user_id: req.user.id,
      title: `Tagihan ${moment().locale("id").format("MMMM YYYY")}`,
      status: InvoiceStatus.ISSUED,
      expiry_date: moment().add(1, "day").toDate(),
    };

    // items, main
    const items = await this.#service.generateItems(req.user.id, booking_ids, {
      startDate: start_date,
      endDate: end_date,
    });
    payload["items"] = items.items;

    // fees, additional
    const fees = await this.#service.generateFees(req.user.id, booking_ids);
    payload["fees"] = fees.items;

    // accumulation
    payload["total"] = fees.total.price + items.total.price;

    const result = await this.#service.create(payload);
    return this.ok(res, result, "Invoice berhasil dibuat");
  });
}

export default InvoiceController;
