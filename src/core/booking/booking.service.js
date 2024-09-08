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

  findRequiredQuestionnaires = async (user_id, booking_id) => {
    const data = this.db.questionnaireResponse.findMany({
      where: {
        user_id: user_id,
        client: {
          user_id,
        },
        booking_service: {
          booking_id: booking_id,
        },
      },
      select: this.include(["id", "questionnaire.id", "questionnaire.title"]),
    });
    return data;
  };

  bookSchedule = async (id, user_id, payload) => {
    await this.checkBookingOwner(id, user_id);

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
      total += serv.quantity * serv.price;

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
        total: total,
        status: "pending_payment",
      },
    });

    return data;
  };
}

export default BookingService;
