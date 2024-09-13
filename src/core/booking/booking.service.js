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
      select: {
        ...this.include(bookingFields.getFields()),
        profile: true,
        payments: true,
        services: {
          select: {
            ...this.include(bookingServiceFields.getFields()),
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
            doctor_sessions: {
              select: {
                ...this.include(doctorSessionFields.getFields()),
                doctor: {
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
    const data = await this.db.booking.create({ data: payload });
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

  book = async (user_id, { profile_id, compliant, services = [] }) => {
    const findServices = await this.db.service.findMany({
      where: {
        id: {
          in: services.map((s) => s.id) ?? [],
        },
        is_active: true,
      },
      select: this.include([
        ...serviceFields.getFields(),
        "category.name",
        "location.title",
        "questionnaires",
      ]),
    });

    if (!findServices.length)
      throw new BadRequest("Tidak ada layanan yang dipesan");

    let total = 0;
    services.forEach((s) => {
      const findService = findServices.find((fs) => fs.id == s.id);
      if (findService) {
        total += findService.price * s.quantity;
        findService["quantity"] = s.quantity;
      }
    });

    const data = await this.db.booking.create({
      data: {
        profile_id,
        total,
        status: BookingStatus.DRAFT,
        services: {
          create: findServices.map((fs) => ({
            service_id: fs.id,
            location_id: fs.location_id,
            category_id: fs.category_id,
            compliant,
            quantity: fs.quantity,
            service_data:
              JSON.stringify(this.exclude(fs, ["questionnaires"])) ?? "",
            questionnaire_responses: {
              create: fs.questionnaires?.map((fsq) => ({
                user_id,
                client_id: profile_id,
                questionnaire_id: fsq.id,
              })),
            },
          })),
        },
      },
    });

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
    const chkOwner = await this.db.booking.count({
      where: { id, profile: { user_id } },
    });
    if (!chkOwner) throw new Forbidden();
  };

  bookSchedule = async (id, payload) => {
    // new total price
    let total = 0;

    for (const bs of payload) {
      // update quantity and lock
      const serv = await this.db.bookingService.update({
        where: { id: bs.id },
        data: {
          compliant: bs.compliant,
          quantity: bs.quantity,
          is_locked: true,
        },
      });

      // recalculate sub total
      const serviceData = this.extractServiceData(serv.service_data);
      total += serviceData.quantity * serviceData.price;

      // update doctor session and Lock
      await this.db.doctorSession.updateMany({
        where: { id: { in: bs.sessions ?? [] } },
        data: {
          is_locked: true,
          booking_service_id: serv.id,
        },
      });
    }

    // update booking total
    const data = await this.db.booking.update({
      where: { id },
      data: {
        status: BookingStatus.NEED_CONFIRM,
        total: total,
      },
    });

    return data;
  };

  bookingConfirm = async (id, payload) => {
    const booking = await this.findById(id);

    await this.db.payments.create({
      data: {
        amount_paid: booking.total,
        payment_method: PaymentMethod.MANUAL_TRANSFER,
        status: PaymentStatus.UNPAID,
        bank_account_id: payload.bank_account_id,
        expiry_date: moment().add({ day: 1 }).toDate(),
        bookings: {
          connect: {
            id: booking.id,
          },
        },
      },
    });

    await this.db.booking.update({
      where: { id },
      data: {
        status: BookingStatus.NEED_PAYMENT,
        is_locked: true,
      },
    });
  };
}

export default BookingService;
