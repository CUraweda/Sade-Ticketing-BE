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
      doctors: await this.#service.countDoctors(),
      users: await this.#service.countUsers(),
      bookings: await this.#service.countBookings(),
      daycare_bookings: await this.#service.countDaycareBookings(),
      revenue: await this.#service.totalPaymentsNet(),
      invoices: await this.#service.countInvoice(),
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
      quota: {
        total: await this.#service.totalScheduleQuota(clientIds),
        active: await this.#service.activeScheduleQuota(clientIds),
        inactive: await this.#service.inactiveScheduleQuota(clientIds),
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

    const schedule = await this.#service.doctorCompletedSchedules(
      doctorId,
      req.query.start_date,
      req.query.end_date
    );
    const data = {
      total_payroll: 0,
      total_service_salary: await this.#service.totalServiceSalary(
        doctorId,
        req.query.start_date,
        req.query.end_date
      ),
      transport_fee: {
        completed: await this.#service.totalDoctorTransport(
          doctorId,
          req.query.start_date,
          req.query.end_date
        ),
        total: await this.#service.estTotalDoctorTransport(
          doctorId,
          req.query.start_date,
          req.query.end_date
        ),
      },
      work_days: {
        completed: await this.#service.totalDoctorWorkDays(
          doctorId,
          req.query.start_date,
          req.query.end_date
        ),
        total: await this.#service.estTotalDoctorWorkDays(
          doctorId,
          req.query.start_date,
          req.query.end_date
        ),
      },
      work_minutes: await this.#service.doctorWorkTime(
        doctorId,
        req.query.start_date,
        req.query.end_date
      ),
      schedule: {
        complete: schedule.completed,
        total: schedule.total,
      },
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

  financeStats = this.wrapper(async (req, res) => {
    const s = req.query.start_date,
      e = req.query.end_date;
    const data = {
      net: await this.#service.totalPaymentsNet(s, e),
      income: await this.#service.totalPaymentIncome(s, e),
      outcome: await this.#service.totalPaymentOutcome(s, e),
      pending: await this.#service.totalPaymentPending(s, e),
    };
    return this.ok(res, data, "Stat finance berhasil didapatkan");
  });

  bankChart = this.wrapper(async (req, res) => {
    const s = req.query.start_date,
      e = req.query.end_date;

    const data = await this.#service.bankChart(s, e);
    return this.ok(res, data, "Chart bank berhasil didapatkan");
  });

  getDaycareOperatingHours = this.wrapper(async (req, res) => {
    const data = await this.#service.getDaycareOperatingHours();
    return this.ok(res, data);
  });
}

export default DashboardController;
