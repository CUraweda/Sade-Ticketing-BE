import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { doctorProfileFields } from "../../data/model-fields.js";

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
    const data = await this.db.doctorProfile.findUnique({
      where: { id },
      select: this.include([
        ...doctorProfileFields,
        "location.id",
        "location.title",
      ]),
    });
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

  findDoctorSpecialisms = async (id) => {
    const data = await this.db.doctorSpecialism.findMany({
      where: { doctor_id: id },
      select: this.include(["id", "specialism"]),
    });
    return data;
  };

  findDoctorServices = async (id) => {
    const data = await this.db.doctorService.findMany({
      where: { doctor_id: id },
      select: this.include([
        "id",
        "service.id",
        "service.title",
        "service.category.name",
      ]),
    });
    return data;
  };

  assignSpecialisms = async (id, payload) => {
    await this.db.doctorSpecialism.deleteMany({
      where: {
        doctor_id: id,
      },
    });

    const data = await this.db.doctorSpecialism.createMany({
      data: payload.map((dat) => ({
        doctor_id: id,
        specialism_id: dat,
      })),
    });

    return data;
  };

  assignServices = async (id, payload) => {
    await this.db.doctorService.deleteMany({
      where: {
        doctor_id: id,
      },
    });

    const data = await this.db.doctorService.createMany({
      data: payload.map((dat) => ({
        doctor_id: id,
        service_id: dat,
      })),
    });

    return data;
  };
}

export default DoctorService;
