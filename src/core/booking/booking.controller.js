import BaseController from "../../base/controller.base.js";
import { Forbidden, NotFound } from "../../lib/response/catch.js";
import InvoiceService from "../invoice/invoice.service.js";
import { RoleCode } from "../role/role.validator.js";
import BookingService from "./booking.service.js";

class BookingController extends BaseController {
  #service;
  #invoiceService;

  constructor() {
    super();
    this.#service = new BookingService();
    this.#invoiceService = new InvoiceService();
  }

  findAll = this.wrapper(async (req, res) => {
    let q = req.query,
      role = req.user.role_code,
      uid = req.user.id;

    if (!this.isAdmin(req)) {
      if (role == RoleCode.USER) {
        q = this.joinBrowseQuery(q, "where", `user_id:${uid}`);
      } else if (role == RoleCode.PSIKOLOG || role == RoleCode.TERAPIS) {
        q = this.joinBrowseQuery(
          q,
          "in_",
          `schedules.some.schedule.doctors.user_id:${uid}`
        );
      } else if (role == RoleCode.ASESOR) {
        q = this.joinBrowseQuery(q, "where", `status.not:draft`);
      }
    }

    const data = await this.#service.findAll(q);

    return this.ok(res, data, "Banyak Booking berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("Reservasi tidak ditemukan");

    if (req.user?.role_code == "USR")
      await this.#service.checkBookingOwner(req.params.id, req.user.id);

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
    if (!this.isAdmin(req)) {
      const find = await this.#service.checkBookingOwner(
        req.params.id,
        req.user.id
      );
      if (find.is_locked)
        throw new Forbidden(
          "Booking Anda sudah dikunci dan tidak bisa diubah lagi"
        );

      // user cant update these fields
      delete req.body.status;
      delete req.body.is_locked;
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

  userConfirm = this.wrapper(async (req, res) => {
    const ids = req.params.ids.split("+");
    for (const id of ids) {
      await this.#service.checkBookingOwner(id, req.user.id);
    }

    let payload = req.body ?? {};
    payload["user_id"] = req.user.id;
    await this.#service.userConfirm(ids, payload);

    return this.ok(res, null, "Booking berhasil dikonfirmasi");
  });

  adminConfirm = this.wrapper(async (req, res) => {
    await this.#service.adminConfirm(req.params.id);
    return this.ok(res, null, "Booking berhasil dikonfirmasi admin");
  });

  invoiceSimulation = this.wrapper(async (req, res) => {
    const ids = req.params.ids.split(",");
    let data = {};

    const items = await this.#invoiceService.getItems(null, ids);
    data["items"] = items.items;
    data["items_total"] = items.total;

    const fees = await this.#invoiceService.getFees(null, ids);
    data["fees"] = fees.items;
    data["fees_total"] = fees.total;

    data["total"] = data.fees_total.price + data.items_total.price;

    return this.ok(res, data, "Simulasi invoice berhasil didapatkan");
  });

  findAllQueResponses = this.wrapper(async (req, res) => {
    let q = req.query,
      role = req.user.role_code;

    if (!this.isAdmin(req)) {
      if (role == RoleCode.USER)
        this.#service.checkBookingOwner(req.params.id, req.user.id);
    }

    const data = await this.#service.findAllQueResponse(req.params.id, q);
    return this.ok(
      res,
      data,
      "Banyak response kuesioner booking berhasil didapatkan"
    );
  });

  createReportResponse = this.wrapper(async (req, res) => {
    const payload = req.body;
    await this.#service.createReportResponse(
      req.user.id,
      payload.booking_id,
      payload.questionnaire_id
    );
    return this.ok(res, null, "Respon laporan berhasil dibuat");
  });

  updateAgreementDocument = this.wrapper(async (req, res) => {
    if (!this.isAdmin(req))
      await this.#service.checkBookingOwner(req.body.booking_id, req.user.id);

    await this.#service.updateAgreementDocument(
      req.params.id,
      req.params.document_id,
      req.body
    );
    return this.ok(res, null, "Berhasil menerima dokumen persetujuan");
  });

  getCurrentSchedule = this.wrapper(async (req, res) => {
    const data = await this.#service.getCurrentSchedule(req.params.id);
    return this.ok(res, data, "Jadwal terkini berhasil didapatkan");
  });
}

export default BookingController;
