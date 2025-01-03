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
      include: {
        _count: {
          select: { attendees: { where: { is_active: true } } },
        },
        service: {
          select: {
            category: { select: { id: true, hex_color: true } },
          },
        },
        parent: {
          select: {
            start_date: true,
            repeat: true,
            repeat_end: true,
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

  findById = async (id, userId) => {
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
          where: {
            is_active: true,
          },
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
            attendees: { where: { is_active: true } },
            children: true,
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

      dataToCreate.push({
        ...rest,
        doctors: {
          connect: doctors.map((d) => ({ id: d })),
        },
      });
    });

    const ids = [];
    const result = await this.db.$transaction(async (db) => {
      for (const data of dataToCreate) {
        const res = await db.schedule.create({ data });
        ids.push(res.id);
      }
    });

    try {
      await this.createRepeats(ids);
    } catch (err) {
      console.log(
        "\n\x1b[31m[ERR]\x1b[0m Failed to create repeats of created schedule"
      );
      console.error(err);
    }

    return result;
  };

  update = async (id, payload) => {
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

  delete = async (id, withChildren) => {
    if (withChildren == "true")
      await this.db.schedule.deleteMany({
        where: { parent_id: id },
      });

    await this.db.schedule.delete({ where: { id } });
  };

  checkAuthorized = async (id, user_id, client = true, doctor = true) => {
    const ors = [];

    if (doctor)
      ors.push({
        doctors: {
          some: {
            user_id,
          },
        },
      });

    if (client) {
      ors.push({
        attendees: {
          some: {
            client: {
              user_id,
            },
          },
        },
      });
      ors.push({
        attendees: {
          some: {
            booking: {
              user_id,
            },
          },
        },
      });
    }

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

  createRepeats = async (
    ids = [],
    start = moment().startOf("month").startOf("day"),
    end = moment().endOf("month").endOf("day")
  ) => {
    const repeatedSchedules = await this.db.schedule.findMany({
      where: {
        ...(ids.length && { id: { in: ids } }),
        repeat: { not: null },
        OR: [{ repeat_end: { gte: start.toDate() } }, { repeat_end: null }],
      },
      include: {
        doctors: { select: { id: true } },
      },
    });

    const schedulesToCreate = repeatedSchedules
      .map((rsc) => {
        const temp = [];
        const repeatEnd = rsc.repeat_end
          ? moment(rsc.repeat_end).endOf("day")
          : end;

        let current = moment(rsc.start_date),
          duration = "";

        if (rsc.repeat == "weekly") duration = "week";

        while (current.add(1, duration).isSameOrBefore(repeatEnd)) {
          const newStart = moment(rsc.start_date).add(
              current.diff(moment(rsc.start_date), duration),
              duration
            ),
            newEnd = moment(rsc.end_date).add(
              current.diff(moment(rsc.start_date), duration),
              duration
            );

          if (newStart.isBefore(start)) continue;

          temp.push({
            id: rsc.id,
            start_date: newStart.toDate(),
            end_date: newEnd.toDate(),
          });
        }

        return temp;
      })
      .flat();

    if (!schedulesToCreate.length) return;

    let countCreated = 0;
    for (const { id, start_date, end_date } of schedulesToCreate) {
      try {
        await this.detach(id, { start_date, end_date }, "with_parent");
        countCreated++;
      } catch (error) {
        if (error?.code != "P2002") throw error;
      }
    }

    return countCreated;
  };

  checkAvailability = async (ids = []) => {
    const schedules = await this.db.schedule.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        start_date: true,
        max_attendees: true,
        _count: {
          select: { attendees: { where: { is_active: true } } },
        },
      },
    });

    const unavailable = schedules
      .filter((sc) => sc._count.attendees >= sc.max_attendees)
      .map(({ id, start_date }) => ({ id, start_date }));

    return unavailable;
  };
}

export default ScheduleService;
