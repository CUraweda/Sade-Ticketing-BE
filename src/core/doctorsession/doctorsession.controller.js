import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import doctorsessionService from "./doctorsession.service.js";

class doctorsessionController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new doctorsessionService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak doctorsession berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("doctorsession tidak ditemukan");

    return this.ok(res, data, "doctorsession berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "doctorsession berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "doctorsession berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    this.noContent(res, "doctorsession berhasil dihapus");
  });
}

export default doctorsessionController;
