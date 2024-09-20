import BaseController from "../../base/controller.base.js";
import { Forbidden, NotFound } from "../../lib/response/catch.js";
import BookingService from "./booking.service.js";

class BookingController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new BookingService();
  }

  findAll = this.wrapper(async (req, res) => {
    const q = this.joinBrowseQuery(
      req.query,
      "where",
      req.user.role_code == "USR" ? `user_id:${req.user.id}` : ""
    );
    const data = await this.#service.findAll(q);
    return this.ok(res, data, "Banyak Booking berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    if (req.user?.role_code == "USR")
      await this.#service.checkBookingOwner(req.params.id, req.user.id);
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("Booking tidak ditemukan");
    data["service_data"] = this.#service.extractServiceData(data.service_data);

    return this.ok(res, data, "Booking berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    let payload = req.body;
    payload["user_id"] = req.user.id;

    const data = await this.#service.create(payload);
    return this.created(res, data, "Booking berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    if (req.user.role_code == "USR") {
      const find = await this.#service.checkBookingOwner(
        req.params.id,
        req.user.id
      );
      if (find.is_locked)
        throw new Forbidden(
          "Booking Anda sudah dikunci dan tidak bisa diubah lagi"
        );
    }

    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "Booking berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    if (req.user.role_code == "USR") {
      const find = await this.#service.checkBookingOwner(
        req.params.id,
        req.user.id
      );
      if (find.is_locked)
        throw new Forbidden(
          "Booking Anda sudah dikunci dan tidak bisa diubah lagi"
        );
    }

    await this.#service.delete(req.params.id);
    return this.noContent(res, "Booking berhasil dihapus");
  });

  setSchedules = this.wrapper(async (req, res) => {
    await this.#service.checkBookingOwner(req.params.id, req.user.id);
    const data = await this.#service.setSchedules(req.params.id, req.body);
    return this.ok(res, data, "Booking jadwal berhasil dibuat");
  });

  userConfirm = this.wrapper(async (req, res) => {
    await this.#service.checkBookingOwner(req.params.ids, req.user.id);

    let payload = req.body;
    payload["user_id"] = req.user.id;
    await this.#service.userConfirm([req.params.ids], payload);

    return this.ok(res, null, "Booking berhasil dikonfirmasi");
  });
}

export default BookingController;
