import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import { RoleCode } from "../role/role.validator.js";
import ScheduleService from "./schedule.service.js";

class ScheduleController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new ScheduleService();
  }

  findAll = this.wrapper(async (req, res) => {
    let q = req.query;

    if (!this.isAdmin(req)) {
      q = this.joinBrowseQuery(q, "where", `is_locked:false`);
    }

    const data = await this.#service.findAll(q);
    return this.ok(res, data, "Banyak Schedule berhasil didapatkan");
  });

  mine = this.wrapper(async (req, res) => {
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
      q = this.joinBrowseQuery(q, "in_", `clients.user_id:${uid}`);
    }

    const data = await this.#service.findAll(q);
    return this.ok(res, data, "Jadwal anda berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    if (req.user.role_code != "SDM" && req.user.role_code != "ADM")
      await this.#service.checkCreator(req.params.id, req.user.id);

    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("Jadwal tidak ditemukan");

    return this.ok(res, data, "Jadwal berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    let payload = req.body;
    payload["creator_id"] = req.user.id;
    const data = await this.#service.create(payload);
    return this.created(res, data, "Jadwal berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    if (req.user.role_code != "SDM" && req.user.role_code != "ADM")
      await this.#service.checkCreator(req.params.id, req.user.id);

    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "Jadwal berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    if (req.user.role_code != "SDM" && req.user.role_code != "ADM")
      await this.#service.checkCreator(req.params.id, req.user.id);

    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "Jadwal berhasil dihapus");
  });

  setClient = this.wrapper(async (req, res) => {
    if (req.user.role_code != "SDM" && req.user.role_code != "ADM")
      await this.#service.checkCreator(req.params.id, req.user.id);

    if (req.body.set == "add")
      await this.#service.addClient(req.params.id, req.body.client_id);
    else await this.#service.removeClient(req.params.id, req.body.client_id);

    return this.ok(
      res,
      null,
      `Klien berhasil ${req.body.set == "add" ? "ditambahkan ke" : "dikeluarkan dari"} jadwal`
    );
  });

  setDoctor = this.wrapper(async (req, res) => {
    if (req.user.role_code != "SDM" && req.user.role_code != "ADM")
      await this.#service.checkCreator(id, req.user.id);

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
    const data = await this.#service.setLock(req.params.id, lock);
    return this.ok(res, data, `Jadwal berhasil di${lock ? "kunci" : "buka"}`);
  });
}

export default ScheduleController;
