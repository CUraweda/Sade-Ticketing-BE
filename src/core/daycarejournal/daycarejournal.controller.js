import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import daycarejournalService from "./daycarejournal.service.js";

class daycarejournalController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new daycarejournalService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak daycare journal berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("daycare journal tidak ditemukan");

    return this.ok(res, data, "daycarejournal berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "daycare journal berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "daycare journal berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "daycare journal berhasil dihapus");
  });

  dates = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(
      res,
      data,
      "Banyak jadwal daycare journal berhasil didapatkan"
    );
  });
}

export default daycarejournalController;
