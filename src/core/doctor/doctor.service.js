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
        specialisms: true,
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
      include: this.select(["location.id", "location.title", "specialisms"]),
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
    const data = await this.db.doctorProfile.findMany({
      where: { id },
      select: {
        specialisms: true,
      },
    });

    return data
      .map((d) => d.specialisms)
      .flat()
      .map((s) => ({ specialism: s }));
  };

  findDoctorServices = async (id) => {
    const data = await this.db.doctorProfile.findMany({
      where: { id },
      include: this.select([
        "services.id",
        "services.title",
        "services.category.name",
      ]),
    });
    return data
      .map((d) => d.services)
      .flat()
      .map((s) => ({ service: s }));
  };

  assignSpecialisms = async (id, payload) => {
    await this.db.doctorProfile.update({
      where: { id },
      data: {
        specialisms: {
          set: payload.map((id) => ({ id })),
        },
      },
    });

    return null;
  };

  assignServices = async (id, payload) => {
    await this.db.doctorProfile.update({
      where: { id },
      data: {
        services: {
          set: payload.map((id) => ({ id })),
        },
      },
    });

    return null;
  };
}

export default DoctorService;
