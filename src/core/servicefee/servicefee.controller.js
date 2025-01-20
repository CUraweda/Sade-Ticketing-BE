import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import ServiceFeeService from "./servicefee.service.js";

class ServiceFeeController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new ServiceFeeService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak ServiceFee berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(parseInt(req.params.id));
    if (!data) throw new NotFound("ServiceFee tidak ditemukan");

    return this.ok(res, data, "ServiceFee berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "ServiceFee berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(parseInt(req.params.id), req.body);
    return this.ok(res, data, "ServiceFee berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(parseInt(req.params.id));
    return this.noContent(res, "ServiceFee berhasil dihapus");
  });
}

export default ServiceFeeController;
