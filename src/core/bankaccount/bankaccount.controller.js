import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import BankAccountService from "./bankaccount.service.js";

class BankAccountController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new BankAccountService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak BankAccount berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("BankAccount tidak ditemukan");

    return this.ok(res, data, "BankAccount berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "BankAccount berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "BankAccount berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "BankAccount berhasil dihapus");
  });
}

export default BankAccountController;
