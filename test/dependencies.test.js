const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));

// poynt 0.x depends on the unmaintained `request` package (no fix for its SSRF advisory)
// and on jsonwebtoken@7. poynt 1.x dropped `request`.
test("poynt SDK is on the 1.x line that no longer depends on request", () => {
  const range = pkg.dependencies.poynt;
  assert.ok(range, "poynt must stay a direct dependency");
  assert.doesNotMatch(range, /^[\^~]?0\./, `poynt range ${range} still allows the 0.x line`);
});
