const MONGO_ID_PATTERN = /^[a-fA-F0-9]{24}$/;

export function isValidMongoId(value) {
  return typeof value === "string" && MONGO_ID_PATTERN.test(value);
}
