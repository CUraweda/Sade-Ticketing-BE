import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class daycarejournalService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.daycareJournal.findMany({ ...q });

    if (query.paginate) {
      const countData = await this.db.daycareJournal.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.daycareJournal.findUnique({ where: { id } });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.daycareJournal.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.daycareJournal.update({
      where: { id },
      data: payload,
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.daycareJournal.delete({ where: { id } });
    return data;
  };

  dates = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.daycareJournal.findMany({
      ...q,
      include: {
        booking: true,
        client: true,
      },
    });

    if (query.paginate) {
      const countData = await this.db.daycareJournal.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };
}

export default daycarejournalService;
