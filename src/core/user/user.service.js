import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import bcrypt from "bcrypt";
import { BadRequest } from "../../lib/response/catch.js";
import jwt from "jsonwebtoken";
import constant from "../../config/constant.js";

class UserService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.user.findMany({
      ...q,
      select: this.include([
        "id",
        "full_name",
        "email",
        "status",
        "email_verified",
        "avatar",
        "created_at",
        "updated_at",
      ]),
    });

    if (query.paginate) {
      const countData = await this.db.user.count({ where: q.where });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.user.findUnique({
      where: { id },
      select: this.include([
        "id",
        "full_name",
        "email",
        "status",
        "email_verified",
        "avatar",
        "created_at",
        "updated_at",
        "user_roles.id",
        "user_roles.is_active",
        "user_roles.role.code",
        "user_roles.role.name",
      ]),
    });
    return data;
  };

  create = async (payload) => {
    const salt = await bcrypt.genSalt();
    payload["password"] = await bcrypt.hash(payload["password"], salt);

    const data = await this.db.user.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    if (payload["password"]) {
      const salt = await bcrypt.genSalt();
      payload["password"] = await bcrypt.hash(payload["password"], salt);
    }

    const data = await this.db.user.update({ where: { id }, data: payload });
    return data;
  };

  assignRole = async (id, payload) => {
    if (payload.filter((dat) => dat.is_active).length > 1)
      throw new BadRequest("Role aktif harus ada satu saja");

    await this.db.userRole.deleteMany({
      where: {
        user_id: id,
      },
    });

    const data = await this.db.userRole.createMany({
      data: payload.map((dat) => ({
        user_id: id,
        role_id: dat.role_id,
        is_active: dat.is_active,
      })),
    });

    return data;
  };

  switchRole = async (id, user_id) => {
    await this.db.userRole.updateMany({
      where: {
        user_id,
      },
      data: {
        is_active: false,
      },
    });

    const data = await this.db.userRole.update({
      where: {
        id,
        user_id,
      },
      select: {
        role: true,
      },
      data: {
        is_active: true,
      },
    });

    const [at, rt] = await Promise.all([
      jwt.sign(
        {
          uid: user_id,
          role: data.role.code,
          iss: process.env.JWT_ISSUER,
        },
        process.env.JWT_ACCESS_SECRET,
        {
          expiresIn: constant.JWT_ACCESS_EXP,
        }
      ),
      jwt.sign(
        { uid: user_id, iss: process.env.JWT_ISSUER },
        process.env.JWT_REFRESH_SECRET,
        {
          expiresIn: constant.JWT_REFRESH_EXP,
        }
      ),
    ]);

    return {
      user_role: data,
      token: {
        at,
        rt,
      },
    };
  };

  delete = async (id) => {
    const data = await this.db.user.delete({ where: { id } });
    return data;
  };
}

export default UserService;
