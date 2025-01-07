import BaseController from "../../base/controller.base.js";
import { BadRequest, Forbidden, NotFound } from "../../lib/response/catch.js";
import ScheduleService from "../schedule/schedule.service.js";
import ScheduleAttendeeService from "../scheduleattendee/scheduleattendee.service.js";
import RescheduleRequestService from "./reschedulerequest.service.js";

class RescheduleRequestController extends BaseController {
  #service;
  #scheduleService;
  #attendeeService;

  constructor() {
    super();
    this.#service = new RescheduleRequestService();
    this.#scheduleService = new ScheduleService();
    this.#attendeeService = new ScheduleAttendeeService();
  }

  findAll = this.wrapper(async (req, res) => {
    let q = req.query;

    if (!this.isAdmin(req)) {
      q = this.joinBrowseQuery(
        q,
        "where",
        `attendee.client.user_id:${req.user.id}`
      );
    }

    const data = await this.#service.findAll(q);
    return this.ok(res, data, "Banyak RescheduleRequest berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("RescheduleRequest tidak ditemukan");

    if (!this.isAdmin(req)) {
      const check = await this.#service.isCreator(req.params.id, req.user.id);
      if (!check) throw new Forbidden();
    }

    return this.ok(res, data, "RescheduleRequest berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "RescheduleRequest berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const isApproved = await this.#service.isApproved(req.params.id);
    if (isApproved != null)
      throw new BadRequest(
        "Permintaan sudah direspon Anda tidak bisa memperbarui lagi"
      );
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "RescheduleRequest berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    if (!this.isAdmin(req)) {
      const check = await this.#service.isCreator(req.params.id, req.user.id);
      if (!check) throw new Forbidden();

      const isApproved = await this.#service.isApproved(req.params.id);
      if (isApproved == true)
        throw new BadRequest(
          "Reschedule sudah diterima anda tidak bisa menghapusnya"
        );
    }

    await this.#service.delete(req.params.id);
    return this.noContent(res, "RescheduleRequest berhasil dihapus");
  });

  adminResponse = this.wrapper(async (req, res) => {
    const { direct_to_new, ...body } = req.body;

    if (body.is_approved && direct_to_new) {
      const data = await this.#service.findById(req.params.id);
      const unavailable = await this.#scheduleService.checkAvailability([
        data.new_schedule_id,
      ]);
      if (unavailable.length) throw new BadRequest("Jadwal baru sudah penuh");

      const isAttendeeDone = await this.#attendeeService.isDone(
        data.attendee_id
      );
      if (isAttendeeDone) throw new BadRequest("Saldo sudah hangus / selesai");

      await this.#attendeeService.update(data.attendee_id, {
        schedule_id: data.new_schedule_id,
      });
    }

    const data = await this.#service.update(req.params.id, body);
    return this.ok(res, data, "RescheduleRequest berhasil disetujui");
  });
}

export default RescheduleRequestController;
