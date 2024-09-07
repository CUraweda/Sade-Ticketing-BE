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
    const data = await this.db.service.findUnique({ where: { id } });
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

  findQuestionnaires = async (id) => {
    const data = await this.db.service.findUnique({
      where: { id },
      select: this.include(["questionnaires"]),
    });
    return data.questionnaires.map((q) => ({ questionnaire: q }));
  };

  setQuestionnaires = async (id, payload) => {
    await this.db.service.update({
      where: {
        id,
      },
      data: {
        questionnaires: {
          set: payload.map((id) => ({ id })),
        },
      },
    });

    return null;
  };

  findDoctors = async (id) => {
    const data = await this.db.doctorService.findMany({
      where: {
        service_id: id,
      },
      select: this.include(["doctor"]),
    });
    return data;
  };
}

export default ServiceService;
