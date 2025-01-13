import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class ServiceFeeService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.serviceFee.findMany({
      ...q,
      include: {
        fee: { select: { title: true, price: true } },
        service: { select: { category: true, title: true } },
      },
    });

    if (query.paginate) {
      const countData = await this.db.serviceFee.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.serviceFee.findUnique({
      where: { id },
      include: {
        fee: { select: { title: true, price: true } },
        service: { select: { category: true, title: true } },
      },
    });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.serviceFee.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.serviceFee.update({
      where: { id },
      data: payload,
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.serviceFee.delete({ where: { id } });
    return data;
  };
}

export default ServiceFeeService;
