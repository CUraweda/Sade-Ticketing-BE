import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import privilegeService from "./privilege.service.js";

class privilegeController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new privilegeService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak privilege berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("privilege tidak ditemukan");

    return this.ok(res, data, "privilege berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const payload = req.body;
    if (req.file) payload.image_path = req.file.path;

    const data = await this.#service.create(payload);
    return this.created(res, data, "privilege berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const prev = await this.#service.findById(req.params.id);
    if (prev.image_path) this.deleteFileByPath(prev.image_path);

    const payload = req.body;
    if (req.file) payload.image_path = req.file.path;

    const data = await this.#service.update(req.params.id, payload);
    return this.ok(res, data, "privilege berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const prev = await this.#service.findById(req.params.id);
    if (prev.image_path) this.deleteFileByPath(prev.image_path);

    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "privilege berhasil dihapus");
  });
}

export default privilegeController;
