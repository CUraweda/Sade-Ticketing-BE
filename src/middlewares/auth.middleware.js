import jwt from "jsonwebtoken";
import {
  catchResponse,
  Forbidden,
  Unauthenticated,
} from "../lib/response/catch.js";

/**
 * @param {("SDM" | "ADM" | "USR")[] | null} roles
 */
const authMiddleware = (roles = null) => {
  return async (req, res, next, ...args) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        throw new Unauthenticated();
      }

      let data;
      try {
        data = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      } catch (err) {
        throw new Unauthenticated();
      }

      if (roles && !roles.includes(data.role)) {
        throw new Forbidden();
      }

      req.user = {
        id: data.uid,
        role_code: data.role,
      };

      next();
    } catch (error) {
      catchResponse(error, req, res);
    }
  };
};

export { authMiddleware };
