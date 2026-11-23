const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[A-Za-z0-9_-]{1,64}$/;
const TOKEN_RE = /^[A-Za-z0-9._~-]{1,512}$/;

const isUuid = (value) => typeof value === "string" && UUID_RE.test(value);
const isSlug = (value) => typeof value === "string" && SLUG_RE.test(value);
const isToken = (value) => typeof value === "string" && TOKEN_RE.test(value);

module.exports = { isUuid, isSlug, isToken };
