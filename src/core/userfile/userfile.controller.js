import BaseController from "../../base/controller.base.js";
import { BadRequest, NotFound } from "../../lib/response/catch.js";
import UserFileService from "./userfile.service.js";

class UserFileController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new UserFileService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak User File berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("User File tidak ditemukan");

    return this.ok(res, data, "User File berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const file = req.file
    
    if (!file) {
      throw new BadRequest("No file Uploaded")
    }
    
    const uploadData = {
      filename: file.originalname,
      mimetype:  file.mimetype,
      size: file.size,
      url: file.path,
      user_id: req.body.user_id
    }

    const data = await this.#service.create(uploadData);
    return this.created(res, data, "User File berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "User File berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "User File berhasil dihapus");
  });

  download = this.wrapper(async (req, res) => {
    const fileData = await this.#service.download(req.params.id);
      res.setHeader('Content-Type', fileData.mimetype);
      res.setHeader('Content-Disposition', `attachment; filename="${fileData.filename}"`);
      res.setHeader('Content-Length', fileData.size);
      res.send(fileData.buffer);
  })

}

export default UserFileController;
