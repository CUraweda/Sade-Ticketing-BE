import moment from "moment";
import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class ChatService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.chat.findMany({
      ...q,
      include: {
        user: { select: { full_name: true } },
        _count: { select: { readers: true } },
      },
    });

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
    await this.db.chatRoom.update({
      where: { id: data.chatroom_id },
      data: { updated_at: moment().toDate() },
    });
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

  read = async (ids, userId) => {
    const chats = await this.db.chat.findMany({
      where: {
        id: { in: ids },
        chatroom: {
          members: {
            some: {
              user_id: userId,
            },
          },
        },
        user_id: {
          not: userId,
        },
      },
      select: {
        id: true,
        chatroom_id: true,
      },
    });

    const res = await this.db.chatRead.createMany({
      data: chats.map((chat) => ({ chat_id: chat.id, user_id: userId })),
      skipDuplicates: true,
    });

    return {
      created_count: res.count,
      chatroom_ids: [...new Set(chats.map((c) => c.chatroom_id))],
    };
  };

  findReaders = async (id, userId) =>
    this.db.chatRead.findMany({
      where: {
        chat_id: id,
        chat: {
          user_id: userId,
        },
      },
      include: {
        user: {
          select: {
            avatar: true,
            full_name: true,
          },
        },
      },
    });

  isSender = async (id, userId) =>
    this.db.chat.count({ where: { id, user_id: userId } });
}

export default ChatService;
