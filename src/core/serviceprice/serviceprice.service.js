import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class servicePriceService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.servicePrice.findMany({
      ...q,
      include: {
        privilege: {
          include: {
            privileges: true,
          },
        },
        service: true,
      },
    });

    if (query.paginate) {
      const countData = await this.db.servicePrice.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.servicePrice.findUnique({
      where: { id },
      include: {
        privilege: {
          include: {
            privileges: true,
          },
        },
        service: true,
      },
    });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.servicePrice.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.servicePrice.update({
      where: { id },
      data: payload,
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.servicePrice.delete({ where: { id } });
    return data;
  };
}

export default servicePriceService;
