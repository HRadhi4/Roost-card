// Right-to-left rules for Roost Cards (Arabic and other right-to-left languages). They run with every `npm test`.
//
//  1. Everything placed from a side moves to the other side in right-to-left, fills and knobs included:
//     a bar fills from the right, a big room icon sits bottom right, a lock slides to the left.
//  2. Every slider reads the finger through rtlX(), so dragging in Arabic goes the right way.
//  3. Marks along a scale (prayer and day timelines, good-range bars) start on the right (flipMarks).
//  4. Lines that run along time (graphs and the small trend lines) are drawn mirrored (/*mirror*/).
//  5. Swiping between rooms is reversed: in Arabic the next room is to the left.
//  6. Kept as drawn, on purpose, and only these (/*ltr*/): the bottom bar's own placement and a TV remote's
//     direction pad (left moves the TV left). A thermostat or fan dial turns the same way in every language,
//     like a real one. A new /*ltr*/ needs a reason and a place in the list below.
//  7. Words the cards show have Arabic: every word below must translate, and a word that means something else in
//     one place carries its own Arabic there (data-ar), like "Cool" for a light (بارد, not تبريد).
import fs from "fs";
import { JSDOM } from "jsdom";

const src = fs.readFileSync("dist/roost-cards.js", "utf8");
const lines = src.split("\n");
let fails = 0, checks = 0;
const check = (rule, ok, msg) => { checks++; if (!ok) { fails++; console.error(`FAIL right-to-left rule ${rule}: ${msg}`); } };

// 1. no side placement is kept back in right-to-left except where marked
{
  const flip = src.match(/flipCss\(css\) \{[\s\S]*?\n  \},/)?.[0] || "";
  check(1, /if \(sides\.length\) \{/.test(flip) && !/one side only, at 0/.test(flip), "fills that start at a side are kept back from mirroring again");
}

// 2. sliders read the finger through rtlX
{
  const allowed = [/ev\.clientY - b\.top\) \/ b\.height\) \* 250/, /lift\(at\(e\.clientX/, /el = at\(e\.clientX/, /touches\[0\]\.clientX; y0/, /changedTouches\[0\]\.clientX - x0/,
    /_winDrag = /, /const dx = e\.clientX - d\.x/, /sim\.poke/, /x0 = ev\.clientX; y0/, /dot\.style\.left/, /const dx = ev\.clientX - x0/, /createSVGPoint/, /Math\.atan2/,
    /const dx = ev\.clientX - \(b\.left/, /dir \* /, /touches\[0\]\?\.clientX/, /const dx = t\.clientX - x0/, /start\(e\.touches\[0\]\.clientX/, /move\(e\.touches\[0\]\.clientX/,
    /start\(e\.clientX, e\.clientY/, /move\(ev\.clientX/, /ptrs\.set/, /start = \{ yaw/, /this\.yaw = start\.yaw/, /this\.roomAt\(e\.clientX/, /at = \[e\.clientX/, /this\.pan\.ry \+=/];
  const bad = [];
  lines.forEach((l, i) => { if (/clientX/.test(l) && !/rtlX\(/.test(l) && !allowed.some((r) => r.test(l))) bad.push(i + 1); });
  check(2, !bad.length, `a finger read without rtlX() on line ${bad.join(", ")}: a slider must use rtlX(el, x); anything else (a dial, a swipe, a 360° view) goes in this test's list with its reason`);
}

// 3 and 4. marks along a scale and lines along time
check(3, /flipMarks\(r\) \{/.test(src) && /this\.flipMarks\(r\);/.test(src), "marks along a scale are no longer moved to the right");
for (const sel of [".sp{display:block;width:100%;height:34px;/*mirror*/}", ".chart svg{width:100%;height:120px;display:block;/*mirror*/}", ".sens svg{flex:1;height:60px;min-width:0;/*mirror*/}", "svg{display:block;width:100%;height:${H}px;/*mirror*/}"])
  check(4, src.includes(sel), `this line along time is no longer drawn mirrored: ${sel}`);
check(4, /\/\\\*mirror\\\*\\\/\/\.test\(body\)/.test(src), "flipCss no longer draws /*mirror*/ rules mirrored");

// 5. swiping between rooms
check(5, /rtlX\(box, 0\) === 1 \? dx > 0 : dx < 0/.test(src), "swiping between rooms is no longer reversed in right-to-left");

// 6. only the listed places stay left-to-right
{
  // the bottom bar's placement; a TV remote's direction pad; the thermostat's − power + row (it follows the dial,
  // which rises clockwise); a media player's previous / play / next (the same everywhere)
  const ok = [/\.bar\{\/\*ltr\*\/\$\{pos\}/, /\.pad \.(k|k:active|up|ok)\{\/\*ltr\*\//, /\.ctl\{\/\*ltr\*\/direction:ltr;display:grid;grid-template-columns:1fr auto 1fr/, /\.ctl\{\/\*ltr\*\/direction:ltr;display:flex;justify-content:center;gap:14px\}/];
  const bad = [];
  lines.forEach((l, i) => { if (/\/\*ltr\*\//.test(l) && !ok.some((r) => r.test(l))) bad.push(i + 1); });
  check(6, !bad.length, `kept left-to-right without a listed reason on line ${bad.join(", ")}`);
}

// 7. words translate
{
  const dom = new JSDOM(`<!doctype html><body></body>`, { runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window;
  w.customElements.define("ha-icon", class extends w.HTMLElement {});
  try { w.eval(src); } catch (e) { /* cards that need more than jsdom still define RoostLang */ }
  const L = w.RoostLang;
  const want = { "See all": "عرض الكل", "No history yet": "لا يوجد سجل بعد", "Power consumption": "استهلاك الطاقة", "Monday 16 November · 3:20 PM": "الاثنين 16 نوفمبر · 3:20 م",
    "Living Room on": "غرفة المعيشة يعمل", "Curtain open · Bedroom on": "الستارة مفتوح · غرفة النوم يعمل", "in 4h 35m": "بعد 4 س 35 د", "Sunset at 5:28 PM": "الغروب الساعة 5:28 م",
    "Slide to unlock ›››": "اسحب لفتح القفل ›››", "Lowest": "الأدنى", "Highest": "الأعلى", "Last 24 h": "آخر 24 س", "Too high": "مرتفع جداً", "4 devices · 2 on": "4 أجهزة · 2 يعمل",
    "15.6°C · 54% humidity": "15.6°C · الرطوبة 54٪", "2 people here": "2 أشخاص هنا", "Wind 24 km/h": "الرياح 24 km/h", "Warm": "دافئ", "Neutral": "محايد", "Tap to stop": "اضغط للإيقاف", "Last ran 9 d ago": "آخر تشغيل قبل 9 ي", "in 43 min": "بعد 43 د", "Open · slide to close": "مفتوح · اسحب للإغلاق" };
  check(7, !!L, "RoostLang is missing");
  if (L) for (const [en, ar] of Object.entries(want)) check(7, L.line(en) === ar, `"${en}" gives "${L.line(en)}", not "${ar}"`);
  check(7, /data-ar="\$\{\{ Warm: "دافئ", Neutral: "محايد", Cool: "بارد" \}\[w\]\}"/.test(src), "the light's Cool no longer has its own Arabic (بارد)");
}

console.log(fails ? `right-to-left: ${fails} failed` : `right-to-left rules: all ${checks} passed`);
process.exit(fails ? 1 : 0);
