import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import LocationService from "./location.service.js";

class LocationController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new LocationService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak Location berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(parseInt(req.params.id));
    if (!data) throw new NotFound("Location tidak ditemukan");

    return this.ok(res, data, "Location berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "Location berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(parseInt(req.params.id), req.body);
    return this.ok(res, data, "Location berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(parseInt(req.params.id));
    this.noContent(res, "Location berhasil dihapus");
  });
}

export default LocationController;
