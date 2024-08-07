import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import RoleService from "./role.service.js";

class RoleController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new RoleService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Roles retrieved successfully");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("Role not found");

    return this.ok(res, data, "Role retrieved succesfully");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "Role created successfully");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "Role updated successfully");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    this.noContent(res, "Role deleted successfully");
  });
}

export default RoleController;
