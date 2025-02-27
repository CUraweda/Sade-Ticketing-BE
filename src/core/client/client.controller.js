import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import clientService from "./client.service.js";

class clientController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new clientService();
  }

  findAll = this.wrapper(async (req, res) => {
    let q = req.query;

    if (!this.isAdmin(req))
      q = this.joinBrowseQuery(q, "where", `user_id:${req.user.id}`);

    const data = await this.#service.findAll(q);
    return this.ok(res, data, "Banyak client berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(
      req.params.id,
      req.user.role_code == "USR" ? req.user.id : undefined
    );
    if (!data) throw new NotFound("client tidak ditemukan");

    return this.ok(res, data, "client berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const body = {
      ...req.body,
      user_id: req.user.id,
    };
    const data = await this.#service.create(body);
    return this.created(res, data, "client berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(
      req.params.id,
      req.user.id,
      req.body
    );
    return this.ok(res, data, "client berhasil diperbarui");
  });

  updateAvatar = this.wrapper(async (req, res) => {
    const prev = await this.#service.findById(
      req.params.id,
      this.isAdmin(req) ? undefined : req.user.id
    );
    if (!prev) throw new NotFound();

    this.deleteFileByPath(prev.avatar);

    const data = await this.#service.update(req.params.id, req.user.id, {
      avatar: req.file?.path ?? null,
    });
    return this.ok(res, data, "Berhasil update avatar");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    this.noContent(res, "client berhasil dihapus");
  });
}

export default clientController;
