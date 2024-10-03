import { v4 as uuidv4 } from 'uuid';
import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class UserChatService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.userChat.findMany({ ...q });

    if (query.paginate) {
      const countData = await this.db.userChat.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.userChat.findUnique({ where: { id } });
    return data;
  };
  
  findByUser = async (id) => {
    const userChats = await this.db.userChat.findMany({
      where: {
        sender_id: id
      }
    });
    
    return userChats;
  };
  

  create = async (payload) => {
    const sender = await this.db.userRole.findFirst({where: {user_id: payload.sender_id}})
    const receiver = await this.db.userRole.findFirst({ where: {user_id: payload.receiver_id}})
    if (sender.role_id === 3 && [1, 3, 4, 5, 6].includes(receiver.role_id)) {
      return "Anda tidak memiliki akses chat";
    }

    let unique_id = uuidv4()
    const existed_unique_id = await this.db.userChat.findFirst({where: {
      sender_id: payload.receiver_id,
      receiver_id: payload.sender_id
    }})
    if (existed_unique_id) {
      unique_id = existed_unique_id.unique_id
    }
    const existed_chat = await this.db.userChat.findFirst({where: {
      sender_id: payload.sender_id,
      receiver_id: payload.receiver_id
    }})
    if (existed_chat) {
      return "Chat already existed"
    }
    const data = await this.db.userChat.create({
      data: {
        ...payload,
        unique_id: unique_id,
      },
    });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.userChat.update({ where: { id }, data: payload });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.userChat.delete({ where: { id } });
    return data;
  };
}

export default UserChatService;  
