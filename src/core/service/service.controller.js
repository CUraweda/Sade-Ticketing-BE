import BaseController from "../../base/controller.base.js";
import { doctorFields } from "../../data/model-fields.js";
import { NotFound } from "../../lib/response/catch.js";
import DoctorService from "../doctor/doctor.service.js";
import ServiceService from "./service.service.js";

class ServiceController extends BaseController {
  #service;
  #doctorService;

  constructor() {
    super();
    this.#service = new ServiceService();
    this.#doctorService = new DoctorService();
  }

  findAll = this.wrapper(async (req, res) => {
    let q = req.query;

    // if (this.isDoctor(req)) {
    //   const doctor = await this.#doctorService.findByUser(req.user.id);
    //   q = this.joinBrowseQuery(
    //     q,
    //     "in_",
    //     `doctors.doctor_id:${doctor?.id ?? ""}`
    //   );
    // }

    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak Service berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("Service tidak ditemukan");

    return this.ok(res, data, "Service berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "Service berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "Service berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    this.noContent(res, "Service berhasil dihapus");
  });

  setQuestionnaire = this.wrapper(async (req, res) => {
    const data = await this.#service.setQuestionnaire(req.params.id, req.body);
    return this.ok(res, data, "Kuesioner Service berhasil diupdate");
  });

  setReport = this.wrapper(async (req, res) => {
    const data = await this.#service.setReport(req.params.id, req.body);
    return this.ok(res, data, "Kuesioner laporan layanan berhasil diupdate");
  });

  setEntryFee = this.wrapper(async (req, res) => {
    const data = await this.#service.setEntryFee(req.params.id, req.body);
    return this.ok(res, data, "Biaya reservasi berhasil diupdate");
  });

  setAgreementDocument = this.wrapper(async (req, res) => {
    const data = await this.#service.setAgreementDocument(
      req.params.id,
      req.body
    );
    return this.ok(res, data, "Dokumen persetujuan berhasil diupdate");
  });

  findAvailableDoctors = this.wrapper(async (req, res) => {
    let data = await this.#service.findAvailableDoctors(req.params.id);
    data = this.include(data, doctorFields.full(req.user?.role_code));

    return this.ok(
      res,
      data,
      "Doctor layanan yang tersedia berhasil didapatkan"
    );
  });

  addFile = this.wrapper(async (req, res) => {
    const result = await this.#service.addFile(req.params.id, req.body);
    return this.ok(res, result, "Berhasil menambahkan file");
  });

  removeFile = this.wrapper(async (req, res) => {
    const result = await this.#service.removeFile(
      req.params.id,
      parseInt(req.params.file_id)
    );
    return this.ok(res, result, "Berhasil menghapus file");
  });
}

export default ServiceController;
