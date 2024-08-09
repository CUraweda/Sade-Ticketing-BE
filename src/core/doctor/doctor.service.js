import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class DoctorService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.doctorProfile.findMany({
      ...q,
      select: {
        id: true,
        first_name: true,
        last_name: true,
        category: true,
        location: {
          select: {
            id: true,
            title: true,
          },
        },
        specialisms: {
          select: {
            id: true,
            specialism: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (query.paginate) {
      const countData = await this.db.doctorProfile.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.doctorProfile.findUnique({ where: { id } });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.doctorProfile.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.doctorProfile.update({
      where: { id },
      data: payload,
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.doctorProfile.delete({ where: { id } });
    return data;
  };
}

export default DoctorService;
