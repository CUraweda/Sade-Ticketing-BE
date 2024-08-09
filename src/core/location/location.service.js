import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class LocationService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.location.findMany({ ...q });

    if (query.paginate) {
      const countData = await this.db.location.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.location.findUnique({ where: { id } });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.location.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.location.update({ where: { id }, data: payload });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.location.delete({ where: { id } });
    return data;
  };
}

export default LocationService;  
