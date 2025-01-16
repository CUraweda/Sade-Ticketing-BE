import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import { ServerError } from "../../lib/response/catch.js";
import { SettingKeys } from "./setting.validator.js";

class SettingService extends BaseService {
  constructor() {
    super(prism);
  }

  isKeyExist = async (key) => this.db.setting.count({ where: { key } });

  getValue = async (key) => this.db.setting.findFirst({ where: { key } });

  setValue = async (key, value) => {
    if (!Object.values(SettingKeys).includes(key)) {
      throw new ServerError();
    }
    const result = await this.db.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
    return result;
  };
}

export default SettingService;
