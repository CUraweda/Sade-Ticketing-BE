import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class DaycareActivityService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.daycareActivity.findMany({
      ...q,
      include: { fee: true },
    });

    if (query.paginate) {
      const countData = await this.db.daycareActivity.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.daycareActivity.findUnique({
      where: { id },
      include: { fee: true },
    });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.daycareActivity.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.daycareActivity.update({
      where: { id },
      data: payload,
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.daycareActivity.delete({ where: { id } });
    return data;
  };
}

export default DaycareActivityService;
