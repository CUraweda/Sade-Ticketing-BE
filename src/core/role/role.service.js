import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class RoleService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.role.findMany({ ...q });

    if (query.paginate) {
      const countData = await this.db.role.count({ ...q });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.role.findUnique({ where: { id } });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.role.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.role.update({ where: { id }, data: payload });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.role.delete({ where: { id } });
    return data;
  };
}

export default RoleService;
