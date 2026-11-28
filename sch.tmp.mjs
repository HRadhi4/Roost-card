import { JSDOM } from "jsdom";
import fs from "node:fs";
const dom = new JSDOM("<!doctype html><body></body>", { pretendToBeVisual: true, url: "http://localhost/" });
const { window } = dom;
Object.assign(globalThis, { window, document: window.document, HTMLElement: window.HTMLElement, customElements: window.customElements, CustomEvent: window.CustomEvent, history: window.history, location: window.location });
window.eval(fs.readFileSync("/home/claude/roost-card/dist/roost-cards.js", "utf8"));
const show = (s, d = 0) => s.map((f) => f.type === "expandable" ? `[${f.title}]{${show(f.schema, d + 1)}}` : f.type === "grid" ? `(${show(f.schema, d + 1)})` : f.name).join(" ");
for (const c of window.customCards) {
  const cls = customElements.get(c.type); if (!cls?.getConfigForm) continue;
  try { console.log(c.type.padEnd(22), show(cls.getConfigForm().schema)); } catch (e) { console.log(c.type, "ERR", e.message); }
}
