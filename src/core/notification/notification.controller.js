import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import NotificationService from "./notification.service.js";

class NotificationController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new NotificationService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak Notification berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("Notification tidak ditemukan");

    return this.ok(res, data, "Notification berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "Notification berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "Notification berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "Notification berhasil dihapus");
  });
}

export default NotificationController;
