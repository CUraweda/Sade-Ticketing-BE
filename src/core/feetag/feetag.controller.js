import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import FeeTagService from "./feetag.service.js";

class FeeTagController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new FeeTagService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak FeeTag berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(parseInt(req.params.id));
    if (!data) throw new NotFound("FeeTag tidak ditemukan");

    return this.ok(res, data, "FeeTag berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "FeeTag berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(parseInt(req.params.id), req.body);
    return this.ok(res, data, "FeeTag berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(parseInt(req.params.id));
    return this.noContent(res, "FeeTag berhasil dihapus");
  });
}

export default FeeTagController;
