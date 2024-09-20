import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { doctorSessionFields } from "../../data/model-fields.js";

class doctorsessionService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.doctorSession.findMany({
      ...q,
      select: this.select([
        ...doctorSessionFields.getFields(),
        "service.id",
        "service.title",
      ]),
    });

    if (query.paginate) {
      const countData = await this.db.doctorSession.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.doctorSession.findUnique({
      where: { id },
      select: this.select([
        ...doctorSessionFields.getFields(),
        "service.id",
        "service.title",
      ]),
    });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.doctorSession.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.doctorSession.update({
      where: { id },
      data: payload,
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.doctorSession.delete({ where: { id } });
    return data;
  };
}

export default doctorsessionService;
