import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import DashboardService from "./dashboard.service.js";

class DashboardController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new DashboardService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak Dashboard berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("Dashboard tidak ditemukan");

    return this.ok(res, data, "Dashboard berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "Dashboard berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "Dashboard berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "Dashboard berhasil dihapus");
  });
}

export default DashboardController;
