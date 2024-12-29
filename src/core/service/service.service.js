import moment from "moment";
import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { BookingStatus } from "../booking/booking.validator.js";

class ServiceService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.service.findMany({
      ...q,
      include: {
        category: { select: { name: true, hex_color: true } },
        location: { select: { title: true } },
        entry_fees: true,
        schedules: {
          select: {
            max_attendees: true,
            _count: {
              select: { attendees: { where: { is_blocked: false } } },
            },
          },
          where: {
            is_locked: false,
            start_date: { gte: moment().toDate() },
          },
        },
        _count: {
          select: { doctors: true, schedules: true },
        },
      },
    });

    const updatedData = data.map((service) => {
      const filteredSchedules = service.schedules.filter(
        (schedule) => schedule._count.attendees < schedule.max_attendees
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
        "entry_fees.id",
        "entry_fees.title",
        "entry_fees.price",
        "agrement_documents.id",
        "agrement_documents.title",
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

  setEntryFee = async (id, payload) => {
    await this.db.service.update({
      where: {
        id,
      },
      data: {
        entry_fees: {
          [payload.set == "add" ? "connect" : "disconnect"]: {
            id: payload.fee_id,
          },
        },
      },
    });
  };

  setAgreementDocument = async (id, payload) => {
    await this.db.service.update({
      where: {
        id,
      },
      data: {
        agrement_documents: {
          [payload.set == "add" ? "connect" : "disconnect"]: {
            id: payload.document_id,
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
