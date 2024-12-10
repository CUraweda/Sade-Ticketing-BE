import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

class SignatureService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.signature.findMany({ ...q });

    if (query.paginate) {
      const countData = await this.db.signature.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id, userId) => {
    const data = await this.db.signature.findUnique({
      where: { id, user_id: userId },
    });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.signature.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.signature.update({
      where: { id },
      data: payload,
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.signature.delete({ where: { id } });
    return data;
  };
}

export default SignatureService;
