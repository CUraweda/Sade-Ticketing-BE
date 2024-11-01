import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import UserService from "./user.service.js";

class UserController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new UserService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak user berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("User tidak ditemukan");

    return this.ok(res, data, "User berhasil didapatkan");
  });

  me = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.user.id);
    if (!data) throw new NotFound("Data user tidak ditemukan");

    return this.ok(res, data, "User berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "User berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "User berhasil diperbarui");
  });

  findUserRoles = this.wrapper(async (req, res) => {
    const data = await this.#service.findUserRoles(req.params.id);
    return this.ok(res, data, "Banyak Role User berhasil didapatkan ");
  });

  assignRole = this.wrapper(async (req, res) => {
    const data = await this.#service.assignRole(req.params.id, req.body);
    return this.ok(res, data, "Berhasil menetapkan role User");
  });

  switchRole = this.wrapper(async (req, res) => {
    const data = await this.#service.switchRole(req.params.id, req.user.id);
    return this.ok(res, data, "Berhasil beralih role");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    this.noContent(res, "User berhasil dihapus");
  });
}

export default UserController;
