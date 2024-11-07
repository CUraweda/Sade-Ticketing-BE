import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import ServiceRecommendationService from "./servicerecommendation.service.js";
import { RoleCode } from "../role/role.validator.js";
class ServiceRecommendationController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new ServiceRecommendationService();
  }

  findAll = this.wrapper(async (req, res) => {
    let q = req.query,
      role = req.user.role_code,
      uid = req.user.id;

    if (role == RoleCode.USER) {
      q = this.joinBrowseQuery(q, "where", `client.user_id:${uid}`);
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
    const data = await this.#service.create(req.body);
    return this.created(res, data, "ServiceRecommendation berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "ServiceRecommendation berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "ServiceRecommendation berhasil dihapus");
  });

  findByBookingId = this.wrapper(async (req, res) => {
    const data = await this.#service.findByBookingId(req.params.booking_id);
    if (!data) throw new NotFound("ServiceRecommendation tidak ditemukan");

    return this.ok(res, data, "ServiceRecommendation berhasil didapatkan");
  });
}

export default ServiceRecommendationController;
