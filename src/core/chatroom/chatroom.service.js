import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { BadRequest, Forbidden } from "../../lib/response/catch.js";
import { getSocket } from "../../socket/index.js";

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
          include: {
            user: {
              select: {
                avatar: true,
                full_name: true,
              },
            },
          },
          take: 2,
          orderBy: {
            is_admin: "desc",
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        updated_at: "desc",
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
    if (!payload.is_group) {
      const findDuplicate = await this.db.chatRoom.count({
        where: {
          is_group: false,
          members: {
            some: {
              user_id: {
                in: payload.members.map((m) => m.user_id),
              },
            },
          },
        },
      });
      if (findDuplicate) throw new BadRequest("Percakapan sudah ada");
    }

    const data = await this.db.chatRoom.create({
      data: {
        ...payload,
        members: {
          createMany: {
            data: payload.members,
          },
        },
      },
    });
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

  notifyMembers = async (id, except = []) => {
    const chatRoom = await this.findById(id);

    if (chatRoom?.members?.length) {
      const socket = getSocket();
      socket
        .to(
          chatRoom.members
            .map((member) => member.user_id)
            .filter((uid) => !except.includes(uid))
        )
        .emit("new_chat");
    }
  };
}

export default ChatRoomService;
