import moment from "moment";
import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { BadRequest } from "../../lib/response/catch.js";
import SettingService from "../setting/setting.service.js";
import { SettingKeys } from "../setting/setting.validator.js";
import { DaycareBookingStatus } from "./daycarebooking.validator.js";

class DaycareBookingService extends BaseService {
  #settingService;

  constructor() {
    super(prism);
    this.#settingService = new SettingService();
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.daycareBooking.findMany({
      ...q,
      include: {
        client: {
          select: {
            avatar: true,
            first_name: true,
            last_name: true,
            dob: true,
          },
        },
      },
    });

    if (query.paginate) {
      const countData = await this.db.daycareBooking.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.daycareBooking.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            sitin_forms: true,
            reports: true,
            invoices: true,
            agreements: true,
            link_books: true,
            short_reports: true,
          },
        },
        sitin_forms: {
          include: {
            questionnaire: { select: { title: true } },
          },
        },
        reports: {
          include: {
            questionnaire: { select: { title: true } },
          },
        },
        agreements: { include: { document: { select: { title: true } } } },
        invoices: { orderBy: { created_at: "desc" } },
        client: true,
        price: true,
      },
    });
    return data;
  };

  create = async (payload) => {
    const check = await this.db.daycareBooking.count({
      where: {
        client_id: payload.client_id,
        status: { not: DaycareBookingStatus.COMPLETED },
      },
    });

    if (check) throw new BadRequest("Anak sudah memiliki reservasi aktif");

    const sitInForms = await this.#settingService.getValue(
      SettingKeys.DAYCARE_SITIN_QUESTIONNAIRE_IDS
    );
    const agreeDocs = await this.#settingService.getValue(
      SettingKeys.DAYCARE_AGREE_DOC_IDS
    );

    const data = await this.db.daycareBooking.create({
      data: {
        ...payload,
        status: DaycareBookingStatus.DRAFT,
        sitin_forms: {
          create:
            sitInForms?.value?.split(",").map((queId) => ({
              user_id: payload.user_id,
              client_id: payload.client_id,
              questionnaire_id: queId,
            })) ?? [],
        },
        agreements: {
          createMany: {
            data:
              agreeDocs?.value
                ?.split(",")
                .map((docId) => ({ document_id: docId })) ?? [],
          },
        },
      },
    });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.daycareBooking.update({
      where: { id },
      data: payload,
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.daycareBooking.delete({ where: { id } });
    return data;
  };

  checkUser = (id, userId) =>
    this.db.daycareBooking.count({ where: { id, user_id: userId } });

  updateAgreeDoc = (id, docId, payload) =>
    this.db.daycareBooking.update({
      where: { id },
      data: {
        agreements: {
          update: {
            where: {
              document_id_booking_id: { booking_id: id, document_id: docId },
            },
            data: payload,
          },
        },
      },
    });

  isOngoing = async (id, date = moment()) => {
    const data = await this.findById(id);
    return (
      data &&
      data.status == DaycareBookingStatus.ONGOING &&
      (!data.start_date || moment(date).isSameOrAfter(data.start_date)) &&
      (!data.end_date || moment(date).isSameOrBefore(data.end_date))
    );
  };

  createReportResponse = async (id, questionnaireId, userId) => {
    const booking = await this.findById(id);

    const result = await this.db.daycareBooking.update({
      where: { id },
      data: {
        reports: {
          create: {
            questionnaire_id: questionnaireId,
            client_id: booking.client_id,
            user_id: userId,
          },
        },
      },
    });
    return result;
  };
}

export default DaycareBookingService;
