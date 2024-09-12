import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class UserFileService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.userFile.findMany({ ...q });

    if (query.paginate) {
      const countData = await this.db.userFile.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.userFile.findUnique({ where: { id } });
    return data;
  };

  create = async (payload) => {
    const data = await this.db.userFile.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.userFile.update({ where: { id }, data: payload });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.userFile.delete({ where: { id } });
    return data;
  };

  download = async (id) => {
      const fileData = await this.db.userFile.findUnique({ where: { id } });

      if (!fileData) {
          throw new Error('File not found');
      }

      const filePath = path.join(__dirname, '../../../', fileData.url);
      if (!fs.existsSync(filePath)) {
          throw new Error('File not found on server');
      }

      const fileBuffer = fs.readFileSync(filePath);

      return {
          buffer: fileBuffer,
          filename: fileData.filename,
          mimetype: fileData.mimetype,
          size: fileData.size,
      };
  };

}

export default UserFileService;  
