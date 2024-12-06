import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import InvoiceService from "./invoice.service.js";

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
}

export default InvoiceController;
