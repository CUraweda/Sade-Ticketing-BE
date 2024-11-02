import BaseController from "../../base/controller.base.js";
import AuthService from "./auth.service.js";
// const TokenTypes = require("../../config/token.js")

class AuthController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new AuthService();
  }

  login = this.wrapper(async (req, res) => {
    const data = await this.#service.login(req.body);
    return this.ok(res, data, "Berhasil login!");
  });
  refreshToken = this.wrapper(async (req, res) => {
    const data = await this.#service.refreshToken(req.body)  
    return this.ok(res, data, "Token Diperbarui!");
  });
  
  register = this.wrapper(async (req, res) => {
    const data = await this.#service.register(req.body)
    return this.ok(res, data, "Berhasil register!")
  })
  verifyEmail = this.wrapper(async (req, res) => {
    const data = await this.#service.verifyEmail(req.body)
    return this.ok(res, data, "Berhasil verifikasi!")
  })
  forgotPassword = this.wrapper(async (req, res) => {
    const data = await this.#service.forgotPassword(req.body)
    return this.ok(res, data, "Berhasil!")
  })
  resetPass = this.wrapper(async (req, res) => {
    const data = await this.#service.resetPass(req.body)
    return this.ok(res, data, "Berhasil!")
  })
}

export default AuthController;
