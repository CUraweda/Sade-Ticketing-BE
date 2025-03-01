import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import clientPrivilegeService from "./clientprivilege.service.js";

class clientPrivilegeController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new clientPrivilegeService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak privilege client berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("Privilege client tidak ditemukan");

    return this.ok(res, data, "Privilege client berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "Privilege client berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "Privilege client berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "Privilege client berhasil dihapus");
  });
}

export default clientPrivilegeController;
