import { isObject } from "./type.js";

export const filterDuplicate = (arr = [], key) =>
  arr.filter(
    (item, index, self) =>
      index ===
      self.findIndex((t) =>
        isObject(item) ? t[key] === item[key] : t === item
      )
  );
