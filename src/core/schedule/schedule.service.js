import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { Forbidden } from "../../lib/response/catch.js";

class ScheduleService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.schedule.findMany({
      ...q,
      include: this.include(["creator.full_name", "creator.avatar"]),
    });

    if (query.paginate) {
      const countData = await this.db.schedule.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.schedule.findUnique({
      where: { id },
      include: this.include([
        "creator.avatar",
        "creator.full_name",
        "doctors.first_name",
        "doctors.last_name",
        "doctors.category",
        "clients.first_name",
        "clients.last_name",
        "clients.category",
        "clients.pob",
      ]),
    });
    return data;
  };

  create = async (payload, user_id) => {
    const data = await this.db.schedule.create({
      data: {
        ...payload,
        creator_id: user_id,
      },
    });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.schedule.update({
      where: { id },
      data: payload,
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.schedule.delete({ where: { id } });
    return data;
  };

  checkCreator = async (id, user_id) => {
    const data = await this.db.schedule.count({
      where: { id, creator_id: user_id },
    });
    if (!data) throw new Forbidden();
  };

  addDoctor = (id, doctor_id) =>
    this.db.schedule.update({
      where: { id },
      data: {
        doctors: { connect: { id: doctor_id } },
      },
    });

  addClient = (id, client_id) =>
    this.db.schedule.update({
      where: { id },
      data: {
        clients: { connect: { id: client_id } },
      },
    });

  removeDoctor = (id, doctor_id) =>
    this.db.schedule.update({
      where: { id },
      data: { doctors: { delete: { id: doctor_id } } },
    });

  removeClient = (id, client_id) =>
    this.db.schedule.update({
      where: { id },
      data: { clients: { delete: { id: client_id } } },
    });

  setLock = (id, lock) =>
    this.db.schedule.update({ where: { id }, data: { is_locked: lock } });
}

export default ScheduleService;
