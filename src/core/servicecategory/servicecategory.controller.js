import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import ServicecategoryService from "./servicecategory.service.js";

class ServicecategoryController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new ServicecategoryService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak Servicecategory berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("Servicecategory tidak ditemukan");

    return this.ok(res, data, "Servicecategory berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "Servicecategory berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "Servicecategory berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    this.noContent(res, "Servicecategory berhasil dihapus");
  });
}

export default ServicecategoryController;
