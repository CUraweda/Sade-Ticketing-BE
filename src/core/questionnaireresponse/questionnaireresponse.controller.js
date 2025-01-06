import BaseController from "../../base/controller.base.js";
import { BadRequest, Forbidden, NotFound } from "../../lib/response/catch.js";
import { RoleCode } from "../role/role.validator.js";
import SignatureService from "../signature/signature.service.js";
import QuestionnaireResponseService from "./questionnaireresponse.service.js";

class QuestionnaireResponseController extends BaseController {
  #service;
  #signatureService;

  constructor() {
    super();
    this.#service = new QuestionnaireResponseService();
    this.#signatureService = new SignatureService();
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
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound();
    if (!this.isAdmin(req) && data.user_id != req.user.id)
      throw new Forbidden();

    await this.#service.delete(req.params.id);
    return this.noContent(res, "QuestionnaireResponse berhasil dihapus");
  });

  addSignature = this.wrapper(async (req, res) => {
    const signature = await this.#signatureService.findById(
      req.body.signature_id,
      req.user.id
    );
    if (!signature) throw new Forbidden();

    const response = await this.#service.findById(req.params.id);
    if (!response.questionnaire.signers.split(",").includes(signature.role))
      throw new BadRequest();
    if (response.signatures.some((s) => s.role == signature.role))
      throw new BadRequest(`Tanda tangan ${signature.role} sudah ada`);

    const payload = {
      name: signature.name,
      role: signature.role,
      signature_img_path: signature.signature_img_path ?? null,
      detail: signature.detail ?? null,
      signed_place: req.body.signed_place,
    };
    const data = await this.#service.addSignature(req.params.id, payload);

    return this.ok(res, data, "Signature berhasil ditambahkan");
  });

  export = this.wrapper(async (req, res) => {
    if (!this.isAdmin(req)) {
      if (req.user.role_code == RoleCode.USER) {
        const chk = await this.#service.checkAccess(req.params.id, req.user.id);
        if (!chk) throw new Forbidden();
      }
    }

    const result = await this.#service.exportResponse(req.params.id);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${result.data.questionnaire.title ?? "Respon"}.pdf`
    );
    result.doc.getBuffer((buffer) => {
      res.send(Buffer.from(buffer));
    });
  });
}

export default QuestionnaireResponseController;
