import BaseController from "../../base/controller.base.js";
import { Forbidden, NotFound } from "../../lib/response/catch.js";
import DoctorService from "../doctor/doctor.service.js";
import DashboardService from "./dashboard.service.js";

class DashboardController extends BaseController {
  #service;
  #doctorService;

  constructor() {
    super();
    this.#service = new DashboardService();
    this.#doctorService = new DoctorService();
  }

  topServices = this.wrapper(async (req, res) => {
    const data = await this.#service.topServices(req.query);
    return this.ok(res, data, "Layanan teratas berhasil didapatkan");
  });

  adminStats = this.wrapper(async (req, res) => {
    const data = {
      total_income: await this.#service.totalIncome("system"),
      pending_income: await this.#service.totalAmountIssuedInvoice(req.query),
      active_booking_count: await this.#service.countActiveBookings(req.query),
      active_specialist_count: await this.#service.countActiveSpecialists(),
    };
    return this.ok(res, data, "Stat dashboard admin berhasil didapatkan");
  });

  adminCharts = this.wrapper(async (req, res) => {
    const data = {
      booking_by_service_category:
        await this.#service.bookingByServiceCategoryChart(),
    };
    return this.ok(res, data, "Chart dashboard admin berhasil didapatkan");
  });

  userStats = this.wrapper(async (req, res) => {
    const data = {
      ongoing_booking_count: await this.#service.countOngoingBookingByUser(
        req.user.id
      ),
      issued_invoice_count: await this.#service.countIssuedInvoices(
        req.user.id
      ),
    };
    return this.ok(res, data, "Stat dashboard user berhasil didapatkan");
  });

  getDoctorId = async (req) => {
    let doctorId = req.params.doctor_id;

    if (!this.isAdmin(req)) {
      const doctor = await this.#doctorService.findByUser(req.user.id);
      if (!doctor) throw new Forbidden();
      doctorId = doctor.id;
    }

    return doctorId;
  };

  doctorStats = this.wrapper(async (req, res) => {
    const doctorId = await this.getDoctorId(req);

    const data = {
      balance: await this.#service.totalIncome(doctorId),
      work_time_minute: await this.#service.doctorWorkTime(doctorId),
      total_clients: await this.#service.doctorClients(doctorId),
      completed_schedules:
        await this.#service.doctorCompletedSchedules(doctorId),
    };

    return this.ok(res, data, "Stat dashboard doctor berhasil didapatkan");
  });

  doctorServicesStat = this.wrapper(async (req, res) => {
    const doctorId = await this.getDoctorId(req);

    const data = await this.#service.doctorServiceStat(doctorId);
    return this.ok(res, data, "Stat layanan doctor berhasil didapatkan");
  });
}

export default DashboardController;
