import BaseController from "../../base/controller.base.js";
import { Forbidden, NotFound } from "../../lib/response/catch.js";
import ChatRoomService from "./chatroom.service.js";

class ChatRoomController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new ChatRoomService();
  }

  findAll = this.wrapper(async (req, res) => {
    const q = this.joinBrowseQuery(
      req.query,
      "where",
      `members.some.user_id:${req.user.id}`
    );
    const data = await this.#service.findAll(q);
    return this.ok(res, data, "Banyak ChatRoom berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("ChatRoom tidak ditemukan");
    if (!data.members.find((m) => m.user_id == req.user.id))
      throw new Forbidden();

    return this.ok(res, data, "ChatRoom berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const payload = {
      ...req.body,
      members: [...req.body.members, { user_id: req.user.id, is_admin: true }],
    };
    const data = await this.#service.create(payload);
    return this.created(res, data, "ChatRoom berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const member = await this.#service.isMember(req.params.id, req.user.id);
    if (!member.is_admin) throw new Forbidden();

    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "ChatRoom berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const member = await this.#service.isMember(req.params.id, req.user.id);
    if (!member.is_admin) throw new Forbidden();

    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "ChatRoom berhasil dihapus");
  });
}

export default ChatRoomController;
