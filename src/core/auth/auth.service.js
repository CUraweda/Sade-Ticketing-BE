import BaseService from "../../base/service.base.js";
import constant from "../../config/constant.js";
import { prism } from "../../config/db.js";
import { userFields } from "../../data/model-fields.js";
import { BadRequest, Forbidden, NotFound } from "../../lib/response/catch.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class AuthService extends BaseService {
  constructor() {
    super(prism);
  }

  login = async (payload) => {
    const user = await this.db.user.findUnique({
      where: { email: payload.email },
      select: {
        ...this.include(userFields),
        UserRole: {
          select: {
            id: true,
            is_active: true,
            role: true,
          },
        },
      },
    });
    if (!user) throw new NotFound("User not found");

    if (!user.status) throw new Forbidden("Account is currently inactive");

    const pwValid = await bcrypt.compare(payload.password, user.password);
    if (!pwValid) throw new BadRequest("Wrong password");

    const activeRole = user.UserRole.filter((ur) => ur.is_active);

    const [at, rt] = await Promise.all([
      jwt.sign(
        {
          uid: user.id,
          role: activeRole.length > 0 ? activeRole[0].role.code : null,
          iss: process.env.JWT_ISSUER,
        },
        process.env.JWT_ACCESS_SECRET,
        {
          expiresIn: constant.JWT_ACCESS_EXP,
        }
      ),
      jwt.sign(
        { uid: user.id, iss: process.env.JWT_ISSUER },
        process.env.JWT_REFRESH_SECRET,
        {
          expiresIn: constant.JWT_REFRESH_EXP,
        }
      ),
    ]);

    return {
      user: this.exclude(user, ["password"]),
      token: {
        at,
        rt,
      },
    };
  };
}

export default AuthService;
