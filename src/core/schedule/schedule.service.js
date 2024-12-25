import moment from "moment";
import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { Forbidden } from "../../lib/response/catch.js";
import { BookingStatus } from "../booking/booking.validator.js";

class ScheduleService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.schedule.findMany({
      ...q,
      ...(!query.paginate && {
        where: {
          OR: [
            {
              repeat: { not: null },
              start_date: {
                lte: this.getQueryValue(query, "gte", "start_date"),
              },
              doctors: {
                some: {
                  id: {
                    in: this.getQueryValue(query, "in_", "doctors.id")?.split(
                      ","
                    ),
                  },
                },
              },
            },
            { ...q.where },
          ],
        },
      }),
      include: {
        ...this.select([
          "service.category_id",
          "service.category.hex_color",
          "creator.full_name",
          "creator.avatar",
          "_count.bookings",
        ]),
        _count: {
          select: {
            children: true,
            bookings: {
              where: {
                status: {
                  not: BookingStatus.DRAFT,
                },
              },
            },
          },
        },
      },
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
        "doctors.avatar",
        "clients.note",
        "clients.status",
        "clients.client.id",
        "clients.client.avatar",
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
        "bookings.client.avatar",
        "bookings.client.last_name",
        "bookings.status",
        "parent.id",
        "parent.start_date",
        "parent.repeat",
        "parent.repeat_end",
      ]),
    });
    return data;
  };

  create = async (payload) => {
    const payloads = Array.isArray(payload) ? payload : [payload];
    const dataToCreate = [];

    payloads.forEach((payload) => {
      const { doctors = [], clients = [], bookings = [], ...rest } = payload;

      if (rest.recurring && Array.isArray(rest.recurring))
        rest["recurring"] = rest.recurring.length
          ? rest.recurring.join(",")
          : null;

      dataToCreate.push({
        ...rest,
        doctors: {
          connect: doctors.map((d) => ({ id: d })),
        },
        bookings: {
          connect: bookings.map((b) => ({ id: b })),
        },
        clients: {
          createMany: {
            data: clients.map((id) => ({
              client_id: id,
            })),
          },
        },
      });
    });

    const result = await this.db.$transaction(async (db) => {
      for (const data of dataToCreate) await db.schedule.create({ data });
    });
    return result;
  };

  update = async (id, payload) => {
    if (payload.recurring && Array.isArray(payload.recurring))
      payload["recurring"] = rest.recurring.length
        ? payload.recurring.join(",")
        : null;

    const data = await this.db.schedule.update({
      where: { id },
      data: payload,
    });
    return data;
  };

  detach = async (id, payload, mode) => {
    const { repeat, repeat_end, ...rest } = await this.db.schedule.findUnique({
      where: { id },
      include: this.select(["bookings.id", "clients.client_id", "doctors.id"]),
    });

    const data = { ...rest, ...payload };
    if (mode == "with_parent") data.parent_id = id;
    else if (mode == "leave_parent") {
      await this.update(id, {
        repeat_end: moment(payload.start_date).subtract(1, "day").toDate(),
      });
      data.repeat = repeat;
    }

    delete data.id;
    data.clients = rest.clients?.map((c) => c.client_id);
    data.doctors = rest.doctors?.map((d) => d.id);
    data.bookings = rest.bookings?.map((b) => b.id);

    const result = await this.create(data);
    return result;
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
      data: { clients: { deleteMany: { client_id } } },
    });

  setLock = (id, lock) =>
    this.db.schedule.update({ where: { id }, data: { is_locked: lock } });

  setClientStatus = (id, client_id, data) =>
    this.db.schedule.update({
      where: { id },
      data: {
        clients: {
          update: {
            where: {
              schedule_id_client_id: {
                client_id,
                schedule_id: id,
              },
            },
            data,
          },
        },
      },
    });
}

export default ScheduleService;
