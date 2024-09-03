import httpStatus from "http-status";
import { catchResponse } from "../lib/response/catch.js";

class BaseController {
  constructor() {}

  ok = (res, data = null, message = "") => {
    return res.status(httpStatus.OK).json({
      status: true,
      message: message || "Sukses",
      data,
    });
  };

  created = (res, data = null, message = "") => {
    return res.status(httpStatus.CREATED).json({
      status: true,
      message: message || "Data baru berhasil dibuat",
      data,
    });
  };

  noContent = (res, message = "") => {
    return res.status(httpStatus.NO_CONTENT).json({
      status: true,
      message: message || "Data berhasil dihapus",
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
        message = "Mohon sertakan " + name;
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

  joinBrowseQuery = (query, field, colval) => {
    query[field] = query[field] ? `${query[field]}+${colval}` : colval;
    return query;
  };

  /**
   * @param {any} data
   * @param {string[]} selects
   * @param {boolean} isPaginate
   */
  exclude = (data, selects, isPaginate = false) => {
    if (isPaginate) {
      data["items"] = data["items"].map((dat) =>
        Object.fromEntries(
          Object.entries(dat).filter(([key]) => !selects.includes(key))
        )
      );
      return data;
    }

    return Array.isArray(data)
      ? data.map((d) =>
          Object.fromEntries(
            Object.entries(d).filter(([key]) => !selects.includes(key))
          )
        )
      : Object.fromEntries(
          Object.entries(data).filter(([key]) => !selects.includes(key))
        );
  };

  /**
   * @param {any} data
   * @param {string[]} selects
   * @param {boolean} isPaginate
   */
  include = (data, selects = [], isPaginate = false) => {
    if (isPaginate) {
      data["items"] = data["items"].map((dat) =>
        Object.fromEntries(
          Object.entries(dat).filter(([key]) => selects.includes(key))
        )
      );
      return data;
    }

    return Array.isArray(data)
      ? data.map((d) =>
          Object.fromEntries(
            Object.entries(d).filter(([key]) => selects.includes(key))
          )
        )
      : Object.fromEntries(
          Object.entries(data).filter(([key]) => selects.includes(key))
        );
  };
}

export default BaseController;
