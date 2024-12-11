import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import servicePriceService from "./serviceprice.service.js";

class servicePriceController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new servicePriceService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak service price berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("Service price tidak ditemukan");

    return this.ok(res, data, "Service price berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "Service price berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "Service price berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "Service price berhasil dihapus");
  });
}

export default servicePriceController;
