import BaseController from "../../base/controller.base.js";
import { Forbidden, NotFound } from "../../lib/response/catch.js";
import clientService from "../client/client.service.js";
import DoctorService from "../doctor/doctor.service.js";
import DashboardService from "./dashboard.service.js";

class DashboardController extends BaseController {
  #service;
  #doctorService;
  #clientService;

  constructor() {
    super();
    this.#service = new DashboardService();
    this.#doctorService = new DoctorService();
    this.#clientService = new clientService();
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
    let clientIds = req.query.client_id ? [req.query.client_id] : [];

    if (!this.isAdmin(req)) {
      const clients = await this.#clientService.findAll({
        paginate: false,
        where: `user_id:${req.user.id}`,
      });

      const userClients = clients.map((cl) => cl.id);

      if (req.query.client_id)
        clientIds = userClients.includes(req.query.client_id)
          ? [req.query.client_id]
          : [];
      else clientIds = userClients;
    }

    const data = {
      ongoing_booking_count: await this.#service.countOngoingBookingByUser(
        req.user.id
      ),
      issued_invoice_count: await this.#service.countIssuedInvoices(
        req.user.id
      ),
      schedule: {
        presence: await this.#service.schedulePresence(clientIds),
        absence: await this.#service.scheduleAbsence(clientIds),
        sick: await this.#service.scheduleSick(clientIds),
        permitted: await this.#service.schedulePermitted(clientIds),
        upcoming: await this.#service.countUpcomingSchedules(clientIds),
      },
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
      balance: await this.#service.totalIncome(
        doctorId,
        req.query.start_date,
        req.query.end_date
      ),
      work_time_minute: await this.#service.doctorWorkTime(
        doctorId,
        req.query.start_date,
        req.query.end_date
      ),
      total_clients: await this.#service.doctorClients(
        doctorId,
        req.query.start_date,
        req.query.end_date
      ),
      completed_schedules: await this.#service.doctorCompletedSchedules(
        doctorId,
        req.query.start_date,
        req.query.end_date
      ),
    };

    return this.ok(res, data, "Stat dashboard doctor berhasil didapatkan");
  });

  doctorServicesStat = this.wrapper(async (req, res) => {
    const doctorId = await this.getDoctorId(req);

    const data = await this.#service.doctorServiceStat(
      doctorId,
      req.query.start_date,
      req.query.end_date
    );
    return this.ok(res, data, "Stat layanan doctor berhasil didapatkan");
  });

  stats = this.wrapper(async (req, res) => {
    const data = {
      chats: {
        unread: await this.#service.unreadChats(req.user.id),
      },
    };
    return this.ok(res, data, "Stat berhasil didapatkan");
  });
}

export default DashboardController;
