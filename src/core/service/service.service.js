import moment from "moment";
import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class ServiceService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.service.findMany({
      ...q,
      include: {
        ...this.select([
          "category.id",
          "category.name",
          "location.id",
          "location.title",
        ]),
        schedules: {
          select: {
            max_bookings: true,
            _count: {
              select: {
                bookings: true,
              },
            },
          },
          where: {
            start_date: {
              gte: moment().toDate(),
            },
          },
        },
        _count: {
          select: {
            doctors: true,
            schedules: true,
          },
        },
      },
    });

    const updatedData = data.map((service) => {
      const filteredSchedules = service.schedules.filter(
        (schedule) => schedule._count.bookings.length < schedule.max_bookings
      );

      return {
        ...service,
        _count: {
          ...service._count,
          schedules: filteredSchedules.length,
        },
      };
    });

    if (query.paginate) {
      const countData = await this.db.service.count({ where: q.where });
      return this.paginate(updatedData, countData, q);
    }
    return updatedData;
  };

  findById = async (id) => {
    const data = await this.db.service.findUnique({
      where: { id },
      include: this.select([
        "category.name",
        "location.title",
        "questionnaires.id",
        "questionnaires.title",
        "questionnaires._count.questions",
        "reports.id",
        "reports.title",
        "reports._count.questions",
      ]),
    });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.service.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.service.update({ where: { id }, data: payload });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.service.delete({ where: { id } });
    return data;
  };

  setQuestionnaire = async (id, payload) => {
    await this.db.service.update({
      where: {
        id,
      },
      data: {
        questionnaires: {
          [payload.set == "add" ? "connect" : "disconnect"]: {
            id: payload.que_id,
          },
        },
      },
    });
  };

  setReport = async (id, payload) => {
    await this.db.service.update({
      where: {
        id,
      },
      data: {
        reports: {
          [payload.set == "add" ? "connect" : "disconnect"]: {
            id: payload.que_id,
          },
        },
      },
    });
  };

  findAvailableDoctors = async (id) => {
    const data = await this.db.doctorProfile.findMany({
      where: {
        schedules: {
          some: {
            is_locked: false,
            service_id: id,
            start_date: {
              gte: moment().toDate(),
            },
          },
        },
      },
      include: {
        schedules: {
          include: {
            bookings: true,
          },
        },
      },
    });

    return data
      .map((profile) => ({
        ...profile,
        schedules: profile.schedules.filter(
          (schedule) => schedule.bookings.length < schedule.max_bookings
        ),
      }))
      .filter((profile) => profile.schedules.length > 0);
  };
}

export default ServiceService;
