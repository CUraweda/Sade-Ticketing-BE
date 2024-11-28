import BaseController from "../../base/controller.base.js";
import { Forbidden, NotFound } from "../../lib/response/catch.js";
import { RoleCode } from "../role/role.validator.js";
import QuestionnaireResponseService from "./questionnaireresponse.service.js";

class QuestionnaireResponseController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new QuestionnaireResponseService();
  }

  findAll = this.wrapper(async (req, res) => {
    let q = req.query;
    // if (!this.isAdmin(req)) {
    //   if (req.user.role_code == RoleCode.USER)
    //     q = this.joinBrowseQuery(q, "where", `user_id:${req.user.id}`);
    // }

    const data = await this.#service.findAll(q, req.user.id);
    return this.ok(
      res,
      data,
      "Banyak QuestionnaireResponse berhasil didapatkan"
    );
  });

  findById = this.wrapper(async (req, res) => {
    if (!this.isAdmin(req)) {
      if (req.user.role_code == RoleCode.USER) {
        const chk = await this.#service.checkAccess(req.params.id, req.user.id);
        if (!chk) throw new Forbidden();
      }
    }

    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("QuestionnaireResponse tidak ditemukan");

    return this.ok(res, data, "QuestionnaireResponse berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "QuestionnaireResponse berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "QuestionnaireResponse berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "QuestionnaireResponse berhasil dihapus");
  });
}

export default QuestionnaireResponseController;
