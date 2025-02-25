import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import PublicApiService from "./publicapi.service.js";

class PublicApiController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new PublicApiService();
  }

  getServices = this.wrapper(async (req, res) => {
    let q = req.query;
    const data = await this.#service.getServices(q);
    return this.ok(res, data);
  });

  getServicesRecap = this.wrapper(async (req, res) => {
    const data = {
      by_location: await this.#service.getLocations(),
      by_category: await this.#service.countServicesByCategory(),
    };

    return this.ok(res, data);
  });

  getDoctors = this.wrapper(async (req, res) => {
    let q = req.query;
    const data = await this.#service.getDoctors(q);
    return this.ok(res, data);
  });

  getDoctorsRecap = this.wrapper(async (req, res) => {
    const data = {
      by_location: await this.#service.getLocations(),
      by_category: await this.#service.countDoctorsByCategory(),
    };

    return this.ok(res, data);
  });

  getDaycarePrices = this.wrapper(async (req, res) => {
    let q = req.query;
    const data = await this.#service.getDaycarePrices(q);
    return this.ok(res, data);
  });
}

export default PublicApiController;
