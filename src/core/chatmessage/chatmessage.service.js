import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class ChatMessageService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.chatMessage.findMany({ ...q });

    if (query.paginate) {
      const countData = await this.db.chatMessage.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.chatMessage.findUnique({ where: { id } });
    return data;
  };

  findByUniqueId = async (id) => {
    const data = await this.db.chatMessage.findMany({ where: { unique_id: id },orderBy: {
      created_at: 'desc',
    }, });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.chatMessage.create({ data: payload });
    return data;
  };

  reply = async (id, payload) => {
    const reply_chat = await this.db.chatMessage.findUnique({ where: {id: id} }) 
    const message = await this.db.chatMessage.create({ data: payload})
    const data = {
      reply_to: reply_chat,
      message: message
    }

    return data
  }

  update = async (id, payload) => {
    const data = await this.db.chatMessage.update({ where: { id }, data: payload });
    return data;
  };
  
  updateRead = async (id) => {
    const data = await this.db.chatMessage.update({ where: { id }, data: {is_read: true } } );
    return data;
  };

  delete = async (id) => {
    const data = await this.db.chatMessage.delete({ where: { id } });
    return data;
  };
}

export default ChatMessageService;  
