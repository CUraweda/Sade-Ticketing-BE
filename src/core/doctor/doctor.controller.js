import BaseController from "../../base/controller.base.js";
import { doctorFields } from "../../data/model-fields.js";
import { NotFound } from "../../lib/response/catch.js";
import DoctorService from "./doctor.service.js";

class DoctorController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new DoctorService();
  }

  findAll = this.wrapper(async (req, res) => {
    let data = await this.#service.findAll(req.query);
    data = this.include(
      data,
      doctorFields.full(req.user.role_code),
      req.query.paginate
    );

    return this.ok(res, data, "Banyak Doctor berhasil didapatkan");
  });

  findMine = this.wrapper(async (req, res) => {
    const data = await this.#service.findByUser(req.user.id);
    if (!data) throw new NotFound("Doctor tidak ditemukan");

    return this.ok(res, data, "Doctor berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    let data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("Doctor tidak ditemukan");

    data = this.include(data, doctorFields.full(req.user.role_code));
    return this.ok(res, data, "Doctor berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "Doctor berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "Doctor berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    this.noContent(res, "Doctor berhasil dihapus");
  });

  findSpecialisms = this.wrapper(async (req, res) => {
    const data = await this.#service.findDoctorSpecialisms(req.params.id);
    return this.ok(
      res,
      data,
      "Banyak Spesialisasi Doctor berhasil didapatkan "
    );
  });

  findServices = this.wrapper(async (req, res) => {
    const data = await this.#service.findDoctorServices(req.params.id);
    return this.ok(res, data, "Banyak layanan Doctor berhasil didapatkan ");
  });

  setService = this.wrapper(async (req, res) => {
    await this.#service.setService(
      req.params.id,
      req.body.service_id,
      req.body.set
    );

    return this.ok(
      res,
      null,
      `Berhasil ${req.body.set == "add" ? "menambahkan" : "menghapus"} layanan`
    );
  });

  setSpecialism = this.wrapper(async (req, res) => {
    await this.#service.setSpecialism(
      req.params.id,
      req.body.specialism_id,
      req.body.set
    );

    return this.ok(
      res,
      null,
      `Berhasil ${req.body.set == "add" ? "menambahkan" : "menghapus"} spesialisasi`
    );
  });
}

export default DoctorController;
