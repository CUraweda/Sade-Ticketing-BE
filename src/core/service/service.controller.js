import BaseController from "../../base/controller.base.js";
import { doctorFields } from "../../data/model-fields.js";
import { NotFound } from "../../lib/response/catch.js";
import ServiceService from "./service.service.js";

class ServiceController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new ServiceService();
  }

  findAll = this.wrapper(async (req, res) => {
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

  findDoctors = this.wrapper(async (req, res) => {
    let data = await this.#service.findDoctors(req.params.id);
    data = this.include(data, doctorFields.full(req.user?.role_code));

    return this.ok(res, data, "Doctor layanan berhasil didapatkan");
  });
}

export default ServiceController;
