// Renders every Roost card with a pretend Home Assistant, in light and dark, to catch mistakes.
// Run:  node tests/render.test.mjs   (needs: npm i jsdom)
import { JSDOM } from "jsdom";
import fs from "node:fs";

const dom = new JSDOM("<!doctype html><body></body>", { pretendToBeVisual: true, url: "http://localhost/home#home" });
const { window } = dom;
Object.assign(globalThis, { window, document: window.document, HTMLElement: window.HTMLElement, customElements: window.customElements,
  CustomEvent: window.CustomEvent, history: window.history, location: window.location });
window.eval(fs.readFileSync(new URL("../dist/roost-cards.js", import.meta.url), "utf8"));

const now = new Date().toISOString();
const st = (entity_id, state, attributes = {}) => ({ entity_id, state, attributes: { friendly_name: entity_id.split(".")[1].replace(/_/g, " "), ...attributes }, last_changed: now });
const states = Object.fromEntries([
  st("light.kitchen", "on", { brightness: 128 }), st("light.hall", "off"), st("switch.kettle", "on"),
  st("person.sam", "home"), st("person.ali", "not_home"), st("alarm_control_panel.home", "disarmed"),
  st("binary_sensor.front_door", "off", { device_class: "door" }), st("sensor.power", "42", { unit_of_measurement: "W" }),
  st("climate.living", "cool", { hvac_modes: ["off", "cool", "dry", "fan_only", "heat_cool"], temperature: 23, min_temp: 16, max_temp: 30, current_temperature: 27.5 }),
  st("climate.noTemp", "off", { hvac_modes: ["off", "cool"] }), st("binary_sensor.back_door", "on", { device_class: "door" }), st("sun.sun", "below_horizon"),
  st("sensor.maghrib", new Date(Date.now() + 3 * 3600e3).toISOString(), { device_class: "timestamp" }), st("scene.movie", "scening"), st("weather.home", "partlycloudy", { temperature: 31, temperature_unit: "°C" }),
].map((s) => [s.entity_id, s]));
const calls = [];
const hass = (dark) => ({ states, themes: { darkMode: dark }, user: { name: "Sam Smith" }, callService: async (...a) => { calls.push(a); } });

