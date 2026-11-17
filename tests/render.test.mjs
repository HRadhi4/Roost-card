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
  st("climate.noTemp", "off", { hvac_modes: ["off", "cool"] }), st("cover.curtain", "closed", { current_position: 0 }), st("cover.assumed", "unknown", { assumed_state: true }), st("binary_sensor.back_door", "on", { device_class: "door" }), st("sun.sun", "below_horizon"),
  st("sensor.maghrib", new Date(Date.now() + 3 * 3600e3).toISOString(), { device_class: "timestamp" }), st("sensor.fajr", "04:40"), st("sensor.dhuhr", new Date(Date.now() - 2 * 3600e3).toISOString()),
  st("sensor.cabinet", "34.2", { unit_of_measurement: "°C", device_class: "temperature" }), st("sensor.hum", "48", { unit_of_measurement: "%" }), st("sensor.lock_battery", "12", { unit_of_measurement: "%", device_class: "battery" }),
  st("sensor.offline", "unavailable"), st("automation.morning", "on", { last_triggered: new Date(Date.now() - 5 * 60000).toISOString() }), st("automation.night", "off", { last_triggered: null }),
  st("media_player.tv", "playing", { volume_level: 0.35, is_volume_muted: false, media_title: "News", app_name: "YouTube", source: "HDMI 1", source_list: ["HDMI 1", "HDMI 2", "YouTube"] }), st("media_player.off_tv", "off"),
  st("light.color", "on", { brightness: 200, supported_color_modes: ["color_temp", "hs"], rgb_color: [255, 180, 90] }), st("light.dim", "off", { supported_color_modes: ["brightness"] }),
  st("alarm_control_panel.coded", "armed_away", { code_format: "number" }), st("alarm_control_panel.boom", "triggered"),
  st("button.tv_power", "unknown", { remote: "TV", friendly_name: "TV Power" }), st("button.tv_vol_up", "unknown", { remote: "TV", friendly_name: "TV Vol up" }), st("button.tv_ok", "unknown", { remote: "TV", friendly_name: "TV OK" }),
  st("remote.box", "on"), st("sensor.radar_target_1_x", "-420"), st("sensor.radar_target_1_y", "1800"), st("sensor.radar_target_2_x", "0"), st("sensor.radar_target_2_y", "0"),
  st("sensor.radar_zone_1_x1", "-1000"), st("sensor.radar_zone_1_y1", "500"), st("sensor.radar_zone_1_x2", "1000"), st("sensor.radar_zone_1_y2", "2500"), st("sensor.radar_zone_1_all_target_count", "1"),
  st("weather.storm", "lightning-rainy", { temperature: 22, humidity: 80, wind_speed: 30, wind_speed_unit: "km/h", forecast: [{ datetime: new Date().toISOString(), condition: "rainy", temperature: 24, templow: 18 }] }),
  st("sensor.energy_today", "12.4", { unit_of_measurement: "kWh", device_class: "energy" }), st("sensor.plug_a", "1500", { unit_of_measurement: "W", device_class: "power" }), st("sensor.plug_b", "60", { unit_of_measurement: "W", device_class: "power" }),
  st("timer.kettle", "active", { duration: "0:05:00", finishes_at: new Date(Date.now() + 150000).toISOString() }), st("timer.idle", "idle", { duration: "0:03:00" }),
  st("fan.ceiling", "on", { percentage: 66, percentage_step: 33.33, oscillating: false, preset_modes: ["Breeze", "Sleep"], preset_mode: "Breeze" }), st("fan.plain", "off"),
  st("lock.front", "locked"), st("lock.jam", "jammed"), st("lock.open", "unlocked"), st("cover.garage", "closed", { device_class: "garage" }),
  st("calendar.home", "off"), st("todo.shopping", "2"), st("camera.door", "idle", { entity_picture: "/api/camera_proxy/camera.door?token=x" }), st("camera.off", "unavailable"),
  st("binary_sensor.bell", "on", { device_class: "occupancy" }), st("scene.movie", "scening"), st("weather.home", "partlycloudy", { temperature: 31, temperature_unit: "°C" }),
].map((s) => [s.entity_id, s]));
const calls = [];
const entities = Object.fromEntries(Object.keys(states).filter((id) => id.startsWith("sensor.radar_")).map((id) => [id, { entity_id: id, device_id: "dev-radar" }]));
const hass = (dark) => ({ states, entities, devices: { "dev-radar": { name: "Presence sensor" } }, themes: { darkMode: dark }, user: { name: "Sam Smith" }, callService: async (...a) => { calls.push(a); },
  callApi: async () => [{ summary: "Bin day", start: { date: new Date().toISOString().slice(0, 10) } }, { summary: "Dentist", start: { dateTime: new Date(Date.now() + 3600e3).toISOString() }, location: "Clinic" }],
  callWS: async (m) => (m.type === "recorder/statistic_during_period" ? { change: new Date(m.fixed_period.end) < Date.now() - 3600e3 ? 10 : 12.4 } : {}),
  connection: { subscribeMessage: async (cb, m) => { setTimeout(() => cb(m.type === "todo/item/subscribe" ? { items: [{ uid: "1", summary: "Milk", status: "needs_action" }, { uid: "2", summary: "Bread", status: "completed" }] } : { forecast: [{ datetime: new Date().toISOString(), condition: "sunny", temperature: 30, templow: 22 }] }), 0); return () => {}; } } });

