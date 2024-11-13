import moment from "moment";
import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { doctorFields } from "../../data/model-fields.js";
import { BadRequest, Forbidden } from "../../lib/response/catch.js";
import { BookingStatus } from "./booking.validator.js";
import { InvoiceStatus } from "../invoice/invoice.validator.js";
import InvoiceService from "../invoice/invoice.service.js";

class BookingService extends BaseService {
  #invoiceService;

  constructor() {
    super(prism);
    this.#invoiceService = new InvoiceService();
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);

    const data = (
      await this.db.booking.findMany({
        ...q,
        include: this.select([
          "client.first_name",
          "client.last_name",
          "client.category",
          "client.dob",
        ]),
      })
    ).map((dat) => ({
      ...dat,
      service_data: this.extractServiceData(dat.service_data),
    }));

    if (query.paginate) {
      const countData = await this.db.booking.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.booking.findUnique({
      where: { id },
      include: {
        client: true,
        questionnaire_responses: {
          include: this.select(["questionnaire.title"]),
        },
        reports: {
          include: this.select(["questionnaire.title"]),
        },
        schedules: {
          include: {
            doctors: {
              select: this.select(doctorFields.full("USR")),
            },
          },
        },
        invoices: true,
      },
    });
    return data;
  };

  create = async (payload) => {
    const service = await this.db.service.findFirst({
      where: {
        id: payload.service_id,
        is_active: true,
      },
      include: this.select([
        "category.name",
        "location.title",
        "questionnaires",
      ]),
    });

    const data = await this.db.booking.create({
      data: {
        ...payload,
        price: service.price,
        service_data:
          JSON.stringify(this.exclude(service, ["questionnaires"])) ?? "",
        status: BookingStatus.DRAFT,
        title: `${service.category?.name ?? ""} - ${service.title}`,
        questionnaire_responses: {
          create: service.questionnaires?.map((que) => ({
            user_id: payload.user_id,
            client_id: payload.client_id,
            questionnaire_id: que.id,
          })),
        },
      },
    });

    return data;
  };

  update = async (id, payload) => {
    const booking = await this.findById(id),
      serviceData = this.extractServiceData(booking.service_data);

    // daycare booking can create its own schedule
    if (
      serviceData.category_id == 4 &&
      payload.start_date &&
      payload.end_date
    ) {
      const start = payload.start_date,
        end = payload.end_date;

      delete payload.start_date;
      delete payload.end_date;

      payload = {
        ...payload,
        quantity: 1,
        schedules: {
          deleteMany: {},
          create: [
            {
              title: `Daycare - ${booking.client?.first_name ?? ""} ${booking.client?.last_name ?? ""}`,
              start_date: start,
              end_date: end,
              service_id: booking.service_id,
            },
          ],
        },
      };
    }

    await this.db.booking.update({
      where: {
        id,
      },
      data: payload,
    });
  };

  delete = async (id) => {
    const data = await this.db.booking.delete({ where: { id } });
    return data;
  };

  extractServiceData = (data, keys = []) => {
    const json = JSON.parse(data);
    return keys.length
      ? Object.fromEntries(
          Object.entries(json).filter(([key]) => !keys.includes(key))
        )
      : json;
  };

  checkBookingOwner = async (id, user_id) => {
    const find = await this.db.booking.findFirst({
      where: { id, user_id },
    });
    if (!find) throw new Forbidden();
    return find;
  };

  setSchedules = async (id, payload) => {
    // check schedule availability
    const schedules = await this.db.schedule.findMany({
      where: {
        id: {
          in: payload.schedule_ids,
        },
        bookings: {
          none: {
            id,
          },
        },
      },
      select: {
        start_date: true,
        max_bookings: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (schedules.filter((s) => s._count.bookings >= s.max_bookings).length)
      throw new BadRequest(
        `Jadwal pada tanggal ${schedules.map((s) => moment(s.start_date).format("DD MMM YYYY")).join(", ")} sudah penuh. Silakan pilih jadwal lain yang masih tersedia.`
      );

    return await this.db.$transaction(async (db) => {
      // disconnect previous related schedules
      const prevScheduleIds = (
        await db.schedule.findMany({
          where: {
            bookings: {
              some: {
                id,
              },
            },
          },
          select: {
            id: true,
          },
        })
      ).map((sc) => sc.id);

      for (let scheduleId of prevScheduleIds) {
        await db.schedule.update({
          where: {
            id: scheduleId,
          },
          data: {
            bookings: {
              disconnect: {
                id,
              },
            },
          },
        });
      }

      // update booking by payload
      await db.booking.update({
        where: {
          id: id,
        },
        data: {
          compliant: payload.compliant,
          quantity: payload.quantity,
        },
      });

      // update schedules and connect to booking
      for (let scheduleId of payload.schedule_ids)
        await db.schedule.update({
          where: {
            id: scheduleId,
          },
          data: {
            bookings: {
              connect: {
                id,
              },
            },
          },
        });
    });
  };

  userConfirm = async (ids, payload) => {
    const bookings = await this.db.booking.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    const fees = await this.#invoiceService.getFees(null, ids);

    await this.db.$transaction(async (db) => {
      const feesPrice = fees.items.reduce(
        (a, c) => (a += c.quantity * c.price),
        0
      );

      await db.invoice.create({
        data: {
          user_id: payload.user_id,
          title: "Tagihan layanan",
          total:
            bookings.reduce((a, c) => (a += c.quantity * c.price), 0) +
            feesPrice,
          status: InvoiceStatus.ISSUED,
          expiry_date: moment().add({ day: 1 }).toDate(),
          bookings: {
            connect: ids.map((id) => ({ id })),
          },
          fees: {
            createMany: {
              data: fees.items.map((f) => ({
                fee_id: f.id,
                quantity: f.quantity,
              })),
            },
          },
        },
      });

      await db.booking.updateMany({
        where: {
          id: {
            in: ids,
          },
        },
        data: {
          // price: {
          //   increment: feesPrice,
          // },
          status: BookingStatus.NEED_PAYMENT,
          is_locked: true,
        },
      });
    });
  };

  adminConfirm = async (id) => {
    await this.db.$transaction(async (db) => {
      const upBooking = await db.booking.update({
        where: {
          id,
          is_locked: true,
        },
        include: {
          schedules: {
            select: {
              id: true,
            },
          },
        },
        data: {
          status: BookingStatus.ONGOING,
        },
      });

      if (!upBooking) return;

      for (let schId of upBooking.schedules.map((sc) => sc.id)) {
        await db.schedule.update({
          where: {
            id: schId,
            bookings: {
              some: {
                id: upBooking.id,
              },
            },
          },
          data: {
            clients: {
              connect: {
                id: upBooking.client_id,
              },
            },
          },
        });
      }
    });
  };

  findAllQueResponse = async (booking_id, query) => {
    const q = this.transformBrowseQuery(query);

    const data = await this.db.questionnaireResponse.findMany({
      ...q,
      where: {
        ...q.where,
        booking_id,
      },
      include: this.select(["questionnaire.title"]),
    });

    if (query.paginate) {
      const countData = await this.db.questionnaireResponse.count({
        where: { ...q.where, booking_id },
      });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  createReportResponse = async (uid, booking_id, questionnaire_id) => {
    const booking = await this.db.booking.findUnique({
      where: {
        id: booking_id,
      },
    });

    await this.db.questionnaireResponse.create({
      data: {
        user_id: uid,
        booking_report_id: booking_id,
        client_id: booking.client_id,
        questionnaire_id,
      },
    });
  };
}

export default BookingService;
