import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class DaycareShortReportService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.daycareShortReport.findMany({ ...q });

    if (query.paginate) {
      const countData = await this.db.daycareShortReport.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.daycareShortReport.findUnique({ where: { id } });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.daycareShortReport.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.daycareShortReport.update({ where: { id }, data: payload });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.daycareShortReport.delete({ where: { id } });
    return data;
  };
}

export default DaycareShortReportService;  
