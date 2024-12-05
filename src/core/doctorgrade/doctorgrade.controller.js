import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import DoctorGradeService from "./doctorgrade.service.js";

class DoctorGradeController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new DoctorGradeService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak DoctorGrade berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("DoctorGrade tidak ditemukan");

    return this.ok(res, data, "DoctorGrade berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "DoctorGrade berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "DoctorGrade berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "DoctorGrade berhasil dihapus");
  });
}

export default DoctorGradeController;
