import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import bcrypt from "bcrypt";

class UserService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.user.findMany({
      ...q,
      select: this.include([
        "id",
        "full_name",
        "email",
        "status",
        "email_verified",
        "avatar",
        "created_at",
        "updated_at",
      ]),
    });

    if (query.paginate) {
      const countData = await this.db.user.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.user.findUnique({
      where: { id },
      select: this.include([
        "id",
        "full_name",
        "email",
        "status",
        "email_verified",
        "avatar",
        "created_at",
        "updated_at",
      ]),
    });
    return data;
  };

  create = async (payload) => {
    const salt = await bcrypt.genSalt();
    payload["password"] = await bcrypt.hash(payload["password"], salt);

    const data = await this.db.user.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    if (payload["password"]) {
      const salt = await bcrypt.genSalt();
      payload["password"] = await bcrypt.hash(payload["password"], salt);
    }

    const data = await this.db.user.update({ where: { id }, data: payload });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.user.delete({ where: { id } });
    return data;
  };
}

export default UserService;
