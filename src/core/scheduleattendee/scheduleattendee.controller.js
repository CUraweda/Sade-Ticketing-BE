import BaseController from "../../base/controller.base.js";
import { BadRequest, NotFound } from "../../lib/response/catch.js";
import BookingService from "../booking/booking.service.js";
import ScheduleService from "../schedule/schedule.service.js";
import ScheduleAttendeeService from "./scheduleattendee.service.js";

class ScheduleAttendeeController extends BaseController {
  #service;
  #bookingService;
  #scheduleService;

  constructor() {
    super();
    this.#service = new ScheduleAttendeeService();
    this.#bookingService = new BookingService();
    this.#scheduleService = new ScheduleService();
  }

  findAll = this.wrapper(async (req, res) => {
    const q = req.query;

    if (!this.isAdmin(req))
      q = this.joinBrowseQuery(q, "where", `booking.user_id:${req.user.id}`);

    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak ScheduleAttendee berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("ScheduleAttendee tidak ditemukan");

    return this.ok(res, data, "ScheduleAttendee berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const payload = req.body;
    if (!this.isAdmin(req))
      await this.#bookingService.checkBookingOwner(
        payload.booking_id,
        req.user.id
      );

    const unavailableSchedules = (
      await this.#scheduleService.checkAvailability(
        payload.schedules.map((sc) => sc.schedule_id)
      )
    ).map((sc) => sc.id);

    payload["schedules"] = payload.schedules.filter(
      (sc) => !unavailableSchedules.includes(sc.schedule_id)
    );

    // align with booking quantity
    const quota = await this.#bookingService.getScheduleQuota(
      payload.booking_id
    );
    if (payload.schedules.length > quota.remaining)
      throw new BadRequest(
        "Banyak jadwal yang dipilih melebihi saldo jadwal tersisa"
      );

    const data = await this.#service.create(payload);
    return this.created(res, data, "ScheduleAttendee berhasil dibuat");
  });

  // date format expected YYYY-MM-DD
  autoCreate = this.wrapper(async (req, res) => {
    if (!req.query.date) throw new BadRequest("Mohon sertakan tanggal");
    if (!req.query.quantity) throw new BadRequest("Mohon sertakan jumlah");
    if (!this.isAdmin(req))
      await this.#bookingService.checkBookingOwner(
        req.params.booking_id,
        req.user.id
      );

    const start = moment(req.query.date),
      end = moment(req.query.date).endOf("month").endOf("day");

    const schedules = await this.#scheduleService.findAll({
      paginate: true,
      gte: `start_date:${start}`,
      lte: `start_date:${end}`,
      order: "start_date:asc",
    });
    const unavailable = await this.#scheduleService.checkAvailability(
      schedules.map((sc) => sc.items.id)
    );
    const available = schedules.items.filter(
      (sc) => !unavailable.includes(sc.id)
    );
    const payload = {
      booking_id: req.params.booking_id,
      schedules: available
        .map((sc) => ({ schedule_id: sc.id }))
        .filter((_, i) => i < +req.query.quantity),
    };

    const data = await this.#service.create(payload);
    return this.created(res, data, "ScheduleAttendee berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const payload = req.body;

    const isDone = await this.#service.isDone(req.params.id);
    if (isDone) {
      delete payload["schedule_id"];
      delete payload["booking_id"];
      delete payload["group_label"];
      delete payload["is_blocked"];
    }

    const data = await this.#service.update(req.params.id, payload);
    return this.ok(res, data, "ScheduleAttendee berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const isDone = await this.#service.isDone(req.params.id);
    if (isDone) throw new BadRequest("Jadwal sudah selesai");

    const data = await this.#service.findById(req.params.id);
    if (!this.isAdmin(req)) await this.#bookingService(data.booking_id);

    await this.#service.delete(req.params.id);
    return this.noContent(res, "ScheduleAttendee berhasil dihapus");
  });
}

export default ScheduleAttendeeController;
