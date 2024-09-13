import fs from "fs";
import { isBoolean, isDateAble, isInteger } from "../utils/type.js";
import { PrismaClient } from "@prisma/client";
import moment from "moment";

class BaseService {
  /**
   * @param {PrismaClient} db
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * @param {{}} query array of data
   */
  transformBrowseQuery = (query = {}) => {
    // where
    let wheres = {};
    if (query && query.where) {
      query.where.split("+").forEach((q) => {
        let [col, val] = q.split(":");

        if (isInteger(val)) {
          val = parseInt(val);
        } else if (isBoolean(val)) {
          val = val === "true";
        }

        const keys = col.split(".");
        let current = wheres;

        keys.forEach((key, index) => {
          if (index === keys.length - 1) {
            current[key] = val;
          } else {
            current[key] = current[key] || {};
            current = current[key];
          }
        });
      });
    }

    // search
    let likes = {};
    if (query && query.search) {
      const ors = [];
      query.search.split("+").forEach((q) => {
        const [col, val] = q.split(":");
        ors.push({
          [col]: {
            startsWith: val,
          },
        });
      });

      likes["OR"] = ors;
    }

    // in
    let in_ = {};
    if (query && query.in_) {
      query.in_.split("+").forEach((q) => {
        let [col, val] = q.split(":");

        if (isInteger(val)) {
          val = parseInt(val);
        } else if (isBoolean(val)) {
          val = val === "true";
        }

        const keys = col.split(".");
        let current = in_;
        keys.forEach((key, index) => {
          if (index === keys.length - 1) {
            if (keys[keys.length - 2]?.endsWith("s")) {
              current["some"] = {
                [key]: {
                  in: Array.isArray(val) ? val : [val],
                },
              };
            } else {
              current[key] = {
                in: Array.isArray(val) ? val : [val],
              };
            }
          } else {
            current[key] = current[key] || {};
            current = current[key];
          }
        });
      });
    }

    // is not
    let not_ = {};
    if (query && query.not_) {
      query.not_.split("+").forEach((q) => {
        const [col, val] = q.split(":");
        not_[col] = {
          not: val,
        };
      });
    }

    // is null
    let isnull = {};
    if (query && query.isnull) {
      query.isnull.split("+").forEach((q) => {
        isnull[q] = null;
      });
    }

    // gte
    let gte = {};
    if (query && query.gte) {
      query.gte.split("+").forEach((q) => {
        const [col, val] = q.split(":");
        gte[col] = {
          gte: isDateAble(val) ? moment(val).toDate() : val,
        };
      });
    }

    // lte
    let lte = {};
    if (query && query.lte) {
      query.lte.split("+").forEach((q) => {
        const [col, val] = q.split(":");
        lte[col] = {
          lte: isDateAble(val) ? moment(val).toDate() : val,
        };
      });
    }

    // order by
    let orderBy = {};
    if (query && query.order) {
      query.order.split("+").forEach((q) => {
        const [col, val] = q.split(":");
        orderBy[col] = val;
      });
    }

    // pagination
    let pagination = {};

    if (query && query.limit && query.limit > 0) {
      if (query.paginate) pagination["take"] = query.limit;
    }

    if (query && query.paginate) {
      if (pagination["take"] && pagination["take"] > 0) {
        const page = query.page && query.page > 0 ? query.page : 1;
        pagination["skip"] = (page - 1) * (pagination["take"] || 0);
      }
    }

    return {
      where: {
        AND: [wheres, likes, in_, not_, isnull, gte, lte],
      },
      take: pagination["take"],
      skip: pagination["skip"],
      orderBy: orderBy,
    };
  };

  /**
   * @param {any[]} data array of data
   * @param {any} count number amount of data
   * @param {{}} query prisma query args
   */
  paginate = (data, count, query) => {
    const size = query.take <= 0 ? count : query.take;

    return {
      total_items: count,
      page: Math.floor(query.skip / query.take) + 1 || 1,
      limit: size,
      total_pages: Math.ceil(count / size) || 1,
      items: data,
    };
  };

  /**
   * @param {{}} data
   * @param {string[]} selects
   */
  exclude = (data, selects) => {
    return Object.fromEntries(
      Object.entries(data).filter(([key]) => !selects.includes(key))
    );
  };

  /**
   * @param {string[]} selects
   */
  include = (selects = []) => {
    if (!selects.length) return undefined;

    const select = {};

    selects.forEach((key) => {
      const parts = key.split(".");
      let current = select;

      parts.forEach((part, index) => {
        if (!current[part]) {
          if (index === parts.length - 1) {
            current[part] = true;
          } else {
            current[part] = {};
            current[part].select = {};
          }
        } else if (
          index === parts.length - 1 &&
          typeof current[part] === "object" &&
          !current[part].select
        ) {
          current[part].select = {};
        }
        current = current[part].select;
      });
    });

    return select;
  };

  deleteUpload = (path) => {
    fs.unlink(path, (err) => {
      if (err) {
        console.error("ERR(file): ", err);
      }
    });
  };
}

export default BaseService;
