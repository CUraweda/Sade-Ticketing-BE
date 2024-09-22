import BaseController from "../../base/controller.base.js";
import { NotFound } from "../../lib/response/catch.js";
import ChatMessageService from "./chatmessage.service.js";

class ChatMessageController extends BaseController {
  #service;

  constructor() {
    super();
    this.#service = new ChatMessageService();
  }

  findAll = this.wrapper(async (req, res) => {
    const data = await this.#service.findAll(req.query);
    return this.ok(res, data, "Banyak ChatMessage berhasil didapatkan");
  });

  findById = this.wrapper(async (req, res) => {
    const data = await this.#service.findById(req.params.id);
    if (!data) throw new NotFound("ChatMessage tidak ditemukan");

    return this.ok(res, data, "ChatMessage berhasil didapatkan");
  });
  findByUniqueId = this.wrapper(async (req, res) => {
    const data = await this.#service.findByUniqueId(req.params.id);
    if (!data) throw new NotFound("ChatMessage tidak ditemukan");

    return this.ok(res, data, "ChatMessage berhasil didapatkan");
  });

  create = this.wrapper(async (req, res) => {
    const data = await this.#service.create(req.body);
    return this.created(res, data, "ChatMessage berhasil dibuat");
  });
  
  reply = this.wrapper(async (req, res) => {
    const data = await this.#service.reply(req.params.id,req.body);
    return this.created(res, data, "ChatMessage berhasil dibuat");
  });

  update = this.wrapper(async (req, res) => {
    const data = await this.#service.update(req.params.id, req.body);
    return this.ok(res, data, "ChatMessage berhasil diperbarui");
  });

  updateRead = this.wrapper(async (req, res) => {
    const data = await this.#service.updateRead(req.params.id);
    return this.ok(res, data, "ChatMessage berhasil diperbarui");
  });

  delete = this.wrapper(async (req, res) => {
    const data = await this.#service.delete(req.params.id);
    return this.noContent(res, "ChatMessage berhasil dihapus");
  });
}

export default ChatMessageController;
