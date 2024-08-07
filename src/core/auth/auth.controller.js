import BaseController from "../../base/controller.base.js";
import AuthService from "./auth.service.js";

class AuthController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new AuthService();
  }

  login = this.wrapper(async (req, res) => {
    const data = await this.#service.login(req.body);
    return this.ok(res, data, "Login successfully");
  });
}

export default AuthController;
