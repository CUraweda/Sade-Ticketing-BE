import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class clientPrivilegeService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.clientPrivilege.findMany({ ...q });

    if (query.paginate) {
      const countData = await this.db.clientPrivilege.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.clientPrivilege.findUnique({ where: { id } });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.clientPrivilege.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.clientPrivilege.update({ where: { id }, data: payload });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.clientPrivilege.delete({ where: { id } });
    return data;
  };
}

export default clientPrivilegeService;  
