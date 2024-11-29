import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import DoctorServiceService from "./doctorservice.service.js";

class DoctorServiceController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new DoctorServiceService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak DoctorService berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(+req.params.id);
    if (!data) throw new NotFound("DoctorService tidak ditemukan");

    return this.ok(res, data, "DoctorService berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "DoctorService berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(+req.params.id, req.body);
    return this.ok(res, data, "DoctorService berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(+req.params.id);
    return this.noContent(res, "DoctorService berhasil dihapus");
  });
}

export default DoctorServiceController;
