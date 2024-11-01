import moment from "moment";

export function isInteger(value) {
  return /^\d+$/.test(value);
}

export function isBoolean(value) {
  return value === "true" || value === "false";
}

export function isDateAble(value) {
  return moment(value).isValid();
}
