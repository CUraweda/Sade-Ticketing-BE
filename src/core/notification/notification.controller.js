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
    const q = this.joinBrowseQuery(
      req.query,
      "where",
      `users.some.user_id:${req.user.id}`
    );

    const data = await this.#service.findAll(q);
    return this.ok(res, data, "Banyak Notification berhasil didapatkan");
  });

  count = this.wrapper(async (req, res) => {
    const data = await this.#service.count(req.user.id);
    return this.ok(res, data, "Jumlah notifikasi berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("Notification tidak ditemukan");

    return this.ok(res, data, "Notification berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const payload = req.body;
    payload["sender_id"] = req.user.id;

    const data = await this.#service.create(payload);
    return this.created(res, data, "Notification berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    await this.#service.checkSender(req.params.id, req.user.id);
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "Notification berhasil diperbarui");
  });

  read = this.wrapper(async (req, res) => {
    await this.#service.read(req.params.id, req.user.id);
    return this.ok(res, null, "Notifikasi berhasil ditandai sudah dibaca");
  });

  delete = this.wrapper(async (req, res) => {
    await this.#service.checkSender(req.params.id, req.user.id);
    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "Notification berhasil dihapus");
  });
}

export default NotificationController;
