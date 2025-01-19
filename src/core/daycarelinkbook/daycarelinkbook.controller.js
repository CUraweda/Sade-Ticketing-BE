import BaseController from "../../base/controller.base.js";
import { BadRequest, Forbidden, NotFound } from "../../lib/response/catch.js";
import DaycareBookingService from "../daycarebooking/daycarebooking.service.js";
import DaycareLinkBookService from "./daycarelinkbook.service.js";

class DaycareLinkBookController extends BaseController {
  #service;
  #daycareBookingService;

  constructor() {
    super();
    this.#service = new DaycareLinkBookService();
    this.#daycareBookingService = new DaycareBookingService();
  }

  findAll = this.wrapper(async (req, res) => {
    let q = req.query;

    if (!this.isAdmin(req))
      q = this.joinBrowseQuery(q, "where", `booking.user_id:${req.user.id}`);

    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak DaycareLinkBook berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("DaycareLinkBook tidak ditemukan");

    if (!this.isAdmin(req)) {
      const check = await this.#daycareBookingService.checkUser(
        data.booking_id,
        req.user.id
      );
      if (!check) throw new Forbidden();
    }

    return this.ok(res, data, "DaycareLinkBook berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const payload = req.body;

    if (!this.isAdmin(req)) {
      const check = await this.#daycareBookingService.checkUser(
        payload.booking_id,
        req.user.id
      );
      if (!check) throw new Forbidden();

      const isOngoing = await this.#daycareBookingService.isOngoing(
        payload.booking_id,
        payload.date
      );
      if (!isOngoing)
        throw new BadRequest(
          "Reservasi tidak berlangsung pada tanggal yang diberikan"
        );
    }

    const data = await this.#service.create(payload);
    return this.created(res, data, "DaycareLinkBook berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const payload = req.body;

    if (!this.isAdmin(req)) {
      const check = await this.#daycareBookingService.checkUser(
        payload.booking_id,
        req.user.id
      );
      if (!check) throw new Forbidden();
    }

    const data = await this.#service.update(req.params.id, payload);
    return this.ok(res, data, "DaycareLinkBook berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "DaycareLinkBook berhasil dihapus");
  });
}

export default DaycareLinkBookController;
