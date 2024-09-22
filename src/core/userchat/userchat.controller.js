import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import UserChatService from "./userchat.service.js";

class UserChatController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new UserChatService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak UserChat berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("UserChat tidak ditemukan");

    return this.ok(res, data, "UserChat berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "UserChat berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "UserChat berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "UserChat berhasil dihapus");
  });
}

export default UserChatController;
