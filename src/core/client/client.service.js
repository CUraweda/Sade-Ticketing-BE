import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class clientService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.clientProfile.findMany(q);

    if (query.paginate) {
      const countData = await this.db.clientProfile.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id, user_id) => {
    const data = await this.db.clientProfile.findUnique({
      where: { id, user_id },
    });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.clientProfile.create({ data: payload });
    return data;
  };

  update = async (id, user_id, payload) => {
    const data = await this.db.clientProfile.update({
      where: { id, user_id },
      data: payload,
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.clientProfile.delete({ where: { id } });
    return data;
  };
}

export default clientService;
