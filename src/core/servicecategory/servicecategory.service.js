import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class ServicecategoryService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.serviceCategory.findMany({ ...q });

    if (query.paginate) {
      const countData = await this.db.serviceCategory.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.serviceCategory.findUnique({ where: { id } });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.serviceCategory.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.serviceCategory.update({ where: { id }, data: payload });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.serviceCategory.delete({ where: { id } });
    return data;
  };
}

export default ServicecategoryService;  
