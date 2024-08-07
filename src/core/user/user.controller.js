import BaseController from "../../base/controller.base.js";
import UserService from "./user.service.js";

class UserController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new UserService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Users retrieved successfully");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    return this.ok(res, data, "User retrieved succesfully");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "User created successfully");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "User updated successfully");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    this.noContent(res, "User deleted successfully");
  });
}

export default UserController;
