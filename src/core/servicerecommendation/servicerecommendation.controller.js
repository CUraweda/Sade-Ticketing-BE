import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import ServiceRecommendationService from "./servicerecommendation.service.js";
import { RoleCode } from "../role/role.validator.js";
import DoctorService from "../doctor/doctor.service.js";
class ServiceRecommendationController extends BaseController {
  #service;
  #doctorService;

  constructor() {
    super();
    this.#service = new ServiceRecommendationService();
    this.#doctorService = new DoctorService();
  }

  findAll = this.wrapper(async (req, res) => {
    let q = req.query;

    if (!this.isAdmin(req) && !this.isDoctor(req)) {
      q = this.joinBrowseQuery(q, "where", `client.user_id:${req.user.id}`);
    }

    const data = await this.#service.findAll(q);
    return this.ok(
      res,
      data,
      "Banyak ServiceRecommendation berhasil didapatkan"
    );
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("ServiceRecommendation tidak ditemukan");

    return this.ok(res, data, "ServiceRecommendation berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const payload = req.body;

    if (this.isDoctor(req)) {
      const doctor = await this.#doctorService.findByUser(req.user.id);
      if (doctor) payload["doctor_id"] = doctor.id;
    }

    const data = await this.#service.create(payload);
    return this.created(res, data, "ServiceRecommendation berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const payload = req.body;

    if (this.isDoctor(req)) {
      const doctor = await this.#doctorService.findByUser(req.user.id);
      if (doctor) payload["doctor_id"] = doctor.id;
    }

    const data = await this.#service.update(req.params.id, payload);
    return this.ok(res, data, "ServiceRecommendation berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    await this.#service.delete(req.params.id);
    return this.noContent(res, "ServiceRecommendation berhasil dihapus");
  });

  markAsRead = this.wrapper(async (req, res) => {
    await this.#service.update(req.params.id, { is_read: true });
    return this.ok(res, null, "ServiceRecommendation berhasil diperbarui");
  });
}

export default ServiceRecommendationController;
