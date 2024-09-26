import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class FeeService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.fee.findMany({ ...q });

    if (query.paginate) {
      const countData = await this.db.fee.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.fee.findUnique({ where: { id: +id } });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.fee.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.fee.update({
      where: { id: +id },
      data: payload,
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.fee.delete({ where: { id: +id } });
    return data;
  };
}

export default FeeService;
