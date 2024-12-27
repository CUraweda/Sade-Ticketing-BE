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
        service: {
          select: {
            category: { select: { id: true, hex_color: true } },
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
      include: {
        service: {
          select: {
            title: true,
            category: true,
          },
        },
        doctors: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            category: true,
            avatar: true,
          },
        },
        attendees: {
          include: {
            client: {
              select: {
                first_name: true,
                last_name: true,
                category: true,
                dob: true,
                avatar: true,
              },
            },
          },
        },
        parent: {
          select: {
            start_date: true,
            repeat: true,
            repeat_end: true,
          },
        },
        _count: {
          select: {
            attendees: { where: { is_blocked: false } },
          },
        },
      },
    });
    return data;
  };

  create = async (payload) => {
    const payloads = Array.isArray(payload) ? payload : [payload];
    const dataToCreate = [];

    payloads.forEach((payload) => {
      const { doctors = [], ...rest } = payload;

      if (rest.recurring && Array.isArray(rest.recurring))
        rest["recurring"] = rest.recurring.length
          ? rest.recurring.join(",")
          : null;

      dataToCreate.push({
        ...rest,
        doctors: {
          connect: doctors.map((d) => ({ id: d })),
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
      include: { doctors: { select: { id: true } } },
    });

    const data = { ...rest, ...payload };
    if (mode == "with_parent") {
      data.parent_id = id;
    } else if (mode == "leave_parent") {
      await this.update(id, {
        repeat_end: moment(payload.start_date).subtract(1, "day").toDate(),
      });
      data.repeat = repeat;
    }

    delete data.id;
    data.doctors = rest.doctors?.map((d) => d.id);

    const result = await this.create(data);
    return result;
  };

  delete = async (id) => {
    const data = await this.db.schedule.delete({ where: { id } });
    return data;
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

  removeDoctor = (id, doctor_id) =>
    this.db.schedule.update({
      where: { id },
      data: { doctors: { disconnect: { id: doctor_id } } },
    });

  generateRepeats = (schedules, end = moment().endOf("month").endOf("day")) =>
    schedules
      .map((sc) => {
        const temp = [sc];

        let currentStart = moment(sc.start_date);
        const repeatEnd = sc.repeat_end
          ? moment(sc.repeat_end).endOf("day")
          : end;

        if (sc.repeat === "weekly") {
          const interval = 7;
          while (currentStart.add(interval, "days").isSameOrBefore(repeatEnd)) {
            temp.push({
              ...sc,
              id: undefined,
              repeat: undefined,
              repeat_end: undefined,
              parent_id: sc.id,
              start_date: moment(sc.start_date)
                .set("date", currentStart.date())
                .toDate(),
              end_date: moment(sc.end_date)
                .set("date", currentStart.date())
                .toDate(),
            });
          }
        }

        return temp;
      })
      .flat();
}

export default ScheduleService;
