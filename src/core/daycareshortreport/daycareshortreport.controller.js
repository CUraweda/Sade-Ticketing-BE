import BaseController from "../../base/controller.base.js";
import { Forbidden, NotFound } from "../../lib/response/catch.js";
import DaycareBookingService from "../daycarebooking/daycarebooking.service.js";
import DaycareShortReportService from "./daycareshortreport.service.js";

class DaycareShortReportController extends BaseController {
  #service;
  #daycareBookingService;

  constructor() {
    super();
    this.#service = new DaycareShortReportService();
    this.#daycareBookingService = new DaycareBookingService();
  }

  findAll = this.wrapper(async (req, res) => {
    let q = req.query;

    if (!this.isAdmin(req))
      q = this.joinBrowseQuery(q, "where", `booking.user_id:${req.user.id}`);

    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak DaycareShortReport berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(parseInt(req.params.id));
    if (!data) throw new NotFound("DaycareShortReport tidak ditemukan");

    if (!this.isAdmin(req)) {
      const check = await this.#daycareBookingService.checkUser(
        data.booking_id,
        req.user.id
      );
      if (!check) throw new Forbidden();
    }

    return this.ok(res, data, "DaycareShortReport berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "DaycareShortReport berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(parseInt(req.params.id), req.body);
    return this.ok(res, data, "DaycareShortReport berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(parseInt(req.params.id));
    return this.noContent(res, "DaycareShortReport berhasil dihapus");
  });
}

export default DaycareShortReportController;
