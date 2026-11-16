import type { ContentInput, StyleInput } from "../input.js";
import type { ContentSpec, StyleSpec } from "../spec/schema.js";

/** Any engine (OpenAI, rules, ...) that turns keywords into specs. */
export interface Interpreter {
  name: string;
  content(input: ContentInput, opts: { seed: number }): Promise<ContentSpec>;
  /** `subject` is context only: style must never change the content. */
  style(keywords: StyleInput, opts: { seed: number; subject: string | null }): Promise<StyleSpec>;
}
