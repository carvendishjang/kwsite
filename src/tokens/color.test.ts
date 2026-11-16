import { test } from "node:test";
import assert from "node:assert/strict";
import { wcagContrast } from "culori";
import { buildPalette } from "./color.js";

test("every palette combination meets WCAG contrast targets", () => {
  for (let baseHue = 0; baseHue < 360; baseHue += 10)
    for (const harmony of ["mono", "analogous", "complementary", "triadic", "split"] as const)
      for (const chroma of ["muted", "balanced", "vivid"] as const)
        for (const scheme of ["light", "dark"] as const) {
          const p = buildPalette({ baseHue, harmony, chroma, scheme });
          const id = `${baseHue}/${harmony}/${chroma}/${scheme}`;
          assert.ok(wcagContrast(p.text, p.bg) >= 7, `text on bg ${id}`);
          assert.ok(wcagContrast(p.text, p.surface) >= 4.5, `text on surface ${id}`);
          assert.ok(wcagContrast(p.muted, p.bg) >= 4.5, `muted on bg ${id}`);
          assert.ok(wcagContrast(p.muted, p.surface) >= 4.5, `muted on surface ${id}`);
          assert.ok(wcagContrast(p.primary, p.bg) >= 4.5, `primary on bg ${id}`);
          assert.ok(wcagContrast(p.onPrimary, p.primary) >= 4.5, `button text ${id}`);
        }
});
