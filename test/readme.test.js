import assert from "node:assert/strict";
import test from "node:test";
import { upsertGeneratedSection } from "../src/readme.js";

test("upsertGeneratedSection appends when markers do not exist", () => {
  const result = upsertGeneratedSection(
    "# Title\n",
    "<!-- repo-insight-card:start -->\nGenerated\n<!-- repo-insight-card:end -->",
  );
  assert.match(result, /# Title/);
  assert.match(result, /Generated/);
});

test("upsertGeneratedSection replaces existing generated section", () => {
  const result = upsertGeneratedSection(
    "# Title\n\n<!-- repo-insight-card:start -->\nOld\n<!-- repo-insight-card:end -->\n\nFooter\n",
    "<!-- repo-insight-card:start -->\nNew\n<!-- repo-insight-card:end -->",
  );

  assert.match(result, /New/);
  assert.doesNotMatch(result, /Old/);
  assert.match(result, /Footer/);
});
