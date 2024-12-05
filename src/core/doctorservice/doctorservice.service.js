import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class DoctorServiceService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.doctorService.findMany({
      ...q,
      include: this.select([
        "service.title",
        "doctor.first_name",
        "doctor.last_name",
        "doctor.category",
        "doctor.grade",
      ]),
    });

    if (query.paginate) {
      const countData = await this.db.doctorService.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.doctorService.findUnique({
      where: { id },
      include: this.select([
        "service.title",
        "service.category.name",
        "doctor.first_name",
        "doctor.last_name",
        "doctor.category",
        "doctor.grade",
      ]),
    });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.doctorService.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.doctorService.update({
      where: { id },
      data: payload,
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.doctorService.delete({ where: { id } });
    return data;
  };
}

export default DoctorServiceService;
