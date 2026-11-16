// The design rules that can be checked by reading the code (see DESIGN_RULES.md).
import fs from "node:fs";

const src = fs.readFileSync(new URL("../dist/roost-cards.js", import.meta.url), "utf8");
const problems = [];
if (/text-overflow\s*:\s*ellipsis|line-clamp|…/.test(src)) problems.push("rule 4: no ellipsis or line-clamp");
for (const m of src.matchAll(/transition\s*:\s*([^;"`}]+)/g)) {
  for (const t of m[1].matchAll(/(\d*\.?\d+)\s*(ms|s)\b/g)) {
    const seconds = t[2] === "ms" ? Number(t[1]) / 1000 : Number(t[1]);
    if (seconds > 0.12) problems.push(`rule 6: transition longer than 0.12 s: "${m[0].trim()}"`);
  }
}
if (/animation\s*:\s*[^;"`]*\b(rise|fade|slide)/i.test(src)) problems.push("rule 6: no entrance animations");
for (const m of src.matchAll(/getGridOptions\(\)\s*\{([^}]*\})/g)) {
  if (/rows:\s*(?!\s|"auto")/.test(m[1])) problems.push(`rule 4: cards must grow to fit (rows: "auto"): ${m[0].slice(0, 80)}`);
}
if (/min_rows/.test(src)) problems.push('rule 4: no fixed minimum rows');
if (!src.includes('"#6D4BFF", "#8B6CFF"')) problems.push("rule 1: the active purple #6D4BFF → #8B6CFF must exist");
if (!/Space Grotesk/.test(src) || !/Inter/.test(src)) problems.push("rule 1: fonts Space Grotesk and Inter");
console.log(problems.length ? problems.map((p) => `FAIL ${p}`).join("\n") : "design rules: all checks passed");
process.exit(problems.length ? 1 : 0);
