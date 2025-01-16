import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
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
    const data = await this.db.daycareBooking.findMany({ ...q });

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
        sitin_forms: { select: { id: true } },
        agreements: true,
        invoices: true,
      },
    });
    return data;
  };

  create = async (payload) => {
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
        client: true,
        price: true,
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
}

export default DaycareBookingService;