const cases = [
  ["roost-tile", { entity: "light.kitchen", animation: "glow", power_entity: "sensor.power" }],
  ["roost-tile", { entity: "light.hall", color: "custom", color_start: [10, 20, 30], color_end: [200, 100, 50], size: "small" }],
  ["roost-tile", { entity: "switch.missing" }],
  ["roost-tile", { entity: "switch.kettle", problem: "Not working · battery" }],
  ["roost-tile", { entity: "light.kitchen", fill: "glass", glow: "strong", icon_shape: "circle", icon_size: 30, name_size: 20, align: "center", animation: "pulse" }],
  ["roost-tile", { entity: "light.kitchen", fill: "outline", glow: "none", icon_shape: "none", off_tint: false, show_state: false }],
  ["roost-tile", { entity: "light.kitchen", fill: "solid", icon_shape: "square", animation: "wiggle", size: "small" }],
  ["roost-scene", { entity: "scene.movie", style: "round", shape: "circle", button_size: 90, fill: "glass", show_name: false }],
  ["roost-scene", { entity: "scene.movie", fill: "outline", glow: "strong" }],
  ["roost-chips", { entities: ["light.kitchen", "person.sam"], chip_shape: "square", background: "glass" }],
  ["roost-row", { entity: "climate.living", ring_size: 90, ring_width: 10 }],
  ["roost-hero", { show_orb: false, show_stars: false, show_sheen: false, min_height: 140 }],
  ["roost-nav", { items: [{ name: "Home", icon: "mdi:home", path: "#home" }, { name: "Rooms", icon: "mdi:view-grid", path: "#rooms" }], active_style: "filled", background: "glass" }],
  ["roost-nav", { items: [{ name: "Home", icon: "mdi:home", path: "#home" }, { name: "Rooms", icon: "mdi:view-grid", path: "#rooms" }], active_style: "soft", background: "solid" }],
  ["roost-nav", { items: [{ name: "Home", icon: "mdi:home", path: "#home" }, { name: "Rooms", icon: "mdi:view-grid", path: "#rooms" }], active_style: "pill", background: "none" }],
  ["roost-nav", { items: [{ name: "Home", icon: "mdi:home", path: "#home" }, { name: "Rooms", icon: "mdi:view-grid", path: "#rooms" }], active_style: "line", background: "glass" }],
  ["roost-nav", { items: [{ name: "Home", icon: "mdi:home", path: "#home" }, { name: "Rooms", icon: "mdi:view-grid", path: "#rooms" }], active_style: "dot", background: "solid" }],
  ["roost-nav", { items: [{ name: "Home", icon: "mdi:home", path: "#home" }, { name: "Rooms", icon: "mdi:view-grid", path: "#rooms" }], active_style: "icon", background: "glass" }],
  ["roost-rooms", { rooms: [{ name: "Living", icon: "mdi:sofa", cards: [] }], active_style: "soft", background: "glass" }],
  ["roost-rooms", { rooms: [{ name: "Living", icon: "mdi:sofa", cards: [] }], active_style: "line", background: "none" }],
  ["roost-chips", { entities: ["alarm_control_panel.home", "binary_sensor.front_door", "light.kitchen", "light.hall", "person.sam", "person.ali", "climate.living"] }],
  ["roost-thermostat", { entity: "climate.living", sensor: "sensor.power" }],
  ["roost-thermostat", { entity: "climate.noTemp" }],
  ["roost-scene", { entity: "scene.movie", style: "round" }],
  ["roost-scene", { entity: "scene.movie" }],
  ["roost-hero", { weather: "weather.home" }],
  ["roost-hero", { weather: "weather.home", sky: "coral", upcoming_title: "Next prayer", upcoming: [{ name: "Maghrib", entity: "sensor.maghrib" }] }],
  ["roost-row", { entity: "climate.living" }],
  ["roost-row", { entity: "sensor.power", name: "Power" }],
  ["roost-row", { entity: "switch.kettle" }],
  ["roost-nav", { items: [{ icon: "mdi:home", path: "#home" }, { icon: "mdi:cog", path: "#settings", name: "Settings" }], show_labels: true }],
];
let fails = 0;
for (const dark of [true, false]) {
  for (const [tag, config] of cases) {
    try {
      const el = document.createElement(tag);
      el.setConfig(config);
      document.body.appendChild(el);
      el.hass = hass(dark);
      const html = el.shadowRoot.innerHTML;
      if (!html || html.length < 200) throw new Error("rendered nothing");
      const text = html.replace(/<style>[\s\S]*?<\/style>/g, "");
      if (/undefined|NaN|\bnull\b|—|\[object Object\]/.test(text)) throw new Error(`bad text in output (design rule 7): ${text.match(/.{40}(undefined|NaN|\bnull\b|—|\[object Object\]).{20}/)?.[0]}`);
      const form = customElements.get(tag).getConfigForm();
      if (!form.schema?.length) throw new Error("no editor");
      el.remove();
    } catch (e) { fails++; console.error(`FAIL ${tag} ${JSON.stringify(config)} dark=${dark}: ${e.message}`); }
  }
}
// The chips group lights with a count, and a tap on the bulb opens the list.
const chips = document.createElement("roost-chips");
chips.setConfig({ entities: ["light.kitchen", "light.hall", "person.sam"] });
document.body.appendChild(chips); chips.hass = hass(true);
if (!/mdi:lightbulb-on/.test(chips.shadowRoot.innerHTML) || !/<span class="num">1<\/span>/.test(chips.shadowRoot.innerHTML)) { fails++; console.error("FAIL chips light count"); }
chips._open = "lights"; chips.render();
if ((chips.shadowRoot.innerHTML.match(/class="tog/g) || []).length !== 2) { fails++; console.error("FAIL chips list"); }
// Two doors share one door chip (1 open), two ACs share one snowflake (1 on); the list opens on tap.
const g = document.createElement("roost-chips");
g.setConfig({ entities: ["binary_sensor.front_door", "binary_sensor.back_door", "climate.living", "climate.noTemp"] });
document.body.appendChild(g); g.hass = hass(true);
const gh = g.shadowRoot.innerHTML;
if ((g.shadowRoot.querySelectorAll(".chip").length !== 2) || !/mdi:door-open/.test(gh) || !/data-g="climates"/.test(gh)) { fails++; console.error("FAIL chips grouping", g.shadowRoot.querySelectorAll(".chip").length); }
g._open = "climates"; g.render();
if (!/Cool · 23°/.test(g.shadowRoot.innerHTML) || g.shadowRoot.querySelectorAll("[data-m]").length !== 2) { fails++; console.error("FAIL chips AC list"); }
// Rooms: pills switch the room instantly, and the room's cards get Home Assistant.
const rooms = document.createElement("roost-rooms");
rooms.setConfig({ rooms: [{ name: "Living", icon: "mdi:sofa", cards: [{ type: "custom:roost-tile", entity: "light.kitchen" }] },
  { name: "Bedroom", icon: "mdi:bed", cards: [{ type: "custom:roost-tile", entity: "light.hall" }, { type: "custom:roost-scene", entity: "scene.movie" }] }] });
document.body.appendChild(rooms); rooms.hass = hass(true);
await new Promise((r) => setTimeout(r, 20));
const visible = () => [...rooms.shadowRoot.querySelectorAll(".room")].filter((x) => !x.hidden).map((x) => x.querySelectorAll("roost-tile,roost-scene").length);
if (visible().join() !== "1") { fails++; console.error("FAIL rooms first room", visible()); }
rooms.shadowRoot.querySelectorAll(".pill")[1].dispatchEvent(new window.Event("click"));
if (visible().join() !== "2") { fails++; console.error("FAIL rooms switch", visible()); }
if (!/Bedroom/.test(rooms.shadowRoot.querySelector(".pill.on").textContent) || /Living/.test(rooms.shadowRoot.querySelectorAll(".pill")[0].textContent)) { fails++; console.error("FAIL rooms names only on the chosen room"); }
if (!rooms.shadowRoot.querySelector("roost-tile").shadowRoot.innerHTML.includes("Kitchen") && !rooms.shadowRoot.querySelectorAll("roost-tile")[1].shadowRoot.innerHTML) { fails++; console.error("FAIL rooms cards not drawn"); }
// The settings screen shows the real values, the own-colour pickers only when chosen, and saves only what changed.
customElements.define("ha-form", class extends window.HTMLElement {});
const names = (schema) => schema.flatMap((x) => (x.schema ? names(x.schema) : [x.name]));
const ed = customElements.get("roost-tile").getConfigElement();
let saved = null;
ed.addEventListener("config-changed", (e) => { saved = e.detail.config; });
ed.setConfig({ type: "custom:roost-tile", entity: "light.kitchen" }); ed.hass = hass(true);
const form = ed.querySelector("ha-form");
if (form.data.radius !== 22 || form.data.size !== "large") { fails++; console.error("FAIL editor shows defaults", form.data); }
if (names(form.schema).includes("color_start")) { fails++; console.error("FAIL editor hides own colours for a preset"); }
form.dispatchEvent(new window.CustomEvent("value-changed", { detail: { value: { ...form.data, color: "custom" } } }));
if (!saved || saved.color !== "custom" || "radius" in saved || saved.entity !== "light.kitchen") { fails++; console.error("FAIL editor saves only the change", saved); }
if (!names(form.schema).includes("color_start")) { fails++; console.error("FAIL editor shows own colours when chosen"); }
// Errors for missing settings
for (const [tag, cfg] of [["roost-tile", {}], ["roost-chips", { entities: [] }], ["roost-nav", { items: [] }], ["roost-rooms", { rooms: [] }]]) {
  try { document.createElement(tag).setConfig(cfg); fails++; console.error(`FAIL ${tag} accepted an empty config`); } catch { /* expected */ }
}
console.log(fails ? `${fails} failed` : `all ${cases.length * 2 + 12} checks passed`);
process.exit(fails ? 1 : 0);
