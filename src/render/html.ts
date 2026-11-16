/** Escape text for HTML. All LLM / user text goes through this. */
export function esc(s: string | null | undefined): string {
  return (s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Make a safe slug for ids / anchors. */
export function slug(s: string): string {
  const out = s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return out || "section";
}

/** Small tagged-template helper: joins arrays, drops null/false. */
export function html(strings: TemplateStringsArray, ...values: unknown[]): string {
  let out = "";
  strings.forEach((str, i) => {
    out += str;
    if (i < values.length) {
      const v = values[i];
      if (Array.isArray(v)) out += v.join("");
      else if (v !== null && v !== undefined && v !== false) out += String(v);
    }
  });
  return out;
}
