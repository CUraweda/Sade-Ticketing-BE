import moment from "moment";
import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { serviceFields } from "../../data/model-fields.js";

class ServiceService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.service.findMany({
      ...q,
      select: this.include([
        ...serviceFields.getFields(),
        "category.id",
        "category.name",
        "location.id",
        "location.title",
        "_count.doctors",
      ]),
    });

    if (query.paginate) {
      const countData = await this.db.service.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.service.findUnique({
      where: { id },
      include: this.include([
        "category.name",
        "location.title",
        "questionnaires.id",
        "questionnaires.title",
        "questionnaires._count.questions",
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

  findAvailableDoctors = async (id) => {
    const data = await this.db.doctorProfile.findMany({
      where: {
        schedules: {
          some: {
            is_locked: false,
            service_id: id,
            start_date: {
              gte: moment(),
            },
          },
        },
      },
    });
    return data;
  };
}

export default ServiceService;
