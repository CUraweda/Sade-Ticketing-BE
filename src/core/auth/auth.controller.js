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
    return this.ok(res, data, "Login successfully");
  });

  refreshToken = this.wrapper(async (req, res) => {
    const { refresh_token } = req.body;
    const refreshTokenDoc = await this.#service.verifyToken(
      refresh_token,
      TokenTypes.REFRESH
    );

    if (!refreshTokenDoc) {
      return this.unauthorized(res, "Invalid refresh token");
    }

    const user = await this.#service.getUserByUUid(refreshTokenDoc.uid);

    if (!user) {
      return this.unauthorized(res, "User not found");
    }

    const tokens = await this.#service.generateTokens(user);

    return this.ok(res, tokens, "Token refreshed successfully");
  })
}

export default AuthController;
