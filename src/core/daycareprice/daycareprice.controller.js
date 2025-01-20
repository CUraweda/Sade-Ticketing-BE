import BaseController from "../../base/controller.base.js";
import { BadRequest, NotFound } from "../../lib/response/catch.js";
import DaycarePriceService from "./daycareprice.service.js";

class DaycarePriceController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new DaycarePriceService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak DaycarePrice berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("DaycarePrice tidak ditemukan");

    return this.ok(res, data, "DaycarePrice berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "DaycarePrice berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "DaycarePrice berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const prev = await this.#service.findById(req.params.id);
    if (prev._count.bookings)
      throw new BadRequest(
        "Tidak dapat dihapus karena memiliki reservasi terkait. Tandai tidak tersedia saja."
      );

    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "DaycarePrice berhasil dihapus");
  });
}

export default DaycarePriceController;
