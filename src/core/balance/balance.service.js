import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class BalanceService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.balance.findMany({ ...q });

    if (query.paginate) {
      const countData = await this.db.balance.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.balance.findUnique({ where: { id } });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.balance.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.balance.update({ where: { id }, data: payload });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.balance.delete({ where: { id } });
    return data;
  };
}

export default BalanceService;  
