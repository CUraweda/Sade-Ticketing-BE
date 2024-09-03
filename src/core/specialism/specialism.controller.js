import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import SpecialismService from "./specialism.service.js";

class SpecialismController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new SpecialismService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak Specialism berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("Specialism tidak ditemukan");

    return this.ok(res, data, "Specialism berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "Specialism berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "Specialism berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    this.noContent(res, "Specialism berhasil dihapus");
  });
}

export default SpecialismController;
