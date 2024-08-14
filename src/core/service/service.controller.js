import BaseController from "../../base/controller.base.js";
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

  findQuestionnaires = this.wrapper(async (req, res) => {
    const data = await this.#service.findQuestionnaires(req.params.id);
    return this.ok(res, data, "Banyak Kuesioner Service berhasil didapatkan");
  });

  setQuestionnaires = this.wrapper(async (req, res) => {
    const data = await this.#service.setQuestionnaires(req.params.id, req.body);
    return this.ok(res, data, "Berhasil menetapkan kuesioner Service");
  });
}

export default ServiceController;
