import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class QuestionnaireResponseService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.questionnaireResponse.findMany({ ...q });

    if (query.paginate) {
      const countData = await this.db.questionnaireResponse.count({
        where: q.where,
      });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.questionnaireResponse.findUnique({
      where: { id },
      include: this.select([
        "questionnaire.id",
        "client",
        "answers.id",
        "answers.text",
        "answers.number",
        "answers.date",
        "answers.question",
      ]),
    });

    return data;
  };

  create = async (payload) => {
    const data = await this.db.questionnaireResponse.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.questionnaireResponse.update({
      where: { id },
      data: payload,
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.questionnaireResponse.delete({ where: { id } });
    return data;
  };

  checkOwner = async (id, uid) => {
    const check = await this.db.questionnaireResponse.count({
      where: {
        id,
        user_id: uid,
      },
    });
    return check;
  };
}

export default QuestionnaireResponseService;
