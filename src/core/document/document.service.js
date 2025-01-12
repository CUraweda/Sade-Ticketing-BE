import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class DocumentService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.document.findMany({
      ...q,
      select: {
        id: true,
        title: true,
        _count: { select: { booking_agreement: true, services: true } },
      },
    });

    if (query.paginate) {
      const countData = await this.db.document.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.document.findUnique({ where: { id } });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.document.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.document.update({
      where: { id },
      data: payload,
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.document.delete({ where: { id } });
    return data;
  };
}

export default DocumentService;
