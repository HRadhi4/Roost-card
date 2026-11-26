// Safety rules for Roost Cards. They come from the HACS security review and run with every `npm test`,
// so the same kinds of bugs cannot come back.
//
//  1. No inline event handlers (onerror=, onclick=, onload= ...) in markup. Use addEventListener.
//  2. No javascript: links, eval() or new Function().
//  3. Anything from Home Assistant or the card settings that goes inside an HTML attribute
//     (data-*, style, aria-*, value, min, max, step ...) is wrapped in esc() for text,
//     or fin() / Number() / num() for numbers.
//  4. Colours from Home Assistant (rgb_color) go through rgbNums() or rgb(), never a raw .join().
//  5. Every card cleans its settings with cleanConfig() and reads Home Assistant through safeHass();
//     the details sheet does too. Native Home Assistant elements get rawHass().
//  6. Values the cards send back to Home Assistant (options, modes, sources, effects) stay unchanged
//     in safeHass, and are escaped where they are shown.
//  7. Nothing is loaded from Google Fonts or another outside site; fonts are bundled.
import fs from "fs";

const file = "dist/roost-cards.js";
const src = fs.readFileSync(file, "utf8");
const lines = src.split("\n");
let fails = 0, checks = 0;
const fail = (rule, msg) => { fails++; console.error(`FAIL safety rule ${rule}: ${msg}`); };
const check = (rule, ok, msg) => { checks++; if (!ok) fail(rule, msg); };

// 1. inline handlers
{
  const bad = [];
  lines.forEach((l, i) => {
    if (/\son[a-z]{3,}\s*=\s*["'`\\$]/i.test(l)) bad.push(i + 1);
    if (/setAttribute\(\s*["']on[a-z]+["']/i.test(l)) bad.push(i + 1);
  });
  check(1, !bad.length, `inline event handler on line ${bad.join(", ")}. Use addEventListener instead.`);
}

// 2. script from text
{
  const bad = [];
  lines.forEach((l, i) => { if (/javascript:|\beval\s*\(|new Function\s*\(/.test(l)) bad.push(i + 1); });
  check(2, !bad.length, `javascript:, eval() or new Function() on line ${bad.join(", ")}`);
}

// 3. attributes built from Home Assistant or settings values
{
  const SAFE = /^(esc|fin|Number|num|rgbNums|rgb|shapeRadius|Math\.[a-z]+|String\(\d)\b|^[\d.]+$|\?\s*["'`\d]|^(i|j|n|idx|index|k|key)$|\.toFixed\(|\.length$|\.indexOf\(|^!!| [<>=!]==? /;
  const RISKY = /\.attributes\b|\.state\b|\b(a|c|it|s|st|cfg|conf)\.[a-z_]+|^(m|o|w|t|v|val|value|label|name|icon|unit|mode|opt|option|title|text)$/;
  const bad = [];
  lines.forEach((l, i) => {
    for (const m of l.matchAll(/\s([a-z][a-z-]*)="([^"]*?)\$\{([^{}]{1,90})\}/g)) {
      const e = m[3].trim();
      if (/\$\{(esc|fin|Number)\(`/.test(m[2])) continue; // already inside esc(`...`)
      if (SAFE.test(e)) continue;
      if (RISKY.test(e)) bad.push(`${i + 1} ${m[1]}="\${${e}}"`);
    }
  });
  // reviewed and safe: the alert tone is one of the cards' own colours, never a value from Home Assistant
  const real = bad.filter((b) => !/style="\$\{a\.tone\}"/.test(b.replace(/^\d+ /, "")));
  check(3, !real.length, `value put in an attribute without esc()/fin()/Number():\n   ${real.join("\n   ")}`);
}

// 4. colours
{
  const bad = [];
  lines.forEach((l, i) => { if (/rgb_color\??\.join|rgbw?w?_color\??\.join|hs_color\??\.join/.test(l)) bad.push(i + 1); });
  check(4, !bad.length, `rgb_color joined raw on line ${bad.join(", ")}. Use rgbNums().`);
}

// 5. every card is cleaned
{
  check(5, /const SIZE_KEY = /.test(src) && /SIZE_KEY\.test\(k\)/.test(src), "size, spacing and timing settings are no longer cleaned");
  check(5, /function safeHass\(/.test(src) && /const cleanConfig = /.test(src) && /const rawHass = /.test(src), "safeHass, cleanConfig or rawHass is missing");
  check(5, /this\._config = \{ \.\.\.this\.constructor\.defaults, \.\.\.cleanConfig\(config, this\.constructor\.defaults\) \}/.test(src), "RoostBase.setConfig does not use cleanConfig");
  check(5, /hass\(\) \{ return safeHass\(this\.ha\(\)\?\.hass\); \}/.test(src), "the details sheet does not read Home Assistant through safeHass");
  // each `set hass` either hands over to super (RoostBase) or wraps with safeHass itself
  const bad = [];
  const re = /set hass\((\w+)\) \{([\s\S]{0,400})/g;
  for (const m of src.matchAll(re)) {
    const body = m[2], line = src.slice(0, m.index).split("\n").length;
    const isEditor = /RoostEditor|class \w+Editor/.test(src.slice(Math.max(0, m.index - 400), m.index));
    if (isEditor) continue;
    if (!/super\.hass = |safeHass\(/.test(body)) bad.push(line);
  }
  check(5, !bad.length, `set hass on line ${bad.join(", ")} neither calls super.hass nor safeHass()`);
  // native HA elements and child cards get the untouched object
  const raw = [];
  lines.forEach((l, i) => { if (/\b(el|this\._form|this\._stack|this\._inner)\.hass = this\._hass\b/.test(l)) raw.push(i + 1); });
  check(5, !raw.length, `child element given the cleaned hass on line ${raw.join(", ")}; use rawHass(this._hass)`);
}

// 6. values sent back to Home Assistant are kept
{
  const keep = src.match(/const SAFE_KEEP = new Set\(\[([\s\S]*?)\]\)/)?.[1] || "";
  for (const k of ["options", "hvac_modes", "preset_modes", "fan_modes", "source_list", "effect_list"]) check(6, keep.includes(`"${k}"`), `${k} is no longer kept unchanged in safeHass`);
}

// 7. nothing from outside sites
{
  const bad = [];
  lines.forEach((l, i) => { if (/fonts\.googleapis|fonts\.gstatic|@import\s+url\(\s*["']?https?:/i.test(l)) bad.push(i + 1); });
  check(7, !bad.length, `outside font or stylesheet on line ${bad.join(", ")}`);
}

console.log(fails ? `safety: ${fails} failed` : `safety rules: all ${checks} passed`);
process.exit(fails ? 1 : 0);
