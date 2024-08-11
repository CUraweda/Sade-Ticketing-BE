import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { serviceFields } from "../../data/model-fields.js";

class ServiceService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.service.findMany({
      ...q,
      select: this.include([...serviceFields, "category.id", "category.name"]),
    });

    if (query.paginate) {
      const countData = await this.db.service.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.service.findUnique({ where: { id } });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.service.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.service.update({ where: { id }, data: payload });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.service.delete({ where: { id } });
    return data;
  };
}

export default ServiceService;
