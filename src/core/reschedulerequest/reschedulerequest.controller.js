import BaseController from "../../base/controller.base.js";
import { BadRequest, NotFound } from "../../lib/response/catch.js";
import RescheduleRequestService from "./reschedulerequest.service.js";

class RescheduleRequestController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new RescheduleRequestService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak RescheduleRequest berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("RescheduleRequest tidak ditemukan");

    return this.ok(res, data, "RescheduleRequest berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const isLocked = await this.#service.checkIsLocked(req.body);
    if (isLocked)
      return new BadRequest(
        "Schedule telah di kunci anda tidak bisa mengajukan reschedule"
      );
    const data = await this.#service.create(req.body);
    return this.created(res, data, "RescheduleRequest berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const isApproved = await this.#service.isApproved(req.params.id);
    if (isApproved)
      return new BadRequest(
        "Reschedule sudah di approve anda tidak bisa mengupdate reschedule anda"
      );
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "RescheduleRequest berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    await this.#service.delete(req.params.id);
    return this.noContent(res, "RescheduleRequest berhasil dihapus");
  });

  findAllByUser = this.wrapper(async (req, res) => {
    const data = await this.#service.findAllByUser(req.user.id, req.query);
    return this.ok(res, data, "RescheduleRequest user berhasil didapatkan");
  });

  approveReschedule = this.wrapper(async (req, res) => {
    const data = await this.#service.approveReschedule(req.params.id);
    return this.ok(res, data, "RescheduleRequest berhasil disetujui");
  });

  deleteByUser = this.wrapper(async (req, res) => {
    const isApproved = await this.#service.isApproved(req.params.id);
    if (isApproved)
      return new BadRequest(
        "Reschedule sudah di approve anda tidak bisa mengupdate reschedule anda"
      );
    const data = await this.#service.deleteByUser(req.user.id, req.params.id);
    return this.ok(res, data, "RescheduleRequest berhasil di hapus oleh user");
  });
}

export default RescheduleRequestController;
