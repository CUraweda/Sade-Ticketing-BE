import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import DashboardService from "./dashboard.service.js";

class DashboardController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new DashboardService();
  }

  topServices = this.wrapper(async (req, res) => {
    const data = await this.#service.topServices(req.query);
    return this.ok(res, data, "Layanan teratas berhasil didapatkan");
  });

  adminStats = this.wrapper(async (req, res) => {
    const data = {
      total_income: await this.#service.totalIncome(req.query),
      pending_income: await this.#service.totalAmountIssuedInvoice(req.query),
      active_booking_count: await this.#service.countActiveBookings(req.query),
      active_specialist_count: await this.#service.countActiveSpecialists(),
    };
    return this.ok(res, data, "Stat dashboard admin berhasil didapatkan");
  });
}

export default DashboardController;