const cases = [
  ["roost-tile", { entity: "light.kitchen", animation: "glow", power_entity: "sensor.power" }],
  ["roost-tile", { entity: "light.hall", color: "custom", color_start: [10, 20, 30], color_end: [200, 100, 50], size: "small" }],
  ["roost-tile", { entity: "switch.missing" }],
  ["roost-remote", { athom_remote: "TV", show_numbers: true }],
  ["roost-remote", { entity: "remote.box" }],
  ["roost-remote", { entity: "media_player.tv", show_extra: false }],
  ["roost-presence", { device: "dev-radar" }],
  ["roost-presence", { device: "dev-none", show_grid: false }],
  ["roost-weather", { entity: "weather.home" }],
  ["roost-weather", { entity: "weather.storm", forecast: "hourly" }],
  ["roost-weather", { entity: "weather.missing", forecast: "none" }],
  ["roost-energy", { energy: "sensor.energy_today", devices: ["sensor.plug_a", "sensor.plug_b", "sensor.missing"] }],
  ["roost-energy", { devices: ["sensor.plug_a"] }],
  ["roost-timer", { entity: "timer.kettle", name: "Kettle", icon: "mdi:kettle" }],
  ["roost-timer", { entity: "timer.idle" }],
  ["roost-timer", { entity: "timer.missing" }],
  ["roost-fan", { entity: "fan.ceiling" }],
  ["roost-fan", { entity: "fan.plain" }],
  ["roost-lock", { entity: "lock.front", door: "binary_sensor.front_door" }],
  ["roost-lock", { entity: "lock.jam" }],
  ["roost-lock", { entity: "lock.open" }],
  ["roost-lock", { entity: "cover.garage" }],
  ["roost-agenda", { entities: ["calendar.home"] }],
  ["roost-todo", { entity: "todo.shopping", show_done: true }],
  ["roost-camera", { entity: "camera.door", doorbell: "binary_sensor.bell", aspect: "3/4" }],
  ["roost-camera", { entity: "camera.off" }],
  ["roost-sensors", { entities: ["sensor.cabinet", { entity: "sensor.hum", name: "Humidity", below: 50 }, "sensor.offline", "sensor.missing"], columns: 2 }],
  ["roost-buttons", { items: [{ name: "Kitchen", icon: "mdi:lightbulb", entity: "light.kitchen" }, { name: "Movie", icon: "mdi:movie", tap_action: { action: "perform-action", perform_action: "scene.turn_on", target: { entity_id: "scene.movie" } } }, { icon: "mdi:power" }] }],
  ["roost-buttons", { items: [{ icon: "mdi:home" }], show_names: false }],
  ["roost-fullscreen", { mode: "button" }],
  ["roost-fullscreen", { mode: "button", show_label: false, color: "teal" }],
  ["roost-gauge", { entity: "sensor.cabinet", title: "Cabinet", min: 20, max: 45, warn: 32, second: "sensor.hum", second_name: "Humidity" }],
  ["roost-gauge", { entity: "sensor.power", max: 2000, frame: false, show_name: false }],
  ["roost-gauge", { entity: "sensor.offline" }],
  ["roost-gauge", { entity: "sensor.missing" }],
  ["roost-automations", { entities: ["automation.morning", "automation.night", "automation.missing"], show_run: true, title: "Automations" }],
  ["roost-automations", { all: true, columns: 2 }],
  ["roost-automations", { all: true, only_on: true }],
  ["roost-clock", { times: [{ name: "Fajr", short: "F", entity: "sensor.fajr" }, { name: "Dhuhr", entity: "sensor.dhuhr" }, { name: "Maghrib", short: "M", entity: "sensor.maghrib" }], hour24: true }],
  ["roost-clock", { times: [], seconds: true, frame: false }],
  ["roost-title", { title: "Devices", subtitle: "3 on", icon: "mdi:devices", badge: "3 on", link_text: "See all", tap_action: { action: "navigate", navigation_path: "#rooms" } }],
  ["roost-title", { title: "Rooms" }],
  ["roost-theme", {}],
  ["roost-theme", { include_auto: true, show_label: true, shape: "pill" }],
  ["roost-media", { entity: "media_player.tv", power_entity: "switch.kettle" }],
  ["roost-media", { entity: "media_player.off_tv" }],
  ["roost-media", { entity: "media_player.missing" }],
  ["roost-room", { name: "Living", temperature: "sensor.cabinet", humidity: "sensor.hum", entities: ["light.kitchen", "climate.living", "cover.curtain", "media_player.tv", "binary_sensor.back_door"] }],
  ["roost-room", { name: "Bedroom", style: "card", icon: "mdi:bed", temperature: "sensor.missing" }],
  ["roost-room", { name: "Hall" }],
  ["roost-alarm", { entity: "alarm_control_panel.home", doors: ["binary_sensor.front_door", "binary_sensor.back_door"] }],
  ["roost-alarm", { entity: "alarm_control_panel.coded", modes: ["arm_away"] }],
  ["roost-alarm", { entity: "alarm_control_panel.boom" }],
  ["roost-alarm", { entity: "alarm_control_panel.missing" }],
  ["roost-light", { entity: "light.color" }],
  ["roost-light", { entity: "light.dim" }],
  ["roost-light", { entity: "light.kitchen", show_presets: false }],
  ["roost-light", { entity: "light.missing" }],
  ["roost-graph", { entity: "sensor.power", hours: 6 }],
  ["roost-graph", { entity: "sensor.missing" }],
  ["roost-people", { entities: ["person.sam", "person.ali"] }],
  ["roost-people", { entities: ["person.sam", "person.ali"], layout: "list", size: 40 }],
  ["roost-alerts", { offline: ["sensor.offline"], doors: ["binary_sensor.back_door"], door_minutes: 0, rules: [{ entity: "sensor.cabinet", above: 32, message: "Cabinet too hot" }] }],
  ["roost-alerts", { batteries: false, show_all_good: true }],
  ["roost-curtain", { entity: "cover.curtain" }],
  ["roost-curtain", { entity: "cover.assumed", style: "left", show_buttons: false, show_header: false }],
  ["roost-curtain", { entity: "cover.curtain", style: "blind", color: "teal", show_sky: false, height: 220 }],
  ["roost-curtain", { entity: "cover.missing" }],
  ["roost-curtain", { entity: "cover.curtain", background: "picture", image: "/local/view.jpg", image_night: "/local/night.jpg" }],
  ["roost-curtain", { entity: "cover.curtain", background: "picture" }],
  ["roost-curtain", { entity: "cover.curtain", background: "weather", weather: "weather.home" }],
  ["roost-curtain", { entity: "cover.curtain", background: "none" }],
  ["roost-tile", { entity: "switch.kettle", problem: "Not working · battery" }],
  ["roost-tile", { entity: "light.kitchen", fill: "glass", glow: "strong", icon_shape: "circle", icon_size: 30, name_size: 20, align: "center", animation: "pulse" }],
  ["roost-tile", { entity: "light.kitchen", fill: "outline", glow: "none", icon_shape: "none", off_tint: false, show_state: false }],
  ["roost-tile", { entity: "light.kitchen", fill: "solid", icon_shape: "square", animation: "wiggle", size: "small" }],
  ["roost-scene", { entity: "scene.movie", style: "round", shape: "circle", button_size: 90, fill: "glass", show_name: false }],
  ["roost-scene", { entity: "scene.movie", fill: "outline", glow: "strong" }],
  ["roost-chips", { entities: ["light.kitchen", "person.sam"], chip_shape: "square", background: "glass" }],
  ["roost-row", { entity: "climate.living", ring_size: 90, ring_width: 10 }],
  ["roost-hero", { show_orb: false, show_stars: false, show_sheen: false, min_height: 140 }],
  ["roost-hero", { greeting: "Welcome home", show_name: false, greeting_size: 34, align: "center", sky: "aurora", orb_size: 80, pill_style: "light", info: [{ entity: "sensor.power", name: "Power", icon: "mdi:flash" }], tap_action: { action: "navigate", navigation_path: "#rooms" } }],
  ["roost-hero", { show_greeting: false, show_weather: false, sky: "sunset" }],
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
  ["roost-grocy", { sample: true }],
  ["roost-grocy", { sample: true, tabs: ["chores", "meals"] }],
  ["roost-grocy", {}],
  ["roost-sensors", { style: "ring", entities: ["sensor.cabinet", "sensor.hum", "sensor.power", "sensor.offline"] }],
  ["roost-sensors", { style: "scale", entities: ["sensor.cabinet", { entity: "sensor.hum", comfort_min: 35, comfort_max: 55 }, "sensor.power"] }],
  ["roost-sensors", { style: "rows", color_by: "fixed", color: "teal", entities: ["sensor.cabinet", "sensor.hum", { entity: "sensor.power", min: 0, max: 3000 }] }],
  ["roost-sensors", { style: "line", show_icon: false, show_name: false, entities: [{ entity: "sensor.cabinet", above: 30 }] }],
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
if (!/mdi:lightbulb-on/.test(chips.shadowRoot.innerHTML) || !/<span class="cnt"[^>]*>1<\/span>/.test(chips.shadowRoot.innerHTML)) { fails++; console.error("FAIL chips light count"); }
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
// The pinned bottom bar sits in its own place while the dashboard is being edited.
const nv = document.createElement("roost-nav"); nv.setConfig({ items: [{ name: "Home", icon: "mdi:home", path: "#home" }] });
document.body.appendChild(nv); nv.editMode = true; nv.hass = hass(true);
if (/position:fixed/.test(nv.shadowRoot.innerHTML) || !/shown here while editing/.test(nv.shadowRoot.innerHTML)) { fails++; console.error("FAIL nav in edit mode"); }
nv.editMode = false;
if (!/position:fixed/.test(nv.shadowRoot.innerHTML)) { fails++; console.error("FAIL nav pinned after editing"); }
// Hero: own greeting, readings, presets.
const he = document.createElement("roost-hero"); he.setConfig({ greeting: "Welcome home", show_name: false, info: [{ entity: "sensor.power", name: "Power" }], sky: "ocean" });
document.body.appendChild(he); he.hass = hass(true);
if (!/Welcome home</.test(he.shadowRoot.innerHTML) || !/Power <b>42W/.test(he.shadowRoot.innerHTML) || !/#0E7490/.test(he.shadowRoot.innerHTML)) { fails++; console.error("FAIL hero options"); }
// Reverse: a curtain reported 99% open is shown as 1% open, and Open sends close_cover.
const rcalls = [];
const rc = document.createElement("roost-curtain"); rc.setConfig({ entity: "cover.rev", reverse: true });
const hr = hass(true); hr.states["cover.rev"] = { entity_id: "cover.rev", state: "open", attributes: { current_position: 99, friendly_name: "Rev" }, last_changed: new Date().toISOString() };
hr.callService = async (d, sv) => { rcalls.push(`${d}.${sv}`); };
document.body.appendChild(rc); rc.hass = hr;
if (!/1% open/.test(rc.shadowRoot.innerHTML)) { fails++; console.error("FAIL reverse shows 1% open", rc.shadowRoot.querySelector(".stt")?.textContent); }
rc.shadowRoot.querySelector('.btn[data-a="open"]').dispatchEvent(new window.Event("click"));
await new Promise((r) => setTimeout(r, 10));
if (rcalls[0] !== "cover.close_cover") { fails++; console.error("FAIL reverse open button", rcalls); }
// Alerts hide themselves when nothing needs you.
const al = document.createElement("roost-alerts"); al.setConfig({ batteries: false }); document.body.appendChild(al); al.hass = hass(true);
if (al.style.display !== "none") { fails++; console.error("FAIL alerts hide when all good"); }
const al2 = document.createElement("roost-alerts"); al2.setConfig({ battery_below: 20 }); document.body.appendChild(al2); al2.hass = hass(true);
if (!/lock battery 12%/i.test(al2.shadowRoot.innerHTML)) { fails++; console.error("FAIL alerts battery"); }
// Gauge warns when too high.
const ga = document.createElement("roost-gauge"); ga.setConfig({ entity: "sensor.cabinet", warn: 32, min: 20, max: 45 }); document.body.appendChild(ga); ga.hass = hass(true);
if (!/Too high/.test(ga.shadowRoot.innerHTML)) { fails++; console.error("FAIL gauge warn"); }
// Room sums up what is on.
const ro = document.createElement("roost-room"); ro.setConfig({ name: "Living", entities: ["light.kitchen", "climate.living", "cover.curtain"] }); document.body.appendChild(ro); ro.hass = hass(true);
if (!/1 light on · AC cool 23° · Curtain closed/.test(ro.shadowRoot.innerHTML)) { fails++; console.error("FAIL room summary", ro.shadowRoot.querySelector(".l")?.textContent); }
// Remote: Athom Hub buttons are matched to keys; keys it does not have are greyed out.
const rm = document.createElement("roost-remote"); rm.setConfig({ athom_remote: "TV" }); document.body.appendChild(rm); rm.hass = hass(true);
if (rm.shadowRoot.querySelectorAll(".k:not(.no)").length !== 3) { fails++; console.error("FAIL remote keys", rm.shadowRoot.querySelectorAll(".k:not(.no)").length); }
// Presence: one person (the 0,0 target is ignored), zone 1 shows its count.
const pm = document.createElement("roost-presence"); pm.setConfig({ device: "dev-radar" }); document.body.appendChild(pm); pm.hass = hass(true);
if (!/1 person here/.test(pm.shadowRoot.innerHTML) || !/1 · 1/.test(pm.shadowRoot.innerHTML)) { fails++; console.error("FAIL presence"); }
// Timer counts down from 2:30.
const tm = document.createElement("roost-timer"); tm.setConfig({ entity: "timer.kettle" }); document.body.appendChild(tm); tm.hass = hass(true);
if (!/^2:(2[5-9]|30)$/.test(tm.shadowRoot.querySelector(".v").textContent)) { fails++; console.error("FAIL timer", tm.shadowRoot.querySelector(".v").textContent); }
// Agenda and to-do load their items.
const ag = document.createElement("roost-agenda"); ag.setConfig({ entities: ["calendar.home"] }); document.body.appendChild(ag); ag.hass = hass(true);
const td = document.createElement("roost-todo"); td.setConfig({ entity: "todo.shopping" }); document.body.appendChild(td); td.hass = hass(true);
await new Promise((r) => setTimeout(r, 30));
if (!/ev hot/.test(ag.shadowRoot.innerHTML) || !/Dentist/.test(ag.shadowRoot.innerHTML)) { fails++; console.error("FAIL agenda"); }
if (!/Milk/.test(td.shadowRoot.innerHTML) || !/1 to do/.test(td.shadowRoot.innerHTML) || !/Clear 1 ticked/.test(td.shadowRoot.innerHTML)) { fails++; console.error("FAIL todo"); }
// Energy: today against yesterday.
const en = document.createElement("roost-energy"); en.setConfig({ energy: "sensor.energy_today", devices: ["sensor.plug_a", "sensor.plug_b"] }); document.body.appendChild(en); en.hass = hass(true);
await new Promise((r) => setTimeout(r, 30));
if (!/12.4 kWh/.test(en.shadowRoot.innerHTML) || !/24% vs this time yesterday/.test(en.shadowRoot.innerHTML) || !/1.6 kW/.test(en.shadowRoot.innerHTML)) { fails++; console.error("FAIL energy", en.shadowRoot.querySelector(".top")?.textContent); }
// Doors say Closed, not Off.
const dt = document.createElement("roost-tile"); dt.setConfig({ entity: "binary_sensor.front_door" }); document.body.appendChild(dt); dt.hass = hass(true);
if (!/Closed/.test(dt.shadowRoot.innerHTML)) { fails++; console.error("FAIL door tile word"); }
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
// Rooms from the device picker: tiles coloured by type, a count badge, a per-room colour, and an empty-room note.
const r2 = document.createElement("roost-rooms");
r2.setConfig({ rooms: [{ name: "Kitchen", icon: "mdi:stove", color: "teal", entities: ["light.kitchen", "light.hall", "climate.living"] }, { name: "Empty", icon: "mdi:door" }], show_count: true, remember: false });
document.body.appendChild(r2); r2.hass = hass(true);
await new Promise((r) => setTimeout(r, 20));
const tiles = [...r2.shadowRoot.querySelectorAll(".room:not([hidden]) roost-tile")];
if (tiles.length !== 3 || tiles[0]._config.color !== "amber" || tiles[2]._config.color !== "blue") { fails++; console.error("FAIL rooms auto tiles", tiles.length, tiles[0]?._config?.color); }
if (!r2.shadowRoot.querySelector(".cnt")) { fails++; console.error("FAIL rooms count badge"); }
if (!/#0E9F8A/.test(r2.shadowRoot.innerHTML)) { fails++; console.error("FAIL rooms per-room colour"); }
r2.shadowRoot.querySelectorAll(".pill")[1].dispatchEvent(new window.Event("click"));
if (!/No devices in this room yet/.test(r2.shadowRoot.innerHTML)) { fails++; console.error("FAIL rooms empty note"); }
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
// Grocy: food going off is listed first, a shopping item disappears when ticked, a chore needs two taps.
const gr = document.createElement("roost-grocy"); gr.setConfig({ sample: true, tabs: ["fridge", "shopping", "chores"] }); document.body.appendChild(gr); gr.hass = hass(true);
const grt = () => gr.shadowRoot.innerHTML.replace(/<style>[\s\S]*?<\/style>/g, "");
if (!/Chicken[\s\S]*Yoghurt[\s\S]*Milk/.test(grt()) || !/1 gone off/.test(grt()) || !/running low/.test(grt())) { fails++; console.error("FAIL grocy fridge"); }
gr.shadowRoot.querySelector('[data-tab="shopping"]').dispatchEvent(new window.Event("click"));
const before = (grt().match(/data-k="s/g) || []).length;
gr.shadowRoot.querySelector('[data-k^="s"]').dispatchEvent(new window.Event("click"));
if ((grt().match(/data-k="s/g) || []).length !== before - 1) { fails++; console.error("FAIL grocy shopping tick", before); }
gr.shadowRoot.querySelector('[data-tab="chores"]').dispatchEvent(new window.Event("click"));
gr.shadowRoot.querySelector('[data-k^="c"]').dispatchEvent(new window.Event("click"));
if (!/Tap again/.test(grt())) { fails++; console.error("FAIL grocy chore confirm"); }
// Grocy with the integration's own names, found by itself.
states["sensor.grocy_shopping_list"] = st("sensor.grocy_shopping_list", "1", { products: [{ id: 7, product_id: 3, amount: 2, note: "", product: { id: 3, name: "Lemons" } }], count: 1 });
const gr2 = document.createElement("roost-grocy"); gr2.setConfig({}); document.body.appendChild(gr2); gr2.hass = hass(false);
if (!/Lemons/.test(gr2.shadowRoot.innerHTML)) { fails++; console.error("FAIL grocy finds its sensors"); }
calls.length = 0; gr2.shadowRoot.querySelector('[data-k="s7"]').dispatchEvent(new window.Event("click"));
await new Promise((r) => setTimeout(r, 5));
if (!calls.some((x) => x[0] === "grocy" && x[1] === "remove_product_in_shopping_list" && x[2].product_id === 3)) { fails++; console.error("FAIL grocy service", JSON.stringify(calls)); }
// Room: any cards under it, in one box, kept between redraws, and folded away when asked.
const rk = document.createElement("roost-room");
rk.setConfig({ name: "Living", temperature: "sensor.cabinet", cards: [{ type: "custom:roost-tile", entity: "light.kitchen" }, { type: "custom:roost-scene", entity: "scene.movie" }], cards_columns: 2 });
document.body.appendChild(rk); rk.hass = hass(true);
await new Promise((r) => setTimeout(r, 20));
const kid = rk.shadowRoot.querySelector(".wrap .kids roost-tile");
if (!kid || !rk.shadowRoot.querySelector(".kids roost-scene") || !/repeat\(2/.test(rk.shadowRoot.innerHTML)) { fails++; console.error("FAIL room cards"); }
rk._sig = null; rk.hass = hass(false);
if (rk.shadowRoot.querySelector(".kids roost-tile") !== kid || !kid.hass) { fails++; console.error("FAIL room cards kept"); }
const rf = document.createElement("roost-room"); rf.setConfig({ name: "Hall", cards: [{ type: "custom:roost-tile", entity: "light.hall" }], cards_fold: true });
document.body.appendChild(rf); rf.hass = hass(true); await new Promise((r) => setTimeout(r, 20));
if (!rf.shadowRoot.querySelector(".kids").hidden) { fails++; console.error("FAIL room fold"); }
rf.shadowRoot.querySelector(".fold").dispatchEvent(new window.Event("click"));
if (rf.shadowRoot.querySelector(".kids").hidden) { fails++; console.error("FAIL room unfold"); }
// Rooms: a room opens from its link, a hidden room has no button, offline sensors say so.
const rl = document.createElement("roost-rooms");
rl.setConfig({ remember: false, rooms: [{ name: "Living", link: "#living", temperature: "sensor.offline", entities: ["light.kitchen"] }, { name: "Entrance", link: "#entrance", entities: ["light.hall"] }, { name: "Automations", link: "#automations", hidden: true, entities: ["automation.morning"] }] });
document.body.appendChild(rl); rl.hass = hass(true); await new Promise((r) => setTimeout(r, 20));
if (rl.shadowRoot.querySelectorAll(".pill").length !== 2 || !/No room sensor online/.test(rl.shadowRoot.innerHTML)) { fails++; console.error("FAIL rooms hidden / sensor note"); }
window.location.hash = "#automations"; window.dispatchEvent(new window.HashChangeEvent("hashchange"));
if (rl._active !== 2 || rl.shadowRoot.querySelector('.room[data-room="2"]').hidden) { fails++; console.error("FAIL rooms link", rl._active); }
rl.shadowRoot.querySelectorAll(".pill")[1].dispatchEvent(new window.Event("click"));
if (window.location.hash !== "#entrance") { fails++; console.error("FAIL rooms sets link", window.location.hash); }
window.location.hash = "";
// Any card can say it is not working right now.
const bk = document.createElement("roost-tile"); bk.setConfig({ entity: "cover.curtain", out_of_order: "The remote's battery is dead" }); document.body.appendChild(bk); bk.hass = hass(true);
if (!/Not working right now[\s\S]*battery is dead/.test(bk.shadowRoot.innerHTML)) { fails++; console.error("FAIL out of order note"); }
// Hero: a person with location off.
states["person.off"] = st("person.off", "unknown");
const hl = document.createElement("roost-hero"); hl.setConfig({ people: ["person.off"] }); document.body.appendChild(hl); hl.hass = hass(true);
if (!/Location off/.test(hl.shadowRoot.innerHTML)) { fails++; console.error("FAIL hero location off"); }
// Thermostat power through a script.
const tp = document.createElement("roost-thermostat"); tp.setConfig({ entity: "climate.living", power_action: { action: "perform-action", perform_action: "script.turn_on", target: { entity_id: "script.ac_power" } } }); document.body.appendChild(tp); tp.hass = hass(true);
calls.length = 0; tp.shadowRoot.querySelector(".pw").dispatchEvent(new window.Event("click")); await new Promise((r) => setTimeout(r, 5));
if (!calls.some((x) => x[0] === "script" && x[1] === "turn_on")) { fails++; console.error("FAIL thermostat power action", JSON.stringify(calls)); }
// Popup: opens from a device change, shows its parts, closes when the device goes back; confirmations use it too.
states["binary_sensor.doorbell"] = st("binary_sensor.doorbell", "off");
const pop = document.createElement("roost-popup");
pop.setConfig({ id: "doorbell", kind: "camera", title: "Someone is at the door", camera: "camera.door", entity: "lock.front", message: "The door is {{state}}", open_on: [{ entity: "binary_sensor.doorbell" }], buttons: [{ name: "Open the door", icon: "mdi:lock-open", color: "green", tap_action: { action: "perform-action", perform_action: "lock.unlock", target: { entity_id: "lock.front" } } }, { name: "Dismiss" }] });
document.body.appendChild(pop); pop.hass = hass(true);
const layer = () => document.querySelector("roost-popup-layer");
if (layer() && layer().style.display !== "none" && layer().shadowRoot.innerHTML.includes("Someone")) { fails++; console.error("FAIL popup opened too early"); }
states["binary_sensor.doorbell"] = st("binary_sensor.doorbell", "on", { }); states["binary_sensor.doorbell"].last_changed = new Date().toISOString();
pop.hass = hass(true);
const lt = () => layer()?.shadowRoot.innerHTML.replace(/<style>[\s\S]*?<\/style>/g, "") || "";
if (!/Someone is at the door/.test(lt()) || !/Open the door/.test(lt()) || !/The door is /.test(lt()) || /undefined|NaN|\bnull\b/.test(lt())) { fails++; console.error("FAIL popup opens with its parts", lt().slice(0, 300)); }
calls.length = 0; layer().shadowRoot.querySelector('[data-b="0"]').dispatchEvent(new window.Event("click")); await new Promise((r) => setTimeout(r, 10));
if (!calls.some((x) => x[0] === "lock" && x[1] === "unlock")) { fails++; console.error("FAIL popup button", JSON.stringify(calls)); }
if (layer().style.display !== "none") { fails++; console.error("FAIL popup closes after a button"); }
pop._prev = {}; states["binary_sensor.doorbell"] = { ...states["binary_sensor.doorbell"], last_changed: new Date().toISOString() }; pop.hass = hass(true);
states["binary_sensor.doorbell"] = st("binary_sensor.doorbell", "off"); pop.hass = hass(true);
if (layer().style.display !== "none") { fails++; console.error("FAIL popup closes when the bell stops"); }
const tl = document.createElement("roost-tile"); tl.setConfig({ entity: "switch.kettle", tap_action: { action: "toggle", confirmation: { text: "Turn the kettle off?" } } }); document.body.appendChild(tl); tl.hass = hass(true);
calls.length = 0; const ask = tl.run({ action: "toggle", confirmation: { text: "Turn the kettle off?" } }, "switch.kettle"); await new Promise((r) => setTimeout(r, 5));
if (!/Turn the kettle off\?/.test(lt())) { fails++; console.error("FAIL confirm popup"); }
layer().shadowRoot.querySelector('[data-b="1"]').dispatchEvent(new window.Event("click")); await ask;
if (!calls.some((x) => x[1] === "toggle")) { fails++; console.error("FAIL confirm yes runs it"); }
// Errors for missing settings
for (const [tag, cfg] of [["roost-tile", {}], ["roost-chips", { entities: [] }], ["roost-nav", { items: [] }], ["roost-rooms", { rooms: [] }]]) {
  const el = document.createElement(tag); el.setConfig(cfg); el.hass = hass(true);
  if (!el._setup || !/finish/.test(el.shadowRoot.textContent)) { fails++; console.error(`FAIL ${tag} shows no setup note for an empty config`); }
}
console.log(fails ? `${fails} failed` : `all ${cases.length * 2 + 31} checks passed`);
process.exit(fails ? 1 : 0);
