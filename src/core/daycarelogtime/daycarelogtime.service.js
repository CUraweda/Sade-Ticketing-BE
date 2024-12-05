import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class daycarelogtimeService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.daycareLogTime.findMany({
      ...q,
      include: {
        fee: true,
      },
    });

    if (query.paginate) {
      const countData = await this.db.daycareLogTime.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.daycareLogTime.findUnique({
      where: { id },
      include: { fee: true },
    });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.daycareLogTime.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.daycareLogTime.update({
      where: { id: parseInt(id, 10) },
      data: payload,
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.daycareLogTime.delete({ where: { id } });
    return data;
  };
}

export default daycarelogtimeService;
