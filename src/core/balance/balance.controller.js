import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import DoctorService from "../doctor/doctor.service.js";
import BalanceService from "./balance.service.js";

class BalanceController extends BaseController {
  #service;
  #doctorService;

  constructor() {
    super();
    this.#service = new BalanceService();
    this.#doctorService = new DoctorService();
  }

  findAll = this.wrapper(async (req, res) => {
    const q = req.query;

    if (!this.isAdmin(req)) {
      const doctor = await this.#doctorService.findByUser(req.user.id);
      q = this.joinBrowseQuery(q, "where", `holder:${doctor.id}`);
    }

    const data = await this.#service.findAll(q);
    return this.ok(res, data, "Banyak Balance berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("Balance tidak ditemukan");

    return this.ok(res, data, "Balance berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "Balance berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "Balance berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "Balance berhasil dihapus");
  });
}

export default BalanceController;
