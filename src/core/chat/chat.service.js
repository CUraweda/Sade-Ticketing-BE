import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class ChatService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.chat.findMany({ ...q });

    if (query.paginate) {
      const countData = await this.db.chat.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.chat.findUnique({ where: { id } });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.chat.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.chat.update({ where: { id }, data: payload });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.chat.delete({ where: { id } });
    return data;
  };
}

export default ChatService;  
