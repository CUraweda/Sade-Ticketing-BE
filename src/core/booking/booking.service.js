import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { bookingFields, serviceFields } from "../../data/model-fields.js";
import { BadRequest } from "../../lib/response/catch.js";

class BookingService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.booking.findMany({
      ...q,
      select: this.include([
        ...bookingFields,
        "booking_services.title",
        "booking_services.category_name",
      ]),
    });

    if (query.paginate) {
      const countData = await this.db.booking.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.booking.findUnique({ where: { id } });
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
        ...serviceFields,
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
        status: "draft",
        booking_services: {
          create: findServices.map((fs) => ({
            compliant,
            quantity: fs.quantity,
            service_id: fs.id,
            category_id: fs.category_id,
            location_id: fs.location_id,
            category_name: fs.category?.name,
            location_name: fs.location?.name,
            title: fs.title,
            description: fs.description,
            price: fs.price,
            price_unit: fs.price_unit,
            duration: fs.duration,
            is_active: fs.is_active,
            is_additional: fs.is_additional,
            questionnaire_responses: {
              create: fs.questionnaires?.map((fsq) => ({
                user_id,
                client_id: profile_id,
                questionnaire_id: fsq.questionnaire_id,
              })),
            },
          })),
        },
      },
    });

    return data;
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
}

export default BookingService;
