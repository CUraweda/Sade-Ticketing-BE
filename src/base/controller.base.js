import httpStatus from "http-status";
import { catchResponse } from "../lib/response/catch.js";

class BaseController {
  constructor() {}

  ok = (res, data = null, message = "") => {
    return res.status(httpStatus.OK).json({
      status: true,
      message: message || "Success",
      data,
    });
  };

  created = (res, data = null, message = "") => {
    return res.status(httpStatus.CREATED).json({
      status: true,
      message: message || "New resource created",
      data,
    });
  };

  noContent = (res, message = "") => {
    return res.status(httpStatus.NO_CONTENT).json({
      status: true,
      message: message || "Resourced deleted",
    });
  };

  /**
   * @param {string[]} keys
   */

  checkFilesObj = (files, keys) => {
    let message = null;

    for (const key of keys) {
      if (!Object.prototype.hasOwnProperty.call(files, key)) {
        let name = key;
        if (key.includes("_")) {
          name = key.substring(key.indexOf("_") + 1);
        }
        message = "Please include your " + name;
        break;
      }
    }

    if (message) throw new BadRequest(message);
  };

  wrapper(method) {
    return async (req, res, ...args) => {
      try {
        return await method.apply(this, [req, res, ...args]);
      } catch (err) {
        catchResponse(err, req, res);
      }
    };
  }
}

export default BaseController;
