import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class DaycarePriceService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.daycarePrice.findMany({
      ...q,
      include: { _count: { select: { bookings: true } } },
    });

    if (query.paginate) {
      const countData = await this.db.daycarePrice.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.daycarePrice.findUnique({
      where: { id },
      include: { _count: { select: { bookings: true } } },
    });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.daycarePrice.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.daycarePrice.update({
      where: { id },
      data: payload,
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.daycarePrice.delete({ where: { id } });
    return data;
  };
}

export default DaycarePriceService;
