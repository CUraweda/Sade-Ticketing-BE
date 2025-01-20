import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import DaycareActivityService from "./daycareactivity.service.js";

class DaycareActivityController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new DaycareActivityService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak DaycareActivity berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("DaycareActivity tidak ditemukan");

    return this.ok(res, data, "DaycareActivity berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "DaycareActivity berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "DaycareActivity berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "DaycareActivity berhasil dihapus");
  });
}

export default DaycareActivityController;
