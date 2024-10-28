import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { Forbidden } from "../../lib/response/catch.js";

class QuestionnaireService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.questionnaire.findMany({ ...q });

    if (query.paginate) {
      const countData = await this.db.questionnaire.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.questionnaire.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.questionnaire.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.questionnaire.update({
      where: { id },
      data: payload,
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.questionnaire.delete({ where: { id } });
    return data;
  };

  findResponse = async (id, response_id) => {
    const data = await this.db.questionnaireResponse.findFirst({
      where: { id: response_id, questionnaire_id: id },
      include: {
        client: true,
        answers: {
          include: {
            question: true,
          },
        },
      },
    });
    return data;
  };

  checkResponseAuthor = async (id, response_id, user_id) => {
    const check = this.db.questionnaireResponse.count({
      where: {
        id: response_id,
        questionnaire_id: id,
        user_id,
      },
    });
    if (!check) throw new Forbidden();
    return check;
  };

  saveResponse = async (response_id, payload = [], lock = false) => {
    await this.db.questionAnswer.deleteMany({
      where: { response_id },
    });

    const data = await this.db.questionAnswer.createMany({
      data: payload.map((p) => ({ response_id, ...p })),
    });

    if (lock)
      await this.db.questionnaireResponse.update({
        where: { id: response_id },
        data: { is_locked: true },
      });

    return data;
  };
}

export default QuestionnaireService;
