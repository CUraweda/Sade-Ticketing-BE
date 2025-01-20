import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class DaycareLinkBookService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.daycareLinkBook.findMany({
      ...q,
      select: {
        id: true,
        date: true,
        status: true,
        booking: {
          select: {
            id: true,
            client: {
              select: {
                id: true,
                avatar: true,
                first_name: true,
                last_name: true,
                dob: true,
              },
            },
          },
        },
      },
    });

    if (query.paginate) {
      const countData = await this.db.daycareLinkBook.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.daycareLinkBook.findUnique({
      where: { id },
      include: {
        booking: {
          select: {
            client: {
              select: {
                id: true,
                avatar: true,
                first_name: true,
                last_name: true,
                dob: true,
              },
            },
          },
        },
      },
    });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.daycareLinkBook.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.daycareLinkBook.update({
      where: { id },
      data: payload,
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.daycareLinkBook.delete({ where: { id } });
    return data;
  };
}

export default DaycareLinkBookService;
