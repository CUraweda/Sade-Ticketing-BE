import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import ApiKeyService from "./apikey.service.js";

class ApiKeyController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new ApiKeyService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak ApiKey berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(+req.params.id);
    if (!data) throw new NotFound("ApiKey tidak ditemukan");

    return this.ok(res, data, "ApiKey berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "ApiKey berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(+req.params.id, req.body);
    return this.ok(res, data, "ApiKey berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(+req.params.id);
    return this.noContent(res, "ApiKey berhasil dihapus");
  });
}

export default ApiKeyController;
