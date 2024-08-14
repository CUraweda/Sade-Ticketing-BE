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
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak Booking berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("Booking tidak ditemukan");

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

  findQuestionnaires = this.wrapper(async (req, res) => {
    const data = await this.#service.findRequiredQuestionnaires(
      req.user.id,
      req.params.id
    );
    return this.ok(res, data, "Banyak kuesioner booking berhasil didapatkan");
  });
}

export default BookingController;
