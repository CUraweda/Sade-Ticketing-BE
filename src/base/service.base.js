import fs from "fs";
import { isBoolean, isInteger } from "../utils/type.js";
import { PrismaClient } from "@prisma/client";

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
        wheres[col] = val;
      });
    }

    // search
    let likes = {};
    if (query && query.search) {
      query.search.split("+").forEach((q) => {
        const [col, val] = q.split(":");
        likes[col] = {
          startsWith: val,
        };
      });
    }

    // in
    let in_ = {};
    if (query && query.in_) {
      query.in_.split("+").forEach((q) => {
        const [col, val] = q.split(":");
        in_[col] = {
          in: val.split(","),
        };
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
      pagination["take"] = query.limit;
    }

    if (query && query.paginate) {
      if (pagination["take"] && pagination["take"] > 0) {
        const page = query.page && query.page > 0 ? query.page : 1;
        pagination["skip"] = (page - 1) * (pagination["take"] || 0);
      }
    }

    return {
      where: {
        AND: [wheres, likes, in_, not_, isnull],
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
