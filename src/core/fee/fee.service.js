import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class FeeService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.fee.findMany({ ...q, include: { tags: true } });

    if (query.paginate) {
      const countData = await this.db.fee.count({
        where: q.where,
      });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.fee.findUnique({
      where: { id: +id },
      include: { tags: true },
    });
    return data;
  };

  create = async (payload) => {
    const { tags = [], ...rest } = payload;
    const data = await this.db.fee.create({
      data: {
        ...rest,
        tags: {
          connect: tags.map((id) => ({ id })),
        },
      },
    });
    return data;
  };

  update = async (id, payload) => {
    const { tags = [], ...rest } = payload;

    const prev = await this.findById(id);

    const data = await this.db.fee.update({
      where: { id: +id },
      data: {
        ...rest,
        tags: {
          disconnect: prev.tags.map((t) => ({ id: t.id })),
          connect: tags.map((id) => ({ id })),
        },
      },
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.fee.delete({ where: { id: +id } });
    return data;
  };
}

export default FeeService;
