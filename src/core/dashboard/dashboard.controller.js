import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import DashboardService from "./dashboard.service.js";

class DashboardController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new DashboardService();
  }

  topServices = this.wrapper(async (req, res) => {
    const data = await this.#service.topServices(req.query);
    return this.ok(res, data, "Layanan teratas berhasil didapatkan");
  });
}

export default DashboardController;
