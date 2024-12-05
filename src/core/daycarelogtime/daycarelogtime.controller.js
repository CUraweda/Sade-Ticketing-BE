import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import daycarelogtimeService from "./daycarelogtime.service.js";

class daycarelogtimeController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new daycarelogtimeService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak daycare log time berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("daycare log time tidak ditemukan");

    return this.ok(res, data, "daycarelogtime berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "daycare log time berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "daycare log time berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "daycare log time berhasil dihapus");
  });
}

export default daycarelogtimeController;
