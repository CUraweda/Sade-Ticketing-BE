import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
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
      req.user.role_code == "USR" ? `profile.user_id:${req.user.id}` : ""
    );
    const data = await this.#service.findAll(q);
    return this.ok(res, data, "Banyak Booking berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    if (req.user?.role_code == "USR")
      await this.#service.checkBookingOwner(req.params.id, req.user.id);
    const data = await this.#service.findById(req.params.id);

    return this.ok(res, data, "Booking berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "Booking berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "Booking berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "Booking berhasil dihapus");
  });

  book = this.wrapper(async (req, res) => {
    const data = await this.#service.book(req.user.id, req.body);
    return this.ok(res, data, "Booking layanan berhasil dibuat");
  });

  bookSchedule = this.wrapper(async (req, res) => {
    await this.#service.checkBookingOwner(req.params.id, req.user.id);
    const data = await this.#service.bookSchedule(req.params.id, req.body);
    return this.ok(res, data, "Booking jadwal berhasil dibuat");
  });

  bookingConfirm = this.wrapper(async (req, res) => {
    await this.#service.checkBookingOwner(req.params.id, req.user.id);
    await this.#service.bookingConfirm(req.params.id, req.body);
    return this.ok(res, null, "Booking berhasil dikonfirmasi");
  });
}

export default BookingController;
