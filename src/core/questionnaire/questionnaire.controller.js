import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import QuestionnaireService from "./questionnaire.service.js";

class QuestionnaireController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new QuestionnaireService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak Questionnaire berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("Questionnaire tidak ditemukan");

    return this.ok(res, data, "Questionnaire berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "Questionnaire berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "Questionnaire berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    this.noContent(res, "Questionnaire berhasil dihapus");
  });
}

export default QuestionnaireController;