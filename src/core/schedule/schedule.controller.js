import moment from "moment";
import BaseController from "../../base/controller.base.js";
import { BadRequest, NotFound } from "../../lib/response/catch.js";
import DoctorService from "../doctor/doctor.service.js";
import { RoleCode } from "../role/role.validator.js";
import ScheduleService from "./schedule.service.js";

class ScheduleController extends BaseController {
  #service;
  #doctorService;

  constructor() {
    super();
    this.#service = new ScheduleService();
    this.#doctorService = new DoctorService();
  }

  findAll = this.wrapper(async (req, res) => {
    let q = req.query;

    if (!this.isAdmin(req)) {
      q = this.joinBrowseQuery(q, "where", `is_locked:false`);
    }

    const data = await this.#service.findAll(q);
    return this.ok(res, data, "Banyak Schedule berhasil didapatkan");
  });

  findMine = this.wrapper(async (req, res) => {
    let q = req.query,
      role = req.user.role_code,
      uid = req.user.id;

    if (
      role == RoleCode.PSIKOLOG ||
      role == RoleCode.ASESOR ||
      role == RoleCode.TERAPIS
    ) {
      q = this.joinBrowseQuery(q, "in_", `doctors.user_id:${uid}`);
    } else if (role == RoleCode.USER) {
      q = this.joinBrowseQuery(
        q,
        "in_",
        `attendees.some.client.user_id:${uid}`
      );
    }

    const data = await this.#service.findAll(q);
    return this.ok(res, data, "Jadwal anda berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    if (!this.isAdmin(req))
      await this.#service.checkAuthorized(req.params.id, req.user.id);

    const data = await this.#service.findById(
      req.params.id,
      !this.isAdmin(req) ? req.user.id : null
    );
    if (!data) throw new NotFound("Jadwal tidak ditemukan");

    return this.ok(res, data, "Jadwal berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    let payload = req.body;

    if (!this.isAdmin(req)) {
      const doctor = await this.#doctorService.findByUser(req.user.id);
      if (!doctor)
        throw new BadRequest(
          "Akun anda belum ditautkan dengan profil spesialis"
        );
      else payload["doctors"] = [doctor.id];
    }

    const { dates, ...restPayload } = payload;
    const payloads = dates.map((date) => ({
      ...restPayload,
      start_date: date.start_date,
      end_date: date.end_date,
      repeat: date.repeat,
      repeat_end: date.repeat_end,
    }));

    const data = await this.#service.create(payloads);
    return this.created(res, data, "Jadwal berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound();
    if (data.is_locked) throw new BadRequest("Jadwal sudah terkunci");

    const payload = req.body;

    if (data.parent_id != null) {
      delete payload["repeat"];
      delete payload["repeat_end"];
    }

    if (payload.max_attendees && payload.max_attendees < data._count.attendees)
      throw new BadRequest(
        `Sudah ada ${data._count.attendees} klien di jadwal`
      );

    const result = await this.#service.update(req.params.id, payload);
    return this.ok(res, result, "Jadwal berhasil diperbarui");
  });

  detach = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound();

    const { mode, ...restPayload } = req.body;
    const result = await this.#service.detach(req.params.id, restPayload, mode);
    return this.ok(res, result, "Jadwal berhasil dilepaskan dari jadwal induk");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound();
    if (data.is_locked) throw new BadRequest("Jadwal sudah terkunci");

    if (data._count.attendees > 0)
      throw new BadRequest(
        `Jadwal tidak dapat dihapus karena sudah memiliki ${data._count.attendees} klien terdaftar.`
      );

    await this.#service.delete(req.params.id, req.query.with_children);
    return this.noContent(res, "Jadwal berhasil dihapus");
  });

  setDoctor = this.wrapper(async (req, res) => {
    if (req.body.set == "add")
      await this.#service.addDoctor(req.params.id, req.body.doctor_id);
    else await this.#service.removeDoctor(req.params.id, req.body.doctor_id);

    return this.ok(
      res,
      null,
      `Spesialis berhasil ${req.body.set == "add" ? "ditambahkan ke" : "dikeluarkan dari"} jadwal`
    );
  });

  toggleLock = this.wrapper(async (req, res) => {
    const lock = req.params.lock == "lock";
    const data = await this.#service.update(req.params.id, { is_locked: lock });
    return this.ok(res, data, `Jadwal berhasil di${lock ? "kunci" : "buka"}`);
  });

  checkAvailability = this.wrapper(async (req, res) => {
    const ids = req.body.map((b) => b.schedule_id);
    const result = await this.#service.checkAvailability(ids);
    if (result.length)
      throw new BadRequest(
        `Jadwal pada tanggal ${result.map((r) => moment(r.start_date).format("DD MMM YYYY")).join(", ")} sudah penuh`
      );

    return this.ok(res, result, "Semua jadwal tersedia!");
  });
}

export default ScheduleController;
