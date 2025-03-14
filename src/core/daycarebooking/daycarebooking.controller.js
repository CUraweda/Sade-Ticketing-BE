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
    let q = req.query;

    if (!this.isAdmin(req))
      q = this.joinBrowseQuery(q, "where", `user_id:${req.user.id}`);

    const data = await this.#service.findAll(q);
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
    const prev = await this.#service.findById(req.params.id);

    if (!this.isAdmin(req)) {
      const check = await this.#service.checkUser(req.params.id, req.user.id);
      if (!check) throw new Forbidden();

      if (prev.is_locked) throw new Forbidden("Reservasi sudah dikunci");
    }

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

  updateAgreeDoc = this.wrapper(async (req, res) => {
    if (!this.isAdmin(req)) {
      const check = await this.#service.checkUser(req.params.id, req.user.id);
      if (!check) throw new Forbidden();
    }

    const { document_id, ...payload } = req.body;
    await this.#service.updateAgreeDoc(req.params.id, document_id, payload);

    return this.ok(res, null, "Berhasil memperbarui dokumen persetujuan");
  });

  createReportResponse = this.wrapper(async (req, res) => {
    await this.#service.createReportResponse(
      req.params.id,
      req.body.questionnaire_id,
      req.user.id
    );
    return this.ok(res, null, "Berhasil membuat respon laporan");
  });
}

export default DaycareBookingController;
