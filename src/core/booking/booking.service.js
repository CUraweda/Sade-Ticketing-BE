import moment from "moment";
import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import {
  bookingFields,
  bookingServiceFields,
  doctorFields,
  doctorSessionFields,
  serviceFields,
} from "../../data/model-fields.js";
import { BadRequest, Forbidden } from "../../lib/response/catch.js";
import {
  PaymentMethod,
  PaymentStatus,
} from "../payments/payments.validator.js";
import { BookingStatus } from "./booking.validator.js";
import { InvoiceStatus } from "../invoice/invoice.validator.js";

class BookingService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = (
      await this.db.booking.findMany({
        ...q,
        select: this.include([
          ...bookingFields.getFields(),
          "services.service_data",
        ]),
      })
    ).map((dat) => ({
      ...dat,
      services: dat.services.map((s) =>
        this.extractServiceData(s.service_data)
      ),
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
        profile: true,
        payments: true,
        services: {
          include: {
            questionnaire_responses: {
              select: {
                id: true,
                is_locked: true,
                questionnaire_id: true,
                questionnaire: {
                  select: {
                    title: true,
                  },
                },
              },
            },
            schedules: {
              include: {
                doctors: {
                  select: this.include(doctorFields.full("USR")),
                },
              },
            },
          },
        },
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
      include: this.include([
        "category.name",
        "location.title",
        "questionnaires",
      ]),
    });

    const data = await this.db.booking.create({
      data: {
        // ...payload,
        price: service.price,
        service_data:
          JSON.stringify(this.exclude(fs, ["questionnaires"])) ?? "",
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
    const data = await this.db.booking.update({ where: { id }, data: payload });
    return data;
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
    return await this.db.$transaction(async (db) => {
      // check schedule availability
      const lockedSchedules = await db.schedule.findMany({
        where: {
          id: {
            in: payload.schedulesIds,
          },
          booking_id: {
            not: id,
          },
          is_locked: true,
        },
        select: {
          start_date: true,
        },
      });

      if (lockedSchedules.length)
        throw new BadRequest(
          `Jadwal pada tanggal ${lockedSchedules.map((s) => moment(s.start_date).format("DD MMM YYYY")).join(", ")} tidak tersedia saat ini. Silakan pilih jadwal lain yang masih tersedia.`
        );

      // disconnect previous schedule if any
      await db.schedule.deleteMany({
        where: {
          booking_id: id,
        },
      });

      // update booking by payload
      await db.booking.update({
        where: {
          id: id,
        },
        data: {
          compliant: payload.compliant,
          quantity: payload.quantity,
          schedules: {
            connect: payload.schedules.map((sc) => ({
              id: sc,
              is_locked: true,
            })),
          },
        },
      });
    });
  };

  userConfirm = async (ids, payload) => {
    const bookings = await this.db.booking.findMany({
      where: ids,
    });

    await this.db.$transaction(async (db) => {
      await db.invoice.create({
        data: {
          bank_account_id: payload.bank_account_id,
          user_id: payload.user_id,
          title: "Tagihan layanan",
          total: bookings.reduce((a, c) => {
            a += c.quantity * c.price;
          }, 0),
          status: InvoiceStatus.ISSUED,
          expiry_date: moment().add({ day: 1 }).toDate(),
          bookings: {
            connect: ids.map((id) => ({ id })),
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
          status: BookingStatus.NEED_PAYMENT,
          is_locked: true,
        },
      });
    });
  };
}

export default BookingService;
