import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

class ApiKeyService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.apiKey.findMany({ ...q });

    if (query.paginate) {
      const countData = await this.db.apiKey.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.apiKey.findUnique({ where: { id } });
    return data;
  };

  create = async (payload) => {
    const apiKey = crypto.randomBytes(32).toString("hex");
    payload["key"] = await bcrypt.hash(apiKey, 10);

    const data = await this.db.apiKey.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.apiKey.update({ where: { id }, data: payload });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.apiKey.delete({ where: { id } });
    return data;
  };
}

export default ApiKeyService;
