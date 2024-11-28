import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { Forbidden } from "../../lib/response/catch.js";

class NotificationService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.notification.findMany({
      ...q,
      include: this.select(["sender.full_name"]),
    });

    if (query.paginate) {
      const countData = await this.db.notification.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  count = async (userId) => {
    const [unread, all, created] = await Promise.all([
      this.db.notification.count({
        where: {
          users: {
            some: { user_id: userId, is_read: false },
          },
        },
      }),
      this.db.notification.count({
        where: {
          users: {
            some: { user_id: userId },
          },
        },
      }),
      this.db.notification.count({
        where: { sender_id: userId },
      }),
    ]);
    return { unread, all, created };
  };

  checkSender = async (id, userId) => {
    const check = await this.db.notification.count({
      where: { id, sender_id: userId },
    });
    if (!check) throw new Forbidden();
  };

  findById = async (id) => {
    const data = await this.db.notification.findUnique({ where: { id } });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.notification.create({
      data: {
        ...payload,
        users: {
          createMany: {
            data: payload.users.map((u) => ({ user_id: u.user_id })),
          },
        },
        roles: {
          connect: payload.roles,
        },
      },
    });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.notification.update({
      where: { id },
      data: payload,
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.notification.delete({ where: { id } });
    return data;
  };
}

export default NotificationService;
