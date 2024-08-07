export function isInteger(value) {
  return /^\d+$/.test(value);
}

export function isBoolean(value) {
  return value === "true" || value === "false";
}
