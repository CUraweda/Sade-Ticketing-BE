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
      include: this.select([
        "creator.full_name",
        "creator.avatar",
        "_count.bookings",
      ]),
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
      include: this.select([
        "creator.avatar",
        "creator.full_name",
        "doctors.id",
        "doctors.first_name",
        "doctors.last_name",
        "doctors.category",
        "clients.client.id",
        "clients.client.first_name",
        "clients.client.last_name",
        "clients.client.category",
        "clients.client.dob",
        "service.id",
        "service.title",
        "service.category.name",
        "bookings.id",
        "bookings.title",
        "bookings.user_id",
        "bookings.client.first_name",
        "bookings.client.last_name",
        "bookings.status",
      ]),
    });
    return data;
  };

  create = async (payload) => {
    const { doctors = [], clients = [], ...restPayload } = payload;
    const data = await this.db.schedule.create({
      data: {
        ...restPayload,
        doctors: {
          connect: doctors.map((d) => ({ id: d })),
        },
        clients: {
          createMany: {
            data: clients.map((id) => ({
              client_id: id,
            })),
          },
        },
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

  checkAuthorized = async (id, user_id, client = true, doctor = true) => {
    const ors = [
      {
        creator_id: user_id,
      },
    ];

    if (doctor)
      ors.push({
        doctors: {
          some: {
            user_id,
          },
        },
      });

    if (client)
      ors.push({
        clients: {
          some: {
            client: {
              user_id,
            },
          },
        },
      });

    const data = await this.db.schedule.count({
      where: {
        id,
        OR: ors,
      },
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
        clients: { create: { client_id } },
      },
    });

  removeDoctor = (id, doctor_id) =>
    this.db.schedule.update({
      where: { id },
      data: { doctors: { disconnect: { id: doctor_id } } },
    });

  removeClient = (id, client_id) =>
    this.db.schedule.update({
      where: { id },
      data: { clients: { delete: { client_id } } },
    });

  setLock = (id, lock) =>
    this.db.schedule.update({ where: { id }, data: { is_locked: lock } });

  setClientStatus = (id, client_id, status) =>
    this.db.schedule.update({
      where: { id },
      data: {
        clients: {
          update: {
            where: { client_id },
            data: { status },
          },
        },
      },
    });
}

export default ScheduleService;
