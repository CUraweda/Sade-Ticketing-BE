import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { Forbidden } from "../../lib/response/catch.js";

class ChatRoomService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.chatRoom.findMany({
      ...q,
      include: {
        chats: {
          include: {
            user: {
              select: {
                full_name: true,
              },
            },
          },
          take: 1,
          orderBy: {
            created_at: "desc",
          },
        },
        members: {
          take: 2,
        },
      },
    });

    if (query.paginate) {
      const countData = await this.db.chatRoom.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.chatRoom.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                avatar: true,
                full_name: true,
              },
            },
          },
        },
      },
    });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.chatRoom.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.chatRoom.update({
      where: { id },
      data: payload,
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.chatRoom.delete({ where: { id } });
    return data;
  };

  isMember = async (id, userId) => {
    const member = await this.db.chatRoomMember.findFirst({
      where: { chatroom_id: id, user_id: userId },
    });
    if (!member) throw new Forbidden();
    return member;
  };
}

export default ChatRoomService;
