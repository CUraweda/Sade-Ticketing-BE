import BaseController from "../../base/controller.base.js";
import { BadRequest, Forbidden, NotFound } from "../../lib/response/catch.js";
import clientService from "../client/client.service.js";
import DaycareBookingService from "./daycarebooking.service.js";
import { DaycareBookingStatus } from "./daycarebooking.validator.js";

class DaycareBookingController extends BaseController {
  #service;
  #clientService;

  constructor() {
    super();
    this.#service = new DaycareBookingService();
    this.#clientService = new clientService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak DaycareBooking berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    if (!this.isAdmin(req)) {
      const check = await this.#service.checkUser(req.params.id, req.user.id);
      if (!check) throw new Forbidden();
    }

    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("DaycareBooking tidak ditemukan");

    return this.ok(res, data, "DaycareBooking berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const payload = req.body;
    payload["user_id"] = req.user.id;

    const check = await this.#clientService.findById(
      payload.client_id,
      req.user.id
    );
    if (!check) throw new Forbidden();

    const data = await this.#service.create(payload);
    return this.created(res, data, "DaycareBooking berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "DaycareBooking berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    if (!this.isAdmin(req)) {
      const check = await this.#service.checkUser(req.params.id, req.user.id);
      if (!check) throw new Forbidden();
    }

    const prev = await this.#service.findById(req.params.id);
    if (prev.status != DaycareBookingStatus.DRAFT)
      throw new BadRequest("Reservasi sudah tidak bisa dibatalkan");

    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "DaycareBooking berhasil dihapus");
  });
}

export default DaycareBookingController;
