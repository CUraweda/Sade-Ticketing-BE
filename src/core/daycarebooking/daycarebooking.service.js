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
        client: { select: { avatar: true, first_name: true, last_name: true } },
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
        sitin_forms: {
          select: {
            id: true,
            is_locked: true,
            questionnaire_id: true,
            questionnaire: { select: { title: true } },
          },
        },
        agreements: { include: { document: { select: { title: true } } } },
        invoices: true,
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
}

export default DaycareBookingService;
