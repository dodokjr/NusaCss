import test from "node:test";
import assert from "node:assert/strict";

import {
  resolveEasing,
  springProgress,
  springDuration,
  presets
} from "../packages/motion/src/index.js";

test("easing resolves known values", () => {
  assert.equal(resolveEasing("linear"), "linear");
  assert.equal(resolveEasing("ease-out"), "ease-out");
});

test("spring progress returns a number", () => {
  const result = springProgress({}, 0.5);
  assert.equal(typeof result, "number");
  assert.ok(Number.isFinite(result));
});

test("spring duration is positive", () => {
  assert.ok(springDuration({}) > 0);
});

test("presets are available", () => {
  assert.ok(presets.fadeIn);
  assert.ok(presets.fadeUp);
  assert.ok(presets.zoomIn);
});
