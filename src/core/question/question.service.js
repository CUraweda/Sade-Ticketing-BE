import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { questionFields } from "../../data/model-fields.js";

class QuestionService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.question.findMany({
      ...q,
      select: this.include([...questionFields, "options"]),
    });

    if (query.paginate) {
      const countData = await this.db.question.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.question.findUnique({ where: { id } });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.question.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.question.update({
      where: { id },
      data: payload,
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.question.delete({ where: { id } });
    return data;
  };
}

export default QuestionService;
