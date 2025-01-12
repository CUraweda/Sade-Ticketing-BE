import BaseController from "../../base/controller.base.js";
import { BadRequest, NotFound } from "../../lib/response/catch.js";
import ChatRoomService from "../chatroom/chatroom.service.js";
import ChatService from "./chat.service.js";

class ChatController extends BaseController {
  #service;
  #chatRoomService;

  constructor() {
    super();
    this.#service = new ChatService();
    this.#chatRoomService = new ChatRoomService();
  }

  findAll = this.wrapper(async (req, res) => {
    const chatRoomId = req.params.chatroom_id;
    await this.#chatRoomService.isMember(chatRoomId, req.user.id);

    const q = this.joinBrowseQuery(
      req.query,
      "where",
      `chatroom_id:${chatRoomId}`
    );
    const data = await this.#service.findAll(q);
    return this.ok(res, data, "Banyak Chat berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("Chat tidak ditemukan");

    return this.ok(res, data, "Chat berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    await this.#chatRoomService.isMember(req.body.chatroom_id, req.user.id);

    const payload = req.body;
    payload["user_id"] = req.user.id;
    const data = await this.#service.create(payload);

    await this.#chatRoomService.notifyMembers(data.chatroom_id, [req.user.id]);

    return this.created(res, data, "Chat berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    await this.#service.isSender(req.params.id, req.user.id);
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "Chat berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    await this.#service.isSender(req.params.id, req.user.id);
    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "Chat berhasil dihapus");
  });

  read = this.wrapper(async (req, res) => {
    const data = await this.#service.read(req.body.chat_ids, req.user.id);

    for (const id of data.chatroom_ids) {
      await this.#chatRoomService.notifyMembers(id, [], "refresh_read");
    }

    return this.ok(res, null, `${data.created_count} chat berhasil dibaca`);
  });

  findReaders = this.wrapper(async (req, res) => {
    const chat = await this.#service.findById(req.params.id);
    await this.#chatRoomService.isMember(chat.chatroom_id, req.user.id);

    const data = await this.#service.findReaders(req.params.id, req.user.id);
    return this.ok(res, data, "Pembaca berhasil didapatkan");
  });
}

export default ChatController;
