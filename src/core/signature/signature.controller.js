import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import SignatureService from "./signature.service.js";
import fs from "fs";

class SignatureController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new SignatureService();
  }

  findAll = this.wrapper(async (req, res) => {
    const q = this.joinBrowseQuery(
      req.query,
      "where",
      `user_id:${req.user.id}`
    );
    const data = await this.#service.findAll(q);
    return this.ok(res, data, "Banyak Signature berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id, req.user.id);
    if (!data) throw new NotFound("Signature tidak ditemukan");

    return this.ok(res, data, "Signature berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const payload = req.body;

    payload["user_id"] = req.user.id;
    payload["signature_img_path"] = req.file?.path ?? null;

    const data = await this.#service.create(req.body);
    return this.created(res, data, "Signature berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const prevData = await this.#service.findById(req.params.id, req.user.id);
    if (!prevData) throw new NotFound("Signature tidak ditemukan");

    const payload = req.body;
    if (req.file?.path) {
      if (prevData.signature_img_path)
        fs.unlink(prevData.signature_img_path, (err) => {
          if (err) {
            console.error("ERR(file): ", err);
          }
        });
      payload["signature_img_path"] = req.file?.path ?? null;
    }

    const data = await this.#service.update(req.params.id, payload);
    return this.ok(res, data, "Signature berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const prevData = await this.#service.findById(req.params.id, req.user.id);
    if (!prevData) throw new NotFound("Signature tidak ditemukan");

    if (prevData.signature_img_path)
      fs.unlink(prevData.signature_img_path, (err) => {
        if (err) {
          console.error("ERR(file): ", err);
        }
      });

    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "Signature berhasil dihapus");
  });

  download = this.wrapper(async (req, res) => {
    if (fs.existsSync(req.query.path)) {
      return res.download(req.query.path, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          return this.serverError(res, "Gagal mendownload file");
        }
      });
    } else {
      return this.ok(res, null, "Gambar Signature tidak ada");
    }
  });
}

export default SignatureController;
