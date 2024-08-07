import Joi from "joi";
import { prism } from "../config/db.js";

const containColon = (value, helpers) => {
  let errMsg = null;
  value.split("+").some((el) => {
    if (!el.includes(":")) {
      errMsg = 'Query must contain ":" to separate field and value';
      return true;
    }
  });

  return errMsg ? helpers.message(errMsg) : value;
};

const orderPattern = (value, helpers) => {
  let errMsg = null;
  value.split("+").forEach((el) => {
    if (!el.includes(":")) {
      errMsg = 'Query must contain ":" to separate field and value';
      return true;
    }
    const val = el.split(":")[1];
    if (val != "desc" && val != "asc") {
      errMsg = 'Order query value must be "desc" or "asc"';
      return true;
    }
  });

  return errMsg ? helpers.message(errMsg) : value;
};

/**
 * @param {string} table table name
 */
export const relationExist = (table) => {
  return async (value, helpers) => {
    if (value == undefined) return value;

    try {
      const found = await prism[table].findUnique({ where: { id: value } });
      if (!found) {
        const fieldName = helpers.state.path.join(".");
        return helpers.message(
          `The ${fieldName} with ID ${value} does not exist`
        );
      }

      return value;
    } catch (err) {
      return helpers.message(err.message);
    }
  };
};

export const baseValidator = {
  browseQuery: Joi.object({
    search: Joi.string().optional().custom(containColon),
    where: Joi.string().optional().custom(containColon),
    in_: Joi.string().optional().custom(containColon),
    not_: Joi.string().optional().custom(containColon),
    isnull: Joi.string().optional(),
    paginate: Joi.boolean().optional().default(true),
    limit: Joi.number().optional().default(10),
    page: Joi.number().optional().default(1),
    order: Joi.string().optional().custom(orderPattern),
  }),
};
