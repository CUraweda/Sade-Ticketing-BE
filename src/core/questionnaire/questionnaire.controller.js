import BaseController from "../../base/controller.base.js";
import { BadRequest, Forbidden, NotFound } from "../../lib/response/catch.js";
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

  findResponse = this.wrapper(async (req, res) => {
    const data = await this.#service.findResponse(
      req.params.id,
      req.params.response_id
    );
    if (!data || (data && data.user_id != req.user.id))
      throw new NotFound("Respon kuesioner tidak ditemukan");
    return this.ok(res, data, "Respons kuesioner berhasil didapatkan");
  });

  saveResponseDraft = this.wrapper(async (req, res) => {
    const check = await this.#service.checkResponseAuthor(
      req.params.id,
      req.params.response_id,
      req.user.id
    );
    if (!check) throw new Forbidden("Akses terlarang");

    const data = await this.#service.saveResponse(
      req.params.response_id,
      req.body
    );
    return this.ok(
      res,
      data,
      "Respon kuesioner berhasil disimpan sebagai draf"
    );
  });

  submitResponse = this.wrapper(async (req, res) => {
    const check = await this.#service.checkResponseAuthor(
      req.params.id,
      req.params.response_id,
      req.user.id
    );
    if (!check) throw new Forbidden("Akses terlarang");

    const data = await this.#service.saveResponse(
      req.params.response_id,
      req.body,
      true
    );
    return this.ok(res, data, "Respon final kuesioner berhasil disimpan");
  });
}

export default QuestionnaireController;
