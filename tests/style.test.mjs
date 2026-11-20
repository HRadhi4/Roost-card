// Look checks that can be made by reading the code.
import fs from "node:fs";

const src = fs.readFileSync(new URL("../dist/roost-cards.js", import.meta.url), "utf8");
const problems = [];
const C = JSON.parse(fs.readFileSync(new URL("./style.json", import.meta.url), "utf8"));
if (new RegExp(C.no.join("|")).test(src)) problems.push("check 1");
for (const m of src.matchAll(/transition\s*:\s*([^;"`}]+)/g)) {
  for (const t of m[1].matchAll(/(\d*\.?\d+)\s*(ms|s)\b/g)) {
    const seconds = t[2] === "ms" ? Number(t[1]) / 1000 : Number(t[1]);
    if (seconds > C.t) problems.push(`check 2: "${m[0].trim()}"`);
  }
}
if (new RegExp(C.anim, "i").test(src)) problems.push("check 3");
for (const m of src.matchAll(/getGridOptions\(\)\s*\{([^}]*\})/g)) if (/rows:\s*(?!\s|"auto")/.test(m[1])) problems.push(`check 4: ${m[0].slice(0, 80)}`);
if (/min_rows/.test(src)) problems.push("check 5");
if (!src.includes(C.accent)) problems.push("check 6");
for (const f of C.fonts) if (!src.includes(f)) problems.push(`check 7: ${f}`);
const SCALE = new Set(C.sizes);
for (const m of src.matchAll(/font-size:\s*([\d.]+)px/g)) if (!SCALE.has(Number(m[1]))) problems.push(`check 8: ${m[1]}px`);
for (const m of src.matchAll(/padding:\s*([^;"`}]+)/g)) for (const v of m[1].matchAll(/(\d+(?:\.\d+)?)px/g)) if (Number(v[1]) % 2) problems.push(`check 9: ${v[1]}px in "${m[0].slice(0, 60)}"`);
console.log(problems.length ? problems.map((p) => `FAIL ${p}`).join("\n") : "look checks: all passed");
process.exit(problems.length ? 1 : 0);
