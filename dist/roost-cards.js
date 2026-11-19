/*
 * Roost Cards — beautiful, fully customisable dashboard cards for Home Assistant.
 * Phones and tablets, light and dark. One file, no build step.
 *
 * Cards: roost-tile, roost-chips, roost-thermostat, roost-scene, roost-hero, roost-nav, roost-rooms, roost-row, roost-curtain,
 *        roost-gauge, roost-automations, roost-clock, roost-title, roost-theme, roost-media, roost-room, roost-alarm, roost-light, roost-graph, roost-people, roost-alerts,
 *        roost-remote, roost-presence, roost-weather, roost-energy, roost-timer, roost-fan, roost-lock, roost-agenda, roost-todo, roost-camera, roost-sensors, roost-buttons,
 *        roost-fullscreen
 * Every card has a visual editor (colours, size, icon, shape and more).
 */

const ROOST_VERSION = "1.19.0";

// ------------------------------------------------------------------ look
const PALETTE = {
  dark: {
    bg: "#0B0D17", panel: "rgba(20,24,49,.86)", border: "#242A4D", text: "#EEF0FF", muted: "#9AA3D9",
    off: "#141831", inset: "#1D2244", track: "#262C52", knob: "#7C84B8", dial: "#171B3A", tick: "#5A5F95",
    offArc: ["#3A4170", "#5A5F95"],
  },
  light: {
    bg: "#EEF1FA", panel: "rgba(255,255,255,.92)", border: "#E2E5F2", text: "#161936", muted: "#5E668F",
    off: "#FFFFFF", inset: "#EEF0FA", track: "#DDE1F0", knob: "#A7AECB", dial: "#F4F5FC", tick: "#A9B0D6",
    offArc: ["#C9CEE8", "#A9B0D6"],
  },
};

// [gradient start, gradient end, glow, text on top]
const COLORS = {
  blue: ["#2F6BFF", "#38BDF8", "rgba(56,189,248,.5)", "#FFFFFF"],
  purple: ["#6D4BFF", "#B794FF", "rgba(139,92,246,.55)", "#FFFFFF"],
  coral: ["#F43F6B", "#FF8F6B", "rgba(255,107,107,.5)", "#FFFFFF"],
  green: ["#059669", "#34D399", "rgba(52,211,153,.45)", "#FFFFFF"],
  amber: ["#E07B00", "#F5A623", "rgba(245,158,11,.5)", "#FFFFFF"],
  teal: ["#0E9F8A", "#2BC4A8", "rgba(52,211,153,.5)", "#FFFFFF"],
  pink: ["#DB2777", "#F9A8D4", "rgba(236,72,153,.5)", "#FFFFFF"],
  slate: ["#475569", "#94A3B8", "rgba(100,116,139,.5)", "#FFFFFF"],
};
// The one colour for "this is the chosen / active one" (design rule 1).
const ACTIVE = ["#6D4BFF", "#8B6CFF", "rgba(109,75,255,.55)", "#FFFFFF"];
const FONT_TEXT = "Inter, -apple-system, 'Segoe UI', Roboto, sans-serif";
// Load Inter and Space Grotesk once, the same fonts the original dashboard uses.
try {
  if (typeof document !== "undefined" && !document.getElementById("roost-fonts") && !document.getElementById("nest-fonts")) {
    const l = document.createElement("link");
    l.id = "roost-fonts"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap";
    document.head.appendChild(l);
  }
} catch (e) { /* fonts fall back to the system font */ }
const FONT_NUM = "'Space Grotesk', Inter, -apple-system, 'Segoe UI', Roboto, sans-serif";
const COLOR_OPTIONS = [{ value: "active", label: "Selected purple" }, ...Object.keys(COLORS).map((k) => ({ value: k, label: k[0].toUpperCase() + k.slice(1) })), { value: "custom", label: "My own colours" }, { value: "lamp", label: "The light's own colour (lights)" }];
const SIZES = { compact: 100, small: 128, medium: 152, large: 176 };
// Ready-made skies for the hero card: [gradient, name in the editor]
const SKIES = {
  day: ["linear-gradient(115deg,#2563EB 0%,#60A5FA 50%,#FDBA74 100%)", "Day sky"],
  night: ["linear-gradient(115deg,#1B1E52 0%,#38287E 52%,#7A3A90 100%)", "Night sky"],
  sunrise: ["linear-gradient(115deg,#F472B6 0%,#FB923C 55%,#FDE68A 100%)", "Sunrise"],
  sunset: ["linear-gradient(115deg,#7C3AED 0%,#EC4899 55%,#F97316 100%)", "Sunset"],
  ocean: ["linear-gradient(115deg,#0E7490 0%,#0EA5E9 55%,#67E8F9 100%)", "Ocean"],
  aurora: ["linear-gradient(115deg,#064E3B 0%,#10B981 45%,#6366F1 100%)", "Aurora"],
  desert: ["linear-gradient(115deg,#B45309 0%,#F59E0B 50%,#FDE68A 100%)", "Desert"],
};

// A curtain whose motor reports the other way round (99% open = really 1% open): flip it.
const FLIP_STATE = { open: "closed", closed: "open", opening: "closing", closing: "opening" };
function coverView(s, reverse) {
  if (!s) return { state: "unknown", pos: null };
  let pos = s.attributes.current_position;
  if (pos != null && reverse) pos = 100 - pos;
  let state = reverse ? FLIP_STATE[s.state] || s.state : s.state;
  // when the position is known, it decides open or closed (some integrations mix the two up)
  if (pos != null && (state === "open" || state === "closed")) state = pos > 0 ? "open" : "closed";
  return { state, pos };
}
// Curtains set to "reverse" in any Roost card. Every command to them (from any card or the details sheet)
// is turned around in one place, so Open always opens and Close always closes.
const RoostReversed = (window.RoostReversed ||= new Set());
function fixCover(domain, service, data) {
  if (domain !== "cover" || !data) return [service, data];
  const ids = [].concat(data.entity_id || []);
  if (!ids.length || !ids.every((id) => RoostReversed.has(id))) return [service, data];
  if (service === "open_cover") return ["close_cover", data];
  if (service === "close_cover") return ["open_cover", data];
  if (service === "set_cover_position" && data.position != null) return [service, { ...data, position: 100 - Number(data.position) }];
  return [service, data];
}
const REVERSE_FIELD = { name: "reverse", label: "Reverse (my curtain reports open and closed the wrong way round)", selector: { boolean: {} } };

// Small helpers for the settings screens and for the shared looks.
const pick = (pairs) => ({ select: { mode: "dropdown", options: pairs.map(([value, label]) => ({ value, label })) } });
const slider = (min, max, step = 1, unit = "px") => ({ number: { min, max, step, mode: "slider", unit_of_measurement: unit } });
const FILL_OPTIONS = pick([["gradient", "Colour fade"], ["solid", "One colour"], ["glass", "See-through glass"], ["outline", "Coloured outline only"]]);
const GLOW_OPTIONS = pick([["soft", "Soft glow"], ["strong", "Strong glow"], ["none", "No glow"]]);
const SHAPE_OPTIONS = pick([["rounded", "Rounded square"], ["circle", "Circle"], ["square", "Square"], ["none", "No box, just the icon"]]);
const ANIMATIONS = { spin: "roost-spin 1.3s linear infinite", glow: "roost-glow 2s ease-in-out infinite", pulse: "roost-pulse 1.6s ease-in-out infinite",
  bounce: "roost-bounce 1.4s ease-in-out infinite", wiggle: "roost-wiggle 1.2s ease-in-out infinite" };
// The corner roundness for a box of a given size in a given shape.
const shapeRadius = (shape, box) => (shape === "circle" ? "50%" : shape === "square" ? `${Math.round(box * 0.14)}px` : `${Math.round(box * 0.34)}px`);
// Background, text colour, border and shadow for something "on" in a colour, in one of the fill styles.
function fillLook(fill, glow, g, p) {
  const shadow = glow === "none" ? "none" : glow === "strong" ? `0 22px 44px -10px ${g[2]},0 0 26px -8px ${g[2]}` : `0 18px 36px -14px ${g[2]}`;
  if (fill === "solid") return { bg: g[0], fg: g[3], border: "transparent", shadow, light: true };
  if (fill === "glass") return { bg: `color-mix(in srgb, ${g[0]} 26%, ${p.panel})`, fg: p.text, border: `color-mix(in srgb, ${g[0]} 55%, transparent)`, shadow, light: false, blur: true };
  if (fill === "outline") return { bg: p.off, fg: p.text, border: g[0], shadow: glow === "none" ? "none" : `0 0 0 1px ${g[0]},0 14px 30px -18px ${g[2]}`, light: false };
  return { bg: `linear-gradient(135deg,${g[0]} 0%,${g[1]} 100%)`, fg: g[3], border: "transparent", shadow, light: true };
}

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const rgb = (v) => (Array.isArray(v) && v.length === 3 ? `rgb(${v.join(",")})` : typeof v === "string" && v ? v : null);
const UNAVAILABLE = ["unavailable", "unknown"];
const OFF_STATES = ["off", "closed", "idle", "standby", "disarmed", "not_home", "locked", "paused"];

function since(iso) {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `for ${m} min`;
  if (m < 1440) return `for ${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ""}`;
  const d = Math.floor(m / 1440);
  return `for ${d} day${d > 1 ? "s" : ""}`;
}

const KEYFRAMES = `
@keyframes roost-spin{to{transform:rotate(360deg)}}
@keyframes roost-glow{0%,100%{filter:drop-shadow(0 0 2px rgba(255,255,255,.4))}50%{filter:drop-shadow(0 0 10px rgba(255,255,255,.95))}}
@keyframes roost-breathe{0%,100%{opacity:.5}50%{opacity:1}}
@keyframes roost-arc{0%,100%{filter:drop-shadow(0 0 6px rgba(56,189,248,.45))}50%{filter:drop-shadow(0 0 18px rgba(139,92,246,.85))}}
@keyframes roost-tick{0%{opacity:1}65%{opacity:1}100%{opacity:0}}
@keyframes roost-twinkle{0%,100%{opacity:.15}50%{opacity:1}}
@keyframes roost-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes roost-sheen{0%{transform:translateX(-140%) skewX(-18deg)}60%,100%{transform:translateX(900%) skewX(-18deg)}}
@keyframes roost-ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.6);opacity:0}}
@keyframes roost-eq{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}
@keyframes roost-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.14)}}
@keyframes roost-bounce{0%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}60%{transform:translateY(-2px)}}
@keyframes roost-wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-10deg)}75%{transform:rotate(10deg)}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}`;

// ------------------------------------------------------------------ Sample devices
// "Try it with sample data": a card set to `sample: true` shows pretend devices that react to taps,
// so people can see a card before they own the device. Nothing is sent to Home Assistant for them.
const SAMPLE_DOOR = `data:image/svg+xml;base64,${typeof btoa === "function" ? btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8dccb"/><stop offset="1" stop-color="#cdbda6"/></linearGradient><linearGradient id="d" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a4a2a"/><stop offset="1" stop-color="#5a3519"/></linearGradient></defs><rect width="400" height="300" fill="url(#w)"/><rect x="0" y="250" width="400" height="50" fill="#b9a68c"/><rect x="140" y="40" width="130" height="215" rx="4" fill="url(#d)"/><rect x="152" y="54" width="106" height="88" rx="3" fill="#6b4022"/><rect x="152" y="152" width="106" height="88" rx="3" fill="#6b4022"/><circle cx="252" cy="152" r="6" fill="#d9b24a"/><rect x="92" y="96" width="30" height="40" rx="4" fill="#f4efe6"/><text x="107" y="124" font-family="Arial" font-size="20" text-anchor="middle" fill="#5a4a3a">12</text><circle cx="330" cy="236" r="26" fill="#3f7d4a"/><rect x="322" y="250" width="16" height="22" fill="#8a5a3a"/></svg>`) : ""}`;

const Sample = {
  cards: new Set(),
  timers: {},
  states: null,

  make() {
    const now = new Date(Date.now() - 3600e3).toISOString(), st = (entity_id, state, attributes) => ({ entity_id, state, attributes, last_changed: now, last_updated: now });
    const keys = ["Power", "Up", "Down", "Left", "Right", "OK", "Back", "Home", "Menu", "Vol up", "Vol down", "Mute", "Ch up", "Ch down", "Input", "Rewind", "Previous", "Play pause", "Next", "Fast forward", "Red", "Green", "Yellow", "Blue", "Info"];
    const s = {
      "fan.sample_fan": st("fan.sample_fan", "on", { friendly_name: "Bedroom fan", percentage: 66, percentage_step: 33.33, oscillating: true, preset_modes: ["Breeze", "Sleep"], preset_mode: "Breeze", supported_features: 63 }),
      "lock.sample_front_door": st("lock.sample_front_door", "locked", { friendly_name: "Front door" }),
      "binary_sensor.sample_front_door": st("binary_sensor.sample_front_door", "off", { friendly_name: "Front door", device_class: "door" }),
      "camera.sample_door": st("camera.sample_door", "idle", { friendly_name: "Front door", entity_picture: SAMPLE_DOOR }),
      "binary_sensor.sample_doorbell": st("binary_sensor.sample_doorbell", "off", { friendly_name: "Doorbell", device_class: "occupancy" }),
      "timer.sample_kettle": st("timer.sample_kettle", "idle", { friendly_name: "Kettle", duration: "0:05:00" }),
      "vacuum.sample_robot": st("vacuum.sample_robot", "docked", { friendly_name: "Robot vacuum", fan_speed: "Balanced", fan_speed_list: ["Quiet", "Balanced", "Turbo", "Max"], status: "Charging", supported_features: 32764 }),
      "sensor.sample_robot_battery": st("sensor.sample_robot_battery", "86", { friendly_name: "Robot vacuum Battery", device_class: "battery", unit_of_measurement: "%" }),
      "sensor.sample_robot_area": st("sensor.sample_robot_area", "0", { friendly_name: "Robot vacuum Cleaning area", unit_of_measurement: "m²" }),
      "sensor.sample_robot_time": st("sensor.sample_robot_time", "0", { friendly_name: "Robot vacuum Cleaning time", unit_of_measurement: "min", device_class: "duration" }),
      "sensor.sample_robot_filter": st("sensor.sample_robot_filter", "62", { friendly_name: "Robot vacuum Filter", unit_of_measurement: "%" }),
      "sensor.sample_robot_main_brush": st("sensor.sample_robot_main_brush", "78", { friendly_name: "Robot vacuum Main brush", unit_of_measurement: "%" }),
      "sensor.sample_robot_side_brush": st("sensor.sample_robot_side_brush", "34", { friendly_name: "Robot vacuum Side brush", unit_of_measurement: "%" }),
      "sensor.sample_robot_mop_pad": st("sensor.sample_robot_mop_pad", "12", { friendly_name: "Robot vacuum Mop pad", unit_of_measurement: "%" }),
      "select.sample_robot_water": st("select.sample_robot_water", "Medium", { friendly_name: "Robot vacuum Water flow", options: ["Off", "Low", "Medium", "High"] }),
      "select.sample_robot_mode": st("select.sample_robot_mode", "Vacuum and mop", { friendly_name: "Robot vacuum Cleaning mode", options: ["Vacuum", "Mop", "Vacuum and mop", "Mop after vacuum"] }),
      "fan.sample_purifier": st("fan.sample_purifier", "on", { friendly_name: "Air purifier", percentage: 50, percentage_step: 25, preset_modes: ["Auto", "Sleep", "Turbo"], preset_mode: "Auto" }),
      "sensor.sample_pm25": st("sensor.sample_pm25", "14", { friendly_name: "PM2.5", unit_of_measurement: "µg/m³", device_class: "pm25" }),
      "sensor.sample_purifier_filter": st("sensor.sample_purifier_filter", "64", { friendly_name: "Filter life", unit_of_measurement: "%" }),
      "sensor.sample_room_temp": st("sensor.sample_room_temp", "23.5", { friendly_name: "Temperature", unit_of_measurement: "°C", device_class: "temperature" }),
      "sensor.sample_room_hum": st("sensor.sample_room_hum", "48", { friendly_name: "Humidity", unit_of_measurement: "%", device_class: "humidity" }),
      "water_heater.sample_heater": st("water_heater.sample_heater", "electric", { friendly_name: "Water heater", current_temperature: 46, temperature: 60, min_temp: 30, max_temp: 75, operation_list: ["off", "eco", "electric", "performance"], operation_mode: "electric" }),
      "timer.sample_heater": st("timer.sample_heater", "idle", { friendly_name: "Water heater timer", duration: "0:30:00" }),
      "sensor.sample_washer_state": st("sensor.sample_washer_state", "rinse", { friendly_name: "Washing machine" }),
      "sensor.sample_washer_left": st("sensor.sample_washer_left", "23", { friendly_name: "Time left", unit_of_measurement: "min" }),
      "sensor.sample_washer_progress": st("sensor.sample_washer_progress", "64", { friendly_name: "Progress", unit_of_measurement: "%" }),
      "cover.sample_garage": st("cover.sample_garage", "closed", { friendly_name: "Garage", device_class: "garage", current_position: 0 }),
      "sensor.sample_solar": st("sensor.sample_solar", "3240", { friendly_name: "Solar", unit_of_measurement: "W", device_class: "power" }),
      "sensor.sample_battery_power": st("sensor.sample_battery_power", "-850", { friendly_name: "Battery", unit_of_measurement: "W", device_class: "power" }),
      "sensor.sample_battery_level": st("sensor.sample_battery_level", "64", { friendly_name: "Battery level", unit_of_measurement: "%", device_class: "battery" }),
      "sensor.sample_grid": st("sensor.sample_grid", "-1130", { friendly_name: "Grid", unit_of_measurement: "W", device_class: "power" }),
      "sensor.sample_house": st("sensor.sample_house", "1260", { friendly_name: "House", unit_of_measurement: "W", device_class: "power" }),
      "switch.sample_zone_1": st("switch.sample_zone_1", "on", { friendly_name: "Front lawn" }),
      "switch.sample_zone_2": st("switch.sample_zone_2", "off", { friendly_name: "Back lawn" }),
      "switch.sample_zone_3": st("switch.sample_zone_3", "off", { friendly_name: "Flower beds" }),
      "switch.sample_zone_4": st("switch.sample_zone_4", "off", { friendly_name: "Trees" }),
      "sensor.sample_rain": st("sensor.sample_rain", "0", { friendly_name: "Rain today", unit_of_measurement: "mm" }),
      "sensor.sample_ev_battery": st("sensor.sample_ev_battery", "58", { friendly_name: "Car battery", unit_of_measurement: "%", device_class: "battery" }),
      "sensor.sample_ev_range": st("sensor.sample_ev_range", "214", { friendly_name: "Range", unit_of_measurement: "km" }),
      "sensor.sample_ev_power": st("sensor.sample_ev_power", "7.2", { friendly_name: "Charging power", unit_of_measurement: "kW", device_class: "power" }),
      "switch.sample_ev_charging": st("switch.sample_ev_charging", "on", { friendly_name: "Charging" }),
      "binary_sensor.sample_ev_plugged": st("binary_sensor.sample_ev_plugged", "on", { friendly_name: "Plugged in", device_class: "plug" }),
      "number.sample_ev_limit": st("number.sample_ev_limit", "80", { friendly_name: "Charge limit", unit_of_measurement: "%" }),
      "sensor.sample_bat_hall": st("sensor.sample_bat_hall", "12", { friendly_name: "Hallway motion battery", unit_of_measurement: "%", device_class: "battery" }),
      "sensor.sample_bat_door": st("sensor.sample_bat_door", "64", { friendly_name: "Front door sensor battery", unit_of_measurement: "%", device_class: "battery" }),
      "sensor.sample_bat_leak": st("sensor.sample_bat_leak", "91", { friendly_name: "Kitchen leak sensor battery", unit_of_measurement: "%", device_class: "battery" }),
      "sensor.sample_bat_remote": st("sensor.sample_bat_remote", "27", { friendly_name: "Living room remote battery", unit_of_measurement: "%", device_class: "battery" }),
      "sensor.sample_bat_thermo": st("sensor.sample_bat_thermo", "unavailable", { friendly_name: "Bedroom thermometer battery", unit_of_measurement: "%", device_class: "battery" }),
      "binary_sensor.sample_bat_smoke": st("binary_sensor.sample_bat_smoke", "off", { friendly_name: "Smoke alarm battery", device_class: "battery" }),
      "binary_sensor.sample_leak": st("binary_sensor.sample_leak", "off", { friendly_name: "Kitchen leak sensor", device_class: "moisture" }),
      "input_number.sample_ac_night": st("input_number.sample_ac_night", "24", { friendly_name: "AC at night", min: 18, max: 30, step: 0.5, unit_of_measurement: "°C", icon: "mdi:snowflake" }),
      "input_select.sample_guest": st("input_select.sample_guest", "family", { friendly_name: "Who is visiting", options: ["nobody", "family", "friends", "workers"], icon: "mdi:account-group" }),
      "input_boolean.sample_guests": st("input_boolean.sample_guests", "on", { friendly_name: "Guest mode", icon: "mdi:account-heart" }),
      "input_text.sample_note": st("input_text.sample_note", "Gate code 4512", { friendly_name: "Note for the cleaner", max: 60, icon: "mdi:note-text-outline" }),
      "sensor.sample_plant_moisture": st("sensor.sample_plant_moisture", "16", { friendly_name: "Monstera moisture", unit_of_measurement: "%", device_class: "moisture" }),
      "sensor.sample_plant_light": st("sensor.sample_plant_light", "5200", { friendly_name: "Light", unit_of_measurement: "lx", device_class: "illuminance" }),
      "sensor.sample_plant_temp": st("sensor.sample_plant_temp", "24", { friendly_name: "Temperature", unit_of_measurement: "°C", device_class: "temperature" }),
      "sensor.sample_ink_black": st("sensor.sample_ink_black", "64", { friendly_name: "Black", unit_of_measurement: "%" }),
      "sensor.sample_ink_cyan": st("sensor.sample_ink_cyan", "22", { friendly_name: "Cyan", unit_of_measurement: "%" }),
      "sensor.sample_ink_magenta": st("sensor.sample_ink_magenta", "48", { friendly_name: "Magenta", unit_of_measurement: "%" }),
      "sensor.sample_ink_yellow": st("sensor.sample_ink_yellow", "9", { friendly_name: "Yellow", unit_of_measurement: "%" }),
      "sensor.sample_printer": st("sensor.sample_printer", "idle", { friendly_name: "Printer" }),
      "sensor.sample_3d_progress": st("sensor.sample_3d_progress", "42", { friendly_name: "Print progress", unit_of_measurement: "%" }),
      "sensor.sample_3d_left": st("sensor.sample_3d_left", "72", { friendly_name: "Time left", unit_of_measurement: "min" }),
      "sensor.sample_3d_nozzle": st("sensor.sample_3d_nozzle", "215", { friendly_name: "Nozzle", unit_of_measurement: "°C" }),
      "sensor.sample_3d_bed": st("sensor.sample_3d_bed", "60", { friendly_name: "Bed", unit_of_measurement: "°C" }),
      "sensor.sample_3d_state": st("sensor.sample_3d_state", "printing", { friendly_name: "3D printer" }),
      "zone.sample_home": st("zone.sample_home", "2", { friendly_name: "Home", latitude: 26.2, longitude: 50.58, radius: 120, icon: "mdi:home" }),
      "zone.sample_work": st("zone.sample_work", "1", { friendly_name: "Work", latitude: 26.235, longitude: 50.54, radius: 300, icon: "mdi:briefcase" }),
      "zone.sample_school": st("zone.sample_school", "0", { friendly_name: "School", latitude: 26.18, longitude: 50.61, radius: 200, icon: "mdi:school" }),
      "person.sample_saeed": st("person.sample_saeed", "home", { friendly_name: "Saeed", latitude: 26.2, longitude: 50.58 }),
      "person.sample_layla": st("person.sample_layla", "Work", { friendly_name: "Layla", latitude: 26.235, longitude: 50.541 }),
      "person.sample_daniel": st("person.sample_daniel", "not_home", { friendly_name: "Daniel", latitude: 26.188, longitude: 50.565 }),
      "sensor.sample_tank_level": st("sensor.sample_tank_level", "62", { friendly_name: "Water tank", unit_of_measurement: "%" }),
      "sensor.sample_tank_used": st("sensor.sample_tank_used", "380", { friendly_name: "Used today", unit_of_measurement: "L" }),
      "binary_sensor.sample_tank_leak": st("binary_sensor.sample_tank_leak", "off", { friendly_name: "Leak", device_class: "moisture" }),
      "switch.sample_tank_pump": st("switch.sample_tank_pump", "off", { friendly_name: "Water pump" }),
      "sensor.sample_pool_temp": st("sensor.sample_pool_temp", "28.5", { friendly_name: "Pool", unit_of_measurement: "°C" }),
      "sensor.sample_pool_cl": st("sensor.sample_pool_cl", "1.8", { friendly_name: "Chlorine", unit_of_measurement: "ppm" }),
      "sensor.sample_pool_ph": st("sensor.sample_pool_ph", "7.7", { friendly_name: "pH" }),
      "switch.sample_pool_pump": st("switch.sample_pool_pump", "on", { friendly_name: "Pool pump" }),
      "switch.sample_pool_heater": st("switch.sample_pool_heater", "off", { friendly_name: "Pool heater" }),
      "light.sample_pool_light": st("light.sample_pool_light", "off", { friendly_name: "Pool light" }),
      "button.sample_pet_feed": st("button.sample_pet_feed", new Date(Date.now() - 3 * 3600e3).toISOString(), { friendly_name: "Feed" }),
      "sensor.sample_pet_food": st("sensor.sample_pet_food", "46", { friendly_name: "Food", unit_of_measurement: "%" }),
      "sensor.sample_pet_water": st("sensor.sample_pet_water", "71", { friendly_name: "Water", unit_of_measurement: "%" }),
      "sensor.sample_pet_meals": st("sensor.sample_pet_meals", "2", { friendly_name: "Meals today" }),
      "sensor.sample_baby_temp": st("sensor.sample_baby_temp", "22.5", { friendly_name: "Temperature", unit_of_measurement: "°C" }),
      "sensor.sample_baby_hum": st("sensor.sample_baby_hum", "50", { friendly_name: "Humidity", unit_of_measurement: "%" }),
      "sensor.sample_baby_sound": st("sensor.sample_baby_sound", "34", { friendly_name: "Sound", unit_of_measurement: "dB" }),
      "light.sample_night_light": st("light.sample_night_light", "on", { friendly_name: "Night light" }),
      "media_player.sample_lullaby": st("media_player.sample_lullaby", "paused", { friendly_name: "Lullaby" }),
      "sensor.sample_net_down": st("sensor.sample_net_down", "486", { friendly_name: "Download", unit_of_measurement: "Mbit/s" }),
      "sensor.sample_net_up": st("sensor.sample_net_up", "94", { friendly_name: "Upload", unit_of_measurement: "Mbit/s" }),
      "sensor.sample_net_ping": st("sensor.sample_net_ping", "12", { friendly_name: "Ping", unit_of_measurement: "ms" }),
      "sensor.sample_net_clients": st("sensor.sample_net_clients", "23", { friendly_name: "Devices online" }),
      "button.sample_router_restart": st("button.sample_router_restart", "unknown", { friendly_name: "Restart router" }),
      "sensor.sample_srv_cpu": st("sensor.sample_srv_cpu", "18", { friendly_name: "CPU", unit_of_measurement: "%" }),
      "sensor.sample_srv_mem": st("sensor.sample_srv_mem", "64", { friendly_name: "Memory", unit_of_measurement: "%" }),
      "sensor.sample_srv_disk": st("sensor.sample_srv_disk", "81", { friendly_name: "Disk", unit_of_measurement: "%" }),
      "sensor.sample_srv_temp": st("sensor.sample_srv_temp", "47", { friendly_name: "Temperature", unit_of_measurement: "°C" }),
      ...(() => {
        const day = (n) => { const d = new Date(Date.now() + n * 864e5); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
        const products = [["Milk", 1, 2], ["Chicken", -1, 1], ["Yoghurt", 0, 4], ["Spinach", 2, 1], ["Hummus", 3, 1], ["Eggs", 12, 10], ["Rice", 300, 2]].map(([name, n, a], i) => ({ id: i + 1, name, best_before_date: day(n), available_amount: a }));
        const shop = [["Bread", 1], ["Tomatoes", 6], ["Laban", 2], ["Coffee", 1], ["Dates", 1]].map(([name, a], i) => ({ id: i + 1, product_id: 20 + i, amount: a, note: "", product: { id: 20 + i, name } }));
        const users = [{ id: 1, display_name: "Layla" }, { id: 2, display_name: "Daniel" }, { id: 3, display_name: "Saeed" }];
        const chores = [["Water the plants", -1, 0], ["Take out the bins", 0, 2], ["Clean the fridge", 2, 1], ["Change the bedsheets", 4, 0]].map(([name, n, u], i) => ({ id: i + 1, name, next_estimated_execution_time: `${day(n)} 18:00:00`, next_execution_assigned_user: users[u] }));
        const tasks = [["Book the car service", 1], ["Renew the gym card", 5]].map(([name, n], i) => ({ id: i + 1, name, due_date: day(n), done: 0 }));
        const meals = [[0, "Machboos", "Lunch"], [0, "Lentil soup", "Dinner"], [1, "Shakshuka", "Breakfast"], [1, "Grilled fish", "Dinner"], [2, "Pasta bake", "Dinner"]].map(([n, name, sec], i) => ({ id: i + 1, day: day(n), recipe: { id: i + 1, name }, section: { name: sec } }));
        return {
          "sensor.sample_grocy_stock": st("sensor.sample_grocy_stock", String(products.length), { friendly_name: "Grocy stock", products, count: products.length }),
          "sensor.sample_grocy_shopping": st("sensor.sample_grocy_shopping", String(shop.length), { friendly_name: "Grocy shopping list", products: shop, count: shop.length }),
          "sensor.sample_grocy_chores": st("sensor.sample_grocy_chores", String(chores.length), { friendly_name: "Grocy chores", chores, count: chores.length }),
          "sensor.sample_grocy_tasks": st("sensor.sample_grocy_tasks", String(tasks.length), { friendly_name: "Grocy tasks", tasks, count: tasks.length }),
          "sensor.sample_grocy_meals": st("sensor.sample_grocy_meals", String(meals.length), { friendly_name: "Grocy meal plan", meals, count: meals.length }),
          "binary_sensor.sample_grocy_missing": st("binary_sensor.sample_grocy_missing", "on", { friendly_name: "Grocy missing products", missing_products: [{ id: 30, name: "Olive oil", amount_missing: 1 }, { id: 31, name: "Salt", amount_missing: 1 }], count: 2 }),
        };
      })(),
      "button.sample_robot_empty": st("button.sample_robot_empty", "unknown", { friendly_name: "Robot vacuum Empty dustbin", icon: "mdi:delete-empty-outline" }),
      "button.sample_robot_wash": st("button.sample_robot_wash", "unknown", { friendly_name: "Robot vacuum Wash the mop", icon: "mdi:water-sync" }),
    };
    keys.forEach((k) => { const id = `button.sample_tv_${k.toLowerCase().replace(/ /g, "_")}`; s[id] = st(id, "unknown", { friendly_name: `Sample TV ${k}`, remote: "Sample TV" }); });
    return s;
  },

  set(id, state, attrs = {}) {
    const o = this.states[id];
    this.states[id] = { ...o, state: state == null ? o.state : state, attributes: { ...o.attributes, ...attrs }, last_changed: new Date().toISOString() };
    this.cards.forEach((card) => { if (!card.isConnected) { this.cards.delete(card); return; } card._sig = null; card.hass = card._realHass; });
  },

  // The pretend Grocy: ticking off, doing chores, using food.
  grocy(service, data = {}) {
    const upd = (id, key, fn) => { const s = this.states[id]; if (!s) return; const list = fn([...(s.attributes[key] || [])]); this.set(id, String(list.length), { [key]: list, count: list.length }); };
    if (service === "remove_product_in_shopping_list") upd("sensor.sample_grocy_shopping", "products", (l) => l.filter((x) => x.product_id !== data.product_id));
    else if (service === "execute_chore") upd("sensor.sample_grocy_chores", "chores", (l) => l.map((x) => (x.id === data.chore_id ? { ...x, next_estimated_execution_time: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10) + " 18:00:00" } : x)));
    else if (service === "complete_task") upd("sensor.sample_grocy_tasks", "tasks", (l) => l.filter((x) => x.id !== data.task_id));
    else if (service === "consume_product_from_stock" || service === "open_product") upd("sensor.sample_grocy_stock", "products", (l) => l.map((x) => (x.id === data.product_id ? { ...x, available_amount: Math.max(0, x.available_amount - (data.amount || 1)) } : x)));
    else if (service === "add_missing_products_to_shopping_list") {
      const miss = this.states["binary_sensor.sample_grocy_missing"].attributes.missing_products || [];
      upd("sensor.sample_grocy_shopping", "products", (l) => [...l, ...miss.filter((m) => !l.some((x) => x.product_id === m.id)).map((m) => ({ id: 100 + m.id, product_id: m.id, amount: m.amount_missing, note: "", product: { id: m.id, name: m.name } }))]);
      this.set("binary_sensor.sample_grocy_missing", "off", { missing_products: [], count: 0 });
    }
  },

  // What a pretend device does when a card asks it to do something.
  act(domain, service, data = {}) {
    const ids = [].concat(data.entity_id || []), id = ids[0], s = this.states[id];
    if (!s) return;
    if (domain === "fan" || (domain === "homeassistant" && id.startsWith("fan."))) {
      if (service === "set_percentage") return this.set(id, data.percentage ? "on" : "off", { percentage: data.percentage });
      if (service === "oscillate") return this.set(id, null, { oscillating: data.oscillating });
      if (service === "set_preset_mode") return this.set(id, "on", { preset_mode: data.preset_mode });
      if (service === "turn_on") return this.set(id, "on", { percentage: s.attributes.percentage || 33 });
      if (service === "turn_off") return this.set(id, "off");
      return this.set(id, s.state === "on" ? "off" : "on");
    }
    if (domain === "lock" || id.startsWith("lock.")) {
      const to = service === "unlock" || service === "open" || (service === "toggle" && s.state === "locked") ? "unlocked" : "locked";
      this.set(id, to === "unlocked" ? "unlocking" : "locking");
      setTimeout(() => this.set(id, to), 900);
      return undefined;
    }
    if (domain === "timer") {
      clearTimeout(this.timers[id]);
      if (service === "start") {
        const dur = data.duration || (s.state === "paused" ? s.attributes.remaining : s.attributes.duration) || "0:05:00";
        const [h, m, x] = String(dur).split(":").map(Number), ms = ((h || 0) * 3600 + (m || 0) * 60 + (x || 0)) * 1000;
        this.set(id, "active", { duration: data.duration || s.attributes.duration, finishes_at: new Date(Date.now() + ms).toISOString(), remaining: dur });
        this.timers[id] = setTimeout(() => this.set(id, "idle", { finishes_at: null }), ms);
      } else if (service === "pause" && s.state === "active") {
        const left = Math.max(0, Math.round((new Date(s.attributes.finishes_at) - Date.now()) / 1000));
        this.set(id, "paused", { remaining: `${Math.floor(left / 3600)}:${String(Math.floor((left % 3600) / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`, finishes_at: null });
      } else if (service === "cancel" || service === "finish") this.set(id, "idle", { finishes_at: null });
      return undefined;
    }
    if (domain === "vacuum") {
      clearTimeout(this.timers[id]); clearInterval(this.timers[`${id}_run`]);
      const run = (status) => {
        this.set(id, "cleaning", { status });
        this.timers[`${id}_run`] = setInterval(() => {
          const ar = this.states["sensor.sample_robot_area"], tm = this.states["sensor.sample_robot_time"], bt = this.states["sensor.sample_robot_battery"];
          this.states["sensor.sample_robot_area"] = { ...ar, state: String(Math.round((Number(ar.state) + 0.4) * 10) / 10) };
          this.states["sensor.sample_robot_time"] = { ...tm, state: String(Number(tm.state) + 1) };
          this.set("sensor.sample_robot_battery", String(Math.max(15, Number(bt.state) - 1)));
        }, 4000);
      };
      if (service === "start" || service === "clean_area") { if (s.state !== "paused") { this.states["sensor.sample_robot_area"].state = "0"; this.states["sensor.sample_robot_time"].state = "0"; } run(service === "clean_area" ? "Cleaning rooms" : "Cleaning"); }
      else if (service === "clean_spot") run("Spot cleaning");
      else if (service === "pause") this.set(id, "paused", { status: "Paused" });
      else if (service === "stop") this.set(id, "idle", { status: "Idle" });
      else if (service === "return_to_base") { this.set(id, "returning", { status: "Going home" }); this.timers[id] = setTimeout(() => this.set(id, "docked", { status: "Charging" }), 6000); }
      else if (service === "set_fan_speed") this.set(id, null, { fan_speed: data.fan_speed });
      return undefined;
    }
    if (domain === "select") return this.set(id, data.option);
    if (domain === "input_select") return this.set(id, data.option);
    if (domain === "input_number" || domain === "input_text" || domain === "number" || domain === "text") return this.set(id, String(data.value));
    if (domain === "counter") return this.set(id, String(Number(s.state) + (service === "increment" ? 1 : service === "decrement" ? -1 : 0)));
    if (domain === "water_heater") {
      if (service === "set_temperature") return this.set(id, null, { temperature: data.temperature });
      if (service === "set_operation_mode") return this.set(id, data.operation_mode, { operation_mode: data.operation_mode });
      if (service === "turn_off") return this.set(id, "off", { operation_mode: "off" });
      if (service === "turn_on") return this.set(id, "electric", { operation_mode: "electric" });
    }
    if (domain === "cover") {
      const to = service === "open_cover" ? "open" : service === "close_cover" ? "closed" : null;
      if (!to) return this.set(id, s.attributes.current_position > 50 ? "open" : "closed");
      this.set(id, to === "open" ? "opening" : "closing");
      this.timers[id] = setTimeout(() => this.set(id, to, { current_position: to === "open" ? 100 : 0 }), 6000);
      return undefined;
    }
    if (domain === "light") return this.set(id, service === "turn_on" ? "on" : service === "turn_off" ? "off" : s.state === "on" ? "off" : "on");
    if (domain === "media_player") return this.set(id, s.state === "playing" ? "paused" : "playing");
    if (domain === "button") return this.set(id, new Date().toISOString());
    if (domain === "switch" || domain === "input_boolean") return this.set(id, service === "turn_on" ? "on" : service === "turn_off" ? "off" : s.state === "on" ? "off" : "on");
    if (domain === "camera" || domain === "button") return undefined;
    return undefined;
  },

  wrap(hass, card) {
    if (!this.states) this.states = this.make();
    this.cards.add(card);
    // the sample doorbell rings now and then, so the camera card shows its banner
    if (card.localName === "roost-camera" && !this.bell) this.bell = setInterval(() => { if ([...this.cards].some((x) => x.isConnected && x.localName === "roost-camera")) { this.set("binary_sensor.sample_doorbell", "on"); setTimeout(() => this.set("binary_sensor.sample_doorbell", "off"), 6000); } }, 30000);
    const merged = Object.create(hass);
    merged.states = { ...hass.states, ...this.states };
    merged.callService = (domain, service, data = {}, target) => {
      const ids = [].concat(data.entity_id || target?.entity_id || []);
      if (ids.length && ids.every((i) => this.states[i])) { this.act(domain, service, { ...data, entity_id: ids }); return Promise.resolve(); }
      return hass.callService(domain, service, data, target);
    };
    return merged;
  },
};

// ------------------------------------------------------------------ shared base
class RoostBase extends HTMLElement {
  static get defaults() { return {}; }

  setConfig(config) {
    if (!config) throw new Error("Missing configuration");
    if (config.sample) {
      const fill = { "roost-fan": { entity: "fan.sample_fan" }, "roost-lock": { entity: "lock.sample_front_door", door: "binary_sensor.sample_front_door" }, "roost-camera": { entity: "camera.sample_door", doorbell: "binary_sensor.sample_doorbell" },
        "roost-timer": { entity: "timer.sample_kettle" },
        "roost-air": { entity: "fan.sample_purifier", air: "sensor.sample_pm25", filter: "sensor.sample_purifier_filter", temperature: "sensor.sample_room_temp", humidity: "sensor.sample_room_hum" },
        "roost-water-heater": { entity: "water_heater.sample_heater", timer: "timer.sample_heater" },
        "roost-doorbell": { camera: "camera.sample_door", ring: "binary_sensor.sample_doorbell", lock: "lock.sample_front_door" },
        "roost-laundry": { entity: "sensor.sample_washer_state", remaining: "sensor.sample_washer_left", progress: "sensor.sample_washer_progress", stage: "sensor.sample_washer_state" },
        "roost-garage": { entity: "cover.sample_garage" },
        "roost-flow": { solar: "sensor.sample_solar", battery: "sensor.sample_battery_power", battery_level: "sensor.sample_battery_level", grid: "sensor.sample_grid", home: "sensor.sample_house" },
        "roost-irrigation": { zones: [{ entity: "switch.sample_zone_1", icon: "mdi:grass" }, { entity: "switch.sample_zone_2", icon: "mdi:grass" }, { entity: "switch.sample_zone_3", icon: "mdi:flower-tulip" }, { entity: "switch.sample_zone_4", icon: "mdi:pine-tree" }], rain: "sensor.sample_rain" },
        "roost-ev": { battery: "sensor.sample_ev_battery", range: "sensor.sample_ev_range", power: "sensor.sample_ev_power", charging: "switch.sample_ev_charging", plugged: "binary_sensor.sample_ev_plugged", limit: "number.sample_ev_limit", capacity: 64 },
        "roost-plant": { name: "Monstera", moisture: "sensor.sample_plant_moisture", light: "sensor.sample_plant_light", temperature: "sensor.sample_plant_temp" },
        "roost-printer": config.kind === "3d" ? { entity: "sensor.sample_3d_state", progress: "sensor.sample_3d_progress", remaining: "sensor.sample_3d_left", nozzle: "sensor.sample_3d_nozzle", bed: "sensor.sample_3d_bed" }
          : { entity: "sensor.sample_printer", inks: [{ entity: "sensor.sample_ink_black", color: "#1F2333" }, { entity: "sensor.sample_ink_cyan", color: "#22D3EE" }, { entity: "sensor.sample_ink_magenta", color: "#EC4899" }, { entity: "sensor.sample_ink_yellow", color: "#FACC15" }] },
        "roost-tank": config.kind === "gas" ? { name: "Gas", level: "sensor.sample_tank_level", capacity: 25, per_day: 0.9 }
          : { level: "sensor.sample_tank_level", capacity: 2000, used_today: "sensor.sample_tank_used", per_day: 420, leak: "binary_sensor.sample_tank_leak", pump: "switch.sample_tank_pump" },
        "roost-pool": { temperature: "sensor.sample_pool_temp", chlorine: "sensor.sample_pool_cl", ph: "sensor.sample_pool_ph", pump: "switch.sample_pool_pump", heater: "switch.sample_pool_heater", light: "light.sample_pool_light" },
        "roost-pet": { name: "Luna", feeder: "button.sample_pet_feed", food: "sensor.sample_pet_food", water: "sensor.sample_pet_water", meals: "sensor.sample_pet_meals" },
        "roost-nursery": { temperature: "sensor.sample_baby_temp", humidity: "sensor.sample_baby_hum", sound: "sensor.sample_baby_sound", light: "light.sample_night_light", music: "media_player.sample_lullaby" },
        "roost-network": config.kind === "server" ? { cpu: "sensor.sample_srv_cpu", memory: "sensor.sample_srv_mem", disk: "sensor.sample_srv_disk", temperature: "sensor.sample_srv_temp" }
          : { download: "sensor.sample_net_down", upload: "sensor.sample_net_up", ping: "sensor.sample_net_ping", clients: "sensor.sample_net_clients", restart: "button.sample_router_restart" },
        "roost-grocy": { stock: "sensor.sample_grocy_stock", shopping: "sensor.sample_grocy_shopping", chores: "sensor.sample_grocy_chores", tasks: "sensor.sample_grocy_tasks", meals: "sensor.sample_grocy_meals", missing: "binary_sensor.sample_grocy_missing" },
        "roost-family": { entities: ["person.sample_saeed", "person.sample_layla", "person.sample_daniel"], zones: ["zone.sample_work", "zone.sample_school"], zone_home: "zone.sample_home" },
        "roost-vacuum": { entity: "vacuum.sample_robot", battery: "sensor.sample_robot_battery", area_sensor: "sensor.sample_robot_area", time_sensor: "sensor.sample_robot_time",
          consumables: ["sensor.sample_robot_filter", "sensor.sample_robot_main_brush", "sensor.sample_robot_side_brush", "sensor.sample_robot_mop_pad"],
          selects: ["select.sample_robot_water", "select.sample_robot_mode"], buttons: ["button.sample_robot_empty", "button.sample_robot_wash"],
          rooms: [{ name: "Living room", icon: "mdi:sofa" }, { name: "Kitchen", icon: "mdi:stove" }, { name: "Bedroom", icon: "mdi:bed-king" }, { name: "Hallway", icon: "mdi:door" }] }, "roost-remote": { athom_remote: "Sample TV" },
        "roost-values": { entities: [{ entity: "input_number.sample_ac_night" }, { entity: "input_select.sample_guest" }, { entity: "input_boolean.sample_guests" }, { entity: "input_text.sample_note" }] } }[this.localName] || {};
      config = { ...fill, ...config };
      if (this.localName === "roost-remote" && config.entity && !config.athom_remote) config = { ...config, entity: undefined, athom_remote: "Sample TV" };
    }
    this._config = { ...this.constructor.defaults, ...config };
    if (this._config.reverse && String(this._config.entity || "").startsWith("cover.")) RoostReversed.add(this._config.entity);
    // A card that still needs a device shows a friendly "pick one" note, like Home Assistant's own cards, instead of a red error.
    this._setup = "";
    try { this.validate?.(this._config); } catch (e) { this._setup = e.message || String(e); }
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this._sig = null;
    if (this._setup) this.renderSetup();
    else if (this._hass) this.render();
  }

  renderSetup() {
    if (!this.shadowRoot) return;
    const name = (window.customCards || []).find((x) => x.type === this.localName)?.name || "Roost card";
    const p = this._hass ? this.p : PALETTE.dark;
    this.shadowRoot.innerHTML = `<style>:host{display:block;height:100%}
      .setup{height:100%;min-height:96px;box-sizing:border-box;display:flex;align-items:center;gap:14px;padding:16px 18px;border-radius:22px;border:1px dashed ${p.border};background:${p.panel};color:${p.text};font-family:${FONT_TEXT}}
      .ic{width:42px;height:42px;border-radius:14px;flex:none;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#6D4BFF,#8B6CFF);color:#fff}
      b{display:block;font-size:15px;margin-bottom:3px}span{font-size:13px;color:${p.muted};line-height:1.4}</style>
      <div class="setup"><div class="ic"><ha-icon icon="mdi:pencil-outline"></ha-icon></div><div><b>${esc(name)}</b><span>${esc(this._setup)}. Open the card's settings (the pencil) to finish.</span></div></div>`;
  }

  // Older Home Assistant versions (2024.8 to 2024.10) size cards in Sections with these.
  getLayoutOptions() {
    const g = this.getGridOptions?.() || {};
    const q = (v) => (v == null ? undefined : v === "full" ? 4 : Math.max(1, Math.round(Number(v) / 3)));
    return { grid_columns: q(g.columns ?? 12), grid_rows: g.rows ?? "auto", grid_min_columns: q(g.min_columns) };
  }

  set hass(hass) {
    if (hass && RoostPop.hass !== hass && this.localName !== "roost-popup-layer") RoostPop.setHass(hass);
    if (this._config?.sample && hass) { this._realHass = hass; hass = Sample.wrap(hass, this); }
    this._hass = hass;
    if (this._setup) { if (!this._setupDrawn) { this._setupDrawn = true; this.renderSetup(); } return; }
    this._setupDrawn = false;
    if (this._menuOpen && this._sig) return;
    const sig = this.signature();
    if (sig === this._sig) return;
    this._sig = sig;
    this.render();
    this.motion();
    this.brokenNote();
  }

  get hass() { return this._hass; }

  // "Not working right now": a calm note over the card with the reason, so nobody keeps tapping a broken device.
  brokenNote() {
    const note = this._config?.out_of_order, root = this.shadowRoot;
    if (!note || !root) return;
    root.querySelector(".roost-broken")?.remove();
    // the note covers just this card: the card itself is the frame
    this.style.position = "relative"; if (!this.style.display) this.style.display = "block";
    const el = document.createElement("div");
    el.className = "roost-broken"; el.setAttribute("role", "status");
    el.style.cssText = `position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:14px;box-sizing:border-box;text-align:center;border-radius:${Number(this._config.radius) || 22}px;background:rgba(10,8,30,.62);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);color:#fff`;
    el.innerHTML = `<ha-icon icon="mdi:alert-circle-outline" style="--mdc-icon-size:28px;color:#FF9F6B"></ha-icon><b style="font-size:14px">Not working right now</b><span style="font-size:12px;opacity:.85;line-height:1.35">${esc(note)}</span>`;
    root.appendChild(el);
  }

  // ---- small shared helpers for the newer cards
  // a reading as words: "1460 W", "22.5°", "64%", "" when there is none
  val(id, fallbackUnit = "") {
    const s = id ? this._hass?.states[id] : null;
    if (!s || UNAVAILABLE.includes(s.state)) return "";
    const n = num(s.state), u = s.attributes.unit_of_measurement ?? fallbackUnit;
    if (n == null) return String(s.state).replace(/_/g, " ");
    const t = fmt(n, decOf(s.state, u));
    return /^(%|°|°C|°F)$/.test(u) ? `${t}${u === "°C" || u === "°F" ? "°" : u}` : u ? `${t} ${u}` : t;
  }

  n(id) { const s = id ? this._hass?.states[id] : null; return s && !UNAVAILABLE.includes(s.state) ? num(s.state) : null; }

  on(id) { const s = id ? this._hass?.states[id] : null; return !!s && ["on", "open", "opening", "home", "active", "heat", "cool", "charging", "running", "cleaning", "playing"].includes(String(s.state).toLowerCase()); }

  menuCss() {
    const p = this.p, g = this.colour();
    return `.menu{position:absolute;right:14px;bottom:14px;z-index:5;min-width:180px;max-width:calc(100% - 28px);max-height:260px;overflow:auto;padding:6px;border-radius:16px;border:1px solid ${p.border};
        background:${this.dark ? "#1A1F3D" : "#FFFFFF"};box-shadow:0 18px 40px -12px rgba(0,0,0,.55);display:flex;flex-direction:column;gap:2px}
      .menu[hidden]{display:none}
      .menu .h{font-size:11px;color:${p.muted};padding:6px 12px 2px;letter-spacing:.5px}
      .mi{all:unset;padding:10px 12px;border-radius:10px;font-size:14px;cursor:pointer;color:${p.text};display:flex;align-items:center;gap:10px}
      .mi ha-icon{--mdc-icon-size:18px;color:${p.muted}}
      .mi:hover,.mi.on{background:${g[0]}2E}
      .mi .ck{margin-left:auto;color:${g[1]}}`;
  }

  // A short list over the card (modes, options). While it is open, updates wait so it doesn't vanish under the finger.
  openMenu(title, items) {
    const menu = this.shadowRoot?.querySelector(".menu");
    if (!menu) return;
    items = items.map((it) => ({ ...it, label: nice(it.label) }));
    menu.innerHTML = `${title ? `<div class="h t">${esc(title)}</div>` : ""}${items.map((it, i) => `<button class="mi ${it.on ? "on" : ""}" role="menuitem" data-i="${i}">${it.icon ? `<ha-icon icon="${it.icon}"></ha-icon>` : ""}<span class="t">${esc(it.label)}</span>${it.on ? '<ha-icon class="ck" icon="mdi:check"></ha-icon>' : ""}</button>`).join("")}`;
    menu.hidden = false; this._menuOpen = true;
    const close = () => { window.removeEventListener("pointerdown", away, true); menu.hidden = true; this._menuOpen = false; this._sig = null; if (this._hass) this.hass = this._realHass || this._hass; };
    const away = (e) => { if (!e.composedPath().includes(menu)) close(); };
    setTimeout(() => window.addEventListener("pointerdown", away, true), 0);
    menu.querySelectorAll(".mi").forEach((b) => b.addEventListener("click", (ev) => { ev.stopPropagation(); this.vibrate(); const it = items[+b.dataset.i]; close(); it.run(); }));
  }

  /**
   * Meaningful movement after a redraw, so changes are seen instead of jumping:
   *  data-tw="key"   a number counts from its old value to its new one
   *  data-bar="key"  a bar grows or shrinks from its old width
   *  data-pop="v" data-popkey="key"  a gentle bounce when its state changes (on/off, armed, locked)
   *  data-glide="key"  slides from its old place to its new one (people on the presence map)
   *  data-flash="v" data-flashkey="key"  a soft glow when something happened (an automation ran)
   * Nothing moves when the phone asks for reduced motion.
   */
  motion() {
    const root = this.shadowRoot;
    if (!root) return;
    const mem = this._mem || (this._mem = {});
    let still = false;
    try { still = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { /* old browser */ }
    const run = (el, frames, opts) => { if (still) return; try { el.animate(frames, opts); } catch (e) { /* old browser: no movement */ } };
    const raf = window.requestAnimationFrame ? (f) => window.requestAnimationFrame(f) : (f) => setTimeout(() => f(performance.now()), 16);
    root.querySelectorAll("[data-tw]").forEach((el) => {
      const txt = el.textContent, m = txt.match(/-?\d+(?:\.\d+)?/);
      if (!m) return;
      const key = `n${el.dataset.tw}`, to = parseFloat(m[0]), dec = (m[0].split(".")[1] || "").length, from = mem[key];
      mem[key] = to;
      if (still || from == null || from === to) return;
      const pre = txt.slice(0, m.index), post = txt.slice(m.index + m[0].length), t0 = performance.now(), D = 650;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / D), e = 1 - (1 - k) ** 3;
        el.textContent = pre + (from + (to - from) * e).toFixed(dec) + post;
        if (k < 1 && el.isConnected) raf(step);
      };
      raf(step);
    });
    root.querySelectorAll("[data-bar]").forEach((el) => {
      const key = `b${el.dataset.bar}`, w = el.style.width, old = mem[key];
      mem[key] = w;
      if (old && old !== w) run(el, [{ width: old }, { width: w }], { duration: 650, easing: "cubic-bezier(.3,1,.4,1)" });
    });
    root.querySelectorAll("[data-pop]").forEach((el) => {
      const key = `p${el.dataset.popkey || ""}`, v = el.dataset.pop, old = mem[key];
      mem[key] = v;
      if (old != null && old !== v) run(el, [{ transform: "scale(1)" }, { transform: "scale(1.16)" }, { transform: "scale(.97)" }, { transform: "scale(1)" }], { duration: 480, easing: "ease-out" });
    });
    root.querySelectorAll("[data-glide]").forEach((el) => {
      const key = `g${el.dataset.glide}`, tr = el.style.transform, old = mem[key];
      mem[key] = tr;
      if (old && old !== tr) run(el, [{ transform: old }, { transform: tr }], { duration: 900, easing: "cubic-bezier(.3,.8,.4,1)" });
    });
    root.querySelectorAll("[data-flash]").forEach((el) => {
      const key = `f${el.dataset.flashkey || ""}`, v = el.dataset.flash, old = mem[key];
      mem[key] = v;
      if (old != null && old !== v) run(el, [{ boxShadow: "0 0 0 0 rgba(139,108,255,.0)" }, { boxShadow: "0 0 0 6px rgba(139,108,255,.45)" }, { boxShadow: "0 0 0 0 rgba(139,108,255,0)" }], { duration: 1100, easing: "ease-out" });
    });
  }

  /**
   * A coloured pill that slides from the old choice to the new one (bottom bar, room pills).
   * `box` holds the buttons; the pill is drawn behind `on`. `memo` remembers where it was, across pages too.
   */
  slidePill(box, on, memo, css) {
    if (!box || !on) return;
    let ind = box.querySelector(":scope > .ind");
    if (!ind) { ind = document.createElement("span"); ind.className = "ind"; ind.setAttribute("aria-hidden", "true"); box.prepend(ind); }
    ind.style.cssText = `position:absolute;z-index:0;pointer-events:none;${css}`;
    const r = { left: on.offsetLeft, top: on.offsetTop, width: on.offsetWidth, height: on.offsetHeight };
    Object.assign(ind.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    const old = memo.rect;
    memo.rect = r; memo.at = Date.now();
    let still = false;
    try { still = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { /* old browser */ }
    if (!still && old && (old.left !== r.left || old.top !== r.top) && Date.now() - (memo.go || 0) < 1500) {
      try {
        ind.animate([{ left: `${old.left}px`, top: `${old.top}px`, width: `${old.width}px`, height: `${old.height}px` }, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` }],
          { duration: 380, easing: "cubic-bezier(.3,1.25,.5,1)" });
        on.animate([{ transform: "scale(.9)" }, { transform: "scale(1.06)" }, { transform: "scale(1)" }], { duration: 380, easing: "ease-out" });
      } catch (e) { /* jumps */ }
    }
    memo.go = 0;
    // the bar can change size after drawing (fonts load, the column widens): keep the highlight on its pill
    if (window.ResizeObserver && box._ro !== on) {
      box._roObs?.disconnect();
      box._ro = on;
      box._roObs = new ResizeObserver(() => {
        if (!on.isConnected) return box._roObs.disconnect();
        const q = { left: on.offsetLeft, top: on.offsetTop, width: on.offsetWidth, height: on.offsetHeight };
        Object.assign(ind.style, { left: `${q.left}px`, top: `${q.top}px`, width: `${q.width}px`, height: `${q.height}px` });
        memo.rect = q;
        return undefined;
      });
      box._roObs.observe(box); box._roObs.observe(on);
    }
  }

  /** Entities whose changes redraw the card. */
  watched() { return [this._config.entity].filter(Boolean); }

  signature() {
    const h = this._hass;
    if (!h) return "";
    const parts = this.watched().map((id) => {
      const s = h.states[id];
      return s ? `${s.state}|${s.last_changed}|${JSON.stringify(s.attributes)}` : "-";
    });
    return `${this.dark ? 1 : 0}|${parts.join("§")}|${this.extraSignature?.() ?? ""}`;
  }

  get dark() {
    const t = this._config?.theme || "auto";
    return t === "auto" ? !!this._hass?.themes?.darkMode : t === "dark";
  }

  /**
   * The colours to draw with. With "Frosted glass" the card's background becomes see-through and blurs
   * what is behind it; "Clear" leaves only the content. How see-through and how blurred can be set.
   */
  get p() {
    const base = this.dark ? PALETTE.dark : PALETTE.light, c = this._config || {};
    const glassNav = this.localName === "roost-nav" && (c.background || "glass") === "glass";
    if (!glassNav && (!c.surface || c.surface === "solid")) return base;
    if (c.surface === "clear") return { ...base, panel: "transparent", off: "transparent", border: "transparent", fx: "" };
    const tint = this.dark ? "20,24,49" : "255,255,255";
    const op = Math.max(0, Math.min(100, Number(c.opacity ?? (glassNav ? 86 : 55)))) / 100, blur = Math.max(0, Number(c.blur ?? 18));
    const fx = blur ? `backdrop-filter:blur(${blur}px) saturate(150%);-webkit-backdrop-filter:blur(${blur}px) saturate(150%)` : "";
    return { ...base, panel: `rgba(${tint},${op})`, off: `rgba(${tint},${Math.min(1, op + 0.06)})`, border: this.dark ? `rgba(255,255,255,${(0.06 + op * 0.06).toFixed(2)})` : `rgba(22,25,54,${(0.06 + op * 0.06).toFixed(2)})`, fx };
  }

  /** The card's colour: a preset name, or the two custom colours. */
  colour(key = "color") {
    const c = this._config;
    if (c[key] === "active" || c[key] == null && key === "color" && this.constructor.activeByDefault) return ACTIVE;
    if (c[key] === "custom") {
      const a = rgb(c[`${key}_start`]) || COLORS.purple[0];
      const b = rgb(c[`${key}_end`]) || a;
      return [a, b, "rgba(0,0,0,.35)", rgb(c[`${key}_text`]) || "#FFFFFF"];
    }
    if (c[key] === "lamp") {
      // the light's own colour while it is on, like the glow of the real lamp
      const s = this.st(), a = s?.attributes || {};
      let col = Array.isArray(a.rgb_color) ? a.rgb_color : null;
      const k = a.color_temp_kelvin || (a.color_temp ? 1000000 / a.color_temp : null);
      if ((!col || a.color_mode === "color_temp") && k) col = k < 3000 ? [255, 168, 80] : k < 4200 ? [255, 206, 140] : k < 5500 ? [255, 236, 210] : [200, 220, 255];
      if (s && s.state === "on" && col) {
        const [r, g, b] = col.map(Number), sh = (f) => `rgb(${Math.round(r * f)},${Math.round(g * f)},${Math.round(b * f)})`;
        return [sh(0.62), sh(0.88), `rgba(${r},${g},${b},.55)`, "#FFFFFF"];
      }
      return COLORS.purple;
    }
    return COLORS[c[key]] || COLORS.purple;
  }

  gradient(key = "color") { const g = this.colour(key); return `linear-gradient(135deg,${g[0]} 0%,${g[1]} 100%)`; }

  st(id = this._config.entity) { return id ? this._hass?.states[id] : undefined; }

  // a state by id, or nothing when no id is given (st() without an id means the card's own entity)
  sx(id) { return id ? this._hass?.states[id] : undefined; }

  name(id, fallback) {
    const s = this.sx(id);
    return this._config.name || s?.attributes.friendly_name || fallback || id || "";
  }

  fire(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
  }

  // Holding a card opens Roost's own details sheet; details: home-assistant keeps Home Assistant's window.
  moreInfo(entityId) {
    if (!entityId) return;
    const d = this._config?.details || window.RoostDetails;
    if (d === "home-assistant" || !window.RoostSheet) this.fire("hass-more-info", { entityId });
    else window.RoostSheet.open(entityId);
  }

  vibrate(ms = 12) { try { navigator.vibrate?.(ms); } catch (e) { /* not on this device */ } }

  async call(domain, service, data) {
    try {
      [service, data] = fixCover(domain, service, data);
      await this._hass.callService(domain, service, data);
      return true;
    } catch (e) {
      this.fire("hass-notification", { message: e.message || "That did not work." });
      return false;
    }
  }

  /** Run a tap/hold action from the card's settings. */
  async run(action, entityId) {
    const a = typeof action === "string" ? { action } : action || { action: "more-info" };
    if (a.confirmation && a.action !== "none" && a.action !== "more-info") {
      const text = typeof a.confirmation === "object" && a.confirmation.text ? a.confirmation.text : "Are you sure?";
      if (!(await RoostPop.confirm(text))) return undefined;
    }
    this.vibrate();
    switch (a.action) {
      case "toggle":
        if (String(entityId).startsWith("cover.") && this._config?.reverse) {
          // reversed curtain: decide from what it really is (open or closed), then ask for the other
          const v = coverView(this.sx(entityId), true);
          return this.call("cover", v.state === "closed" || v.state === "closing" ? "open_cover" : "close_cover", { entity_id: entityId });
        }
        return this.call("homeassistant", "toggle", { entity_id: entityId });
      case "more-info": return this.moreInfo(a.entity || entityId);
      case "navigate":
        if (a.navigation_path) { history.pushState(null, "", a.navigation_path); this.fire("location-changed", { replace: false }); }
        return undefined;
      case "url": if (a.url_path) window.open(a.url_path, "_blank"); return undefined;
      case "fire-dom-event": this.fire("ll-custom", a); return undefined;
      case "perform-action": case "call-service": {
        const [d, s] = String(a.perform_action || a.service || "").split(".");
        if (d && s) return this.call(d, s, { ...(a.data || a.service_data || {}), ...(a.target || {}) });
        return undefined;
      }
      default: return undefined;
    }
  }

  /** Tap and long-press on an element. */
  press(el, onTap, onHold) {
    let timer = null, held = false;
    const start = () => { held = false; timer = setTimeout(() => { held = true; onHold?.(); }, 550); };
    const cancel = () => clearTimeout(timer);
    el.addEventListener("pointerdown", start);
    el.addEventListener("pointerleave", cancel);
    el.addEventListener("pointercancel", cancel);
    el.addEventListener("pointerup", (ev) => { cancel(); if (!held) onTap(ev); });
    el.addEventListener("contextmenu", (ev) => ev.preventDefault());
    el.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); onTap(ev); } });
  }

  /** An icon: the one set in the card, else the entity's own icon. */
  icon(container, icon, entityId) {
    container.innerHTML = "";
    const s = this.sx(entityId);
    if (icon || !s) {
      const el = document.createElement("ha-icon");
      el.icon = icon || "mdi:help-circle-outline";
      container.appendChild(el);
    } else {
      const el = document.createElement("ha-state-icon");
      el.hass = this._hass;
      el.stateObj = s;
      container.appendChild(el);
    }
  }

  baseCss() {
    const p = this.p;
    return `:host{display:block;height:100%;container-type:inline-size;--roost-text:${p.text};--roost-muted:${p.muted};font-family:${FONT_TEXT};line-height:normal}
      .num,svg text{font-family:${FONT_NUM}}
      *{box-sizing:border-box}
      :host > .card:last-child{min-height:100%}
      .t{white-space:normal;overflow-wrap:break-word;word-break:normal;overflow:visible;text-overflow:clip}
      ${KEYFRAMES}`;
  }

  getCardSize() { return 3; }
}

// ------------------------------------------------------------------ editors
const THEME_FIELD = { name: "theme", selector: { select: { mode: "dropdown", options: [
  { value: "auto", label: "Follow Home Assistant" }, { value: "dark", label: "Always dark" }, { value: "light", label: "Always light" }] } } };

const colourFields = (key = "color", label = "Colour") => [
  { name: key, label, selector: { select: { mode: "dropdown", options: COLOR_OPTIONS } } },
  { name: `${key}_start`, label: "First colour (my own colours)", selector: { color_rgb: {} } },
  { name: `${key}_end`, label: "Second colour (my own colours)", selector: { color_rgb: {} } },
];

const ACTION_FIELD = (name, label) => ({ name, label, selector: { ui_action: {} } });

const LABELS = {
  entity: "Device", name: "Name (optional)", icon: "Icon (optional)", size: "Size", radius: "Corner roundness",
  show_switch: "Show the switch", show_since: "Show how long (“for 5 min”)", power_entity: "Power reading (optional)",
  animation: "Animation when on", tap_action: "When tapped", hold_action: "When held", theme: "Light or dark",
  sensor: "Room temperature sensor (optional)", modes: "Mode buttons", show_power: "Show the power button",
  show_plus_minus: "Show − and +", style: "Style", weather: "Weather", title: "Greeting name (optional)",
  show_date: "Show the date", show_clock: "Show the clock", layout: "Layout", show_labels: "Show names under icons",
  items: "Buttons", entities: "Devices", fixed: "Stick to the screen edge", max_width: "Dial size",
};
Object.assign(LABELS, {
  fill: "Look when on", glow: "Glow", icon_shape: "Icon box", icon_size: "Icon size", name_size: "Name size",
  off_tint: "Hint of colour when off", align: "Line up", show_state: "Show the state (On, Off, 23°)",
  shape: "Button shape", button_size: "Button size", show_name: "Show the name",
  active_style: "How the chosen button looks", bar_height: "Bar height", background: "Background",
  chip_shape: "Chip shape", ring_size: "Ring size", ring_width: "Ring thickness",
  show_orb: "Show the sun / moon", show_stars: "Twinkling stars at night", show_sheen: "Soft light sweep", min_height: "Height",
});
const computeLabel = (s) => s.label || LABELS[s.name] || s.name;

// ------------------------------------------------------------------ the editor
// Shows the values a card really uses (its defaults included), and the "own colour" pickers only when chosen.
const sameValue = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function fitSchema(schema, data) {
  const out = [];
  for (const item of schema) {
    const m = /^(.*)_(start|end|text)$/.exec(item.name || "");
    if (m && data[m[1]] !== "custom" && (`${m[1]}` in data || m[1] === "color")) continue;
    out.push(item.schema ? { ...item, schema: fitSchema(item.schema, data) } : item);
  }
  return out;
}

// How see-through a card is: solid, frosted glass (blurs what is behind) or clear. Added to every card's editor.
const BROKEN_FIELDS = { type: "expandable", name: "", title: "Not working right now", icon: "mdi:alert-circle-outline", schema: [
  { name: "out_of_order", label: "A note over the card (for example “The curtain remote's battery is dead”); empty = working", selector: { text: {} } },
] };
const SURFACE_FIELDS = (nav) => ({ type: "expandable", name: "", title: "See-through (frosted glass)", icon: "mdi:blur", schema: [
  ...(nav ? [] : [{ name: "surface", label: "Background", selector: pick([["solid", "Solid"], ["frosted", "Frosted glass"], ["clear", "Clear (no background)"]]) }]),
  { type: "grid", name: "", schema: [{ name: "opacity", label: "How solid (%)", selector: slider(0, 100, 5, "%") }, { name: "blur", label: "Blur", selector: slider(0, 40, 2) }] },
] });

class RoostEditor extends HTMLElement {
  setConfig(config) { this._config = { ...config }; this.draw(); }

  set hass(hass) { this._hass = hass; this.draw(); }

  // Home Assistant hands the dashboard to card editors; the card picker under "Cards on it" needs it to list cards.
  set lovelace(v) { this._lovelace = v; if (this._stack && "lovelace" in this._stack) this._stack.lovelace = v; }

  get lovelace() {
    if (this._lovelace) return this._lovelace;
    try {
      const panel = document.querySelector("home-assistant")?.shadowRoot?.querySelector("home-assistant-main")?.shadowRoot?.querySelector("ha-panel-lovelace");
      const ll = panel?.lovelace || panel?.shadowRoot?.querySelector("hui-root")?.lovelace;
      return ll?.config || undefined;
    } catch (e) { return undefined; }
  }

  draw() {
    const cls = this.cardClass;
    if (!cls || !this._hass || !this._config) return;
    const form = cls.getConfigForm();
    const label = form.computeLabel;
    const noSurface = ["roost-page", "roost-fullscreen", "roost-title", "roost-theme"].includes(cls.tag);
    const noBroken = noSurface || ["roost-nav", "roost-page", "roost-panel", "roost-rooms"].includes(cls.tag);
    const WHO = { name: "show_to", label: "Only these people see this card (empty = everyone)", selector: { entity: { multiple: true, domain: "person" } } };
    const LANG = { name: "language", label: "Language of this card", selector: { select: { mode: "dropdown", options: [{ value: "auto", label: "Like Home Assistant (or this screen's choice)" }, { value: "en", label: "English" }, { value: "ar", label: "العربية · Arabic, right to left" }] } } };
    const schema = [...(noSurface ? form.schema : [...form.schema, ...(noBroken ? [] : [BROKEN_FIELDS]), SURFACE_FIELDS(cls.tag === "roost-nav")]), WHO, LANG];
    this._data = { ...cls.defaults, ...this._config };
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const next = ev.detail.value || {};
        const config = { ...this._config };
        for (const key of new Set([...Object.keys(next), ...Object.keys(this._data)])) {
          if (sameValue(next[key], this._data[key])) continue;
          if (next[key] === undefined || next[key] === "" || next[key] === null) delete config[key];
          else config[key] = next[key];
        }
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
        this.draw();
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.data = this._data;
    this._form.schema = fitSchema(schema, this._data);
    this._form.computeLabel = label;
    if (cls.hasCards || cls.roomCards) this.drawCards();
  }

  // Rooms card: which room's cards are being edited.
  roomIdx() { const n = (this._config.rooms || []).length; return Math.max(0, Math.min(n - 1, this._roomIdx || 0)); }

  drawRoomChips() {
    const rooms = this._config.rooms || [], on = this.roomIdx();
    const key = `${rooms.map((r) => `${r.name}:${(Array.isArray(r.cards) ? r.cards : []).length}`).join("|")}#${on}`;
    if (key === this._chipsKey) return;
    this._chipsKey = key;
    this._roomChips.innerHTML = "";
    if (!rooms.length) { this._roomChips.textContent = "Add a room above first."; return; }
    rooms.forEach((r, i) => {
      const b = document.createElement("button");
      const n = Array.isArray(r.cards) ? r.cards.length : 0;
      b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("aria-selected", String(i === on));
      b.textContent = `${r.name || `Room ${i + 1}`}${n ? ` · ${n}` : ""}`;
      b.style.cssText = `font:inherit;font-size:13px;font-weight:600;padding:8px 14px;border-radius:999px;cursor:pointer;border:1px solid ${i === on ? "transparent" : "var(--divider-color,#8884)"};background:${i === on ? "var(--primary-color,#6D4BFF)" : "transparent"};color:${i === on ? "var(--text-primary-color,#fff)" : "var(--primary-text-color)"}`;
      b.addEventListener("click", () => { this._roomIdx = i; this._stackCards = null; this._stackJson = null; this.draw(); });
      this._roomChips.appendChild(b);
    });
  }

  // Cards inside a Roost Page or Panel are edited here too, one tab per card, with Home Assistant's own card editor.
  async drawCards() {
    if (!this._stack && !this._stackLoading) {
      this._stackLoading = true;
      try {
        if (!customElements.get("hui-vertical-stack-card") && window.loadCardHelpers) (await window.loadCardHelpers()).createCardElement({ type: "vertical-stack", cards: [] });
        await customElements.whenDefined("hui-vertical-stack-card");
        const el = await customElements.get("hui-vertical-stack-card").getConfigElement();
        const head = document.createElement("div");
        head.textContent = "Cards on it";
        head.style.cssText = "font-weight:600;margin:20px 0 6px;font-size:15px";
        el.addEventListener("config-changed", (ev) => {
          ev.stopPropagation();
          const cards = ev.detail?.config?.cards;
          if (!Array.isArray(cards)) return;
          if (this.cardClass.roomCards) {
            // the cards of the chosen room
            const rooms = (this._config.rooms || []).map((r, i) => (i === this.roomIdx() ? { ...r, cards } : r));
            this._config = { ...this._config, rooms };
            this._stackCards = cards;
          } else { this._config = { ...this._config, cards }; this._stackCards = cards; }
          this._stackJson = JSON.stringify(cards);
          this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true }));
        });
        if (this.cardClass.roomCards) {
          head.textContent = "Cards in each room";
          const hint = document.createElement("div");
          hint.textContent = "Pick a room, then add, move or remove its cards. They show under that room's devices.";
          hint.style.cssText = "font-size:13px;opacity:.75;margin-bottom:8px";
          this._roomChips = document.createElement("div");
          this._roomChips.setAttribute("role", "tablist");
          this._roomChips.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px";
          this.append(head, hint, this._roomChips, el);
        } else this.append(head, el);
        this._stack = el;
      } catch (e) {
        const note = document.createElement("p");
        note.textContent = "The cards on it can be changed in the code editor (Show code editor).";
        note.style.cssText = "opacity:.75;font-size:13px";
        this.appendChild(note);
        this._stack = note;
      }
      this._stackLoading = false;
    }
    if (this._roomChips) this.drawRoomChips();
    if (this._stack?.setConfig) {
      this._stack.hass = this._hass;
      const ll = this.lovelace;
      if (ll && this._stack.lovelace !== ll) this._stack.lovelace = ll;
      const cards = (this.cardClass.roomCards ? (this._config.rooms || [])[this.roomIdx()]?.cards : this._config.cards) || [];
      if (this._stackCards !== cards && JSON.stringify(cards) !== this._stackJson) { this._stackCards = cards; this._stackJson = JSON.stringify(cards); try { this._stack.setConfig({ type: "vertical-stack", cards }); } catch (e) { /* shown as code */ } }
      // the stack's own "Title" box means nothing here, so it is hidden
      Promise.resolve(this._stack.updateComplete).then(() => {
        const sr = this._stack.shadowRoot;
        if (sr && !sr.getElementById("roost-hide")) { const st = document.createElement("style"); st.id = "roost-hide"; st.textContent = ":host > ha-form, .card-config > ha-form, ha-form:first-child{display:none}"; sr.appendChild(st); }
      });
    }
  }
}
if (!customElements.get("roost-editor")) customElements.define("roost-editor", RoostEditor);

// ------------------------------------------------------------------ Roost Tile
class RoostTile extends RoostBase {
  static get defaults() {
    return { color: "purple", size: "large", radius: 22, fill: "gradient", glow: "soft", icon_shape: "rounded", icon_size: 22, name_size: 15, off_tint: false, align: "left",
      show_switch: true, quick: "switch", entities: [], stale_hours: 0, show_state: true, show_since: true, animation: "auto", locked: false, confirm: false, tap_action: { action: "toggle" }, hold_action: { action: "more-info" }, theme: "auto" };
  }

  validate(c) { if (!c.entity) throw new Error("Choose a device (entity)"); }

  watched() { return [this._config.entity, this._config.power_entity, ...this.members()].filter(Boolean); }

  // more devices run together with the main one (a light group, all curtains in a room)
  members() { return (this._config.entities || []).map((e) => (typeof e === "string" ? e : e?.entity)).filter((e) => e && e !== this._config.entity); }

  extraSignature() { return Math.floor(Date.now() / 60000); } // "for 5 min" moves on

  static getConfigForm() {
    return {
      schema: [
        { name: "entity", required: true, selector: { entity: {} } },
        { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } }] },
        { type: "expandable", name: "", title: "Colour and shape", icon: "mdi:palette", schema: [
          ...colourFields(),
          { type: "grid", name: "", schema: [
            { name: "size", selector: { select: { mode: "dropdown", options: [{ value: "compact", label: "Compact (for wall panels)" }, { value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }] } } },
            { name: "radius", selector: { number: { min: 0, max: 40, step: 2, mode: "slider", unit_of_measurement: "px" } } },
          ] },
          { type: "grid", name: "", schema: [{ name: "shape", label: "Shape", selector: pick([["auto", "By its size"], ...TILE_SHAPES]) }, { name: "height", label: "Height (my own height)", selector: slider(90, 320, 10) }] },
          { type: "grid", name: "", schema: [{ name: "fill", selector: FILL_OPTIONS }, { name: "glow", selector: GLOW_OPTIONS }] },
          { name: "off_tint", selector: { boolean: {} } },
          { name: "animation", selector: pick([["auto", "Automatic (lights glow, fans spin, TV shows sound bars)"], ["none", "None"], ["glow", "Glow"], ["spin", "Spin"],
            ["pulse", "Pulse"], ["bounce", "Bounce"], ["wiggle", "Wiggle"], ["bars", "Sound bars"]]) },
          THEME_FIELD,
        ] },
        { type: "expandable", name: "", title: "Icon and text", icon: "mdi:format-size", schema: [
          { type: "grid", name: "", schema: [{ name: "icon_shape", selector: SHAPE_OPTIONS }, { name: "icon_size", selector: slider(16, 40) }] },
          { type: "grid", name: "", schema: [{ name: "name_size", selector: slider(12, 24) }, { name: "align", selector: pick([["left", "Left"], ["center", "Centre"]]) }] },
        ] },
        { name: "entities", label: "Group: more devices that switch together with it (lights or curtains)", selector: { entity: { multiple: true } } },
        { type: "expandable", name: "", title: "What it shows", icon: "mdi:eye-outline", schema: [
          { name: "quick", label: "Quick control", selector: pick([["switch", "A switch in the corner; tap the tile to switch"], ["button", "A round button in the corner switches; tap the tile for all controls (like Homey)"], ["none", "None"]]) },
          { name: "show_switch", selector: { boolean: {} } },
          { name: "stale_hours", label: "Warn when it hasn't reported for (hours, 0 = never)", selector: { number: { min: 0, max: 720, mode: "box" } } },
          { name: "show_state", selector: { boolean: {} } },
          { name: "show_since", selector: { boolean: {} } },
          { name: "power_entity", selector: { entity: { domain: "sensor" } } },
          { ...REVERSE_FIELD, label: "Curtains only: reverse (it reports open and closed the wrong way round)" },
        ] },
        { type: "expandable", name: "", title: "Safety", icon: "mdi:shield-lock-outline", schema: [
          { name: "locked", label: "Locked: can't be switched from here (for things that must stay on)", selector: { boolean: {} } },
          { name: "confirm", label: "Ask before switching (for things that affect many devices)", selector: { boolean: {} } },
          { name: "problem", label: "Not working? Say why (for example “Not working · battery”). Leave empty when it works.", selector: { text: {} } },
        ] },
        { type: "expandable", name: "", title: "Tap and hold", icon: "gesture-tap", schema: [ACTION_FIELD("tap_action"), ACTION_FIELD("hold_action")] },
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) {
    const e = Object.keys(hass.states).find((id) => /^(light|switch|fan)\./.test(id));
    return { entity: e || "", color: "purple" };
  }

  getGridOptions() { return { columns: 6, rows: "auto", min_columns: 3 }; }

  stateText(s, on, un) {
    if (un) return "Offline";
    const d = s.entity_id.split(".")[0];
    const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1);
    if (d === "climate") return on ? `${cap(s.state.replace("_only", "").replace("heat_cool", "auto"))}${s.attributes.temperature != null ? ` · ${s.attributes.temperature}°` : ""}` : "Off";
    if (d === "cover") { const v = coverView(s, this._config.reverse); return cap(v.state) + (v.pos != null && v.pos > 0 && v.pos < 100 ? ` · ${v.pos}% open` : ""); }
    if (d === "binary_sensor") {
      const cls = s.attributes.device_class;
      if (["door", "window", "opening", "garage_door"].includes(cls)) return s.state === "on" ? "Open" : "Closed";
      if (["motion", "occupancy", "presence", "moving"].includes(cls)) return s.state === "on" ? "Someone there" : "Nobody";
      if (cls === "lock") return s.state === "on" ? "Unlocked" : "Locked";
    }
    if (d === "alarm_control_panel") return { disarmed: "Disarmed", armed_away: "Armed (away)", armed_home: "Armed (home)", armed_night: "Armed (night)", arming: "Arming", pending: "Pending", triggered: "Alarm!" }[s.state] || cap(s.state.replace(/_/g, " "));
    if (d === "lock") return s.state === "locked" ? "Locked" : "Unlocked";
    if (d === "light" && on && s.attributes.brightness != null) return `On · ${Math.round((s.attributes.brightness / 255) * 100)}%`;
    if (["sensor", "binary_sensor", "input_number", "number"].includes(d) && !["on", "off"].includes(s.state)) {
      return `${s.state}${s.attributes.unit_of_measurement ? ` ${s.attributes.unit_of_measurement}` : ""}`;
    }
    let t = on ? "On" : "Off";
    const pw = this._config.power_entity && parseFloat(this.sx(this._config.power_entity)?.state);
    if (on && Number.isFinite(pw)) t += ` · ${Math.round(pw)} W`;
    return t;
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, s = this.st(), p = this.p, g = this.colour();
    const broken = !!c.problem;
    const un = !s || UNAVAILABLE.includes(s.state) || broken;
    const isOn = (x) => x && !UNAVAILABLE.includes(x.state) && !OFF_STATES.includes(x.entity_id.startsWith("cover.") ? coverView(x, c.reverse).state : x.state);
    const group = this.members().length ? [s, ...this.members().map((id) => this.sx(id))].filter(Boolean) : null;
    const onCount = group ? group.filter(isOn).length : 0;
    const on = !un && (group ? onCount > 0 : isOn(s));
    // "not seen for 2 days": the device stopped reporting, often a flat battery
    const staleH = Number(c.stale_hours) || 0, quietH = s && staleH ? (Date.now() - new Date(s.last_updated || s.last_changed).getTime()) / 3600e3 : 0, stale = staleH > 0 && quietH >= staleH;
    const quietTxt = quietH >= 48 ? `${Math.floor(quietH / 24)} days` : quietH >= 1 ? `${Math.floor(quietH)} h` : `${Math.max(1, Math.round(quietH * 60))} min`;
    const quick = c.show_switch === false ? "none" : c.quick || "switch";
    const h = SIZES[c.size] || SIZES.large;
    const togglable = s && ["light", "switch", "fan", "input_boolean", "automation", "media_player", "climate", "cover", "humidifier", "siren", "lock"].includes(s.entity_id.split(".")[0]);
    const dom = s ? s.entity_id.split(".")[0] : "";
    const showSwitch = quick === "switch" && togglable && !un && !c.locked;
    const showBtn = quick === "button" && togglable && !un && !c.locked;
    const btnIcon = !s ? "mdi:power" : dom === "lock" ? (s.state === "locked" ? "mdi:lock-open-variant-outline" : "mdi:lock-outline") : dom === "cover" ? (on ? "mdi:arrow-collapse-down" : "mdi:arrow-collapse-up") : dom === "media_player" ? (s.state === "playing" ? "mdi:pause" : "mdi:play") : "mdi:power";
    const kind = c.animation === "auto" ? (dom === "light" ? "glow" : dom === "fan" || /fan/.test(s?.attributes.icon || "") ? "spin" : dom === "media_player" && s?.state === "playing" ? "bars" : "none") : c.animation;
    const anim = on && ANIMATIONS[kind] ? `animation:${ANIMATIONS[kind]}` : "";
    const look = fillLook(c.fill, c.glow, g, p);
    const isz = Math.max(12, Number(c.icon_size) || 22), box = c.icon_shape === "none" ? isz : Math.round(isz * 1.9);
    const nsz = Number(c.name_size) === 15 && h < 140 ? 14 : Math.max(11, Number(c.name_size) || 15); // the default name shrinks a little on small tiles
    const center = c.align === "center";
    const bars = on && kind === "bars" ? `<span class="bars">${[0, 0.2, 0.4, 0.1].map((d) => `<i style="animation-delay:${d}s"></i>`).join("")}</span>` : "";
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{position:relative;${c.shape && c.shape !== "auto" ? shapeCss(c.shape, c.height, h) : `min-height:${h}px;height:100%`};box-sizing:border-box;border-radius:${c.radius}px;padding:${c.size === "compact" ? 12 : 16}px;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;
        display:flex;flex-direction:column;justify-content:space-between;gap:8px;overflow:hidden;transition:transform .12s;${center ? "align-items:center;text-align:center;" : ""}
        background:${on ? look.bg : p.off};color:${on ? look.fg : p.text};${on && look.blur ? "backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);" : ""}
        border:${on && c.fill === "outline" ? 2 : 1}px solid ${on ? look.border : c.off_tint ? `color-mix(in srgb, ${g[0]} 35%, ${p.border})` : p.border};box-shadow:${on ? look.shadow : "none"};opacity:${un ? 0.55 : 1}}
      .card:active{transform:scale(.96)}
      .ic{width:${box}px;height:${box}px;border-radius:${shapeRadius(c.icon_shape, box)};display:flex;align-items:center;justify-content:center;flex:none;
        background:${c.icon_shape === "none" ? "transparent" : on ? (look.light ? "rgba(255,255,255,.24)" : `color-mix(in srgb, ${g[0]} 30%, transparent)`) : c.off_tint ? `color-mix(in srgb, ${g[0]} 18%, ${p.inset})` : p.inset};
        color:${on ? (look.light ? "#FFFFFF" : g[this.dark ? 1 : 0]) : un ? p.muted : c.off_tint ? g[this.dark ? 1 : 0] : p.muted}}
      .ic ha-icon,.ic ha-state-icon{--mdc-icon-size:${isz}px;${anim}}
      .bars{position:absolute;right:18px;bottom:18px;display:flex;align-items:flex-end;gap:3px;height:22px}
      .bars i{display:block;width:4px;height:22px;border-radius:2px;background:currentColor;transform-origin:bottom;animation:roost-eq .9s ease-in-out infinite}
      .sw{position:absolute;top:16px;right:14px;width:42px;height:24px;border-radius:999px;background:${on ? (look.light ? "rgba(255,255,255,.38)" : `linear-gradient(135deg,${g[0]},${g[1]})`) : p.track}}
      .sw::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:${on ? "#fff" : p.knob};transform:translateX(${on ? 18 : 0}px);transition:transform .12s}
      .lk{position:absolute;top:18px;right:16px;opacity:.8;--mdc-icon-size:18px}
      .qb{position:absolute;top:${c.size === "compact" ? 10 : 12}px;right:${c.size === "compact" ? 10 : 12}px;width:40px;height:40px;border-radius:50%;border:0;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center;--mdc-icon-size:20px;
        background:${on ? (look.light ? "rgba(255,255,255,.28)" : `linear-gradient(135deg,${g[0]},${g[1]})`) : p.inset};color:${on ? (look.light ? "inherit" : g[3]) : p.muted};transition:transform .12s;-webkit-tap-highlight-color:transparent}
      .qb:active{transform:scale(.88)}
      .qb::after{content:"";position:absolute;inset:0;border-radius:50%;pointer-events:none}
      .qb.go::after{border:2px solid ${on ? g[1] : p.muted};animation:roost-ping .7s ease-out}
      .stale{position:absolute;top:14px;right:${showSwitch || showBtn ? 62 : 14}px;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${on ? "rgba(255,255,255,.92)" : "rgba(245,158,11,.18)"};color:${on || !this.dark ? "#B45309" : "#F59E0B"};--mdc-icon-size:16px;animation:roost-breathe 2.4s ease-in-out infinite}
      .gc{display:inline-flex;gap:3px;margin-left:6px;vertical-align:middle}.gc i{width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.3}.gc i.on{opacity:1}
      .nm{font-size:${nsz}px;font-weight:600;line-height:1.2}
      .lb{font-size:12px;line-height:1.3;opacity:.85;color:${on ? "inherit" : p.muted}}
      .ago{font-size:11px;opacity:.65;margin-top:4px;color:${on ? "inherit" : p.muted}}
    </style>
    <div class="card" role="button" tabindex="0" aria-label="${esc(this.name(c.entity))}">
      <div class="ic" data-pop="${on ? 1 : 0}" data-popkey="ic"></div>
      ${showSwitch ? '<span class="sw" aria-hidden="true"></span>' : ""}
      ${showBtn ? `<button class="qb" data-qb="1" aria-label="${esc(`${on ? "Turn off" : "Turn on"} ${this.name(c.entity)}`)}" data-pop="${on ? 1 : 0}" data-popkey="qb"><ha-icon icon="${btnIcon}"></ha-icon></button>` : ""}
      ${stale ? `<span class="stale" title="Not seen for ${esc(quietTxt)}"><ha-icon icon="mdi:clock-alert-outline"></ha-icon></span>` : ""}
      ${c.locked ? '<ha-icon class="lk" icon="mdi:lock" aria-label="Locked"></ha-icon>' : ""}${broken ? '<ha-icon class="lk" icon="mdi:battery-alert-variant-outline" style="color:#FF9F6B;--mdc-icon-size:20px" aria-label="Not working"></ha-icon>' : ""}${bars}
      <div><div class="nm t">${esc(this.name(c.entity))}</div>
        ${c.show_state || broken || !s ? `<div class="lb t" data-tw="lb">${esc(broken ? c.problem : stale ? `Not seen for ${quietTxt}` : group && s && !un ? (onCount ? `${onCount} of ${group.length} on${dom === "light" ? (() => { const b = group.filter((x) => isOn(x) && x.attributes.brightness != null); return b.length ? ` · ${Math.round(b.reduce((a, x) => a + x.attributes.brightness, 0) / b.length / 2.55)}%` : ""; })() : ""}` : `All ${group.length} off`) : s ? this.stateText(s, on, un) + (c.locked && !un ? " · protected" : "") : "Device not found")}${group && !un ? `<span class="gc" aria-hidden="true">${group.slice(0, 8).map((x) => `<i class="${isOn(x) ? "on" : ""}"></i>`).join("")}</span>` : ""}</div>` : ""}
        ${c.show_since && c.size !== "compact" && s && !UNAVAILABLE.includes(s.state) ? `<div class="ago t">${esc(since(s.last_changed))}</div>` : ""}</div>
    </div>`;
    this.icon(this.shadowRoot.querySelector(".ic"), c.icon, c.entity);
    const tap = (c.locked || broken) && ["toggle", "perform-action", "call-service"].includes((c.tap_action || {}).action) ? { action: "more-info" }
      : c.confirm && (c.tap_action || {}).action === "toggle" ? { ...c.tap_action, confirmation: { text: `Switch ${this.name(c.entity)} ${on ? "off" : "on"}? Everything on it will be affected.` } } : c.tap_action;
    const ids = group ? group.map((x) => x.entity_id) : null;
    const flip = () => {
      if (ids) { this.vibrate(); return this.call("homeassistant", onCount ? "turn_off" : "turn_on", { entity_id: ids }); }
      return this.run(c.confirm ? { action: "toggle", confirmation: { text: `Switch ${this.name(c.entity)} ${on ? "off" : "on"}? Everything on it will be affected.` } } : { action: "toggle" }, c.entity);
    };
    const tapAct = (tap || {}).action;
    // with the round button, the tile itself opens all the controls
    const onTap = showBtn && tapAct === "toggle" ? () => this.moreInfo(c.entity) : ids && tapAct === "toggle" && !c.locked && !broken ? flip : () => this.run(tap, c.entity);
    this.press(this.shadowRoot.querySelector(".card"), onTap, () => this.run(c.hold_action, c.entity));
    const qb = this.shadowRoot.querySelector("[data-qb]");
    if (qb) {
      ["pointerdown", "pointerup", "touchstart", "touchend", "mousedown", "mouseup", "keydown"].forEach((ev) => qb.addEventListener(ev, (e) => e.stopPropagation()));
      qb.addEventListener("click", (e) => { e.stopPropagation(); qb.classList.remove("go"); void qb.offsetWidth; qb.classList.add("go"); flip(); });
    }
  }
}

// ------------------------------------------------------------------ Roost Chips
// Status chips in one centred row. Lights are grouped into one bulb with a count, doors into one door,
// air conditioners into one snowflake, people into one row of bubbles (colour = home, grey = away).
// Tap a group to see its list.
class RoostChips extends RoostBase {
  static get defaults() { return { entities: [], theme: "auto", align: "stretch", size: "medium", chip_shape: "pill", background: "solid" }; }

  validate(c) { if ((!Array.isArray(c.entities) || !c.entities.length) && !c.show_fullscreen && !c.show_theme && !c.show_language) throw new Error("Choose at least one device"); }

  extraSignature() { return `${RoostFull.isOn() ? 1 : 0}|${this._hass?.themes?.darkMode ? 1 : 0}`; }

  watched() { return this.ids(); }

  ids() { return (this._config.entities || []).map((e) => (typeof e === "string" ? e : e.entity)).filter(Boolean); }

  static getConfigForm() {
    return {
      schema: [
        { name: "entities", selector: { entity: { multiple: true } } },
        { type: "grid", name: "", schema: [{ name: "show_fullscreen", label: "A full screen chip", selector: { boolean: {} } }, { name: "show_theme", label: "A light and dark mode chip", selector: { boolean: {} } }] },
        { name: "fullscreen_users", label: "Full screen chip only for (empty = everyone)", selector: { entity: { multiple: true, domain: "person" } } },
        { name: "theme_users", label: "Light and dark chip only for (empty = everyone)", selector: { entity: { multiple: true, domain: "person" } } },
        { name: "show_language", label: "An Arabic / English chip", selector: { boolean: {} } },
        { type: "grid", name: "", schema: [
          { name: "size", selector: { select: { mode: "dropdown", options: [{ value: "compact", label: "Compact (for wall panels)" }, { value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }] } } },
          { name: "show_words", label: "Words next to door icons (“Closed”)", selector: { boolean: {} } },
          { name: "chip_shape", selector: pick([["pill", "Pill"], ["rounded", "Rounded square"], ["square", "Square"]]) },
          { name: "background", selector: pick([["solid", "Solid"], ["glass", "See-through glass"], ["none", "None"]]) },
          { name: "align", label: "Line up", selector: { select: { mode: "dropdown", options: [{ value: "stretch", label: "One row, equal sizes" }, { value: "center", label: "Centre (may use two rows)" }, { value: "start", label: "Left (may use two rows)" }] } } },
        ] },
        THEME_FIELD,
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) {
    const pick = (re, n) => Object.keys(hass.states).filter((id) => re.test(id)).slice(0, n);
    return { entities: [...pick(/^alarm_control_panel\./, 1), ...pick(/^light\./, 4), ...pick(/^person\./, 3)] };
  }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  groups() {
    const lights = [], people = [], doors = [], climates = [];
    let singles = [];
    for (const id of this.ids()) {
      const d = id.split(".")[0];
      if (d === "light") { if (!Array.isArray(this.sx(id)?.attributes.entity_id)) lights.push(id); } // light groups are not lights
      else if (d === "person" || d === "device_tracker") people.push(id);
      else if (d === "binary_sensor" && ["door", "window", "garage_door", "opening"].includes(this.sx(id)?.attributes.device_class)) doors.push(id);
      else if (d === "climate") climates.push(id);
      else singles.push(id);
    }
    // one door or one AC stays a plain chip; two or more become one grouped chip
    const lone = (arr) => (arr.length === 1 ? (singles.push(arr[0]), []) : arr);
    return { lights, people, singles, doors: lone(doors), climates: lone(climates) };
  }

  chipFor(id) {
    const s = this.sx(id);
    const d = id.split(".")[0];
    const un = !s || UNAVAILABLE.includes(s.state);
    const cls = s?.attributes.device_class;
    if (un) return { icon: "mdi:help-circle-outline", colour: this.p.muted, text: "" };
    if (d === "alarm_control_panel") {
      const armed = s.state.startsWith("armed") || s.state === "triggered";
      return { icon: armed ? "mdi:shield-check" : "mdi:shield-off", colour: s.state === "triggered" ? "#F43F6B" : armed ? "#34D399" : "#F43F6B", text: "" };
    }
    if (d === "lock") return { icon: s.state === "locked" ? "mdi:lock" : "mdi:lock-open-variant", colour: s.state === "locked" ? "#3DD68C" : "#FF9A3D", text: "" };
    if (d === "binary_sensor" && ["door", "window", "garage_door", "opening"].includes(cls)) {
      const open = s.state === "on";
      const icon = cls === "window" ? (open ? "mdi:window-open-variant" : "mdi:window-closed-variant") : (open ? "mdi:door-open" : "mdi:door-closed");
      return { icon, colour: open ? "#FF9F6B" : "#34D399", text: this._config.show_words ? (open ? "Open" : "Closed") : "", word: true };
    }
    if (d === "climate") {
      const on = s.state !== "off";
      return { icon: "mdi:snowflake", colour: on ? "#38BDF8" : this.p.muted, text: on && s.attributes.temperature != null ? `${s.attributes.temperature}°` : "" };
    }
    if (d === "media_player") { const on = !OFF_STATES.includes(s.state); return { icon: "mdi:television", colour: on ? "#B794FF" : this.p.muted, text: "" }; }
    if (d === "sensor" && s.attributes.unit_of_measurement) return { icon: null, colour: this.p.text, text: `${Math.round(parseFloat(s.state) * 10) / 10 || s.state}${s.attributes.unit_of_measurement}` };
    const on = !OFF_STATES.includes(s.state);
    return { icon: null, colour: on ? "#B794FF" : this.p.muted, text: "" };
  }

  render() {
    if (!this._hass || !this._config) return;
    const p = this.p, c = this._config;
    const { lights, people, singles, doors, climates } = this.groups();
    const h = { small: 34, medium: 40, large: 48 }[c.size] || 40;
    const lightsOn = lights.filter((id) => this.sx(id)?.state === "on").length;
    const chips = [];
    singles.forEach((id) => {
      if (id.startsWith("media_player.") && OFF_STATES.concat(UNAVAILABLE).includes(this.sx(id)?.state)) return; // a TV chip only while it is on
      chips.push({ key: id, ...this.chipFor(id), entity: id });
    });
    if (doors.length) {
      const open = doors.filter((id) => this.sx(id)?.state === "on").length;
      chips.unshift({ key: "__doors", icon: open ? "mdi:door-open" : "mdi:door-closed", colour: open ? "#FF9F6B" : "#34D399", text: open ? String(open) : "", group: "doors", label: "Doors" });
    }
    if (lights.length) chips.push({ key: "__lights", icon: lightsOn ? "mdi:lightbulb-on" : "mdi:lightbulb-outline", colour: lightsOn ? "#F5B94A" : p.muted, text: lightsOn ? String(lightsOn) : "", group: "lights" });
    if (climates.length) {
      const on = climates.filter((id) => this.sx(id) && !OFF_STATES.concat(UNAVAILABLE).includes(this.sx(id).state)).length;
      chips.push({ key: "__climates", icon: "mdi:snowflake", colour: on ? "#38BDF8" : p.muted, text: on ? String(on) : "", group: "climates", label: "Air conditioners" });
    }
    if (people.length) chips.push({ key: "__people", people: true, group: "people" });
    if (c.show_theme && forPeople(this._hass, c.theme_users)) chips.push({ key: "__theme", icon: RoostMode.icon(), colour: this.dark ? "#FCD34D" : "#6D4BFF", text: "", special: "theme" });
    if (c.show_language) chips.push({ key: "__lang", icon: "mdi:translate", colour: p.text, text: "", special: "language" });
    if (c.show_fullscreen && forPeople(this._hass, c.fullscreen_users)) chips.push({ key: "__full", icon: specialIcon("fullscreen"), colour: RoostFull.isOn() ? "#8B6CFF" : p.text, text: "", special: "fullscreen" });
    const open = this._open;
    const initials = (id) => (this.sx(id)?.attributes.friendly_name || id.split(".")[1]).split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const AVG = ["linear-gradient(135deg,#38BDF8,#6D4BFF)", "linear-gradient(135deg,#FF5577,#FF9F6B)", "linear-gradient(135deg,#10B981,#6EE7B7)", "linear-gradient(135deg,#F59E0B,#FDE68A)", "linear-gradient(135deg,#8B6CFF,#D6C4FF)"];
    const avatar = (id, i) => {
      const s = this.sx(id), home = s?.state === "home", pic = s?.attributes.entity_picture;
      return `<span class="av" style="z-index:${10 - i};margin-left:${i ? -10 : 0}px;color:${home ? "#fff" : "#A3A9CF"};${pic && !home ? "filter:grayscale(1);opacity:.6;" : ""}background:${home ? AVG[i % AVG.length] : "#3A4070"}">${pic ? `<img src="${esc(pic)}" alt="">` : esc(initials(id).slice(0, 1))}</span>`;
    };
    const list = { lights, people, doors, climates }[open] || [];
    const stateWord = (id, s) => {
      if (!s) return "Not found";
      if (open === "people") return s.state === "home" ? "Home" : "Away";
      if (open === "doors") return s.state === "on" ? "Open" : "Closed";
      if (open === "climates") return s.state === "off" ? "Off" : `${s.state.replace(/_/g, " ").replace(/^./, (m) => m.toUpperCase())}${s.attributes.temperature != null ? ` · ${s.attributes.temperature}°` : ""}`;
      return s.state === "on" ? "On" : "Off";
    };
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .row{${c.align === "stretch" ? "display:grid;grid-auto-flow:column;grid-auto-columns:minmax(max-content,1fr);gap:8px"
    : `display:flex;flex-wrap:wrap;gap:8px;justify-content:${c.align === "start" ? "flex-start" : "center"}`}}
      .chip{min-width:max-content;white-space:nowrap;height:${h}px;padding:0 ${c.align === "stretch" ? 6 : 14}px;border-radius:${c.chip_shape === "square" ? 10 : c.chip_shape === "rounded" ? 16 : 999}px;
        border:1px solid ${c.background === "none" ? "transparent" : p.border};background:${c.background === "none" ? "transparent" : c.background === "glass" ? "color-mix(in srgb, " + p.panel + " 60%, transparent);backdrop-filter:blur(14px)" : p.off};
        color:${p.text};display:flex;align-items:center;justify-content:center;gap:5px;cursor:pointer;font:inherit;font-size:${h > 44 ? 14 : 12}px;font-weight:600;-webkit-tap-highlight-color:transparent}
      .chip:active{transform:scale(.95)}
      :host{container-type:inline-size}
      @container (max-width: 340px){:host .row{gap:4px}:host .chip{padding:0 6px;gap:4px}:host .chip .word{display:none}:host .av{width:${h - 20}px;height:${h - 20}px}}
      @container (max-width: 260px){:host .row{overflow-x:auto;scrollbar-width:none;justify-content:start}:host .row::-webkit-scrollbar{display:none}}
      :host{padding:4px 4px ${this._open ? 4 : 20}px}
      .chip.on{outline:2px solid #8B6CFF}
      .chip ha-icon{--mdc-icon-size:${h > 44 ? 22 : 18}px;display:flex}
      .av{width:${h - 14}px;height:${h - 14}px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;border:2px solid ${p.off};overflow:hidden;position:relative;flex:none}
      .av img{width:100%;height:100%;object-fit:cover}
      .list{margin:12px 0 16px;border-radius:20px;border:1px solid ${p.border};background:${p.panel};${p.fx || ""};padding:6px 14px}
      .it{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid ${p.border}}
      .it:first-child{border-top:0}
      .it .n{flex:1;min-width:0;font-size:14px;color:${p.text}}
      .it .s{font-size:12px;color:${p.muted}}
      .tog{flex:none;width:48px;height:28px;border-radius:999px;border:0;background:${p.track};position:relative;cursor:pointer}
      .tog::after{content:"";position:absolute;top:4px;left:4px;width:20px;height:20px;border-radius:50%;background:${p.knob};transition:left .12s}
      .tog.on{background:linear-gradient(135deg,#6D4BFF,#38BDF8)}.tog.on::after{left:24px;background:#fff}
    </style>
    <div class="row">${chips.map((ch) => ch.people
      ? `<button class="chip ${open === "people" ? "on" : ""}" data-g="people" aria-label="People">${people.map(avatar).join("")}</button>`
      : `<button class="chip ${open && open === ch.group ? "on" : ""}" data-pop="${esc(`${ch.text || ""}${ch.colour || ""}${ch.icon || ""}`)}" data-popkey="${esc(ch.key || ch.entity || ch.group || "")}" ${ch.special ? `data-sp="${ch.special}" aria-label="${esc(specialLabel(ch.special))}"` : ch.group ? `data-g="${ch.group}"` : `data-e="${esc(ch.entity)}"`} aria-label="${esc(ch.entity ? this.name(ch.entity) : ch.label || "Lights")}">
          ${ch.icon ? `<ha-icon icon="${ch.icon}" style="color:${ch.colour}"></ha-icon>` : `<span class="ent" data-icon="${esc(ch.entity)}" style="color:${ch.colour};display:flex"></span>`}
          ${ch.text ? `<span class="${ch.word ? "word" : "cnt"}"${ch.word ? "" : ` style="color:${ch.colour}"`}>${esc(ch.text)}</span>` : ""}</button>`).join("")}</div>
    ${list.length ? `<div class="list">${list.map((id) => {
      const s = this.sx(id), isOn = s?.state === "on" || s?.state === "home";
      return `<div class="it" ${open === "climates" || open === "doors" ? `data-m="${esc(id)}" style="cursor:pointer"` : ""}><span class="n t">${esc(s?.attributes.friendly_name || id)}<br><span class="s">${esc(stateWord(id, s))}</span></span>
        ${open === "lights" ? `<button class="tog ${isOn ? "on" : ""}" data-t="${esc(id)}" aria-label="Switch ${esc(s?.attributes.friendly_name || id)}"></button>` : ""}</div>`;
    }).join("")}</div>` : ""}`;
    this.shadowRoot.querySelectorAll("[data-icon]").forEach((el) => this.icon(el, null, el.dataset.icon));
    this.shadowRoot.querySelectorAll(".chip").forEach((el) => this.press(el,
      () => { if (el.dataset.sp) { this.vibrate(); specialRun(el.dataset.sp); setTimeout(() => { this._sig = null; this.hass = this._hass; }, 120); } else if (el.dataset.g) { this._open = this._open === el.dataset.g ? null : el.dataset.g; this.vibrate(); this.render(); } else this.moreInfo(el.dataset.e); },
      () => el.dataset.e && this.moreInfo(el.dataset.e)));
    this.shadowRoot.querySelectorAll("[data-m]").forEach((el) => el.addEventListener("click", () => this.moreInfo(el.dataset.m)));
    this.shadowRoot.querySelectorAll("[data-t]").forEach((el) => el.addEventListener("click", () => { this.vibrate(); this.call("light", "toggle", { entity_id: el.dataset.t }); }));
  }

  getCardSize() { return this._open ? 4 : 1; }
}

// ------------------------------------------------------------------ Roost Thermostat
class RoostThermostat extends RoostBase {
  static get defaults() {
    return { style: "nest", color: "blue", show_power: true, show_plus_minus: true, modes: ["cool", "dry", "fan_only", "heat_cool", "auto"], theme: "auto", radius: 24 };
  }

  validate(c) { if (!c.entity) throw new Error("Choose an air conditioner or thermostat"); }

  watched() { return [this._config.entity, this._config.sensor].filter(Boolean); }

  signature() { return this._drag ? this._sig : super.signature(); }

  static getConfigForm() {
    return {
      schema: [
        { name: "entity", required: true, selector: { entity: { domain: "climate" } } },
        { name: "name", selector: { text: {} } },
        { name: "sensor", selector: { entity: { domain: "sensor", device_class: "temperature" } } },
        { name: "style", label: "Look", selector: pick([["nest", "Nest dial, like the phone dashboard (glows and breathes when on)"], ["classic", "Classic (your own dial colour)"]]) },
        { type: "expandable", name: "", title: "Colour and size", icon: "mdi:palette", schema: [
          ...colourFields("color", "Dial colour"),
          { name: "max_width", selector: { number: { min: 160, max: 360, step: 10, mode: "slider", unit_of_measurement: "px" } } },
          { name: "radius", selector: { number: { min: 0, max: 40, step: 2, mode: "slider", unit_of_measurement: "px" } } },
          { name: "plain", label: "No box around it (inside a Roost Panel)", selector: { boolean: {} } },
          THEME_FIELD,
        ] },
        { type: "expandable", name: "", title: "Buttons", icon: "mdi:gesture-tap-button", schema: [
          { name: "show_power", selector: { boolean: {} } },
          { name: "compact", label: "Compact: the buttons sit in the gap of the dial (for wall panels)", selector: { boolean: {} } },
          ACTION_FIELD("power_action", "The power button runs (for an AC sent by infrared, for example a script; empty = on and off)"),
          { name: "show_plus_minus", selector: { boolean: {} } },
          { name: "modes", selector: { select: { multiple: true, options: [
            { value: "cool", label: "Cool" }, { value: "heat", label: "Heat" }, { value: "dry", label: "Dry" },
            { value: "fan_only", label: "Fan" }, { value: "heat_cool", label: "Auto (heat and cool)" }, { value: "auto", label: "Auto" }] } } },
        ] },
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) { return { entity: Object.keys(hass.states).find((id) => id.startsWith("climate.")) || "" }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  get info() {
    const s = this.st();
    const a = s?.attributes || {};
    const un = !s || UNAVAILABLE.includes(s.state);
    return { s, a, un, on: !un && s.state !== "off", mn: a.min_temp ?? 16, mx: a.max_temp ?? 30, step: a.target_temperature_step || 1,
      set: a.temperature ?? null, modes: (this._config.modes || []).filter((m) => (a.hvac_modes || []).includes(m)) };
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, nest = c.style !== "classic";
    // The Nest look is the phone dashboard's own dial: cyan to purple, fixed colours, a breeze while it runs.
    const g = nest ? ["#38BDF8", "#A78BFA", "rgba(90,110,255,.9)", "#FFFFFF"] : this.colour();
    const { s, a, un, on, mn, mx, set, modes } = this.info;
    const maxW = c.max_width || (nest ? 250 : 260);
    const shown = this._value ?? set ?? 24;
    const f = Math.max(0, Math.min(1, (shown - mn) / (mx - mn)));
    const R = 96, C = 2 * Math.PI * R, L = C * 0.75, th = ((135 + 270 * f) * Math.PI) / 180;
    let ticks = "";
    for (let i = 0; i < 45; i++) {
      const q = i / 44, gg = ((135 + 270 * q) * Math.PI) / 180;
      ticks += `<line class="tk" x1="${(125 + 114 * Math.cos(gg)).toFixed(1)}" y1="${(125 + 114 * Math.sin(gg)).toFixed(1)}" x2="${(125 + 122 * Math.cos(gg)).toFixed(1)}" y2="${(125 + 122 * Math.sin(gg)).toFixed(1)}" stroke="${q <= f + 0.001 ? (on ? (q < 0.5 ? g[0] : g[1]) : p.tick) : p.track}" stroke-width="2" stroke-linecap="round"/>`;
    }
    const rs = c.sensor ? this.sx(c.sensor) : null;
    const roomV = rs && !isNaN(parseFloat(rs.state)) ? parseFloat(rs.state) : a.current_temperature;
    const room = roomV != null && !isNaN(roomV) ? Number(roomV).toFixed(1) : null; // never show "—"
    const noTemp = !un && set == null;
    // a device with both "auto" and "heat_cool" would show "Auto" twice
    const both = (a.hvac_modes || []).includes("auto") && (a.hvac_modes || []).includes("heat_cool");
    const modeName = { cool: "Cool", heat: "Heat", dry: "Dry", fan_only: "Fan", heat_cool: both ? "Heat & cool" : "Auto", auto: "Auto" };
    const act = { heating: "Heating", cooling: "Cooling", drying: "Drying", fan: "Fan on", idle: "Resting", preheating: "Warming up", defrosting: "Defrosting" }[s?.attributes.hvac_action];
    const modeWord = modeName[s?.state] || nice(s?.state);
    const status = un ? "Offline" : on ? act || `${modeWord} on` : "Off";
    const breeze = nest && on ? [100, 125, 150].map((x, i) => `<rect x="${x - 1}" y="70" width="2" height="12" rx="1" fill="${this.dark ? "#9CD8FF" : "#1E5FB8"}" style="animation:roost-breathe 1.4s ease-in-out ${i * 0.4}s infinite"/>`).join("") : "";
    const pillOn = nest ? `background:${this.dark ? "#1F3A66" : "#DCEBFF"};color:${this.dark ? "#9CD8FF" : "#1E5FB8"}` : `background:${g[0]}33;color:${g[1]}`;
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${c.plain ? `padding:0;background:none;border:0;color:${p.text}` : `border-radius:${c.radius}px;padding:${c.compact ? 16 : nest ? 24 : 18}px;background:${p.panel};${p.fx || ""};border:1px solid ${p.border};color:${p.text}`}}
      .hd{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
      .hd .n{font-size:15px;font-weight:600}
      .pill{font-size:12px;font-weight:600;padding:6px 12px;border-radius:999px;${on ? pillOn : `background:${p.inset};color:${p.muted}`}}
      svg{width:100%;max-width:${maxW}px;display:block;margin:${nest ? "10px auto 0" : "4px auto"};touch-action:none;user-select:none;-webkit-user-select:none;cursor:${noTemp || un ? "default" : "pointer"}}
      svg.on{animation:roost-arc 3s ease-in-out infinite}
      svg.drag #val{fill:#C084FC}
      .ctl{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px;margin-top:${c.compact ? -52 : nest ? 10 : 6}px;position:relative}
      @container (max-width: 260px){:host .ctl{gap:8px}}
      .rb{width:min(52px,24cqw);height:min(52px,24cqw);border-radius:50%;border:0;background:${p.inset};color:${p.text};display:flex;align-items:center;justify-content:center;cursor:pointer}
      .rb.pw{width:min(${nest ? 68 : 64}px,30cqw);height:min(${nest ? 68 : 64}px,30cqw);background:${on ? (nest ? "linear-gradient(135deg,#2F6BFF,#8B6CFF)" : `linear-gradient(135deg,${g[0]},${g[1]})`) : p.inset};color:${on ? "#fff" : nest ? p.muted : p.text};box-shadow:${on ? (nest ? "0 14px 30px -8px rgba(90,110,255,.9)" : `0 12px 28px -10px ${g[2]}`) : "none"}}
      ${nest ? ".rb.pw ha-icon{--mdc-icon-size:28px}" : ""}
      .rb:active{transform:scale(.94)}
      .mi{justify-self:end}.pl{justify-self:start}
      .modes{display:grid;grid-template-columns:repeat(${Math.max(1, modes.length)},minmax(0,1fr));gap:8px;margin-top:${nest ? 8 : 14}px}
      @container (max-width: 300px){:host .modes{grid-template-columns:repeat(2,minmax(0,1fr))}}
      .md{min-height:42px;border-radius:14px;border:0;background:${p.inset};color:${p.text};font:inherit;font-size:13px;font-weight:600;cursor:pointer;padding:6px 4px}
      .md.on{background:${nest ? "linear-gradient(135deg,#2F6BFF,#38BDF8)" : `linear-gradient(135deg,${g[0]},${g[1]})`};color:${nest ? "#fff" : g[3]}}
      ${nest ? ".md{min-height:0;padding:10px 0}" : ""}
    </style>
    <div class="card">
      <div class="hd"><span class="n t">${esc(this.name(c.entity))}</span><span class="pill">${esc(status)}</span></div>
      <svg viewBox="0 0 250 250" class="${on ? "on" : ""}">
        <defs><linearGradient id="gon" x1="0" y1="1" x2="1" y2="0">${nest ? '<stop offset="0" stop-color="#38BDF8"/><stop offset=".55" stop-color="#6D4BFF"/><stop offset="1" stop-color="#C084FC"/>' : `<stop offset="0" stop-color="${g[0]}"/><stop offset="1" stop-color="${g[1]}"/>`}</linearGradient>
        <linearGradient id="goff" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${p.offArc[0]}"/><stop offset="1" stop-color="${p.offArc[1]}"/></linearGradient></defs>
        ${ticks}
        <circle cx="125" cy="125" r="${R}" fill="none" stroke="${p.track}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${L.toFixed(1)} ${C.toFixed(1)}" transform="rotate(135 125 125)"/>
        <circle id="arc" cx="125" cy="125" r="${R}" fill="none" stroke="url(#${on ? "gon" : "goff"})" stroke-width="16" stroke-linecap="round" stroke-dasharray="${(L * f).toFixed(1)} ${C.toFixed(1)}" transform="rotate(135 125 125)"/>
        ${noTemp ? "" : `<circle id="knob" cx="${(125 + R * Math.cos(th)).toFixed(1)}" cy="${(125 + R * Math.sin(th)).toFixed(1)}" r="11" fill="#fff" stroke="rgba(255,255,255,.25)" stroke-width="6"/>`}
        <circle cx="125" cy="125" r="70" fill="${p.dial}"/>
        ${breeze}
        <text id="lab" x="125" y="104" text-anchor="middle" font-size="10" letter-spacing="1.5" fill="${p.muted}">${un ? "" : noTemp ? (room != null ? "ROOM" : "") : "SET TO"}</text>
        <text id="val" x="125" y="146" text-anchor="middle" font-size="${un || (noTemp && room == null) ? 22 : 44}" font-weight="700" fill="${p.text}">${un ? "Offline" : noTemp ? (room != null ? `${room}°` : "No setting") : `${shown}°`}</text>
        <text x="125" y="168" text-anchor="middle" font-size="12" fill="${p.muted}">${noTemp || room == null ? "" : `Room ${room}°`}</text>
      </svg>
      ${c.show_power || (c.show_plus_minus && !noTemp) ? `<div class="ctl">
        ${c.show_plus_minus && !noTemp ? '<button class="rb mi" data-d="-1" aria-label="Lower"><ha-icon icon="mdi:minus"></ha-icon></button>' : "<span></span>"}
        ${c.show_power ? `<button class="rb pw" aria-label="${on ? "Turn off" : "Turn on"}"><ha-icon icon="mdi:power"></ha-icon></button>` : "<span></span>"}
        ${c.show_plus_minus && !noTemp ? '<button class="rb pl" data-d="1" aria-label="Higher"><ha-icon icon="mdi:plus"></ha-icon></button>' : "<span></span>"}
      </div>` : ""}
      ${modes.length ? `<div class="modes">${modes.map((m) => `<button class="md ${s?.state === m ? "on" : ""}" data-m="${m}">${modeName[m] || m}</button>`).join("")}</div>` : ""}
    </div>`;
    this.wire();
  }

  valueAt(ev) {
    const b = this.shadowRoot.querySelector("svg").getBoundingClientRect();
    const x = ((ev.clientX - b.left) / b.width) * 250 - 125, y = ((ev.clientY - b.top) / b.height) * 250 - 125;
    let ang = (Math.atan2(y, x) * 180) / Math.PI;
    ang = (ang - 135 + 720) % 360;
    if (ang > 270) ang = ang > 315 ? 0 : 270;
    const { mn, mx, step } = this.info;
    return Math.max(mn, Math.min(mx, Math.round((mn + (ang / 270) * (mx - mn)) / step) * step));
  }

  paint(v) {
    const { mn, mx, on } = this.info, p = this.p, root = this.shadowRoot;
    const g = this._config.style !== "classic" ? ["#38BDF8", "#A78BFA"] : this.colour();
    const svg = root.querySelector("svg"); svg.classList.toggle("drag", !!this._drag); if (this._drag) svg.classList.remove("on");
    const f = Math.max(0, Math.min(1, (v - mn) / (mx - mn)));
    const R = 96, C = 2 * Math.PI * R, L = C * 0.75, th = ((135 + 270 * f) * Math.PI) / 180;
    root.getElementById("arc").setAttribute("stroke-dasharray", `${(L * f).toFixed(1)} ${C.toFixed(1)}`);
    root.getElementById("arc").setAttribute("stroke", "url(#gon)");
    const k = root.getElementById("knob");
    if (k) { k.setAttribute("cx", (125 + R * Math.cos(th)).toFixed(1)); k.setAttribute("cy", (125 + R * Math.sin(th)).toFixed(1)); k.setAttribute("r", "14"); }
    root.querySelectorAll(".tk").forEach((ln, i) => { const q = i / 44; ln.setAttribute("stroke", q <= f + 0.001 ? (q < 0.5 ? g[0] : g[1]) : p.track); });
    root.getElementById("val").textContent = `${v}°`;
    root.getElementById("lab").textContent = this._drag ? "LET GO TO SET" : on ? "SET TO" : "SET TO";
  }

  setTemp(v) {
    const { set } = this.info;
    if (v == null || v === set) return;
    this._value = v;
    this.call("climate", "set_temperature", { entity_id: this._config.entity, temperature: v }).then((ok) => { if (!ok) { this._value = null; this._sig = null; this.render(); } });
  }

  wire() {
    const root = this.shadowRoot, svg = root.querySelector("svg"), c = this._config;
    svg.addEventListener("pointerdown", (ev) => {
      const { un, set } = this.info;
      if (un || set == null) return;
      this._drag = true;
      svg.setPointerCapture(ev.pointerId);
      this._value = this.valueAt(ev);
      this.paint(this._value);
    });
    svg.addEventListener("pointermove", (ev) => {
      if (!this._drag) return;
      const v = this.valueAt(ev);
      if (v !== this._value) { this._value = v; this.vibrate(8); this.paint(v); }
    });
    const end = () => { if (!this._drag) return; this._drag = false; const v = this._value; this.paint(v); this.setTemp(v); };
    svg.addEventListener("pointerup", end);
    svg.addEventListener("pointercancel", end);
    root.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", () => {
      const { set, mn, mx, step } = this.info;
      const v = Math.max(mn, Math.min(mx, (this._value ?? set ?? 24) + Number(b.dataset.d) * step));
      this.vibrate(); this.paint(v); this.setTemp(v);
    }));
    root.querySelector(".pw")?.addEventListener("click", () => { this.vibrate(); if (c.power_action && c.power_action.action && c.power_action.action !== "none") this.run(c.power_action); else this.call("climate", this.info.on ? "turn_off" : "turn_on", { entity_id: c.entity }); });
    root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { this.vibrate(); this.call("climate", "set_hvac_mode", { entity_id: c.entity, hvac_mode: b.dataset.m }); }));
    this.press(root.querySelector(".hd"), () => this.moreInfo(c.entity), () => this.moreInfo(c.entity));
  }

  set hass(hass) {
    this._hass = hass;
    if (this._setup) { if (!this._setupDrawn) { this._setupDrawn = true; this.renderSetup(); } return; }
    if (this._drag) return;
    const sig = super.signature();
    if (sig === this._sig) return;
    this._sig = sig;
    this._value = null;
    this.render();
  }

  getCardSize() { return 7; }
}

// ------------------------------------------------------------------ Roost Scene
class RoostScene extends RoostBase {
  static get defaults() { return { color: "purple", style: "card", size: "large", radius: 22, fill: "gradient", glow: "soft", shape: "rounded", button_size: 58, show_name: true, theme: "auto" }; }

  validate(c) { if (!c.entity && !c.tap_action) throw new Error("Choose a scene, script or action"); }

  static getConfigForm() {
    return {
      schema: [
        { name: "entity", selector: { entity: { domain: ["scene", "script", "automation", "button", "input_button"] } } },
        { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } }] },
        { type: "expandable", name: "", title: "Colour and shape", icon: "mdi:palette", schema: [
          ...colourFields(),
          { name: "style", selector: { select: { mode: "dropdown", options: [{ value: "card", label: "Coloured card" }, { value: "round", label: "Round button with name under it" }] } } },
          { type: "grid", name: "", schema: [{ name: "fill", selector: FILL_OPTIONS }, { name: "glow", selector: GLOW_OPTIONS }] },
          { name: "show_name", selector: { boolean: {} } },
        ] },
        { type: "expandable", name: "", title: "Size and shape", icon: "mdi:shape-outline", schema: [
          { type: "grid", name: "", schema: [
            { name: "size", label: "Card size (coloured card)", selector: pick([["small", "Small"], ["medium", "Medium"], ["large", "Large"]]) },
            { name: "radius", label: "Corner roundness (coloured card)", selector: slider(0, 40, 2) },
          ] },
          { type: "grid", name: "", schema: [
            { name: "shape", label: "Button shape (round button)", selector: pick([["rounded", "Rounded square"], ["circle", "Circle"], ["square", "Square"]]) },
            { name: "button_size", label: "Button size (round button)", selector: slider(44, 100, 2) },
          ] },
          THEME_FIELD,
        ] },
        { type: "expandable", name: "", title: "Tap", icon: "mdi:gesture-tap", schema: [ACTION_FIELD("tap_action")] },
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) { return { entity: Object.keys(hass.states).find((id) => /^(scene|script)\./.test(id)) || "", color: "purple" }; }

  getGridOptions() { return this._config?.style === "round" ? { columns: 3, rows: "auto" } : { columns: 6, rows: "auto", min_columns: 3 }; }

  activate() {
    const c = this._config;
    if (c.tap_action) return this.run(c.tap_action, c.entity);
    const d = c.entity.split(".")[0];
    this.vibrate();
    if (d === "scene") return this.call("scene", "turn_on", { entity_id: c.entity });
    if (d === "script") return this.call("script", "turn_on", { entity_id: c.entity });
    if (d === "automation") return this.call("automation", "trigger", { entity_id: c.entity });
    if (d === "button" || d === "input_button") return this.call(d, "press", { entity_id: c.entity });
    return this.moreInfo(c.entity);
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, g = this.colour(), p = this.p, h = SIZES[c.size] || SIZES.large;
    const round = c.style === "round";
    const look = fillLook(c.fill, c.glow, g, p), bs = Math.max(36, Number(c.button_size) || 58);
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{position:relative;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;transition:transform .12s;
        ${round ? `display:flex;flex-direction:column;align-items:center;gap:8px;padding:0;color:${p.text}`
    : `min-height:${h}px;height:100%;border-radius:${c.radius}px;padding:14px;display:flex;flex-direction:column;justify-content:space-between;gap:8px;
          background:${look.bg};color:${look.light ? "#fff" : look.fg};border:${c.fill === "outline" ? 2 : 1}px solid ${look.border};box-shadow:${(c.glow || "soft") === "soft" && c.fill !== "outline" ? `0 14px 30px -14px ${g[2]}` : look.shadow};${look.blur ? "backdrop-filter:blur(14px);" : ""}`}}
      .card:active{transform:scale(.95)}
      .ic{display:flex;align-items:center;justify-content:center;flex:none;
        ${round ? `width:${bs}px;height:${bs}px;border-radius:${shapeRadius(c.shape, bs)};background:${look.bg};color:${look.light ? "#fff" : g[this.dark ? 1 : 0]};
          border:${c.fill === "outline" || c.fill === "glass" ? `${c.fill === "outline" ? 2 : 1}px solid ${look.border}` : "0"};box-shadow:${c.glow === "none" ? "none" : c.glow === "strong" ? look.shadow : c.fill === "outline" ? look.shadow : `0 12px 24px -10px ${g[2]}`};${look.blur ? "backdrop-filter:blur(14px);" : ""}`
    : `width:34px;height:34px;border-radius:12px;background:${look.light ? "rgba(255,255,255,.22)" : `color-mix(in srgb, ${g[0]} 30%, transparent)`}`}}
      .ic ha-icon,.ic ha-state-icon{--mdc-icon-size:${round ? Math.round(bs * 0.4) : 18}px}
      .nm{font-size:${round ? 11 : 14}px;font-weight:600;line-height:1.2;text-align:${round ? "center" : "left"}${round ? ";margin:0 -6px" : ""}}
      .done{position:absolute;top:8px;right:8px;width:22px;height:22px;border-radius:50%;background:#3DD68C;display:none;align-items:center;justify-content:center;color:#fff}
      .done.show{display:flex;animation:roost-tick 1.6s ease-out forwards}
    </style>
    <div class="card" role="button" tabindex="0" aria-label="${esc(this.name(c.entity, "Scene"))}"><div class="ic"></div>
      ${c.show_name ? `<div class="nm t">${esc(this.name(c.entity, "Scene"))}</div>` : ""}<span class="done"><ha-icon icon="mdi:check" style="--mdc-icon-size:14px"></ha-icon></span></div>`;
    this.icon(this.shadowRoot.querySelector(".ic"), c.icon, c.entity);
    const card = this.shadowRoot.querySelector(".card");
    this.press(card, async () => {
      const ok = await this.activate();
      if (ok !== false) { const d = this.shadowRoot.querySelector(".done"); d.classList.remove("show"); void d.offsetWidth; d.classList.add("show"); }
    }, () => this.moreInfo(c.entity));
  }
}

// ------------------------------------------------------------------ Roost Hero
// The greeting card: a sky that follows the sun (twinkling stars at night), a floating sun or moon,
// a soft light sweep, the date and time, the weather, and an optional "what's next" pill.
class RoostHero extends RoostBase {
  static get defaults() { return { sky: "auto", sun: "sun.sun", show_date: true, show_clock: true, show_orb: true, show_stars: true, show_sheen: true, min_height: 180, upcoming: [], upcoming_title: "Next", radius: 26, theme: "auto",
    greeting: "", show_greeting: true, show_name: true, greeting_size: 25, align: "left", show_weather: true, info: [], orb_size: 56, pill_style: "glass", tap_action: { action: "none" } }; }

  watched() { const c = this._config; return [c.weather, c.sun, ...(c.upcoming || []).map((u) => u.entity), ...(c.info || []).map((u) => u.entity), ...(c.people || []), ...(c.status_entities || [])].filter(Boolean); }

  extraSignature() { return Math.floor(Date.now() / 30000); }

  // "Doors are closed, the alarm is off and no one is home."
  status() {
    const c = this._config;
    if (c.message) return c.message;
    const ids = c.status_entities || [];
    if (!ids.length) return "";
    const out = [];
    const DOORISH = ["door", "window", "garage_door", "opening", "lock", undefined, ""];
    const MOVING = ["motion", "occupancy", "presence", "moving"];
    const dc = (id) => this.sx(id)?.attributes?.device_class;
    const doors = ids.filter((id) => /^(lock|cover)\./.test(id) || (id.startsWith("binary_sensor.") && DOORISH.includes(dc(id))));
    const moving = ids.filter((id) => id.startsWith("binary_sensor.") && MOVING.includes(dc(id)) && this.sx(id)?.state === "on");
    if (doors.length) {
      const open = doors.filter((id) => { const s = this.sx(id)?.state; return s === "on" || s === "open" || s === "unlocked" || s === "opening"; });
      out.push(open.length ? `${open.map((id) => this.name(id)).join(" and ")} ${open.length > 1 ? "are" : "is"} open` : "Doors are closed");
    }
    if (moving.length) out.push(`someone is moving: ${moving.map((id) => this.name(id)).join(", ")}`);
    ids.filter((id) => id.startsWith("alarm_control_panel.")).forEach((id) => {
      const s = this.sx(id)?.state || "";
      out.push(s === "disarmed" ? "the alarm is off" : s.startsWith("armed") ? `the alarm is on (${s.replace("armed_", "").replace("_", " ")})` : s === "triggered" ? "THE ALARM IS RINGING" : "");
    });
    const people = ids.filter((id) => id.startsWith("person."));
    if (people.length) {
      const home = people.filter((id) => this.sx(id)?.state === "home");
      out.push(home.length ? `${home.map((id) => this.name(id).split(" ")[0]).join(" and ")} ${home.length > 1 ? "are" : "is"} home` : "no one is home");
    }
    const parts = out.filter(Boolean);
    if (!parts.length) return "";
    const text = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}` : parts[0];
    return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
  }

  connectedCallback() { this._timer = setInterval(() => { if (this._hass) this.hass = this._hass; }, 30000); }

  disconnectedCallback() { clearInterval(this._timer); }

  static getConfigForm() {
    return {
      schema: [
        { type: "expandable", name: "", title: "Greeting", icon: "mdi:hand-wave-outline", schema: [
          { name: "greeting", label: "Greeting (empty = Good morning / afternoon / evening)", selector: { text: {} } },
          { name: "title", selector: { text: {} } },
          { type: "grid", name: "", schema: [{ name: "show_greeting", label: "Show the greeting", selector: { boolean: {} } }, { name: "show_name", selector: { boolean: {} } }] },
          { type: "grid", name: "", schema: [{ name: "greeting_size", label: "Greeting size", selector: slider(16, 40) }, { name: "align", selector: pick([["left", "Left"], ["center", "Centre"]]) }] },
          { type: "grid", name: "", schema: [{ name: "show_clock", selector: { boolean: {} } }, { name: "show_date", selector: { boolean: {} } }] },
        ] },
        { type: "expandable", name: "", title: "Weather and readings", icon: "mdi:weather-partly-cloudy", schema: [
          { name: "weather", selector: { entity: { domain: "weather" } } },
          { name: "show_weather", label: "Show the weather line", selector: { boolean: {} } },
          { name: "status_entities", label: "Say how the house is (doors, alarm, people), for example “Doors are closed and the alarm is off.”", selector: { entity: { multiple: true, domain: ["binary_sensor", "lock", "cover", "alarm_control_panel", "person"] } } },
          { name: "message", label: "Or your own sentence", selector: { text: {} } },
          { name: "people", label: "People chips (picture or first letter, and where they are)", selector: { entity: { multiple: true, domain: "person" } } },
          { name: "info", label: "Small readings under the weather (for example inside temperature)", selector: { object: { multiple: true, label_field: "name", fields: {
            entity: { label: "Reading", required: true, selector: { entity: {} } },
            name: { label: "Name (optional)", selector: { text: {} } },
            icon: { label: "Icon (optional)", selector: { icon: {} } },
          } } } },
        ] },
        { type: "expandable", name: "", title: "What's next pill", icon: "mdi:clock-outline", schema: [
          { name: "upcoming_title", label: "Pill title (for example “Next prayer”)", selector: { text: {} } },
          { name: "upcoming", label: "Times to count down to (the soonest is shown)", selector: { object: { multiple: true, label_field: "name", fields: {
            name: { label: "Name", required: true, selector: { text: {} } },
            entity: { label: "Time (a date/time sensor)", required: true, selector: { entity: { domain: ["sensor", "input_datetime", "calendar"] } } },
          } } } },
        ] },
        { type: "expandable", name: "", title: "Sky and shape", icon: "mdi:palette", schema: [
          { name: "sky", label: "Background", selector: { select: { mode: "dropdown", options: [{ value: "auto", label: "Sky that follows the sun" },
            ...Object.keys(SKIES).map((k) => ({ value: k, label: SKIES[k][1] })), ...COLOR_OPTIONS] } } },
          { name: "sky_start", label: "First colour (my own colours)", selector: { color_rgb: {} } },
          { name: "sky_end", label: "Second colour (my own colours)", selector: { color_rgb: {} } },
          { name: "sun", label: "Sun (for day and night)", selector: { entity: { domain: "sun" } } },
          { type: "grid", name: "", schema: [{ name: "radius", selector: slider(0, 40, 2) }, { name: "min_height", selector: slider(120, 280, 10) }] },
          { type: "grid", name: "", schema: [{ name: "show_orb", selector: { boolean: {} } }, { name: "show_stars", selector: { boolean: {} } }, { name: "show_sheen", selector: { boolean: {} } }] },
          { name: "house", label: "House picture with lit windows (good on tablets)", selector: { boolean: {} } },
          { type: "grid", name: "", schema: [{ name: "orb_size", label: "Sun / moon size", selector: slider(28, 96, 2) }, { name: "pill_style", label: "Pill look", selector: pick([["glass", "Dark glass"], ["light", "Light glass"], ["none", "No background"]]) }] },
          ACTION_FIELD("tap_action"),
          THEME_FIELD,
        ] },
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) { return { weather: Object.keys(hass.states).find((id) => id.startsWith("weather.")) || "" }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  nextUp() {
    const now = Date.now();
    const list = (this._config.upcoming || []).map((u) => {
      const s = this.sx(u.entity);
      if (!s) return null;
      const raw = s.entity_id.startsWith("calendar.") ? s.attributes.start_time : s.entity_id.startsWith("input_datetime.") ? (s.attributes.timestamp ? s.attributes.timestamp * 1000 : s.state) : s.state;
      let t = new Date(raw).getTime();
      if (!Number.isFinite(t)) return null;
      while (t <= now && s.entity_id.startsWith("sensor.")) t += 86400000; // daily times: tomorrow's
      return t > now ? { name: u.name, t } : null;
    }).filter(Boolean).sort((a, b) => a.t - b.t);
    return list[0] || null;
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, now = new Date(), hr = now.getHours();
    const sun = this.sx(c.sun);
    const day = sun ? sun.state === "above_horizon" : hr >= 6 && hr < 18;
    const part = c.greeting ? c.greeting : hr < 5 ? "Good night" : hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
    const who = c.show_name ? c.title || (this._hass.user?.name || "").split(" ")[0] : "";
    const os = Math.max(20, Number(c.orb_size) || 56);
    const osz = os !== 56 ? os : day ? 56 : 52; // the moon is a little smaller, as on the original
    const info = (c.info || []).map((it) => {
      const st = this.sx(it.entity);
      if (!st || UNAVAILABLE.includes(st.state)) return "";
      const v = isNaN(parseFloat(st.state)) ? st.state : `${Math.round(parseFloat(st.state) * 10) / 10}${st.attributes.unit_of_measurement || ""}`;
      return `<span class="inf t" data-e="${esc(it.entity)}">${it.icon ? `<ha-icon icon="${esc(it.icon)}"></ha-icon>` : ""}${it.name ? `${esc(it.name)} ` : ""}<b>${esc(v)}</b></span>`;
    }).join("");
    const say = this.status();
    const PG = [["#38BDF8", "#6D4BFF"], ["#FF5577", "#FF9F6B"], ["#10B981", "#6EE7B7"], ["#F59E0B", "#FDE68A"]];
    const chips = (c.people || []).map((id, k) => {
      const st = this.sx(id);
      if (!st) return "";
      const nm = this.name(id).split(" ")[0], pic = st.attributes.entity_picture;
      const where = st.state === "home" ? "" : UNAVAILABLE.includes(st.state) ? "Location off" : st.state === "not_home" ? "Away" : st.state;
      return `<span class="who t" data-e="${esc(id)}"><span class="av" style="background:linear-gradient(135deg,${PG[k % 4][0]},${PG[k % 4][1]})">${pic ? `<img src="${esc(pic)}" alt="">` : esc(nm.charAt(0).toUpperCase())}</span>${esc(nm)}${where ? ` · ${esc(where)}` : ""}</span>`;
    }).join("");
    const house = c.house ? `<svg class="house" aria-hidden="true" width="230" height="130" viewBox="0 0 230 130"><path d="M10 130V70L70 28l60 42v60z" fill="${day ? "rgba(255,255,255,.18)" : "#120F33"}"/><path d="M120 130V58l45-32 45 32v72z" fill="${day ? "rgba(255,255,255,.12)" : "#0E0B2A"}"/>
      <rect x="38" y="78" width="18" height="18" rx="3" fill="#FCD34D" class="win"/><rect x="82" y="78" width="18" height="18" rx="3" fill="#FCD34D" opacity=".35"/>
      <rect x="148" y="70" width="16" height="16" rx="3" fill="#A78BFA" class="win" style="animation-delay:.8s;animation-duration:4.4s"/><rect x="174" y="96" width="16" height="34" rx="3" fill="${day ? "rgba(255,255,255,.2)" : "#2A2560"}"/><rect x="58" y="104" width="22" height="26" rx="3" fill="${day ? "rgba(255,255,255,.2)" : "#2A2560"}"/></svg>` : "";
    const w = this.sx(c.weather);
    const temp = w?.attributes.temperature;
    const unit = (w?.attributes.temperature_unit || "°C").replace(/^°?/, "°");
    const cond = w && !UNAVAILABLE.includes(w.state) ? w.state.replace("clear-night", "clear").replace("partlycloudy", "partly cloudy").replace(/-/g, " ") : "";
    const sky = c.sky === "auto" || !c.sky ? SKIES[day ? "day" : "night"][0]
      : SKIES[c.sky] ? SKIES[c.sky][0]
      : (() => { const g = this.colour("sky"); return `linear-gradient(115deg,${g[0]} 0%,${g[1]} 100%)`; })();
    let stars = "";
    if (!day && c.show_stars) for (let j = 0; j < 22; j++) stars += `<span class="star" style="left:${(j * 37 + 11) % 96}%;top:${(j * 53 + 7) % 88}%;width:${1 + (j % 3)}px;height:${1 + (j % 3)}px;animation-duration:${2.4 + (j % 5) * 0.7}s;animation-delay:${((j * 0.37) % 3).toFixed(2)}s"></span>`;
    const orb = day ? "background:radial-gradient(circle at 40% 40%,#FFF7D6,#FDE047 55%,#F59E0B);box-shadow:0 0 50px 16px rgba(253,224,71,.45)"
      : "background:radial-gradient(circle at 36% 34%,#FFFBEA 0%,#F6E3A6 62%,#E2C273 100%);box-shadow:0 0 40px 12px rgba(255,234,170,.28)";
    const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const date = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
    const top = [c.show_date ? date : "", c.show_clock ? time : ""].filter(Boolean).join(" · ");
    const nx = this.nextUp();
    let pill = "";
    if (nx) {
      const dm = Math.max(0, Math.round((nx.t - now.getTime()) / 60000));
      const left = `${Math.floor(dm / 60) ? `${Math.floor(dm / 60)}h ` : ""}${dm % 60}m`;
      const at = new Date(nx.t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      pill = `<div class="pill"><span class="dot"><span></span></span><span class="t" style="flex:1">${esc(c.upcoming_title || "Next")} <b>${esc(nx.name)}</b> at ${esc(at)}</span><b class="cd">in ${esc(left)}</b></div>`;
    }
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{position:relative;overflow:hidden;border-radius:${c.radius}px;padding:20px;min-height:${Number(c.min_height) || 180}px;color:#fff;background:${sky}}
      .star{position:absolute;border-radius:50%;background:#fff;animation:roost-twinkle 3s ease-in-out infinite}
      .sheen{position:absolute;top:0;bottom:0;left:0;width:70px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.12),rgba(255,255,255,0));animation:roost-sheen 8s ease-in-out 1s infinite;pointer-events:none}
      @container (max-width: 300px){:host .orb{width:34px;height:34px;right:14px;top:14px}:host .hi{padding:0;font-size:min(${Number(c.greeting_size) || 25}px,13cqw)}:host .top{padding:0 44px 0 0}:host .card{padding:16px}}
      .orb{position:absolute;right:24px;top:22px;width:${osz}px;height:${osz}px;border-radius:50%;${orb};animation:roost-float 6s ease-in-out infinite}
      .body{position:relative;display:flex;flex-direction:column;gap:8px;${c.align === "center" ? "align-items:center;text-align:center;" : ""}}
      .infos{display:flex;flex-wrap:wrap;gap:6px;${c.align === "center" ? "justify-content:center;" : ""}}
      .inf{display:inline-flex;align-items:center;gap:5px;font-size:13px;padding:4px 10px;border-radius:999px;background:rgba(10,8,40,.25);cursor:pointer}
      .inf ha-icon{--mdc-icon-size:15px}
      .top{font-size:13px;opacity:.85;${c.show_orb ? `padding:0 ${os + 12}px 0 ${c.align === "center" ? os + 12 : 0}px` : ""}}
      .hi{font-size:${Number(c.greeting_size) || 25}px;font-weight:700;letter-spacing:-.4px;line-height:1.15;padding:0 ${c.show_orb ? os + 12 : 0}px 0 ${c.show_orb && c.align === "center" ? os + 12 : 0}px;font-family:${FONT_NUM}}
      .wx{font-size:14px;line-height:1.5;opacity:.9;cursor:${w ? "pointer" : "default"}}
      .pill{display:flex;align-items:center;gap:10px;background:${c.pill_style === "none" ? "transparent" : c.pill_style === "light" ? "rgba(255,255,255,.22)" : "rgba(10,8,40,.3)"};${c.align === "center" ? "align-self:stretch;" : ""}border-radius:16px;padding:10px 12px;margin-top:6px;font-size:13px}
      .pill b.cd{font-size:14px;flex:none}
      @container (max-width: 260px){:host .pill{flex-wrap:wrap}:host .pill b.cd{flex-basis:100%;padding-left:22px}}
      .house{position:absolute;right:-6px;bottom:-4px;pointer-events:none}
      .house .win{animation:roost-breathe 3.2s ease-in-out infinite}
      @keyframes roost-breathe{0%,100%{opacity:.55}50%{opacity:1}}
      .orb.wh{right:210px}
      @container (max-width: 520px){:host .house{display:none}:host .orb.wh{right:24px}}
      .say{font-size:15px;line-height:1.5;opacity:.9;max-width:470px}
      .whos{display:flex;flex-wrap:wrap;gap:8px}
      .who{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.12);border-radius:999px;padding:4px 12px 4px 4px;font-size:13px;cursor:pointer}
      .av{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;overflow:hidden;flex:none}
      .av img{width:100%;height:100%;object-fit:cover}
      .dot{position:relative;width:10px;height:10px;border-radius:50%;background:#E9E2FF;flex:none}
      .dot span{position:absolute;inset:0;border-radius:50%;background:#E9E2FF;animation:roost-ping 1.8s ease-out infinite}
    </style>
    <div class="card">${stars}${c.show_sheen ? '<span class="sheen"></span>' : ""}${c.show_orb ? `<span class="orb${c.house ? " wh" : ""}"></span>` : ""}${house}
      <div class="body">
        ${top ? `<span class="top t">${esc(top)}</span>` : ""}
        ${c.show_greeting ? `<span class="hi t">${esc(part)}${who ? `, ${esc(who)}` : ""}</span>` : ""}
        ${c.show_weather && w && temp != null ? `<span class="wx t">${esc(Math.round(temp) + unit)}${cond ? ` · ${esc(cond)}` : ""}</span>` : ""}
        ${info ? `<div class="infos">${info}</div>` : ""}
        ${say ? `<span class="say t">${esc(say)}</span>` : ""}
        ${chips ? `<div class="whos">${chips}</div>` : ""}
        ${pill}
      </div></div>`;
    this.shadowRoot.querySelectorAll(".inf,.who").forEach((el) => el.addEventListener("click", (e) => { e.stopPropagation(); this.moreInfo(el.dataset.e); }));
    if ((c.tap_action || {}).action && c.tap_action.action !== "none") {
      const card = this.shadowRoot.querySelector(".card");
      card.style.cursor = "pointer";
      this.press(card, () => this.run(c.tap_action), () => {});
    }
    const wx = this.shadowRoot.querySelector(".wx");
    if (wx) wx.addEventListener("click", (e) => { e.stopPropagation(); this.moreInfo(c.weather); });
  }
}

// ------------------------------------------------------------------ Roost Nav
// A bottom bar on phones and a side rail on tablets ("auto"), or always one of them.
const slug = (v) => String(v || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\u0600-\u06ff]+/g, "-").replace(/^-+|-+$/g, "");

class RoostNav extends RoostBase {
  static get defaults() { return { items: [], layout: "auto", show_labels: true, fixed: true, color: "active", active_style: "filled", background: "glass", bar_height: 54, icon_size: 21, radius: 26, rail_style: "floating", logo: "", push_content: true, theme: "auto" }; }

  validate(c) { if (!Array.isArray(c.items) || !c.items.length) throw new Error("Add at least one button"); }

  watched() { return []; }

  extraSignature() { return `${location.pathname}${location.hash}|${RoostFull.isOn() ? 1 : 0}|${this._hass?.themes?.darkMode ? 1 : 0}|${window.innerWidth >= 768}|${this.editing()}|${RoostNav.sideEdge()}|${RoostNav.topEdge()}`; }

  logoHtml() {
    const l = String(this._config.logo || "").trim();
    if (!l) return "";
    const st = l.includes(".") ? this.sx(l) : null;
    if (st) {
      const pic = st.attributes.entity_picture;
      return `<span class="logo">${pic ? `<img src="${esc(pic)}" alt="">` : esc(this.name(l).charAt(0).toUpperCase())}</span>`;
    }
    return `<span class="logo">${esc(l.slice(0, 2))}</span>`;
  }

  // Where Home Assistant's own top bar ends (0 when it is hidden).
  static topEdge() {
    try {
      const root = document.querySelector("home-assistant")?.shadowRoot?.querySelector("home-assistant-main")?.shadowRoot
        ?.querySelector("ha-panel-lovelace")?.shadowRoot?.querySelector("hui-root")?.shadowRoot;
      const hd = root?.querySelector(".header, app-header, .toolbar");
      if (!hd) return 0;
      const r = hd.getBoundingClientRect();
      return r.height > 4 && getComputedStyle(hd).display !== "none" ? Math.max(0, Math.round(r.bottom)) : 0;
    } catch (e) { return 0; }
  }

  // Keeps the page's cards out from under a pinned side rail.
  makeRoom(px, side) {
    try {
      const root = document.querySelector("home-assistant")?.shadowRoot?.querySelector("home-assistant-main")?.shadowRoot
        ?.querySelector("ha-panel-lovelace")?.shadowRoot?.querySelector("hui-root")?.shadowRoot;
      if (!root) return;
      let el = root.getElementById("roost-nav-room");
      if (!px) { if (el) el.remove(); return; }
      if (!el) { el = document.createElement("style"); el.id = "roost-nav-room"; root.appendChild(el); }
      el.textContent = side === "bottom" ? `#view{padding-bottom:calc(${px}px + env(safe-area-inset-bottom))!important;box-sizing:border-box}` : `#view{padding-left:${px}px!important;box-sizing:border-box}`;
    } catch (e) { /* nothing to move */ }
  }

  // Where Home Assistant's own side menu ends (0 when it is hidden or folded away as a pop-out on phones).
  // A pinned bar or rail starts after it, so the menu never covers the buttons.
  static sideEdge() {
    try {
      const main = document.querySelector("home-assistant")?.shadowRoot?.querySelector("home-assistant-main");
      const bar = main?.shadowRoot?.querySelector("ha-sidebar");
      if (!bar) return 0;
      const r = bar.getBoundingClientRect();
      if (r.width < 8 || r.right <= 0 || r.left >= window.innerWidth / 2 || getComputedStyle(bar).display === "none" || getComputedStyle(bar).visibility === "hidden") return 0;
      return Math.round(r.right);
    } catch (e) { return 0; }
  }

  watchSide() {
    try {
      const bar = document.querySelector("home-assistant")?.shadowRoot?.querySelector("home-assistant-main")?.shadowRoot?.querySelector("ha-sidebar");
      if (!bar || this._sideBar === bar || !window.ResizeObserver) return;
      this._sideObs?.disconnect();
      this._sideBar = bar;
      this._sideObs = new ResizeObserver(() => { if (this._hass) { this._sig = null; this.hass = this._hass; } });
      this._sideObs.observe(bar);
    } catch (e) { /* no side menu to watch */ }
  }

  // While the dashboard is being edited, the bar sits in its own place so it can be found and tapped to edit.
  editing() { return !!(this.preview || this.editMode || /[?&]edit=1/.test(location.search) || this.closest?.("hui-card-preview, hui-dialog-edit-card")); }

  set preview(v) { this._preview = v; this._sig = null; if (this._hass) this.hass = this._hass; }

  get preview() { return this._preview; }

  set editMode(v) { this._editMode = v; this._sig = null; if (this._hass) this.hass = this._hass; }

  get editMode() { return this._editMode; }

  connectedCallback() {
    this._onLoc = () => { this._sig = null; if (this._hass) this.hass = this._hass; };
    window.addEventListener("location-changed", this._onLoc);
    window.addEventListener("hashchange", this._onLoc);
    window.addEventListener("resize", this._onLoc);
    setTimeout(() => this.watchSide(), 300);
  }

  static getConfigForm() {
    return {
      schema: [
        { name: "items", label: "Buttons in the bar", selector: { object: { multiple: true, label_field: "name", fields: {
          name: { label: "Name", selector: { text: {} } },
          icon: { label: "Icon", required: true, selector: { icon: {} } },
          path: { label: "Opens (for example /dashboard-home/0 or #rooms)", selector: { text: {} } },
          action: { label: "Or does", selector: { select: { mode: "dropdown", options: [{ value: "navigate", label: "Open the page above" }, ...SPECIAL_DOES] } } },
          match: { label: "Also lights up on these pages", selector: { select: { multiple: true, custom_value: true, options: [] } } },
          users: { label: "Only for these people (empty = everyone)", selector: { entity: { multiple: true, domain: "person" } } },
          bottom: { label: "At the far end of the side rail (for example Settings)", selector: { boolean: {} } },
        } } } },
        { type: "grid", name: "", schema: [
          { name: "layout", selector: { select: { mode: "dropdown", options: [{ value: "auto", label: "Bar on phones, rail on tablets" }, { value: "bar", label: "Always a bottom bar" }, { value: "rail", label: "Always a side rail" }] } } },
          { name: "show_labels", selector: { boolean: {} } },
        ] },
        { name: "fixed", label: "Pinned to the edge of the screen", selector: { boolean: {} } },
        { type: "expandable", name: "", title: "Side rail (tablets and wall panels)", icon: "mdi:tablet", schema: [
          { name: "rail_style", label: "Rail shape", selector: pick([["floating", "Floating in the middle of the side"], ["full", "Full height, from top to bottom"]]) },
          { name: "logo", label: "At the top of the rail: a letter or word, or a person (their picture)", selector: { text: {} } },
          { name: "push_content", label: "Leave room so the bar or rail never covers cards", selector: { boolean: {} } },
        ] },
        { type: "expandable", name: "", title: "Look", icon: "mdi:palette", schema: [
          ...colourFields("color", "Colour of the chosen button"),
          { name: "active_style", selector: pick([["filled", "Filled square with glow"], ["soft", "Soft tinted square"], ["pill", "Filled pill"], ["line", "Line under it"], ["dot", "Dot under it"], ["icon", "Coloured icon only"]]) },
          { type: "grid", name: "", schema: [
            { name: "background", selector: pick([["glass", "Frosted glass"], ["solid", "Solid"], ["none", "None (clear)"]]) },
            { name: "radius", selector: slider(0, 40, 2) },
          ] },
          { type: "grid", name: "", schema: [{ name: "bar_height", selector: slider(40, 76, 2) }, { name: "icon_size", selector: slider(16, 32) }] },
          THEME_FIELD,
        ] },
      ],
      computeLabel,
    };
  }

  static getStubConfig() {
    return { items: [{ name: "Home", icon: "mdi:home", path: "#home" }, { name: "Rooms", icon: "mdi:view-grid", path: "#rooms" }, { name: "Security", icon: "mdi:shield-home", path: "#security" }] };
  }

  getGridOptions() { return { columns: 12, rows: "auto" }; }

  active(path, it) {
    if (it?.action === "fullscreen" || !path) return false;
    if (Array.isArray(it?.match) && it.match.some((m) => (String(m).startsWith("#") ? location.hash === m : location.pathname.startsWith(m)))) return true;
    const here = `${location.pathname}${location.hash}`;
    if (path.startsWith("#")) return location.hash === path || (!location.hash && this._config.items[0]?.path === path);
    return here === path || location.pathname === path;
  }

  // Home Assistant's pop-up messages ("Starting broadlink") appear at the bottom of the screen, on top of the bar,
  // and catch the taps meant for it. While a pinned bar is shown, they are lifted above it.
  liftToasts(on) {
    try {
      const nm = document.querySelector("home-assistant")?.shadowRoot?.querySelector("notification-manager")?.shadowRoot;
      if (!nm) return;
      let el = nm.getElementById("roost-nav-toast");
      if (!on) { if (el) el.remove(); return; }
      if (!el) { el = document.createElement("style"); el.id = "roost-nav-toast"; nm.appendChild(el); }
      el.textContent = ".stack{bottom:calc(96px + env(safe-area-inset-bottom))!important}";
    } catch (e) { /* nothing to lift */ }
  }

  disconnectedCallback() {
    this._sideObs?.disconnect(); this._sideBar = null;
    window.removeEventListener("location-changed", this._onLoc);
    window.removeEventListener("hashchange", this._onLoc);
    window.removeEventListener("resize", this._onLoc);
    if (this._room) { this._room = 0; this.makeRoom(0); }
    if (this._lifted) { this._lifted = false; RoostNav.lifts = Math.max(0, (RoostNav.lifts || 1) - 1); setTimeout(() => { if (!RoostNav.lifts) this.liftToasts(false); }, 400); } }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour();
    const editing = this.editing();
    const lift = !!c.fixed && !editing;
    if (lift !== !!this._lifted) { this._lifted = lift; RoostNav.lifts = Math.max(0, (RoostNav.lifts || 0) + (lift ? 1 : -1)); if (lift || !RoostNav.lifts) this.liftToasts(lift); }
    else if (lift) this.liftToasts(true);
    const rail = !editing && (c.layout === "rail" || (c.layout === "auto" && window.innerWidth >= 768));
    const fixed = c.fixed && !editing;
    const uid = this._hass.user?.id;
    const mine = (list) => list.some((u) => u === uid || this._hass.states[u]?.attributes.user_id === uid);
    const shown = c.items.map((it, i) => ({ it, i })).filter(({ it }) => editing || !Array.isArray(it.users) || !it.users.length || mine(it.users));
    const edge = fixed ? RoostNav.sideEdge() : 0;
    if (fixed) this.watchSide();
    const full = rail && c.rail_style === "full";
    const top = full && fixed ? RoostNav.topEdge() : 0;
    const pos = fixed ? (rail ? (full ? `position:fixed;left:${edge + 24}px;top:${top + 24}px;bottom:24px;z-index:4` : `position:fixed;left:${edge + 16}px;top:50%;transform:translateY(-50%);z-index:4`) : `position:fixed;left:calc(${edge}px + (100% - ${edge}px) / 2);bottom:calc(14px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:4`) : "";
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      :host{${fixed ? (rail || c.push_content !== false ? "height:0;" : "height:calc(76px + env(safe-area-inset-bottom));") : ""}display:block}
      .edit{font-size:12px;color:${p.muted};text-align:center;margin:0 0 6px}
      nav{${pos};display:${rail ? "flex" : "grid"};${rail ? "flex-direction:column" : `grid-template-columns:repeat(${shown.length},minmax(0,1fr))`};gap:${rail ? 12 : 7}px;padding:${rail ? "14px 10px" : "8px"};border-radius:${Number(c.radius) + (rail ? 2 : 0)}px;
        ${c.background === "none" ? "background:transparent;border:0;" : c.background === "solid" ? `background:${this.dark ? "#141831" : "#FFFFFF"};border:1px solid ${p.border};box-shadow:0 18px 40px -16px ${this.dark ? "rgba(0,0,0,.5)" : "rgba(40,30,90,.16)"};`
    : `background:linear-gradient(180deg, ${g[0]}24, transparent 70%), ${p.panel};border:1px solid ${g[1]}47;backdrop-filter:blur(${Number(c.blur ?? 18)}px) saturate(150%);-webkit-backdrop-filter:blur(${Number(c.blur ?? 18)}px) saturate(150%);box-shadow:0 18px 40px -12px ${this.dark ? "rgba(0,0,0,.6)" : "rgba(40,30,90,.18)"}, 0 0 0 1px rgba(255,255,255,.04) inset;`}
        ${rail ? "width:max-content" : `width:${fixed ? "calc(100% - 24px)" : "100%"};max-width:536px`};${fixed ? "" : "margin:0 auto"}}
      a{position:relative;min-width:${rail ? 56 : 0}px;min-height:${Number(c.bar_height) || 54}px;border-radius:${c.active_style === "pill" ? 999 : Math.max(8, Number(c.radius) - 8)}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
        color:${p.muted};text-decoration:none;font-size:clamp(8.5px, 2.7vw, 10.5px);font-weight:600;-webkit-tap-highlight-color:transparent;padding:4px 6px;transition:background .12s}
      ${{
    filled: `a.on{color:${g[3]}}`,
    pill: `a.on{color:${g[3]}}`,
    soft: `a.on{color:${g[this.dark ? 1 : 0]}}`,
    line: `a.on{color:${g[this.dark ? 1 : 0]}}a.on::after{content:"";position:absolute;bottom:3px;left:30%;right:30%;height:3px;border-radius:3px;background:linear-gradient(90deg,${g[0]},${g[1]})}`,
    dot: `a.on{color:${g[this.dark ? 1 : 0]}}a.on::after{content:"";position:absolute;bottom:3px;left:50%;width:6px;height:6px;margin-left:-3px;border-radius:50%;background:${g[1]};box-shadow:0 0 8px ${g[2]}}`,
    icon: `a.on{color:${g[this.dark ? 1 : 0]}}a.on ha-icon{filter:drop-shadow(0 0 6px ${g[2]})}`,
  }[c.active_style] || ""}
      a:active{transform:scale(.94)}
      nav{position:${fixed ? "fixed" : "relative"}}
      a{z-index:1}
      a ha-icon{--mdc-icon-size:${Number(c.icon_size) || 22}px}
      a{min-width:0}
      @container (max-width: ${shown.length * 64}px){:host a span{display:none}:host a{padding:4px 2px}:host nav{padding:4px;gap:2px}}
      @media (max-width: 360px){nav{gap:2px;padding:6px}a{padding:4px 2px}}
      ${full ? `nav{align-items:center;padding:16px 12px;gap:10px;box-sizing:border-box;${fixed ? "" : "min-height:480px;"}}a{width:48px;min-width:48px;min-height:48px;padding:0}a span{display:none}` : ""}
      .grow{flex:1 1 auto}
      .logo{width:44px;height:44px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;margin-bottom:14px;overflow:hidden;
        background:linear-gradient(135deg,${g[0]},#38BDF8);color:#fff;font-weight:700;font-size:20px;box-shadow:0 8px 24px -6px ${g[2]}}
      .logo img{width:100%;height:100%;object-fit:cover}
    </style>
    ${editing && c.fixed ? '<div class="edit t">Bottom bar · shown here while editing, pinned to the bottom of the screen when you are done</div>' : ""}<nav aria-label="Navigation">${rail ? this.logoHtml() : ""}${shown.map(({ it, i }, k) => `${rail && it.bottom && !shown.slice(0, k).some((x) => x.it.bottom) ? '<span class="grow"></span>' : ""}<a href="${esc(it.path || "#")}" data-i="${i}" class="${this.active(it.path, it) ? "on" : ""}" aria-label="${esc(specialLabel(it.action) || it.name || it.path)}">
      <ha-icon icon="${esc(specialIcon(it.action) || it.icon || "mdi:circle")}"></ha-icon>${c.show_labels && it.name ? `<span class="t">${esc(it.name)}</span>` : ""}</a>`).join("")}</nav>`;
    const pillCss = { filled: `background:linear-gradient(135deg,${g[0]},${g[1]});box-shadow:0 10px 24px -8px color-mix(in srgb, ${g[0]} 95%, transparent), inset 0 1px 0 rgba(255,255,255,.35)`,
      pill: `background:linear-gradient(135deg,${g[0]},${g[1]});box-shadow:0 10px 22px -8px ${g[2]}`, soft: `background:${g[0]}2E` }[c.active_style];
    if (pillCss) {
      const key = (c.items || []).map((it) => it.path).join("|"), memo = (RoostNav.memo = RoostNav.memo || {})[key] || (RoostNav.memo[key] = {});
      const navEl = this.shadowRoot.querySelector("nav"), on = navEl?.querySelector("a.on");
      const draw = () => this.slidePill(navEl, on, memo, `${pillCss};border-radius:${c.active_style === "pill" ? 999 : Math.max(8, Number(c.radius) - 8)}px`);
      if (on) (window.requestAnimationFrame || setTimeout)(draw);
    }
    if (rail && fixed && c.push_content !== false) {
      (window.requestAnimationFrame || setTimeout)(() => {
        const nv = this.shadowRoot.querySelector("nav");
        if (!nv) return;
        const r = nv.getBoundingClientRect();
        this._room = Math.max(0, Math.round(r.right - RoostNav.sideEdge() + 4));
        this.makeRoom(this._room);
      });
    } else if (!rail && fixed && c.push_content !== false) {
      // A pinned bottom bar: leave room under the last card so the bar never covers it.
      (window.requestAnimationFrame || setTimeout)(() => {
        const nv = this.shadowRoot.querySelector("nav");
        if (!nv) return;
        this._room = Math.max(0, Math.round(nv.getBoundingClientRect().height + 28));
        this.makeRoom(this._room, "bottom");
      });
    } else if (this._room) { this._room = 0; this.makeRoom(0); }
    this.shadowRoot.querySelectorAll("a").forEach((a) => a.addEventListener("click", (ev) => {
      const it = c.items[+a.dataset.i];
      ev.preventDefault();
      const mk = (c.items || []).map((x) => x.path).join("|"); ((RoostNav.memo = RoostNav.memo || {})[mk] = RoostNav.memo[mk] || {}).go = Date.now();
      this.vibrate();
      if (it.action === "fullscreen" || it.action === "theme") { specialRun(it.action); setTimeout(() => { this._sig = null; this.hass = this._hass; }, 120); return; }
      if (!it.path) return;
      if (it.path.startsWith("#")) { if (location.hash === it.path) RoostNav.jump(it.path, it.path === c.items[0]?.path); else location.hash = it.path; }
      else { history.pushState(null, "", it.path); this.fire("location-changed", { replace: false }); }
      this._sig = null; this.hass = this._hass;
    }));
  }

  getCardSize() { return this._config?.fixed && !this.editing() ? 0 : 1; }

  // "#rooms" scrolls to the Roost Title on this page called "Rooms" (or whose "Jump name" is rooms).
  // The first button goes back to the top when there is no title for it.
  static jump(hash, first) {
    const want = slug(String(hash).replace(/^#/, ""));
    if (!want) return;
    const found = [], walk = (root, depth) => {
      if (!root || depth > 14 || found.length) return;
      for (const el of root.querySelectorAll("*")) {
        if (el.localName === "roost-title" && el._config) {
          const c = el._config;
          if (slug(c.anchor || "") === want || slug(c.title || "") === want) { found.push(el); return; }
        }
        if (el.shadowRoot) walk(el.shadowRoot, depth + 1);
        if (found.length) return;
      }
    };
    walk(document, 0);
    if (found[0]) found[0].scrollIntoView({ behavior: "smooth", block: "start" });
    else if (first) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      const walkTop = (root, d) => { if (!root || d > 14) return; for (const el of root.querySelectorAll("*")) { if (el.scrollTop > 0 && el.scrollHeight > el.clientHeight) el.scrollTo({ top: 0, behavior: "smooth" }); if (el.shadowRoot) walkTop(el.shadowRoot, d + 1); } };
      walkTop(document, 0);
    }
  }
}
if (!window.__roostJump) {
  window.__roostJump = true;
  window.addEventListener("hashchange", () => {
    setTimeout(() => RoostNav.jump(location.hash, true), 60);
  });
}

// ------------------------------------------------------------------ Roost Row
// A long row: a ring with the number (an AC's set temperature, or any sensor), a name, a short state line and an arrow.
class RoostRow extends RoostBase {
  static get defaults() { return { color: "blue", min: 16, max: 30, radius: 22, ring_size: 58, ring_width: 6, tap_action: { action: "more-info" }, theme: "auto" }; }

  validate(c) { if (!c.entity) throw new Error("Choose a device"); }

  static getConfigForm() {
    return {
      schema: [
        { name: "entity", required: true, selector: { entity: {} } },
        { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "icon", label: "Icon in the ring (instead of a number)", selector: { icon: {} } }] },
        { type: "expandable", name: "", title: "Ring", icon: "mdi:circle-slice-5", schema: [
          { type: "grid", name: "", schema: [
            { name: "min", label: "Ring starts at", selector: { number: { mode: "box" } } },
            { name: "max", label: "Ring is full at", selector: { number: { mode: "box" } } },
          ] },
          ...colourFields("color", "Ring colour"),
          { type: "grid", name: "", schema: [{ name: "ring_size", selector: slider(40, 96, 2) }, { name: "ring_width", selector: slider(2, 12) }] },
          { name: "radius", selector: { number: { min: 0, max: 40, step: 2, mode: "slider", unit_of_measurement: "px" } } },
          THEME_FIELD,
        ] },
        { type: "expandable", name: "", title: "Tap", icon: "mdi:gesture-tap", schema: [ACTION_FIELD("tap_action")] },
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) { return { entity: Object.keys(hass.states).find((id) => id.startsWith("climate.")) || "" }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  reading(s) {
    const d = s.entity_id.split(".")[0], a = s.attributes;
    if (d === "climate") {
      const v = a.temperature ?? a.current_temperature;
      const mode = s.state === "off" ? "off" : s.state.replace("_only", "").replace("heat_cool", "auto");
      return { value: v, text: v != null ? `${Math.round(v)}°` : null, line: `AC ${mode}${s.state !== "off" && a.current_temperature != null ? ` · room ${a.current_temperature}°` : ""}`, min: a.min_temp, max: a.max_temp };
    }
    const n = parseFloat(s.state);
    if (Number.isFinite(n)) return { value: n, text: `${Math.round(n * 10) / 10}${a.unit_of_measurement && /^(°|°C|°F|%)$/.test(a.unit_of_measurement) ? a.unit_of_measurement : ""}`, line: a.unit_of_measurement && a.unit_of_measurement.length > 2 ? `${n} ${a.unit_of_measurement}` : "" };
    return { value: null, text: null, line: s.state.charAt(0).toUpperCase() + s.state.slice(1) };
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour(), s = this.st();
    const un = !s || UNAVAILABLE.includes(s.state);
    const r = s && !un ? this.reading(s) : { value: null, text: null, line: s ? "Offline" : "Device not found" };
    const mn = r.min ?? c.min, mx = r.max ?? c.max;
    const f = r.value == null ? 0 : Math.max(0, Math.min(1, (r.value - mn) / (mx - mn || 1)));
    const rs = Math.max(40, Number(c.ring_size) || 58), rw = Math.max(2, Number(c.ring_width) || 6);
    const R = 32 - rw / 2 - 3, C = 2 * Math.PI * R, L = C * 0.75;
    const on = s && !un && !OFF_STATES.includes(s.state);
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      @container (max-width: 280px){:host .row{gap:10px;padding:12px}:host .ring{width:min(${Math.max(40, Number(c.ring_size) || 58)}px,30cqw);height:min(${Math.max(40, Number(c.ring_size) || 58)}px,30cqw)}:host .ring .v{font-size:min(${Math.round(Math.max(40, Number(c.ring_size) || 58) * 0.3)}px,9cqw)}:host .ch{display:none}:host .n{font-size:15px}}
      @container (max-width: 220px){:host .row{flex-wrap:wrap}:host .tx{flex:1 1 100%}}
      .row{display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:${c.radius}px;background:${p.panel};${p.fx || ""};border:1px solid ${p.border};color:${p.text};cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .12s;opacity:${un ? 0.55 : 1}}
      .row:active{transform:scale(.98)}
      .ring{position:relative;width:${rs}px;height:${rs}px;flex:none;display:flex;align-items:center;justify-content:center}
      .ring svg{position:absolute;inset:0}
      .ring .v{font-size:${Math.round(rs * 0.295)}px;font-weight:700;font-family:${FONT_NUM}}
      .ring ha-icon{--mdc-icon-size:24px;color:${on ? g[1] : p.muted}}
      .tx{flex:1;min-width:0}
      .n{font-size:15px;font-weight:600;line-height:1.25}
      .l{font-size:12px;color:${p.muted};margin-top:3px;line-height:1.3}
      .ch{flex:none;color:${p.muted};--mdc-icon-size:22px}
    </style>
    <div class="row" role="button" tabindex="0" aria-label="${esc(this.name(c.entity))}">
      <span class="ring"><svg viewBox="0 0 64 64"><defs><linearGradient id="rg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${g[0]}"/><stop offset="1" stop-color="${g[1]}"/></linearGradient></defs>
        <circle cx="32" cy="32" r="${R}" fill="none" stroke="${p.track}" stroke-width="${rw}" stroke-linecap="round" stroke-dasharray="${L.toFixed(1)} ${C.toFixed(1)}" transform="rotate(135 32 32)"/>
        ${f > 0 ? `<circle class="arc" cx="32" cy="32" r="${R}" fill="none" stroke="${on ? "url(#rg)" : p.tick}" stroke-width="${rw}" stroke-linecap="round" stroke-dasharray="${(L * f).toFixed(1)} ${C.toFixed(1)}" transform="rotate(135 32 32)"/>` : ""}</svg>
        ${c.icon || r.text == null ? `<ha-icon icon="${esc(c.icon || "mdi:information-outline")}"></ha-icon>` : `<span class="v" data-tw="v">${esc(r.text)}</span>`}</span>
      <span class="tx"><div class="n t">${esc(this.name(c.entity))}</div>${r.line ? `<div class="l t">${esc(r.line)}</div>` : ""}</span>
      <ha-icon class="ch" icon="mdi:chevron-right"></ha-icon>
    </div>`;
    const arc = this.shadowRoot.querySelector(".arc");
    if (arc && this._lastF != null && this._lastF !== f) {
      try { arc.animate([{ strokeDasharray: `${(L * this._lastF).toFixed(1)} ${C.toFixed(1)}` }, { strokeDasharray: `${(L * f).toFixed(1)} ${C.toFixed(1)}` }], { duration: 650, easing: "cubic-bezier(.3,1,.4,1)" }); } catch (e) { /* jumps */ }
    }
    this._lastF = f;
    this.press(this.shadowRoot.querySelector(".row"), () => this.run(c.tap_action, c.entity), () => this.moreInfo(c.entity));
  }
}

// ------------------------------------------------------------------ Roost Rooms
// A row of room pills; the chosen room's cards show below. Switching is instant (all rooms are built once).
class RoostRooms extends RoostBase {
  static get roomCards() { return true; }
  static get defaults() {
    return { rooms: [], columns: 2, gap: 8, color: "active", show_names: "active", active_style: "filled", background: "solid",
      pill_shape: "pill", pill_height: 40, pill_icon_size: 20, pill_align: "spread", show_count: false,
      tile_size: "large", tile_shape: "square", tile_fill: "gradient", tile_glow: "soft", tile_radius: 22, auto_colors: true,
      swipe: true, remember: true, start_room: "", theme: "auto" };
  }

  validate(c) { if (!Array.isArray(c.rooms) || !c.rooms.length) throw new Error("Add at least one room"); }

  setConfig(config) {
    super.setConfig(config);
    this._built = null;
    const c = this._config;
    if (this._active == null || this._active >= c.rooms.length) {
      let i = -1;
      if (c.remember) { try { i = c.rooms.findIndex((r) => r.name === localStorage.getItem(this.memKey())); } catch (e) { i = -1; } }
      if (i < 0 && c.start_room) i = c.rooms.findIndex((r) => String(r.name).toLowerCase() === String(c.start_room).toLowerCase());
      this._active = i < 0 ? 0 : i;
    }
  }

  // A room can open from a link (#entrance), so a side rail or any button can show it.
  connectedCallback() {
    super.connectedCallback?.();
    this._onHash = () => this.fromHash(true);
    window.addEventListener("hashchange", this._onHash);
    window.addEventListener("location-changed", this._onHash);
    this.fromHash(false);
  }

  disconnectedCallback() {
    super.disconnectedCallback?.();
    window.removeEventListener("hashchange", this._onHash);
    window.removeEventListener("location-changed", this._onHash);
  }

  fromHash(redraw) {
    const rooms = this._config?.rooms || [], h = location.hash;
    if (!h) return;
    const i = rooms.findIndex((r) => r.link && (r.link === h || `#${String(r.link).replace(/^#/, "")}` === h));
    if (i < 0 || i === this._active) return;
    this._active = i;
    if (redraw) { this._sig = null; if (this._hass) this.hass = this._hass; }
  }

  memKey() { return `roost-rooms:${(this._config.rooms || []).map((r) => r.name).join("|")}`; }

  // the devices of a room: the ones picked in the editor, plus any card that names a device
  roomIds(r) { return [...(r.entities || []), ...(Array.isArray(r.cards) ? r.cards.map((x) => x && x.entity).filter(Boolean) : [])]; }

  onCount(r) {
    return [...new Set(this.roomIds(r))].filter((id) => {
      const st = this._hass?.states?.[id];
      return st && !UNAVAILABLE.includes(st.state) && !OFF_STATES.includes(st.state) && ["light", "switch", "fan", "climate", "media_player", "cover", "humidifier", "input_boolean"].includes(id.split(".")[0]);
    }).length;
  }

  set hass(hass) {
    this._hass = hass;
    if (this._setup) { if (!this._setupDrawn) { this._setupDrawn = true; this.renderSetup(); } return; }
    (this._cards || []).flat().forEach((el) => { el.hass = hass; });
    const counts = this._config?.show_count ? this._config.rooms.map((r) => this.onCount(r)).join(",") : "";
    const rm = this._config?.rooms?.[this._active] || {};
    const clim = [rm.temperature, rm.humidity].map((id) => (id ? hass.states?.[id]?.state : "")).join(",");
    const sig = `${this.dark ? 1 : 0}|${this._active}|${counts}|${clim}`;
    if (sig === this._sig) return;
    this._sig = sig;
    this.render();
  }

  static getConfigForm() {
    return {
      schema: [
        { name: "rooms", label: "Rooms", selector: { object: { multiple: true, label_field: "name", fields: {
          name: { label: "Room name", required: true, selector: { text: {} } },
          icon: { label: "Icon", selector: { icon: {} } },
          color: { label: "Colour of this room's button (empty = the card's colour)", selector: { select: { mode: "dropdown", options: COLOR_OPTIONS.filter((o) => o.value !== "custom") } } },
          entities: { label: "Devices in this room (each becomes a tile)", selector: { entity: { multiple: true } } },
          temperature: { label: "Temperature sensor (shown next to the room buttons)", selector: { entity: { domain: "sensor" } } },
          humidity: { label: "Humidity sensor", selector: { entity: { domain: "sensor" } } },
          link: { label: "Opens from a link (for example #entrance, for the side rail)", selector: { text: {} } },
          hidden: { label: "No button in the bar (reached only from its link, for example an Automations page)", selector: { boolean: {} } },
        } } } },
        { type: "expandable", name: "", title: "Room buttons", icon: "mdi:gesture-tap-button", schema: [
          { name: "show_names", label: "What the room buttons show", selector: pick([["active", "Icons, and the name when chosen"], ["all", "Icons and names"], ["names", "Names only"], ["none", "Icons only"]]) },
          ...colourFields("color", "Colour of the chosen room"),
          { type: "grid", name: "", schema: [
            { name: "active_style", label: "How the chosen room looks", selector: pick([["filled", "Filled with glow"], ["soft", "Soft tint"], ["line", "Line under it"]]) },
            { name: "background", label: "Bar background", selector: pick([["solid", "Solid"], ["glass", "See-through glass"], ["none", "None"]]) },
          ] },
          { type: "grid", name: "", schema: [
            { name: "pill_shape", label: "Button shape", selector: pick([["pill", "Pill"], ["rounded", "Rounded square"], ["square", "Square"]]) },
            { name: "pill_align", label: "Line up", selector: pick([["fill", "Same width, filling the bar"], ["spread", "Spread across"], ["start", "Left"], ["center", "Centre"]]) },
          ] },
          { type: "grid", name: "", schema: [
            { name: "pill_width", label: "Button width (0 = automatic)", selector: slider(0, 240, 4) },
          ] },
          { type: "grid", name: "", schema: [
            { name: "pill_height", label: "Button height", selector: slider(32, 64, 2) },
            { name: "pill_icon_size", label: "Icon size", selector: slider(14, 32) },
          ] },
          { name: "show_count", label: "Show how many things are on in each room", selector: { boolean: {} } },
        ] },
        { type: "expandable", name: "", title: "Tiles in the rooms", icon: "mdi:view-grid-outline", schema: [
          { type: "grid", name: "", schema: [
            { name: "columns", label: "Tiles per row", selector: { number: { min: 1, max: 6, mode: "box" } } },
            { name: "gap", label: "Space between tiles", selector: slider(4, 24, 2) },
          ] },
          { type: "grid", name: "", schema: [
            { name: "tile_size", label: "Tile size", selector: pick([["small", "Small"], ["medium", "Medium"], ["large", "Large"]]) },
            { name: "tile_radius", label: "Tile roundness", selector: slider(0, 40, 2) },
          ] },
          { type: "grid", name: "", schema: [
            { name: "tile_shape", label: "Tile shape (every tile in the rooms)", selector: pick([["square", "Square"], ["wide", "Wide (4:3)"], ["tall", "Tall (3:4)"], ["size", "By the tile size"], ["custom", "My own height"]]) },
            { name: "tile_height", label: "Tile height (my own height)", selector: slider(90, 320, 10) },
          ] },
          { type: "grid", name: "", schema: [{ name: "tile_fill", label: "Look when on", selector: FILL_OPTIONS }, { name: "tile_glow", label: "Glow", selector: GLOW_OPTIONS }] },
          { name: "auto_colors", label: "Colour tiles by type (lights amber, ACs blue, curtains coral, TVs purple, plugs green)", selector: { boolean: {} } },
        ] },
        { type: "expandable", name: "", title: "Behaviour", icon: "mdi:hand-back-right-outline", schema: [
          { name: "swipe", label: "Swipe left or right to change room", selector: { boolean: {} } },
          { name: "remember", label: "Open the last room I used", selector: { boolean: {} } },
          { name: "start_room", label: "Room to show first (its name)", selector: { text: {} } },
          THEME_FIELD,
        ] },
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) {
    // Four rooms to start with, each with a mix of the devices this home has (lights first, then AC, curtains, TV, fans, plugs).
    const ids = Object.keys(hass.states), pick = (d) => ids.filter((id) => id.startsWith(d + "."));
    const pool = ["light", "climate", "cover", "media_player", "fan", "switch"].flatMap((d) => pick(d).slice(0, 4));
    const rooms = [["Living", "mdi:sofa"], ["Bedroom", "mdi:bed-king"], ["Kitchen", "mdi:stove"], ["Bathroom", "mdi:shower"]];
    return { rooms: rooms.map(([name, icon], r) => ({ name, icon, entities: pool.filter((_, i) => i % 4 === r).slice(0, 4) })) };
  }

  getGridOptions() { return { columns: 12, rows: "auto" }; }

  // A tile for a device picked in the editor, styled by the card's tile settings.
  tileFor(id) {
    const c = this._config, d = id.split(".")[0];
    const colour = { light: "amber", switch: "green", fan: "teal", climate: "blue", cover: "coral", media_player: "purple", lock: "coral", alarm_control_panel: "coral", humidifier: "teal", vacuum: "teal" }[d] || "slate";
    const switches = ["light", "switch", "fan", "input_boolean", "media_player", "humidifier"].includes(d);
    return { type: "custom:roost-tile", entity: id, color: c.auto_colors ? colour : c.color === "active" ? "purple" : c.color,
      size: c.tile_size, fill: c.tile_fill, glow: c.tile_glow, radius: c.tile_radius, tap_action: { action: switches || d === "cover" ? "toggle" : "more-info" } };
  }

  async build() {
    const token = (this._buildToken = {});
    const helpers = window.loadCardHelpers ? await window.loadCardHelpers() : null;
    if (token !== this._buildToken) return;
    const make = (cfg0) => {
      let el;
      const cfg = withTheme(cfg0, this._config.theme);
      try {
        el = helpers ? helpers.createCardElement(cfg) : document.createElement(String(cfg.type || "").replace(/^custom:/, ""));
        if (!helpers) el.setConfig?.(cfg);
      } catch (e) {
        el = document.createElement("div");
        el.textContent = `Card problem: ${e.message}`;
      }
      if (this._hass) el.hass = this._hass;
      return el;
    };
    // every Roost tile in the rooms takes the card's tile shape, unless the tile sets its own
    const ts = this._config.tile_shape || "square";
    const shaped = (x) => (x && x.type === "custom:roost-tile" && !x.shape && ts !== "size" ? { ...x, shape: ts, ...(ts === "custom" && !x.height ? { height: this._config.tile_height } : {}) } : x);
    this._cfgs = this._config.rooms.map((room) => [...(room.entities || []).map((id) => this.tileFor(id)), ...(Array.isArray(room.cards) ? room.cards : [])].map(shaped));
    this._cards = this._cfgs.map((list) => list.map(make));
    this._built = true;
    this._sig = null;
    this.render();
  }

  go(i) {
    (this._pillMemo = this._pillMemo || {}).go = Date.now();
    const rooms = this._config.rooms, n = rooms.length, step = i >= this._active ? 1 : -1;
    let k = (i + n) % n, guard = 0;
    while (rooms[k]?.hidden && guard++ < n) k = (k + step + n) % n;
    this._active = k;
    const link = rooms[k]?.link;
    if (link) { try { history.replaceState(history.state, "", `${location.pathname}${location.search}#${String(link).replace(/^#/, "")}`); window.dispatchEvent(new Event("location-changed")); } catch (e) { /* old browser */ } }
    if (this._config.remember) { try { localStorage.setItem(this.memKey(), this._config.rooms[this._active].name); } catch (e) { /* private mode */ } }
    this.vibrate();
    this._sig = null;
    this.hass = this._hass || {};
  }

  render() {
    if (!this._config) return;
    if (!this._built) { if (!this._building) { this._building = true; this.build().finally(() => { this._building = false; }); } return; }
    const c = this._config, p = this.p;
    const showName = (i) => c.show_names === "all" || c.show_names === "names" || (c.show_names === "active" && i === this._active);
    const room = c.rooms[this._active] || {};
    const g = room.color && room.color !== "custom" ? (room.color === "active" ? ACTIVE : COLORS[room.color] || this.colour()) : this.colour();
    const ph = Math.max(28, Number(c.pill_height) || 40);
    const rad = c.pill_shape === "square" ? 10 : c.pill_shape === "rounded" ? Math.round(ph * 0.34) : 999;
    const counts = c.show_count ? c.rooms.map((r) => this.onCount(r)) : [];
    const rd = (id) => { const s = this.sx(id); const v = s ? num(s.state) : null; return v == null ? null : fmt(v, 1); };
    const t0 = room.temperature ? rd(room.temperature) : null, h0 = room.humidity ? rd(room.humidity) : null;
    const sensorsOff = (room.temperature || room.humidity) && t0 == null && h0 == null;
    const clim = sensorsOff ? `<div class="clim t"><span><ha-icon icon="mdi:access-point-network-off"></ha-icon>No room sensor online</span></div>` : t0 != null || h0 != null ? `<div class="clim t">${h0 != null ? `<span><ha-icon icon="mdi:water-outline" style="color:#38BDF8"></ha-icon>${esc(Math.round(h0))}%</span>` : ""}${t0 != null ? `<span><ha-icon icon="mdi:thermometer" style="color:#FF9F6B"></ha-icon>${esc(t0)}°C</span>` : ""}</div>` : "";
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .bar{border-radius:${c.pill_shape === "pill" ? 999 : rad + 4}px;border:1px solid ${c.background === "none" ? "transparent" : p.border};background:${c.background === "none" ? "transparent" : c.background === "glass" ? `color-mix(in srgb, ${p.panel} 60%, transparent);backdrop-filter:blur(14px)` : p.panel};padding:4px;margin-bottom:16px}
      .pills{display:flex;gap:2px;justify-content:${c.pill_align === "start" ? "flex-start" : c.pill_align === "center" ? "center" : "space-between"};overflow-x:auto;scrollbar-width:none;padding:8px 12px 18px;margin:-8px -12px -18px}
      ${Number(c.pill_width) > 0 ? `.pill{flex:0 0 ${Number(c.pill_width)}px!important;padding:0 8px!important;white-space:normal!important;line-height:1.15;text-align:center}` : c.pill_align === "fill" ? ".pill{flex:1 1 0!important;padding:0 8px!important;min-width:0;white-space:normal!important;line-height:1.15;text-align:center}" : ""}
      .pills::-webkit-scrollbar{display:none}
      .head{display:flex;align-items:center;justify-content:space-between;gap:8px 12px;flex-wrap:wrap}
      .head .bar{flex:${c.pill_align === "fill" ? "1 1 440px" : "0 1 auto"};min-width:0;padding:4px}
      .head .clim{margin-left:auto}
      .clim{display:flex;gap:16px;font-size:14px;color:${p.muted};flex:none}
      .clim span{display:flex;align-items:center;gap:6px}.clim ha-icon{--mdc-icon-size:16px}
      .pill{position:relative;flex:0 0 auto;min-height:${ph}px;min-width:${ph + 8}px;border-radius:${rad}px;border:0;background:transparent;color:${p.muted};
        display:flex;align-items:center;justify-content:center;gap:6px;padding:0 16px;font:inherit;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;-webkit-tap-highlight-color:transparent}
      ${c.active_style === "soft" ? `.pill.on{background:${g[0]}2E;color:${g[this.dark ? 1 : 0]}}`
    : c.active_style === "line" ? `.pill.on{color:${g[this.dark ? 1 : 0]}}.pill.on::after{content:"";position:absolute;bottom:4px;left:28%;right:28%;height:3px;border-radius:3px;background:linear-gradient(90deg,${g[0]},${g[1]})}`
      : `.pill.on{color:${g[3]}}`}
      .pills{position:relative}.pill{z-index:1}
      .pill:active{transform:scale(.95)}
      .pill ha-icon{--mdc-icon-size:${Number(c.pill_icon_size) || 20}px}
      .cnt{position:absolute;top:3px;right:4px;min-width:16px;height:16px;padding:0 4px;border-radius:999px;background:#FCD34D;color:#2A1800;font-size:11px;font-weight:700;line-height:16px;text-align:center}
      .room{display:grid;grid-template-columns:repeat(${Math.max(1, c.columns)},minmax(0,1fr));gap:${Number(c.gap) || 8}px;touch-action:pan-y}
      @container (max-width: 300px){:host .room{grid-template-columns:minmax(0,1fr)}:host .room > *{grid-column:auto!important}}
      .room[hidden]{display:none}
      .room > *{min-width:0}
      .room > .wide{grid-column:1/-1}
      .empty{grid-column:1/-1;padding:22px;border-radius:20px;border:1px dashed ${p.border};color:${p.muted};text-align:center;font-size:14px;line-height:1.4}
    </style>
    ${clim ? '<div class="head">' : ""}<div class="bar"><div class="pills" role="tablist">${c.rooms.map((r, i) => (r.hidden ? "" : `<button class="pill ${i === this._active ? "on" : ""}" role="tab" aria-selected="${i === this._active}" data-i="${i}" aria-label="${esc(r.name)}">
      ${r.icon && c.show_names !== "names" ? `<ha-icon icon="${esc(r.icon)}"></ha-icon>` : ""}${showName(i) || !r.icon ? `<span>${esc(r.name)}</span>` : ""}${counts[i] ? `<span class="cnt">${counts[i]}</span>` : ""}</button>`)).join("")}</div></div>${clim ? `${clim}</div>` : ""}
    ${c.rooms.map((r, i) => `<div class="room" data-room="${i}" ${i === this._active ? "" : "hidden"}>${(this._cards[i] || []).length ? "" : '<div class="empty t">No devices in this room yet. Edit the card and pick some under “Devices in this room”.</div>'}</div>`).join("")}`;
    this.shadowRoot.querySelectorAll(".room").forEach((box) => {
      const i = +box.dataset.room;
      (this._cards[i] || []).forEach((el, k) => {
        const cfg = this._cfgs[i][k] || {};
        const wrap = document.createElement("div");
        if (cfg.wide || cfg.grid_options?.columns === "full" || cfg.grid_options?.columns === 12) wrap.className = "wide";
        else if (Number(cfg.span) > 1) wrap.style.gridColumn = `span ${Math.min(Number(cfg.span), Math.max(1, c.columns))}`;
        wrap.appendChild(el);
        box.appendChild(wrap);
      });
      if (c.swipe) {
        let x0 = null, y0 = 0;
        box.addEventListener("touchstart", (e) => {
          // a finger on something you drag (a curtain, a slider, a dial) never changes the room
          if (e.composedPath().some((n) => n.dataset?.noswipe != null || n.getAttribute?.("role") === "slider")) { x0 = null; return; }
          x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
        }, { passive: true });
        box.addEventListener("touchend", (e) => {
          if (x0 == null) return;
          const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
          x0 = null;
          if (Math.abs(dx) > 60 && Math.abs(dy) < 40) this.go(this._active + (dx < 0 ? 1 : -1));
        }, { passive: true });
      }
    });
    this.shadowRoot.querySelectorAll(".pill").forEach((b) => b.addEventListener("click", () => this.go(+b.dataset.i)));
    if (c.active_style !== "soft" && c.active_style !== "line") {
      const box = this.shadowRoot.querySelector(".pills"), onp = box?.querySelector(".pill.on");
      (window.requestAnimationFrame || setTimeout)(() => this.slidePill(box, onp, this._pillMemo || (this._pillMemo = {}),
        `background:linear-gradient(135deg,${g[0]},${g[1]});box-shadow:0 8px 20px -8px color-mix(in srgb, ${g[0]} 90%, transparent);border-radius:${rad}px`));
    }
    const on = this.shadowRoot.querySelector(".pill.on");
    if (on && on.scrollIntoView && c.pill_align !== "spread") on.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  getCardSize() { return 6; }
}

// ------------------------------------------------------------------ Roost Curtain
// A window with a sky that follows the sun and curtains that really slide open and closed.
// While the curtain moves, the fabric ripples and a small note says "Opening" or "Closing".
class RoostCurtain extends RoostBase {
  static get defaults() {
    return { color: "coral", style: "pair", look: "classic", blind_look: "classic", fabric: "", controls: "", height: 150, radius: 18, show_sky: true, show_header: true, show_buttons: true, show_percent: true,
      travel_time: 1.4, reverse: false, frame: true, background: "sky", image: "", image_night: "", weather: "", show_weather_text: true, tap_action: { action: "toggle" }, hold_action: { action: "more-info" }, theme: "auto" };
  }

  validate(c) { if (!c.entity) throw new Error("Choose a curtain or blind (cover)"); }

  watched() { return [this._config.entity, this._config.sun || "sun.sun", this._config.weather, this._config.schedule].filter(Boolean); }

  static getConfigForm() {
    return {
      schema: [
        { name: "entity", required: true, selector: { entity: { domain: "cover" } } },
        { type: "expandable", name: "", title: "Opens with the sun", icon: "mdi:weather-sunset-up", schema: [
          { type: "grid", name: "", schema: [{ name: "open_at", label: "Opens at (sunrise, or 06:30)", selector: { text: {} } }, { name: "close_at", label: "Closes at (sunset, or 22:00)", selector: { text: {} } }] },
          { name: "schedule", label: "The automation that does it (the card shows the times and turns it on or off)", selector: { entity: { domain: "automation" } } },
        ] },
        { type: "expandable", name: "", title: "Behind the window", icon: "mdi:window-open-variant", schema: [
          { name: "background", label: "What you see when it is open", selector: pick([["sky", "Sky that follows the sun"], ["weather", "Live weather, animated"], ["picture", "My own picture"], ["none", "Nothing (plain)"]]) },
          { name: "weather", label: "Weather (for live weather)", selector: { entity: { domain: "weather" } } },
          { name: "show_weather_text", label: "Show the temperature in the window", selector: { boolean: {} } },
          { name: "image", label: "Picture (for example /local/view.jpg or a web address)", selector: { text: {} } },
          { name: "image_night", label: "Night picture (optional)", selector: { text: {} } },
        ] },
        { name: "name", selector: { text: {} } },
        { type: "expandable", name: "", title: "Look", icon: "mdi:palette", schema: [
          { name: "style", label: "Kind", selector: pick([["pair", "Two curtains that meet in the middle"], ["left", "One curtain, opens to the left"], ["right", "One curtain, opens to the right"], ["blind", "Blind (up and down)"]]) },
          { name: "look", label: "Curtain look", selector: pick([["classic", "Classic stripes (bright, simple)"], ["pleat", "Pinch pleat drapes on a metal rod"], ["wave", "Wave curtain on rings"], ["banded", "Ripple folds with a band at the bottom"], ["sheer", "Sheer behind a blackout curtain"]]) },
          { type: "grid", name: "", schema: [{ name: "band", label: "Bottom band (ripple with band)", selector: pick([["silver", "Light grey"], ["grey", "Stone grey"], ["linen", "Linen"], ["sand", "Sand"], ["sage", "Sage"], ["navy", "Navy"], ["charcoal", "Charcoal"], ["blush", "Blush"], ["black", "Black"]]) }, { name: "band_height", label: "Band height", selector: slider(10, 40, 1, "%") }] },
          { name: "fabric_image", label: "Your own curtain photo (for example /local/roost/curtain.jpg); it bunches up as it opens", selector: { text: {} } },
          { name: "blind_look", label: "Blind look", selector: pick([["classic", "Classic stripes (bright, simple)"], ["venetian", "Venetian slats that tilt"], ["roller", "Roller blind that rolls up"], ["roman", "Roman shade with soft folds"]]) },
          { name: "fabric", label: "Fabric or finish", selector: pick([["", "Card colour (below)"], ["linen", "Linen"], ["sand", "Sand"], ["sage", "Sage"], ["navy", "Navy"], ["charcoal", "Charcoal"], ["blush", "Blush"], ["white", "White"], ["oak", "Oak wood"], ["walnut", "Walnut wood"], ["grey", "Stone grey"], ["black", "Black"]]) },
          ...colourFields("color", "Card colour"),
          { type: "grid", name: "", schema: [{ name: "height", label: "Window height", selector: slider(90, 280, 10) }, { name: "radius", selector: slider(0, 32, 2) }] },
          { type: "grid", name: "", schema: [{ name: "travel_time", label: "Slide time", selector: slider(0.4, 4, 0.2, "s") }, { name: "frame", label: "Card background", selector: { boolean: {} } }] },
          THEME_FIELD,
        ] },
        { type: "expandable", name: "", title: "What it shows", icon: "mdi:eye-outline", schema: [
          { name: "show_header", label: "Name and state above", selector: { boolean: {} } },
          { name: "controls", label: "Controls under the window", selector: pick([["slider", "One slide bar with two small arrows"], ["buttons", "Open, Stop and Close buttons"], ["none", "None (tap the window)"]]) },
          { name: "show_percent", label: "Show how far open (%)", selector: { boolean: {} } },
          REVERSE_FIELD,
        ] },
        { type: "expandable", name: "", title: "Tap and hold", icon: "mdi:gesture-tap", schema: [ACTION_FIELD("tap_action"), ACTION_FIELD("hold_action"),
          { name: "stop_action", label: "Stop button does (empty = stop the curtain)", selector: { ui_action: {} } }] },
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) { return { entity: Object.keys(hass.states).find((id) => id.startsWith("cover.")) || "" }; }

  getGridOptions() { return { columns: 12, rows: "auto" }; }

  view(s = this.st()) { return coverView(s, this._config.reverse); }

  position(s) {
    if (this._dragPos != null) return this._dragPos;
    if (!s || UNAVAILABLE.includes(s.state)) return 0;
    const v = this.view(s);
    if (v.pos != null) return Math.max(0, Math.min(100, v.pos));
    return v.state === "open" || v.state === "opening" ? 100 : v.state === "closed" || v.state === "closing" ? 0 : 50;
  }

  // how much of the window each curtain covers, in % of the window
  cover(pos) { return this._config.style === "pair" ? 50 - 43 * pos / 100 : 100 - 88 * pos / 100; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, s = this.st(), p = this.p;
    const key = `${this.dark}|${JSON.stringify(c)}|${!!s}`;
    if (key !== this._key) { this._key = key; this.build(); }
    this.update();
  }

  // which controls: the slide bar unless the card says otherwise (older cards: show_buttons false = none)
  ctl() { const c = this._config; return c.controls || (c.show_buttons === false ? "none" : "slider"); }

  // "pleat", "venetian" and so on, or "classic"
  kind() { const c = this._config; return c.style === "blind" ? c.blind_look || "classic" : c.fabric_image ? "photo" : c.look || "classic"; }

  build() {
    const c = this._config, p = this.p, g = this.colour();
    const frame = this.dark ? "#1C2142" : "#DDE1F0", rod = this.dark ? "#3A3F70" : "#C3C9E6";
    const a = `color-mix(in srgb, ${g[1]} 55%, ${g[0]})`, b = `color-mix(in srgb, ${g[0]} 80%, ${g[1]})`;
    const blind = c.style === "blind", look = this.kind(), real = look !== "classic";
    // a real fabric or finish, or the card's own colour
    const FAB = { silver: [206, 204, 199], linen: [217, 203, 181], sand: [196, 164, 120], sage: [140, 160, 132], navy: [52, 70, 112], charcoal: [70, 72, 80], blush: [212, 160, 156], white: [238, 236, 231], oak: [196, 152, 102], walnut: [112, 76, 50], grey: [150, 152, 156], black: [44, 45, 50] };
    const base = FAB[c.fabric] || FAB[c.fabric === "" && real ? (blind || look === "banded" ? "white" : "linen") : ""] || null;
    const hex = (h) => { const m = /^#?([0-9a-f]{6})$/i.exec(String(h)); return m ? [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)) : null; };
    const tone = base || hex(g[0]) || [217, 203, 181];
    const mix = (k) => `rgb(${tone.map((v) => Math.max(0, Math.min(255, Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k))))).join(",")})`;
    const wood = c.fabric === "oak" || c.fabric === "walnut";
    const grain = wood ? "repeating-linear-gradient(90deg,rgba(0,0,0,.08) 0 2px,rgba(0,0,0,0) 2px 5px,rgba(255,255,255,.05) 5px 8px,rgba(0,0,0,.06) 8px 11px)," : "";
    const deep = { pleat: 0.32, wave: 0.42, sheer: 0.38, banded: 0.24 }[look] || 0.35;
    // one fold: a shadow valley, the cloth and a lit ridge (the pitch is set as it opens, so folds bunch up)
    const fold = `linear-gradient(90deg,${mix(-deep)} 0%,${mix(-deep * 0.35)} 18%,${mix(0.14)} 42%,${mix(0.05)} 60%,${mix(-deep * 0.55)} 85%,${mix(-deep)} 100%)`;
    this._pitch = { pleat: 26, wave: 42, sheer: 30, banded: 22 }[look] || 0;
    // your own curtain photo: one seamless strip of the real fabric, squeezed together as the curtain opens
    if (look === "photo") this._pitch = Number(c.fabric_tile) || Math.round((Number(c.height) || 150) * 1.3);
    const photo = look === "photo" ? `url("${String(c.fabric_image).replace(/["\\]/g, "")}")` : "";
    const fabric = (dir) => (photo || (!real ? `repeating-linear-gradient(${blind ? 180 : 90}deg,${dir ? a : b} 0 9px,${dir ? b : a} 9px 18px)` : fold));
    // ripple folds with a band at the bottom (a second fabric sewn along the hem)
    const btone = FAB[c.band || "silver"] || FAB.silver, bmix = (k) => `rgb(${btone.map((v) => Math.max(0, Math.min(255, Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k))))).join(",")})`;
    const bandFold = `linear-gradient(90deg,${bmix(-deep)} 0%,${bmix(-deep * 0.35)} 18%,${bmix(0.14)} 42%,${bmix(0.05)} 60%,${bmix(-deep * 0.55)} 85%,${bmix(-deep)} 100%)`;
    const blindBg = { venetian: `${grain}linear-gradient(180deg,${mix(0.22)} 0,${mix(0)} 40%,${mix(-0.28)} var(--sl,80%),rgba(0,0,0,0) var(--sl,80%))`,
      roller: `repeating-linear-gradient(0deg,rgba(0,0,0,.05) 0 2px,rgba(0,0,0,0) 2px 4px),repeating-linear-gradient(90deg,rgba(0,0,0,.04) 0 2px,rgba(255,255,255,.04) 2px 4px),linear-gradient(90deg,${mix(-0.08)},${mix(0.05)} 50%,${mix(-0.08)})`,
      roman: `linear-gradient(180deg,${mix(-0.14)} 0%,${mix(0.1)} 35%,${mix(0)} 70%,${mix(-0.32)} 100%)` }[look];
    let stars = "";
    [[18, 22, 2], [62, 30, 3], [42, 58, 2], [30, 40, 2], [78, 62, 2], [8, 70, 2]].forEach((q, i) => {
      stars += `<span class="star" style="left:${q[0]}%;top:${q[1]}%;width:${q[2]}px;height:${q[2]}px;animation-duration:${3 + i * 0.5}s;animation-delay:${i * 0.4}s"></span>`;
    });
    const panels = (look === "sheer" && !blind ? '<span class="shr"></span>' : "") + (c.style === "pair" ? '<span class="cl"></span><span class="cr"></span>' : c.style === "right" ? '<span class="cr"></span>' : blind ? `<span class="bl">${look === "venetian" || look === "roller" ? '<i class="bb"></i>' : ""}</span>${look === "roller" ? '<i class="tube"></i>' : ""}` : '<span class="cl"></span>');
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      @keyframes roost-ripple{to{background-position:36px 0}}
      @keyframes roost-ripple-v{to{background-position:0 36px}}
      @keyframes roost-sway{0%,100%{transform:skewX(0)}50%{transform:skewX(1.2deg)}}
      @keyframes roost-drift{from{transform:translateX(-40%)}to{transform:translateX(140%)}}
      @keyframes roost-rain{from{transform:translateY(-20px)}to{transform:translateY(${c.height}px)}}
      @keyframes roost-snow{from{transform:translate(0,-10px)}to{transform:translate(14px,${c.height}px)}}
      @keyframes roost-flash{0%,92%,100%{opacity:0}94%,97%{opacity:.75}}
      @keyframes roost-rays{to{transform:rotate(360deg)}}
      .pic{position:absolute;inset:0;background-size:cover;background-position:center}
      .wx{position:absolute;inset:0;overflow:hidden}
      .wx > *{position:absolute}
      .cloud{width:70px;height:22px;border-radius:999px;background:rgba(255,255,255,.85);filter:blur(.5px);animation:roost-drift linear infinite}
      .cloud::before{content:"";position:absolute;left:14px;top:-12px;width:30px;height:30px;border-radius:50%;background:inherit}
      .cloud::after{content:"";position:absolute;left:34px;top:-7px;width:22px;height:22px;border-radius:50%;background:inherit}
      .drop{width:2px;height:12px;border-radius:2px;background:rgba(220,235,255,.85);animation:roost-rain linear infinite}
      .flake{width:5px;height:5px;border-radius:50%;background:#fff;animation:roost-snow linear infinite}
      .flash{inset:0;background:#fff;animation:roost-flash 5s linear infinite}
      .fog{left:-10%;right:-10%;height:18px;border-radius:999px;background:rgba(255,255,255,.35);filter:blur(6px);animation:roost-drift linear infinite}
      .rays{width:70px;height:70px;right:calc(18% - 20px);top:calc(18% - 20px);border-radius:50%;background:repeating-conic-gradient(rgba(253,224,71,.35) 0 8deg,transparent 8deg 24deg);animation:roost-rays 14s linear infinite}
      .temp{position:absolute;z-index:3;left:calc(${c.style === "pair" || c.style === "left" ? 12 : 0}% + 8px);bottom:10px;padding:4px 8px;border-radius:999px;background:rgba(10,8,40,.35);color:#fff;font-size:12px;font-weight:600}
      .win.shut .wx *,.win.shut .star,.win.shut .orb{animation-play-state:paused}
      .card{${c.frame ? `${panelCss(p, c.radius + 6)};padding:14px` : ""}}
      .head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin:0 2px 10px}
      .nm{font-size:15px;font-weight:600;color:${p.text}}
      .stt{font-size:13px;color:${p.muted}}
      .win{position:relative;height:${c.height}px;border-radius:${c.radius}px;overflow:hidden;border:6px solid ${frame};box-sizing:border-box;cursor:pointer;-webkit-tap-highlight-color:transparent;
        background:${p.inset}}
      .sky{position:absolute;inset:0}
      .star{position:absolute;border-radius:50%;background:#fff;animation:roost-twinkle 3s ease-in-out infinite}
      .orb{position:absolute;right:18%;top:18%;border-radius:50%;animation:roost-float 6s ease-in-out infinite}
      .mull{position:absolute;left:50%;top:0;bottom:0;width:4px;margin-left:-2px;background:${frame}}
      .rod{position:absolute;left:0;right:0;top:0;height:6px;background:${rod};z-index:2}
      .cl,.cr,.bl{position:absolute;top:0;z-index:1;will-change:width,height}
      .cl{left:0;bottom:0;background:${fabric(1)};box-shadow:6px 0 18px rgba(0,0,0,.3);transform-origin:left top}
      .cr{right:0;bottom:0;background:${fabric(0)};box-shadow:-6px 0 18px rgba(0,0,0,.3);transform-origin:right top}
      .bl{left:0;right:0;background:${blind && real ? blindBg : fabric(1)};box-shadow:0 6px 18px rgba(0,0,0,.3)}
      ${real && !blind ? `.cl,.cr{background-size:${this._pitch}px 100%;background-repeat:repeat-x;border-radius:2px 2px ${look === "wave" ? 10 : 6}px ${look === "wave" ? 10 : 6}px}
      .cl::after,.cr::after{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(180deg,rgba(255,255,255,.10),rgba(0,0,0,0) 30%,rgba(0,0,0,.18))}
      ${look === "banded" ? `.cl::before,.cr::before{content:"";position:absolute;left:0;right:0;bottom:0;height:${Math.max(5, Math.min(60, Number(c.band_height) || 22))}%;border-radius:0 0 inherit inherit;background:${bandFold};background-size:inherit;background-repeat:repeat-x}` : ""}
      ${look === "photo" ? `.cl,.cr{background-color:${mix(0)};border-radius:2px 2px 4px 4px}.cl::after,.cr::after{background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(0,0,0,0) 30%,rgba(0,0,0,.10))}` : ""}
      .rod{height:7px;top:2px;border-radius:4px;background:linear-gradient(180deg,#E8E2D6,#9E968A);box-shadow:0 2px 4px rgba(0,0,0,.35)}
      ${look === "wave" ? `.rod::before{content:"";position:absolute;left:4px;right:4px;top:-3px;height:13px;background:radial-gradient(circle at 50% 50%,rgba(0,0,0,0) 3px,#C9C2B5 3.5px,#8E8578 5px,rgba(0,0,0,0) 5.5px) 0 0/${this._pitch / 2}px 13px repeat-x}` : `.rod::before,.rod::after{content:"";position:absolute;top:-3px;width:13px;height:13px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#F5F0E6,#8E8578)}.rod::before{left:-2px}.rod::after{right:-2px}`}
      .shr{position:absolute;inset:0;z-index:1;background:repeating-linear-gradient(90deg,rgba(255,255,255,.30) 0 7px,rgba(255,255,255,.12) 7px 14px,rgba(255,255,255,.34) 14px 21px);backdrop-filter:blur(1.5px);-webkit-backdrop-filter:blur(1.5px)}` : ""}
      ${blind && real ? `.bl{background-size:100% var(--pitch,18px)}
      .bl .bb{position:absolute;left:-2px;right:-2px;bottom:-5px;height:9px;border-radius:4px;background:linear-gradient(180deg,${look === "venetian" ? `${mix(0.1)},${mix(-0.35)}` : "#E9E6E0,#8F8A82"});box-shadow:0 3px 5px rgba(0,0,0,.35)}
      .tube{position:absolute;left:-2px;right:-2px;top:0;z-index:2;border-radius:10px;background:linear-gradient(180deg,${mix(0.15)},${mix(-0.15)} 55%,${mix(-0.4)})}
      .rod{background:linear-gradient(180deg,${mix(0.25)},${mix(-0.2)})}
      .win.moving .bl{animation:none}` : ""}
      .ctl{display:grid;grid-template-columns:44px minmax(0,1fr) 44px;gap:8px;margin-top:10px;align-items:center}
      .ctl .btn{padding:0}
      .trk{position:relative;height:44px;border-radius:14px;background:${p.inset};overflow:hidden;cursor:pointer;touch-action:none;-webkit-tap-highlight-color:transparent}
      .trk .fl{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,${g[0]},${g[1]});opacity:.55}
      .trk .tl{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:${p.text};pointer-events:none}
      .win.moving .cl,.win.moving .cr{animation:roost-ripple .9s linear infinite,roost-sway 1.2s ease-in-out infinite}
      .win.moving .bl{animation:roost-ripple-v .9s linear infinite}
      .note{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);z-index:3;display:none;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;
        background:rgba(10,8,40,.55);color:#fff;font-size:12px;font-weight:600;white-space:nowrap}
      .win.moving .note{display:flex}
      .note ha-icon{--mdc-icon-size:16px;animation:roost-breathe 1s ease-in-out infinite}
      .btns{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}
      .btn{min-height:44px;border-radius:14px;border:1px solid ${p.border};background:${p.panel};${p.fx || ""};color:${p.text};font:inherit;font-size:14px;font-weight:600;cursor:pointer;
        display:flex;align-items:center;justify-content:center;gap:6px;-webkit-tap-highlight-color:transparent;transition:transform .12s}
      .btn:active{transform:scale(.96)}
      .btn.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};border-color:transparent;box-shadow:0 10px 22px -10px ${g[2]}}
      .btn ha-icon{--mdc-icon-size:18px}
      .sch{display:flex;align-items:center;gap:10px;margin-top:10px;padding:10px 12px;border-radius:14px;background:${p.inset}}
      .sch .sun{width:34px;height:34px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#F59E0B,#FDE68A);color:#2A1800;--mdc-icon-size:18px;animation:roost-float 6s ease-in-out infinite}
      .sch.off .sun{background:${p.track};color:${p.muted};animation:none}
      .sch .sx{flex:1;min-width:0}.sch b{display:block;font-size:13px;font-weight:600}.sch small{font-size:12px;color:${p.muted}}
      ${switchCss(p, g)}
    </style>
    <div class="card">${c.show_header ? '<div class="head"><span class="nm t"></span><span class="stt t"></span></div>' : ""}
    <div class="win" role="button" tabindex="0">
      ${c.background === "picture" ? '<div class="pic"></div>' : c.background === "none" || c.show_sky === false ? "" : `<div class="sky"></div>${stars}${c.background === "weather" ? '<div class="wx"></div>' : ""}<span class="orb"></span>${c.background === "weather" && c.show_weather_text ? '<span class="temp t"></span>' : ""}`}${c.style === "pair" ? '<span class="mull"></span>' : ""}
      <span class="rod"></span>${panels}
      <span class="note"><ha-icon></ha-icon><span class="nt"></span></span>
    </div>
    ${c.open_at || c.close_at || c.schedule ? (() => {
      const sun = this.sx(c.sun || "sun.sun")?.attributes || {}, sOn = c.schedule ? this.sx(c.schedule)?.state === "on" : true;
      const when = (v, key) => { if (!v) return ""; if (/^sun(rise|set)$/i.test(v)) { const t = sun[key]; return t ? new Date(t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""; } return v; };
      const o = when(c.open_at, "next_rising"), cl = when(c.close_at, "next_setting");
      return `<div class="sch ${sOn ? "" : "off"}"><span class="sun"><ha-icon icon="mdi:weather-sunset-up"></ha-icon></span><div class="sx"><b class="t">${c.open_at ? `Opens ${/^sunrise$/i.test(c.open_at) ? "with the sunrise" : "at"} ${esc(o)}` : ""}${c.open_at && c.close_at ? " · " : ""}${c.close_at ? `closes ${/^sunset$/i.test(c.close_at) ? "at sunset" : "at"} ${esc(cl)}` : ""}</b><small>${sOn ? "On every day" : "Paused"}</small></div>
        ${c.schedule ? `<span class="sw ${sOn ? "on" : ""}" role="switch" aria-checked="${sOn}" data-sch="1" tabindex="0"></span>` : ""}</div>`; })() : ""}
    ${this.ctl() === "buttons" ? `<div class="btns">
      <button class="btn" data-a="open"><ha-icon icon="${blind ? "mdi:arrow-up" : "mdi:arrow-expand-horizontal"}"></ha-icon>Open</button>
      <button class="btn" data-a="stop"><ha-icon icon="mdi:stop"></ha-icon>Stop</button>
      <button class="btn" data-a="close"><ha-icon icon="${blind ? "mdi:arrow-down" : "mdi:arrow-collapse-horizontal"}"></ha-icon>Close</button></div>`
      : this.ctl() === "slider" ? `<div class="ctl">
      <button class="btn" data-a="close" aria-label="Close"><ha-icon icon="${blind ? "mdi:arrow-down" : "mdi:arrow-collapse-horizontal"}"></ha-icon></button>
      <div class="trk" role="slider" tabindex="0" aria-label="How far open" aria-valuemin="0" aria-valuemax="100"><i class="fl"></i><span class="tl"></span></div>
      <button class="btn" data-a="open" aria-label="Open"><ha-icon icon="${blind ? "mdi:arrow-up" : "mdi:arrow-expand-horizontal"}"></ha-icon></button></div>` : ""}</div>`;
    this._shown = null;
    const win = this.shadowRoot.querySelector(".win");
    win.dataset.noswipe = "1";
    this.press(win, () => { if (this._winDrag?.on || this._dragged) { this._dragged = false; return; } this.run(c.tap_action, c.entity); }, () => { if (!this._winDrag?.on) this.run(c.hold_action, c.entity); });
    this.dragWindow(win);
    this.shadowRoot.querySelector("[data-sch]")?.addEventListener("click", () => { this.vibrate(); this.call("automation", "toggle", { entity_id: c.schedule }); });
    this.shadowRoot.querySelectorAll(".btn").forEach((el) => el.addEventListener("click", () => {
      this.vibrate();
      const a = el.dataset.a;
      if (a === "stop" && c.stop_action && c.stop_action.action && c.stop_action.action !== "none") { this.run(c.stop_action, c.entity); this.call("cover", "stop_cover", { entity_id: c.entity }); return; }
      this._moveUntil = Date.now() + c.travel_time * 1000 + 300;
      this.call("cover", `${a}_cover`, { entity_id: c.entity });
    }));
    const trk = this.shadowRoot.querySelector(".trk");
    if (trk) {
      // drag along the bar to choose how far open; a tap while it moves stops it
      const at = (e) => { const r = trk.getBoundingClientRect(); return Math.round(Math.max(0, Math.min(100, ((e.clientX - r.left) / (r.width || 1)) * 100)) / 5) * 5; };
      let drag = null;
      trk.addEventListener("pointerdown", (e) => {
        const v = this.view(this.st());
        if (v.state === "opening" || v.state === "closing") { this.vibrate(); this.call("cover", "stop_cover", { entity_id: c.entity }); return; }
        drag = at(e); trk.setPointerCapture?.(e.pointerId); this.showDrag(drag);
      });
      trk.addEventListener("pointermove", (e) => { if (drag != null) { drag = at(e); this.showDrag(drag); } });
      const end = () => { if (drag == null) return; const v = drag; drag = null; this._dragging = false; this.goTo(v); };
      trk.addEventListener("pointerup", end); trk.addEventListener("pointercancel", end);
      trk.addEventListener("keydown", (e) => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); this.goTo(Math.max(0, Math.min(100, this.position(this.st()) + (e.key === "ArrowRight" ? 10 : -10)))); } });
    }
  }

  // slide the curtains open or closed with a finger on the window (sideways), or a blind up and down
  dragWindow(win) {
    const c = this._config, blind = c.style === "blind";
    win.style.touchAction = blind ? "none" : "pan-y";
    win.addEventListener("pointerdown", (e) => {
      const r = win.getBoundingClientRect();
      this._winDrag = { x: e.clientX, y: e.clientY, w: r.width || 1, h: r.height || 1, side: e.clientX - r.left > r.width / 2 ? 1 : -1, p0: this.position(this.st()), on: false, id: e.pointerId };
    });
    win.addEventListener("pointermove", (e) => {
      const d = this._winDrag; if (!d) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (!d.on) {
        if (blind ? Math.abs(dy) < 10 || Math.abs(dy) < Math.abs(dx) : Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy)) return;
        d.on = true; try { win.setPointerCapture(d.id); } catch (err) { /* fine */ }
      }
      // how far the edge of the fabric moved, as a share of how far it can travel
      const k = blind ? (-dy / d.h) / 0.88 : c.style === "pair" ? ((d.side * dx) / d.w) / 0.43 : c.style === "left" ? (-dx / d.w) / 0.88 : (dx / d.w) / 0.88;
      this._dragPos = Math.round(Math.max(0, Math.min(100, d.p0 + k * 100)) / 5) * 5;
      this.update(); if (this.shadowRoot.querySelector(".trk")) this.showDrag(this._dragPos);
    });
    const end = () => {
      const d = this._winDrag; this._winDrag = null; if (!d?.on) return;
      this._dragged = true; const v = this._dragPos; this._dragPos = null; this._dragging = false;
      if (v != null) this.goTo(v);
    };
    win.addEventListener("pointerup", end); win.addEventListener("pointercancel", end);
  }

  showDrag(v) {
    this._dragging = true;
    const R = this.shadowRoot;
    R.querySelector(".trk .fl").style.width = `${v}%`;
    R.querySelector(".trk .tl").textContent = v === 0 ? "Closed" : v === 100 ? "Open" : `${v}% open`;
  }

  // send the curtain to v% open (open or close when the device has no positions)
  goTo(v) {
    const c = this._config, s = this.st();
    this.vibrate();
    this._moveUntil = Date.now() + (Number(c.travel_time) || 1.4) * 1000 + 300;
    const canPos = s && (s.attributes.supported_features & 4) && s.attributes.current_position != null;
    if (canPos && v > 0 && v < 100) this.call("cover", "set_cover_position", { entity_id: c.entity, position: v });
    else this.call("cover", `${v >= 50 ? "open" : "close"}_cover`, { entity_id: c.entity });
    this._sig = null; this.update();
  }

  update() {
    const c = this._config, s = this.st(), root = this.shadowRoot;
    const pos = this.position(s);
    const day = (this.sx(c.sun || "sun.sun") || {}).state !== "below_horizon";
    const sky = root.querySelector(".sky");
    if (sky) {
      sky.style.background = day ? "linear-gradient(180deg,#60A5FA,#BFDBFE)" : "linear-gradient(180deg,#131848,#2C2472)";
      root.querySelectorAll(".star").forEach((el) => { el.style.display = day ? "none" : "block"; });
      const orb = root.querySelector(".orb");
      orb.style.cssText += day ? ";width:30px;height:30px;background:radial-gradient(circle,#FFF7D6,#FDE047 60%,#F59E0B);box-shadow:0 0 26px 8px rgba(253,224,71,.45)"
        : ";width:26px;height:26px;background:radial-gradient(circle at 36% 34%,#FFFBEA,#E2C273);box-shadow:0 0 22px 6px rgba(255,234,170,.25)";
    }
    const pic = root.querySelector(".pic");
    if (pic) {
      const src = !day && c.image_night ? c.image_night : c.image;
      if (src) pic.style.backgroundImage = `url("${String(src).replace(/["\\]/g, "")}")`;
      else pic.style.background = day ? "linear-gradient(180deg,#60A5FA,#BFDBFE)" : "linear-gradient(180deg,#131848,#2C2472)";
    }
    const wx = root.querySelector(".wx");
    if (wx) this.weather(wx, day, sky);
    const un = !s || UNAVAILABLE.includes(s.state);
    const v = this.view(s);
    const word = !s ? "Device not found" : un ? (s.attributes.assumed_state ? "Ready" : "Offline") : v.state.charAt(0).toUpperCase() + v.state.slice(1);
    const pct = c.show_percent && v.pos != null && pos > 0 && pos < 100 ? ` · ${pos}% open` : "";
    const nm = root.querySelector(".nm"), stt = root.querySelector(".stt");
    if (nm) nm.textContent = this.name(c.entity);
    if (stt) stt.textContent = word + pct;
    root.querySelectorAll(".btns .btn").forEach((b) => b.classList.toggle("on", (b.dataset.a === "open" && v.state === "open") || (b.dataset.a === "close" && v.state === "closed")));
    const trk = root.querySelector(".trk");
    if (trk && !this._dragging) {
      const mv = v.state === "opening" || v.state === "closing";
      trk.querySelector(".fl").style.width = `${pos}%`;
      trk.setAttribute("aria-valuenow", String(pos));
      trk.querySelector(".tl").textContent = un ? "Not reachable" : mv ? "Tap to stop" : pos === 0 ? "Slide to open" : pos === 100 ? "Open · slide to close" : `${pos}% open`;
    }
    // real fabrics: folds bunch up as it opens, slats close up as a blind rises
    const look = this.kind(), H = Math.max(40, (Number(c.height) || 150) - 12);
    if (look !== "classic" && c.style !== "blind" && this._pitch) root.querySelectorAll(".cl,.cr").forEach((el) => { el.style.backgroundSize = `${(this._pitch * (0.55 + 0.45 * (1 - pos / 100))).toFixed(1)}px 100%`; });
    const bl = root.querySelector(".bl");
    if (bl && look !== "classic") {
      const covered = H * (1 - 0.88 * pos / 100);
      if (look === "venetian") {
        const tilt = Number(s?.attributes.current_tilt_position ?? 50) / 100;
        bl.style.setProperty("--pitch", `${Math.max(3.4, covered / 14).toFixed(1)}px`);
        bl.style.setProperty("--sl", `${Math.round((0.3 + 0.62 * (1 - tilt)) * 100)}%`);
      } else if (look === "roman") bl.style.setProperty("--pitch", `${Math.max(14, covered / 5).toFixed(1)}px`);
      const tube = root.querySelector(".tube");
      if (tube) tube.style.height = `${(10 + 10 * pos / 100).toFixed(0)}px`;
    }
    // slide the fabric from where it is to where it should be
    const amount = this.cover(pos), blind = c.style === "blind";
    const dur = Math.max(200, (Number(c.travel_time) || 1.4) * 1000);
    root.querySelectorAll(".cl,.cr,.bl").forEach((el) => {
      const prop = blind ? "height" : "width";
      const to = `${amount}%`;
      if (this._shown == null) { el.style[prop] = to; return; }
      if (el.style[prop] === to) return;
      const from = getComputedStyle(el)[prop];
      el.style[prop] = to;
      try { el.animate([{ [prop]: from }, { [prop]: to }], { duration: dur, easing: "cubic-bezier(.6,0,.2,1)" }); } catch (e) { /* old browser: it just jumps */ }
      this._moveUntil = Math.max(this._moveUntil || 0, Date.now() + dur);
    });
    this._shown = pos;
    // ripple while it moves
    const moving = s && (v.state === "opening" || v.state === "closing" || (this._moveUntil || 0) > Date.now());
    const win = root.querySelector(".win");
    win.classList.toggle("moving", !!moving);
    win.classList.toggle("shut", pos === 0 && !moving); // weather and stars rest while nothing can be seen
    const goingUp = v.state === "opening" || (v.state !== "closing" && pos >= 50);
    root.querySelector(".nt").textContent = goingUp ? "Opening" : "Closing";
    root.querySelector(".note ha-icon").setAttribute("icon", blind ? (goingUp ? "mdi:arrow-up" : "mdi:arrow-down") : goingUp ? "mdi:arrow-expand-horizontal" : "mdi:arrow-collapse-horizontal");
    clearTimeout(this._stopTimer);
    if (moving && v.state !== "opening" && v.state !== "closing") this._stopTimer = setTimeout(() => { this._sig = null; this.update(); }, Math.max(50, this._moveUntil - Date.now() + 20));
  }

  // Live weather behind the window: clouds drift, rain and snow fall, storms flash, the sun's rays turn.
  weather(box, day, sky) {
    const c = this._config, w = this.sx(c.weather), cond = w ? w.state : "sunny";
    const grey = /rain|pour|light|cloudy|fog|snow|hail/.test(cond) && cond !== "partlycloudy";
    if (sky && grey) sky.style.background = day ? "linear-gradient(180deg,#7C8BA6,#C7D0DE)" : "linear-gradient(180deg,#1A1F3D,#33395E)";
    const orb = this.shadowRoot.querySelector(".orb");
    if (orb) orb.style.display = grey ? "none" : "block";
    if (box.dataset.cond === `${cond}|${day}`) return this.weatherText(w);
    box.dataset.cond = `${cond}|${day}`;
    let h = "";
    const rnd = (i, m) => ((i * 37 + 13) % m);
    if (day && (cond === "sunny" || cond === "partlycloudy")) h += '<span class="rays"></span>';
    const clouds = { partlycloudy: 2, cloudy: 4, rainy: 3, pouring: 4, "lightning-rainy": 4, lightning: 3, snowy: 3, "snowy-rainy": 3, hail: 3, windy: 3, "windy-variant": 3 }[cond] || 0;
    for (let i = 0; i < clouds; i++) h += `<span class="cloud" style="top:${8 + rnd(i, 40)}%;animation-duration:${18 + i * 7}s;animation-delay:-${i * 6}s;${grey ? "background:rgba(225,230,240,.9);" : ""}"></span>`;
    const drops = { rainy: 18, pouring: 32, "lightning-rainy": 26, "snowy-rainy": 10, hail: 14 }[cond] || 0;
    for (let i = 0; i < drops; i++) h += `<span class="drop" style="left:${rnd(i * 3, 100)}%;top:0;animation-duration:${(0.6 + (i % 4) * 0.12).toFixed(2)}s;animation-delay:-${((i % 7) * 0.13).toFixed(2)}s"></span>`;
    const flakes = { snowy: 18, "snowy-rainy": 8 }[cond] || 0;
    for (let i = 0; i < flakes; i++) h += `<span class="flake" style="left:${rnd(i * 5, 100)}%;top:0;animation-duration:${(3 + (i % 5) * 0.6).toFixed(1)}s;animation-delay:-${((i % 9) * 0.5).toFixed(1)}s"></span>`;
    if (/lightning/.test(cond)) h += '<span class="flash"></span>';
    if (cond === "fog") for (let i = 0; i < 3; i++) h += `<span class="fog" style="top:${25 + i * 22}%;animation-duration:${22 + i * 6}s;animation-delay:-${i * 7}s"></span>`;
    box.innerHTML = h;
    return this.weatherText(w);
  }

  weatherText(w) {
    const t = this.shadowRoot.querySelector(".temp");
    if (!t) return;
    const temp = w?.attributes.temperature;
    t.style.display = w && temp != null ? "block" : "none";
    if (w && temp != null) t.textContent = `${Math.round(temp)}${(w.attributes.temperature_unit || "°C").replace(/^°?/, "°")} · ${w.state.replace("partlycloudy", "partly cloudy").replace("clear-night", "clear").replace(/-/g, " ")}`;
  }

  getCardSize() { return 4; }
}

// ------------------------------------------------------------------ helpers for the cards below
// A card that redraws on a timer (clock, "last ran", "home for").
const ticking = (Base, ms) => class extends Base {
  connectedCallback() { super.connectedCallback?.(); clearInterval(this._tick); this._tick = setInterval(() => { this._sig = null; if (this._hass) this.hass = this._hass; }, ms); }

  disconnectedCallback() { super.disconnectedCallback?.(); clearInterval(this._tick); }
};

// "5 min ago", "3 h ago", "2 d ago"
function ago(iso) {
  if (!iso) return "";
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.round(m / 60)} h ago`;
  return `${Math.round(m / 1440)} d ago`;
}

// Roost cards inside another Roost card follow its light/dark setting unless they have their own.
const withTheme = (cfg, theme) => (cfg && typeof cfg.type === "string" && cfg.type.startsWith("custom:roost-") && !cfg.theme && theme && theme !== "auto" ? { ...cfg, theme } : cfg);
// a number, or null. A time such as "2026-11-17T08:00" is not the number 2026.
const num = (v) => { if (typeof v === "number") return Number.isFinite(v) ? v : null; const t = String(v ?? "").trim(); if (!/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(t)) return null; const n = parseFloat(t); return Number.isFinite(n) ? n : null; };
const fmt = (v, dec) => (v == null ? "" : Number(v).toFixed(dec == null ? (Math.abs(v) >= 100 ? 0 : 1) : dec));
// as many decimals as the sensor itself gives (52 stays 52, 26.4 stays 26.4), at most two
// whole numbers for watts, lux and ppm (a "0.0 W" reading reads as "0 W"); otherwise as many decimals as the sensor gives, at most 2
const decOf = (state, unit) => (/^(W|Wh|lx|ppm|rpm|mA)$/.test(String(unit || "")) ? 0 : Math.min(2, (String(state).split(".")[1] || "").length));
// "26°" and "52%" sit next to the number; "1460 W" and "612 ppm" get a space
const unitGap = (u) => (!u ? "" : /^(°|°C|°F|%)$/.test(u) ? u : ` ${u}`);
// The shape of a tile: square by default in rooms, or 4:3, 3:4, or a height you choose.
const TILE_SHAPES = [["square", "Square"], ["wide", "Wide (4:3)"], ["tall", "Tall (3:4)"], ["custom", "My own height"]];
const shapeCss = (shape, h, fallback) => (shape === "square" ? "aspect-ratio:1/1;height:auto;min-height:0" : shape === "wide" ? "aspect-ratio:4/3;height:auto;min-height:0" : shape === "tall" ? "aspect-ratio:3/4;height:auto;min-height:0" : `min-height:${Number(h) || fallback}px;height:100%`);
const CORNERS = [["top-left", "Top left"], ["top-right", "Top right"], ["bottom-left", "Bottom left"], ["bottom-right", "Bottom right"]];
const panelCss = (p, radius = 22) => `background:${p.panel};${p.fx || ""};border:1px solid ${p.border};border-radius:${radius}px;color:${p.text}`;
// a ring: the track and the coloured part, in a 0..1 fraction
function ringSvg({ size = 210, r = 80, width = 14, f = 0, track, id = "g", from, to, inner, innerFill }) {
  const C = 2 * Math.PI * r, L = C * 0.75, cx = size / 2;
  return `<svg viewBox="0 0 ${size} ${size}"><defs><linearGradient id="${id}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
    <circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="${track}" stroke-width="${width}" stroke-linecap="round" stroke-dasharray="${L.toFixed(1)} ${C.toFixed(1)}" transform="rotate(135 ${cx} ${cx})"/>
    <circle class="arc" cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="url(#${id})" stroke-width="${width}" stroke-linecap="round" stroke-dasharray="${(L * Math.max(0.0001, f)).toFixed(1)} ${C.toFixed(1)}" transform="rotate(135 ${cx} ${cx})" ${f <= 0 ? 'opacity="0"' : ""}/>
    ${inner ? `<circle cx="${cx}" cy="${cx}" r="${inner}" fill="${innerFill}"/>` : ""}</svg>`;
}

// A switch like the tiles' one.
const switchCss = (p, g) => `.sw{position:relative;width:44px;height:24px;border-radius:999px;background:${p.track};flex:none;cursor:pointer;transition:background .12s}
  .sw::after{content:"";position:absolute;left:3px;top:3px;width:18px;height:18px;border-radius:50%;background:${p.knob};transition:transform .12s,background .12s}
  .sw.on{background:linear-gradient(135deg,${g[0]},${g[1]})}
  .sw.on::after{transform:translateX(20px);background:#fff}`;

// ------------------------------------------------------------------ Roost Gauge
// A big ring for one reading (a cabinet's temperature, a plug's power). It turns orange and glows when too high.
class RoostGauge extends RoostBase {
  static get defaults() { return { min: 0, max: 100, color: "custom", color_start: "#38BDF8", color_end: "#8B6CFF", size: 230, radius: 22, show_name: true, frame: true, tap_action: { action: "more-info" }, theme: "auto" }; }

  validate(c) { if (!c.entity) throw new Error("Choose a reading (sensor)"); }

  watched() { return [this._config.entity, this._config.second].filter(Boolean); }

  static getConfigForm() {
    return {
      schema: [
        { name: "entity", required: true, selector: { entity: {} } },
        { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "title", label: "Small title in the ring (for example POWER)", selector: { text: {} } }] },
        { type: "expandable", name: "", title: "Numbers", icon: "mdi:numeric", schema: [
          { type: "grid", name: "", schema: [{ name: "min", label: "Ring starts at", selector: { number: { mode: "box" } } }, { name: "max", label: "Ring is full at", selector: { number: { mode: "box" } } }] },
          { type: "grid", name: "", schema: [{ name: "warn", label: "Warn at or above", selector: { number: { mode: "box" } } }, { name: "warn_below", label: "Warn at or below", selector: { number: { mode: "box" } } }] },
          { type: "grid", name: "", schema: [{ name: "unit", label: "Unit (empty = the sensor's)", selector: { text: {} } }, { name: "decimals", selector: { number: { min: 0, max: 3, mode: "box" } } }] },
          { name: "second", label: "Second reading under it (for example humidity)", selector: { entity: {} } },
          { name: "second_name", label: "Name of the second reading", selector: { text: {} } },
        ] },
        { type: "expandable", name: "", title: "Look", icon: "mdi:palette", schema: [
          ...colourFields("color", "Ring colour"),
          { type: "grid", name: "", schema: [{ name: "size", label: "Ring size", selector: slider(140, 320, 10) }, { name: "radius", selector: slider(0, 40, 2) }] },
          { type: "grid", name: "", schema: [{ name: "show_name", selector: { boolean: {} } }, { name: "frame", label: "Card background", selector: { boolean: {} } }] },
          THEME_FIELD,
        ] },
        { type: "expandable", name: "", title: "Tap", icon: "mdi:gesture-tap", schema: [ACTION_FIELD("tap_action")] },
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) { return { entity: Object.keys(hass.states).find((id) => id.startsWith("sensor.") && num(hass.states[id].state) != null) || "", min: 0, max: 50 }; }

  getGridOptions() { return { columns: 6, rows: "auto", min_columns: 4 }; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, s = this.st();
    const v = s ? num(s.state) : null, ok = v != null;
    const hot = ok && ((c.warn != null && c.warn !== "" && v >= c.warn) || (c.warn_below != null && c.warn_below !== "" && v <= c.warn_below));
    const f = ok ? Math.max(0, Math.min(1, (v - c.min) / ((c.max - c.min) || 1))) : 0;
    const g = hot ? ["#FF9F6B", "#F43F6B"] : this.colour();
    const unit = c.unit != null && c.unit !== "" ? c.unit : s?.attributes.unit_of_measurement || "";
    const u2 = unitGap(unit);
    const sub = c.second ? this.sx(c.second) : null, sv = sub ? num(sub.state) : null;
    const line = !s ? "Device not found" : !ok ? "Offline" : hot ? (c.warn_below != null && v <= c.warn_below ? "Too low" : "Too high") : sub ? `${c.second_name || sub.attributes.friendly_name || "Also"} ${sv != null ? fmt(sv, decOf(sub.state, sub.attributes.unit_of_measurement)) : sub.state}${sv != null ? unitGap(sub.attributes.unit_of_measurement || "") : ""}` : "";
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${c.frame ? panelCss(p, c.radius) : `color:${p.text}`};padding:${c.frame ? "16px 14px" : 0};display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;-webkit-tap-highlight-color:transparent}
      .ring{position:relative;width:100%;max-width:${c.size}px;container-type:inline-size}
      .ring svg{display:block;width:100%;${hot ? "animation:roost-arc 2.4s ease-in-out infinite" : ""}}
      .in{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 24%}
      .ti{font-size:max(9px,5cqw);letter-spacing:1.2px;color:${p.muted};text-transform:uppercase}
      .v{font-size:12.5cqw;font-weight:700;line-height:1.05;color:${hot ? "#FF9F6B" : p.text};white-space:nowrap}
      .v ha-icon{--mdc-icon-size:12cqw;color:${p.muted}}
      .ln{font-size:max(10px,5.4cqw);color:${hot ? "#FF9F6B" : p.muted};line-height:1.3}
      .nm{font-size:15px;font-weight:600;text-align:center}
    </style>
    <div class="card" role="button" tabindex="0">
      <div class="ring">${ringSvg({ f, track: p.track, from: g[0], to: g[1], id: "gg", inner: 58, innerFill: p.dial })}
        <div class="in">${c.title ? `<span class="ti t">${esc(c.title)}</span>` : ""}<span class="v num" ${ok ? 'data-tw="v"' : ""}>${ok ? esc(fmt(v, c.decimals ?? decOf(s.state, unit)) + u2) : '<ha-icon icon="mdi:help-circle-outline"></ha-icon>'}</span>${line ? `<span class="ln t">${esc(line)}</span>` : ""}</div></div>
      ${c.show_name ? `<div class="nm t">${esc(this.name(c.entity))}</div>` : ""}
    </div>`;
    // the arc grows to its new value instead of jumping
    const arc = this.shadowRoot.querySelector(".arc");
    if (arc && this._lastF != null && this._lastF !== f) {
      const L = 2 * Math.PI * 80 * 0.75, C = 2 * Math.PI * 80;
      try { arc.animate([{ strokeDasharray: `${(L * Math.max(0.0001, this._lastF)).toFixed(1)} ${C.toFixed(1)}` }, { strokeDasharray: `${(L * Math.max(0.0001, f)).toFixed(1)} ${C.toFixed(1)}` }], { duration: 700, easing: "cubic-bezier(.3,1,.4,1)" }); } catch (e) { /* jumps */ }
    }
    this._lastF = f;
    this.press(this.shadowRoot.querySelector(".card"), () => this.run(c.tap_action, c.entity), () => this.moreInfo(c.entity));
  }
}

// ------------------------------------------------------------------ Roost Automations
// A list of automations, each with a switch and when it last ran.
class RoostAutomations extends ticking(RoostBase, 60000) {
  static get defaults() { return { entities: [], all: false, color: "active", columns: 1, show_last_run: true, show_run: false, only_on: false, title: "", radius: 16, theme: "auto" }; }

  validate(c) { if (!c.all && (!Array.isArray(c.entities) || !c.entities.length)) throw new Error("Pick some automations, or turn on “Show all automations”"); }

  ids() {
    const c = this._config, h = this._hass;
    let ids = c.all ? Object.keys(h?.states || {}).filter((id) => id.startsWith("automation.")).sort((a, b) => this.name(a).localeCompare(this.name(b))) : c.entities.map((e) => (typeof e === "string" ? e : e.entity));
    if (c.only_on) ids = ids.filter((id) => this.sx(id)?.state === "on");
    return ids;
  }

  name(id) {
    const e = (this._config.entities || []).find((x) => typeof x === "object" && x.entity === id);
    return e?.name || this.sx(id)?.attributes.friendly_name || id;
  }

  watched() { return this._hass ? this.ids() : []; }

  static getConfigForm() {
    return {
      schema: [
        { name: "title", label: "Title above the list (optional)", selector: { text: {} } },
        { name: "entities", label: "Automations", selector: { entity: { multiple: true, domain: "automation" } } },
        { name: "all", label: "Show all automations (ignores the list above)", selector: { boolean: {} } },
        { type: "expandable", name: "", title: "What it shows", icon: "mdi:eye-outline", schema: [
          { type: "grid", name: "", schema: [{ name: "show_last_run", label: "When it last ran", selector: { boolean: {} } }, { name: "show_run", label: "A “run now” button", selector: { boolean: {} } }] },
          { name: "only_on", label: "Only the ones that are switched on", selector: { boolean: {} } },
        ] },
        { type: "expandable", name: "", title: "Look", icon: "mdi:palette", schema: [
          ...colourFields("color", "Colour when on"),
          { type: "grid", name: "", schema: [{ name: "columns", label: "Side by side", selector: { number: { min: 1, max: 3, mode: "box" } } }, { name: "radius", selector: slider(0, 32, 2) }] },
          THEME_FIELD,
        ] },
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) { return { entities: Object.keys(hass.states).filter((id) => id.startsWith("automation.")).slice(0, 4) }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour();
    const ids = this.ids();
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${switchCss(p, g)}
      .ttl{font-size:17px;font-weight:700;color:${p.text};margin:2px 4px 10px}
      .list{display:grid;grid-template-columns:repeat(${Math.max(1, c.columns)},minmax(0,1fr));gap:8px}
      @container (max-width: 560px){:host .list{grid-template-columns:minmax(0,1fr)}}
      .row{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:${c.radius}px;background:${p.off};${p.fx || ""};border:1px solid ${p.border};color:${p.text};cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .12s}
      .row:active{transform:scale(.98)}
      .ic{width:38px;height:38px;border-radius:12px;flex:none;display:flex;align-items:center;justify-content:center;background:${p.inset};color:${p.muted}}
      .row.on .ic{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};box-shadow:0 8px 18px -8px ${g[2]}}
      @container (max-width: 300px){:host .row{padding:10px 12px;gap:10px}:host .ic{display:none}}
      @container (max-width: 240px){:host .run{display:none}}
      .ic ha-icon{--mdc-icon-size:20px}
      .tx{flex:1;min-width:0}
      .n{font-size:14px;font-weight:600;line-height:1.25;overflow-wrap:normal;word-break:normal;hyphens:none}
      .l{font-size:12px;color:${p.muted};margin-top:2px}
      .run{flex:none;width:34px;height:34px;border-radius:50%;border:1px solid ${p.border};background:${p.panel};${p.fx || ""};color:${p.text};display:flex;align-items:center;justify-content:center;cursor:pointer}
      .run ha-icon{--mdc-icon-size:18px}
      .run.go ha-icon{animation:roost-pulse .8s ease-in-out 2}
      .empty{padding:18px;border-radius:${c.radius}px;border:1px dashed ${p.border};color:${p.muted};text-align:center;font-size:14px}
    </style>
    ${c.title ? `<div class="ttl t">${esc(c.title)}</div>` : ""}
    <div class="list">${ids.length ? ids.map((id) => {
      const s = this.sx(id), on = s?.state === "on", un = !s || UNAVAILABLE.includes(s.state);
      const line = un ? (s ? "Offline" : "Not found") : c.show_last_run ? (s.attributes.last_triggered ? `Last ran ${ago(s.attributes.last_triggered)}` : "Never ran") : on ? "On" : "Off";
      const ent = (c.entities || []).find((x) => typeof x === "object" && x.entity === id);
      return `<div class="row ${on ? "on" : ""}" data-id="${esc(id)}" data-flash="${esc(s?.attributes.last_triggered || "")}" data-flashkey="${esc(id)}" role="button" tabindex="0" aria-label="${esc(this.name(id))}">
        <span class="ic" data-pop="${on ? 1 : 0}" data-popkey="${esc(id)}"><ha-icon icon="${esc(ent?.icon || (on ? "mdi:robot" : "mdi:robot-outline"))}"></ha-icon></span>
        <span class="tx"><div class="n t">${esc(this.name(id))}</div><div class="l t">${esc(line)}</div></span>
        ${c.show_run ? `<button class="run" data-run="${esc(id)}" aria-label="Run now"><ha-icon icon="mdi:play"></ha-icon></button>` : ""}
        <span class="sw ${on ? "on" : ""}" data-sw="${esc(id)}" role="switch" aria-checked="${on}"></span></div>`;
    }).join("") : '<div class="empty t">Nothing to show here.</div>'}</div>`;
    this.shadowRoot.querySelectorAll(".row").forEach((row) => {
      const id = row.dataset.id;
      this.press(row, (ev) => {
        if (ev?.target?.closest?.(".run")) return;
        this.vibrate();
        this.call("automation", "toggle", { entity_id: id });
      }, () => this.moreInfo(id));
    });
    this.shadowRoot.querySelectorAll(".run").forEach((b) => b.addEventListener("pointerup", (ev) => {
      ev.stopPropagation();
      b.classList.remove("go"); void b.offsetWidth; b.classList.add("go");
      this.vibrate();
      this.call("automation", "trigger", { entity_id: b.dataset.run });
    }));
  }
}

// ------------------------------------------------------------------ Roost Clock
// A big clock and date, with a line of the day's times (prayers or anything else) and a countdown to the next one.
class RoostClockClassic extends ticking(RoostBase, 15000) {
  static get defaults() { return { times: [], seconds: false, hour24: false, show_date: true, show_timeline: true, countdown_title: "Next", color: "active", radius: 22, frame: true, theme: "auto" }; }

  watched() { return (this._config.times || []).map((t) => t.entity).filter(Boolean); }

  connectedCallback() {
    super.connectedCallback();
    if (this._config?.seconds) { clearInterval(this._tick); this._tick = setInterval(() => { this._sig = null; if (this._hass) this.hass = this._hass; }, 1000); }
  }

  extraSignature() { const d = new Date(); return `${d.getHours()}:${d.getMinutes()}${this._config.seconds ? `:${d.getSeconds()}` : ""}`; }

  static getConfigForm() {
    return {
      schema: [
        { name: "times", label: "Times of the day (for example prayer times)", selector: { object: { multiple: true, label_field: "name", fields: {
          name: { label: "Name", required: true, selector: { text: {} } },
          short: { label: "Short name on the line (1–2 letters)", selector: { text: {} } },
          entity: { label: "Time (a sensor with a time)", required: true, selector: { entity: {} } },
          countdown: { label: "Count down to it", selector: { boolean: {} } },
        } } } },
        { name: "prayer_method", label: "Or prayer times worked out here (no sensors needed)", selector: { select: { mode: "dropdown", options: [{ value: "", label: "Off" }, ...Object.entries(PRAYER_METHODS).map(([k, v]) => ({ value: k, label: v.name }))] } } },
        { name: "countdown_title", label: "Word before the next time", selector: { text: {} } },
        { type: "expandable", name: "", title: "Clock", icon: "mdi:clock-outline", schema: [
          { type: "grid", name: "", schema: [{ name: "hour24", label: "24-hour clock", selector: { boolean: {} } }, { name: "seconds", selector: { boolean: {} } }] },
          { type: "grid", name: "", schema: [{ name: "show_date", selector: { boolean: {} } }, { name: "show_timeline", label: "The line of times", selector: { boolean: {} } }] },
        ] },
        { type: "expandable", name: "", title: "Look", icon: "mdi:palette", schema: [
          ...colourFields("color", "Colour of the next time"),
          { type: "grid", name: "", schema: [{ name: "radius", selector: slider(0, 40, 2) }, { name: "frame", label: "Card background", selector: { boolean: {} } }] },
          THEME_FIELD,
        ] },
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) {
    const find = (re) => Object.keys(hass.states).find((id) => re.test(id));
    const t = [["Fajr", "F", /fajr/], ["Dhuhr", "D", /dhuhr/], ["Asr", "A", /asr/], ["Maghrib", "M", /maghrib/], ["Isha", "I", /isha/]]
      .map(([name, short, re]) => ({ name, short, entity: find(re), countdown: true })).filter((x) => x.entity);
    return { times: t };
  }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  // Prayer times worked out here, for the line, when no time sensors are picked.
  prayerTimes(now) {
    const h = this._hass, c = this._config;
    const lat = Number(h?.config?.latitude ?? 26.2), lng = Number(h?.config?.longitude ?? 50.6);
    const tz = -new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12).getTimezoneOffset() / 60;
    const t = PrayerCalc.times(now, lat, lng, tz, c.prayer_method, c.asr === "hanafi" ? 2 : 1, Number(h?.config?.elevation ?? 0));
    return [["fajr", "Fajr", "F"], ["sunrise", "Sunrise", "S"], ["dhuhr", "Dhuhr", "D"], ["asr", "Asr", "A"], ["maghrib", "Maghrib", "M"], ["isha", "Isha", "I"]]
      .filter(([k]) => isFinite(t[k])).map(([k, name, short]) => {
        const at = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0); at.setMinutes(Math.round(t[k] * 60));
        return { name, short, at, countdown: k !== "sunrise" };
      });
  }

  // today's time for a sensor (a full date, or "18:05")
  when(id) {
    const s = this.sx(id);
    if (!s || UNAVAILABLE.includes(s.state)) return null;
    let d = new Date(s.state);
    if (isNaN(d)) {
      const m = String(s.state).match(/^(\d{1,2}):(\d{2})/);
      if (!m) return null;
      d = new Date(); d.setHours(+m[1], +m[2], 0, 0);
    }
    return d;
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour(), now = new Date();
    const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: c.seconds ? "2-digit" : undefined, hour12: !c.hour24 });
    const [hm, ap] = c.hour24 ? [time, ""] : [time.replace(/\s?[AaPp]\.?[Mm]\.?$/, ""), (time.match(/[AaPp]\.?[Mm]\.?$/) || [""])[0]];
    const date = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
    let times = (c.times || []).map((t) => ({ ...t, at: this.when(t.entity) })).filter((t) => t.at);
    if (!times.length && c.prayer_method) times = this.prayerTimes(now);
    const mins = (d) => d.getHours() * 60 + d.getMinutes();
    // when some times are marked "count down to it", only those are counted down to (prayers, not sunrise or the end of the night)
    const marked = times.some((t) => t.countdown === true);
    const counts = (t) => (marked ? t.countdown === true : t.countdown !== false);
    let next = times.filter((t) => counts(t) && mins(t.at) > mins(now)).sort((a, b) => mins(a.at) - mins(b.at))[0];
    let nextAt = next ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), next.at.getHours(), next.at.getMinutes()) : null;
    if (!next) {
      next = times.filter((t) => counts(t)).sort((a, b) => mins(a.at) - mins(b.at))[0];
      if (next) { nextAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, next.at.getHours(), next.at.getMinutes()); }
    }
    const left = nextAt ? Math.max(0, Math.round((nextAt - now) / 60000)) : 0;
    const cd = nextAt ? `${Math.floor(left / 60) ? `${Math.floor(left / 60)}h ` : ""}${left % 60}m` : "";
    const fmtT = (d) => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: !c.hour24 });
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${c.frame ? panelCss(p, c.radius) : `color:${p.text}`};padding:${c.frame ? 20 : 0}px;display:flex;flex-direction:column;gap:14px}
      .top{display:flex;justify-content:space-between;align-items:flex-end;gap:10px}
      .top > div:first-child{min-width:0}
      .clk{display:flex;align-items:baseline;gap:6px}
      .hm{font-size:clamp(30px,14cqw,52px);font-weight:700;letter-spacing:-1.5px;line-height:1}
      .ap{font-size:17px;font-weight:600;color:${p.muted}}
      .dt{font-size:14px;color:${p.muted};margin-top:6px}
      .nx{display:flex;flex-direction:column;align-items:flex-end;text-align:right;flex:none}
      .nx .w{font-size:12px;color:${p.muted}}
      .nx .n{font-size:17px;font-weight:700;color:${this.dark ? "#C4B5FD" : "#5B3FE0"};white-space:nowrap}
      .nx .c{font-size:12px;color:${p.muted}}
      .line{position:relative;height:44px;margin:0 8px}
      .bar{position:absolute;left:0;right:0;top:10px;height:6px;border-radius:999px;background:${c.line === "plain" ? p.track : "linear-gradient(90deg,#1B1E52,#38BDF8 25%,#FCD34D 50%,#FF9F6B 70%,#6D4BFF 85%,#1B1E52)"}}
      .fill{${c.line === "plain" ? `position:absolute;left:0;top:10px;height:6px;border-radius:999px;background:linear-gradient(90deg,${g[0]},${g[1]})` : "display:none"}}
      .dot{position:absolute;top:7px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:6px}
      .dot i{display:block;width:8px;height:8px;border-radius:50%;background:${this.dark ? "#0B0D17" : "#fff"};border:2px solid ${this.dark ? "#C4B5FD" : "#8B6CFF"}}
      .dot.nx2 i{width:12px;height:12px;margin-top:-2px;border:0;background:#B794FF;box-shadow:0 0 10px #B794FF}
      .dot span{font-size:11px;color:${p.muted};white-space:nowrap}
      .dot.l span{transform:translateX(calc(-50% - 2px))}.dot.r span{transform:translateX(calc(50% + 2px))}
      .dot.nx2 span{margin-top:-2px}
      .now{position:absolute;top:5px;width:16px;height:16px;margin-left:-8px;border-radius:50%;background:${this.dark ? "#fff" : "#161936"};box-shadow:0 0 12px ${this.dark ? "rgba(255,255,255,.9)" : "rgba(22,25,54,.5)"}}
      .now::after{content:"";position:absolute;inset:0;border-radius:50%;background:inherit;animation:roost-ping 1.8s ease-out infinite}
    </style>
    <div class="card">
      <div class="top"><div><div class="clk"><span class="hm num">${esc(hm)}</span>${ap ? `<span class="ap">${esc(ap)}</span>` : ""}</div>${c.show_date ? `<div class="dt t">${esc(date)}</div>` : ""}</div>
        ${next ? `<div class="nx"><span class="w t">${esc(c.countdown_title)}</span><span class="n">${esc(next.name)} · ${esc(cd)}</span><span class="c">at ${esc(fmtT(nextAt))}</span></div>` : ""}</div>
      ${c.show_timeline && times.length ? `<div class="line"><span class="bar"></span><span class="fill" style="width:${(mins(now) / 1440 * 100).toFixed(2)}%"></span>
        ${times.slice().sort((a, b) => mins(a.at) - mins(b.at)).map((t, k, arr) => {
          // two times close together: their names lean apart instead of sitting on top of each other
          const gap = (x, y) => (x && y ? (mins(y.at) - mins(x.at)) / 1440 : 1);
          const side = gap(arr[k - 1], t) < 0.06 ? " r" : gap(t, arr[k + 1]) < 0.06 ? " l" : "";
          return `<span class="dot${next && t.name === next.name ? " nx2" : ""}${side}" style="left:${(mins(t.at) / 1440 * 100).toFixed(2)}%"><i></i><span>${esc(t.short || t.name.slice(0, 2))}</span></span>`; }).join("")}
        <span class="now" style="left:${(mins(now) / 1440 * 100).toFixed(2)}%"></span></div>` : ""}
    </div>`;
  }
}

// ------------------------------------------------------------------ prayer time calculation
// Standard astronomical method (sun position, equation of time), with the common calculation
// authorities. All local: nothing leaves the house unless "online" is chosen.
const PRAYER_METHODS = {
  makkah: { name: "Umm al-Qura, Makkah", fajr: 18.5, isha: "90 min" },
  mwl: { name: "Muslim World League", fajr: 18, isha: 17 },
  isna: { name: "North America (ISNA)", fajr: 15, isha: 15 },
  egypt: { name: "Egyptian General Authority", fajr: 19.5, isha: 17.5 },
  karachi: { name: "University of Islamic Sciences, Karachi", fajr: 18, isha: 18 },
  gulf: { name: "Gulf region", fajr: 19.5, isha: "90 min" },
  kuwait: { name: "Kuwait", fajr: 18, isha: 17.5 },
  qatar: { name: "Qatar", fajr: 18, isha: "90 min" },
  dubai: { name: "Dubai", fajr: 18.2, isha: 18.2 },
  jafari: { name: "Shia Ithna-Ashari (Qum)", fajr: 16, isha: 14, maghrib: 4, midnight: "jafari" },
  tehran: { name: "University of Tehran", fajr: 17.7, isha: 14, maghrib: 4.5, midnight: "jafari" },
  singapore: { name: "Singapore", fajr: 20, isha: 18 },
  turkey: { name: "Turkey (Diyanet)", fajr: 18, isha: 17 },
  france: { name: "France (UOIF)", fajr: 12, isha: 12 },
  russia: { name: "Russia", fajr: 16, isha: 15 },
};
// Aladhan's numbers for the same authorities (for the online source)
const ALADHAN_METHOD = { jafari: 0, karachi: 1, isna: 2, mwl: 3, makkah: 4, egypt: 5, tehran: 7, gulf: 8, kuwait: 9, qatar: 10, singapore: 11, france: 12, turkey: 13, russia: 14, dubai: 16 };

const PrayerCalc = {
  rad: (d) => (d * Math.PI) / 180,
  deg: (r) => (r * 180) / Math.PI,
  fix: (a, b) => { a -= b * Math.floor(a / b); return a < 0 ? a + b : a; },
  sun(jd) {
    const D = jd - 2451545.0, r = this.rad, d = this.deg;
    const g = this.fix(357.529 + 0.98560028 * D, 360), q = this.fix(280.459 + 0.98564736 * D, 360);
    const L = this.fix(q + 1.915 * Math.sin(r(g)) + 0.02 * Math.sin(r(2 * g)), 360);
    const e = 23.439 - 0.00000036 * D;
    const RA = this.fix(d(Math.atan2(Math.cos(r(e)) * Math.sin(r(L)), Math.cos(r(L)))) / 15, 24);
    return { decl: d(Math.asin(Math.sin(r(e)) * Math.sin(r(L)))), eqt: q / 15 - RA };
  },
  julian(y, m, d) {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  },
  // hours (local solar) for one day; date: a Date; lat/lng in degrees; tz: hours from UTC
  times(date, lat, lng, tz, method, asrFactor = 1, elev = 0) {
    const M = PRAYER_METHODS[method] || PRAYER_METHODS.mwl, r = this.rad, d = this.deg;
    const jd0 = this.julian(date.getFullYear(), date.getMonth() + 1, date.getDate()) - lng / (15 * 24);
    const midDay = (t) => this.fix(12 - this.sun(jd0 + t).eqt, 24);
    const angleTime = (angle, t, ccw) => {
      const decl = this.sun(jd0 + t).decl, noon = midDay(t);
      const x = (-Math.sin(r(angle)) - Math.sin(r(decl)) * Math.sin(r(lat))) / (Math.cos(r(decl)) * Math.cos(r(lat)));
      const T = d(Math.acos(Math.max(-1, Math.min(1, x)))) / 15;
      return noon + (ccw ? -T : T);
    };
    const asrTime = (f, t) => { const decl = this.sun(jd0 + t).decl; return angleTime(-d(Math.atan(1 / (f + Math.tan(r(Math.abs(lat - decl)))))), t); };
    const riseAngle = 0.833 + 0.0347 * Math.sqrt(Math.max(0, elev));
    let t = { fajr: 5, sunrise: 6, dhuhr: 12, asr: 13, sunset: 18, maghrib: 18, isha: 18 };
    for (let i = 0; i < 2; i++) {
      const p = Object.fromEntries(Object.entries(t).map(([k, v]) => [k, v / 24]));
      t = {
        fajr: angleTime(M.fajr, p.fajr, true), sunrise: angleTime(riseAngle, p.sunrise, true), dhuhr: midDay(p.dhuhr),
        asr: asrTime(asrFactor, p.asr), sunset: angleTime(riseAngle, p.sunset), maghrib: M.maghrib ? angleTime(M.maghrib, p.maghrib) : angleTime(riseAngle, p.maghrib),
        isha: typeof M.isha === "number" ? angleTime(M.isha, p.isha) : 0,
      };
    }
    const shift = tz - lng / 15;
    Object.keys(t).forEach((k) => { t[k] += shift; });
    if (typeof M.isha === "string") t.isha = t.maghrib + parseFloat(M.isha) / 60;
    // high latitudes: keep fajr and isha within the night (angle-based rule)
    const night = 24 - (t.sunset - t.sunrise);
    const cap = (time, base, angle, ccw) => { const portion = (angle / 60) * night; const diff = ccw ? base - time : time - base; return isNaN(time) || diff > portion ? base + (ccw ? -portion : portion) : time; };
    t.fajr = cap(t.fajr, t.sunrise, M.fajr, true);
    if (typeof M.isha === "number") t.isha = cap(t.isha, t.maghrib, M.isha, false);
    t.imsak = t.fajr - 10 / 60;
    const nextFajr = t.fajr + 24;
    t.midnight = M.midnight === "jafari" ? t.sunset + (nextFajr - t.sunset) / 2 : t.sunset + (t.sunrise + 24 - t.sunset) / 2;
    t.last_third = t.sunset + ((nextFajr - t.sunset) * 2) / 3;
    return t;
  },
};

const PRAYER_NAMES = {
  imsak: ["Imsak", "الإمساك", "mdi:weather-night-partly-cloudy"], fajr: ["Fajr", "الفجر", "mdi:moon-waning-crescent"], sunrise: ["Sunrise", "الشروق", "mdi:weather-sunset-up"],
  dhuhr: ["Dhuhr", "الظهر", "mdi:white-balance-sunny"], asr: ["Asr", "العصر", "mdi:weather-partly-cloudy"], maghrib: ["Maghrib", "المغرب", "mdi:weather-sunset-down"],
  isha: ["Isha", "العشاء", "mdi:weather-night"], midnight: ["Midnight", "منتصف الليل", "mdi:moon-full"], last_third: ["Last third", "الثلث الأخير", "mdi:star-crescent"],
};
const easternDigits = (s) => String(s).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);

// ------------------------------------------------------------------ Roost Prayer Times
// Today's prayer times, the next one with a countdown, and the Hijri date. Calculated on the spot
// (any common method, your own adjustments), read from your sensors, or fetched online.
class RoostPrayer extends ticking(RoostBase, 15000) {
  static get defaults() {
    return { source: "calculate", method: "makkah", asr: "standard", prayers: ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"], adjust: {}, names: "english", numerals: "western",
      hour24: false, layout: "list", show_header: true, show_hijri: true, show_timeline: true, hijri_offset: 0, jumuah: true, title: "", color: "active", radius: 22, frame: true, ramadan: "auto", theme: "auto" };
  }

  static getConfigForm() {
    const prayerList = [["imsak", "Imsak"], ["fajr", "Fajr"], ["sunrise", "Sunrise"], ["dhuhr", "Dhuhr"], ["asr", "Asr"], ["maghrib", "Maghrib"], ["isha", "Isha"], ["midnight", "Midnight"], ["last_third", "Last third of the night"]];
    return {
      schema: [
        { name: "title", label: "Title (optional)", selector: { text: {} } },
        { name: "calendar_name", label: "Name of your calendar (shown at the bottom, e.g. Al-Hadi calendar)", selector: { text: {} } },
        { name: "source", label: "Where the times come from", selector: pick([["calculate", "Calculated here (no internet needed)"], ["online", "Online (aladhan.com)"], ["sensors", "My own sensors (Al-Hadi calendar, Islamic Prayer Times)"]]) },
        { type: "expandable", name: "", title: "Calculation", icon: "mdi:calculator-variant-outline", schema: [
          { name: "method", label: "Method", selector: pick(Object.entries(PRAYER_METHODS).map(([k, v]) => [k, v.name])) },
          { name: "asr", label: "Asr", selector: pick([["standard", "Standard (Shafi'i, Maliki, Hanbali)"], ["hanafi", "Hanafi"]]) },
          { type: "grid", name: "", schema: [{ name: "latitude", label: "Latitude (empty = your home)", selector: { number: { mode: "box", step: "any" } } }, { name: "longitude", label: "Longitude", selector: { number: { mode: "box", step: "any" } } }] },
          { name: "adjust", label: "Move a time by minutes", selector: { object: {} } },
        ] },
        { type: "expandable", name: "", title: "My own times (for example the Al-Hadi calendar)", icon: "mdi:clock-check-outline", schema: [
          { type: "grid", name: "", schema: ["imsak", "fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha", "midnight"].map((k) => ({ name: `${k}_entity`, label: PRAYER_NAMES[k][0], selector: { entity: { domain: "sensor" } } })) },
        ] },
        { name: "prayers", label: "Times to show", selector: { select: { multiple: true, mode: "list", options: prayerList.map(([value, label]) => ({ value, label })) } } },
        { type: "expandable", name: "", title: "Adhan", icon: "mdi:bullhorn-outline", schema: [
          { name: "adhan_speaker", label: "Speaker for the adhan", selector: { entity: { domain: "media_player" } } },
          { name: "adhan_media", label: "Adhan sound (a link, or /local/adhan.mp3)", selector: { text: {} } },
          { name: "adhan_switches", label: "A switch for each prayer (input_booleans with fajr, dhuhr and so on in their names): the bell on each row turns it on or off; your automation plays the adhan when it is on", selector: { entity: { multiple: true, domain: ["input_boolean", "switch"] } } },
        ] },
        { type: "expandable", name: "", title: "Ramadan", icon: "mdi:moon-waning-crescent", schema: [
          { name: "ramadan", label: "Suhoor and iftar countdown", selector: pick([["auto", "In Ramadan by itself"], ["on", "Always (for testing or extra fasts)"], ["off", "Off"]]) },
        ] },
        { type: "expandable", name: "", title: "Look", icon: "mdi:palette", schema: [
          { name: "layout", selector: pick([["list", "List"], ["tiles", "Tiles in a row"], ["compact", "One line"]]) },
          { type: "grid", name: "", schema: [{ name: "names", label: "Names", selector: pick([["english", "English"], ["arabic", "Arabic"], ["both", "Both"]]) }, { name: "numerals", selector: pick([["western", "1 2 3"], ["eastern", "١ ٢ ٣"]]) }] },
          { type: "grid", name: "", schema: [{ name: "hour24", label: "24-hour", selector: { boolean: {} } }, { name: "show_header", label: "Next prayer at the top", selector: { boolean: {} } }] },
          { type: "grid", name: "", schema: [{ name: "show_hijri", label: "Hijri date", selector: { boolean: {} } }, { name: "hijri_offset", label: "Hijri day correction", selector: slider(-2, 2, 1, "days") }] },
          { type: "grid", name: "", schema: [{ name: "show_timeline", label: "Day line", selector: { boolean: {} } }, { name: "jumuah", label: "Call Dhuhr \"Jumu'ah\" on Fridays", selector: { boolean: {} } }] },
          ...colourFields("color", "Colour of the next prayer"),
          { type: "grid", name: "", schema: [{ name: "radius", selector: slider(0, 40, 2) }, { name: "frame", label: "Card background", selector: { boolean: {} } }] },
          THEME_FIELD,
        ] },
      ],
      computeLabel,
    };
  }

  static getStubConfig() { return { source: "calculate", method: "makkah" }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  watched() { const c = this._config; return [...Object.keys(PRAYER_NAMES).map((k) => c[`${k}_entity`]), ...(c.adhan_switches || [])].filter(Boolean); }

  extraSignature() { const d = new Date(); return `${d.toDateString()} ${d.getHours()}:${d.getMinutes()}|${this._online ? 1 : 0}`; }

  place() {
    const c = this._config, h = this._hass;
    return { lat: Number(c.latitude ?? h?.config?.latitude ?? 26.2), lng: Number(c.longitude ?? h?.config?.longitude ?? 50.6), elev: Number(h?.config?.elevation ?? 0) };
  }

  // Date objects for one day, by key. Calculated (or online) first; any time that has its own sensor
  // (for example the Al-Hadi calendar's Imsak and Fajr) is then taken from that sensor instead.
  day(date) {
    const c = this._config, out = {};
    if (c.source === "online" && this._online && this._online.day === date.toDateString()) Object.assign(out, this._online.times);
    if (!Object.keys(out).length) {
      const { lat, lng, elev } = this.place();
      const tz = -new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12).getTimezoneOffset() / 60;
      const h = PrayerCalc.times(date, lat, lng, tz, c.method, c.asr === "hanafi" ? 2 : 1, elev);
      if (c.method === "makkah" && this.hijri(date).month === 9) h.isha += 0.5; // Umm al-Qura: 2 hours after Maghrib in Ramadan
      for (const [k, v] of Object.entries(h)) {
        if (!isFinite(v)) continue;
        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0); d.setMinutes(Math.round(v * 60));
        out[k] = d;
      }
    }
    for (const [k, m] of Object.entries(c.adjust || {})) if (out[k] && Number(m)) out[k] = new Date(out[k].getTime() + Number(m) * 60000);
    for (const k of Object.keys(PRAYER_NAMES)) {
      const s = this.sx(c[`${k}_entity`]);
      if (!s || UNAVAILABLE.includes(s.state)) continue;
      let d = new Date(s.state);
      if (isNaN(d)) { const m = String(s.state).match(/^(\d{1,2}):(\d{2})/); if (!m) continue; d = new Date(date); d.setHours(+m[1], +m[2], 0, 0); }
      else { const x = new Date(date); x.setHours(d.getHours(), d.getMinutes(), 0, 0); d = x; }
      out[k] = d;
    }
    return out;
  }

  async loadOnline() {
    const c = this._config, today = new Date();
    if (c.source !== "online" || this._loadingOnline || (this._online && this._online.day === today.toDateString())) return;
    const key = `roost-prayer:${today.toDateString()}:${c.method}:${c.asr}`;
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "null");
      if (saved) { this._online = { day: saved.day, times: Object.fromEntries(Object.entries(saved.times).map(([k, v]) => [k, new Date(v)])) }; return; }
    } catch (e) { /* no storage */ }
    this._loadingOnline = true;
    try {
      const { lat, lng } = this.place();
      const ds = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;
      const r = await fetch(`https://api.aladhan.com/v1/timings/${ds}?latitude=${lat}&longitude=${lng}&method=${ALADHAN_METHOD[c.method] ?? 3}&school=${c.asr === "hanafi" ? 1 : 0}`);
      const j = await r.json(), tm = j?.data?.timings || {}, times = {};
      const map = { Imsak: "imsak", Fajr: "fajr", Sunrise: "sunrise", Dhuhr: "dhuhr", Asr: "asr", Maghrib: "maghrib", Isha: "isha", Midnight: "midnight", Lastthird: "last_third" };
      for (const [a, k] of Object.entries(map)) { const m = String(tm[a] || "").match(/(\d{1,2}):(\d{2})/); if (m) { const d = new Date(today); d.setHours(+m[1], +m[2], 0, 0); if (k === "midnight" || k === "last_third") { if (+m[1] < 12) d.setDate(d.getDate() + 1); } times[k] = d; } }
      if (Object.keys(times).length) {
        this._online = { day: today.toDateString(), times };
        try { localStorage.setItem(key, JSON.stringify({ day: this._online.day, times })); } catch (e) { /* no storage */ }
      }
    } catch (e) { this._onlineFailed = true; }
    this._loadingOnline = false; this._sig = null; if (this._hass) this.hass = this._hass;
  }

  hijri(date) {
    const d = new Date(date.getTime() + Number(this._config.hijri_offset || 0) * 86400e3);
    try {
      const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { day: "numeric", month: "numeric", year: "numeric" }).formatToParts(d);
      const get = (t) => +parts.find((p) => p.type === t)?.value;
      const months = ["Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", "Jumada al-Ula", "Jumada al-Akhirah", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"];
      const monthsAr = ["محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];
      const m = get("month");
      return { day: get("day"), month: m, year: get("year"), name: months[m - 1], nameAr: monthsAr[m - 1] };
    } catch (e) { return { day: 0, month: 0, year: 0, name: "", nameAr: "" }; }
  }

  label(k, date) {
    const c = this._config, fri = c.jumuah && k === "dhuhr" && date.getDay() === 5;
    const en = fri ? "Jumu'ah" : PRAYER_NAMES[k][0], ar = fri ? "الجمعة" : PRAYER_NAMES[k][1];
    return c.names === "arabic" ? ar : c.names === "both" ? `${en} · ${ar}` : en;
  }

  clock(d) {
    const c = this._config;
    let s = d.toLocaleTimeString(c.hour24 ? "en-GB" : "en-US", { hour: "numeric", minute: "2-digit", hour12: !c.hour24 });
    if (c.names === "arabic" && !c.hour24) s = s.replace("AM", "ص").replace("PM", "م");
    return c.numerals === "eastern" ? easternDigits(s) : s;
  }

  left(ms) {
    const m = Math.max(0, Math.round(ms / 60000)), h = Math.floor(m / 60), r = m % 60;
    const ar = this._config.names === "arabic", s = ar ? (h ? `${h} س ${r} د` : `${r} دقيقة`) : h ? `${h}h ${r}m` : `${r} min`;
    return this._config.numerals === "eastern" ? easternDigits(s) : s;
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour(), now = new Date();
    this.loadOnline();
    const today = this.day(now), tomorrow = this.day(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
    const keys = (c.prayers || []).filter((k) => PRAYER_NAMES[k] && today[k]);
    const order = ["imsak", "fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha", "midnight", "last_third"];
    keys.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    const real = keys.filter((k) => !["sunrise", "imsak", "midnight", "last_third"].includes(k));
    let nextKey = real.find((k) => today[k] > now), nextAt = nextKey ? today[nextKey] : null;
    if (!nextKey && real.length) { nextKey = real[0]; nextAt = tomorrow[nextKey]; }
    let prevAt = now;
    if (nextKey) {
      const ri = real.indexOf(nextKey), last = today[real[real.length - 1]];
      prevAt = ri > 0 ? today[real[ri - 1]] : nextAt.toDateString() === now.toDateString() ? new Date(last.getTime() - 86400e3) : last;
    }
    const span = nextAt && prevAt ? Math.max(1, nextAt - prevAt) : 1, done = nextAt ? Math.min(1, Math.max(0, (now - prevAt) / span)) : 0;
    const hj = this.hijri(now), hjNow = hj, ar = c.names === "arabic";
    const greg = now.toLocaleDateString(ar ? `ar-u-nu-${c.numerals === "eastern" ? "arab" : "latn"}` : "en-GB", { weekday: "long", day: "numeric", month: "long" });
    const hijriText = hj.year ? (ar ? `${easternDigits(hj.day)} ${hj.nameAr} ${easternDigits(hj.year)}` : `${hj.day} ${hj.name} ${hj.year}`) : "";
    const soon = nextAt && nextAt - now < 15 * 60000;
    const R = 34, C = 2 * Math.PI * R;
    const sky = (() => { const hr = now.getHours() + now.getMinutes() / 60, f = today.fajr, sr = today.sunrise, mg = today.maghrib, is = today.isha, v = (d) => (d ? d.getHours() + d.getMinutes() / 60 : null);
      if (v(f) != null && hr >= v(f) && hr < (v(sr) ?? v(f) + 1.3)) return "linear-gradient(135deg,#2B2A6B 0%,#B05C8A 100%)";
      if (v(sr) != null && v(mg) != null && hr >= v(sr) && hr < v(mg) - 0.7) return "linear-gradient(135deg,#2563EB 0%,#60A5FA 60%,#93C5FD 100%)";
      if (v(mg) != null && hr >= v(mg) - 0.7 && hr < (v(is) ?? v(mg) + 1.3)) return "linear-gradient(135deg,#3B2A78 0%,#C2547A 60%,#F59E6B 100%)";
      return "linear-gradient(135deg,#1B1E52 0%,#38287E 55%,#5B3290 100%)"; })();
    // adhan: one switch per prayer, found by its name (fajr, dhuhr)
    const sw = (k) => (c.adhan_switches || []).find((id) => id.toLowerCase().includes(k) || String(this.sx(id)?.attributes.friendly_name || "").toLowerCase().includes(k));
    const bell = (k) => { const id = sw(k); if (!id) return ""; const on = this.sx(id)?.state === "on"; return `<button class="bl ${on ? "on" : ""}" data-bell="${esc(id)}" aria-pressed="${on}" aria-label="Adhan for ${esc(PRAYER_NAMES[k][0])}"><ha-icon icon="${on ? "mdi:bell-ring-outline" : "mdi:bell-off-outline"}"></ha-icon></button>`; };
    // Ramadan: suhoor ends at Fajr (or Imsak), iftar at Maghrib
    const ram = c.ramadan === "on" || (c.ramadan !== "off" && hjNow.month === 9);
    let ramHtml = "";
    if (ram && today.fajr && today.maghrib) {
      const sEnd = today.imsak || today.fajr, tSuhoor = tomorrow.imsak || tomorrow.fajr;
      const fasting = now >= sEnd && now < today.maghrib;
      const target = fasting ? today.maghrib : now < sEnd ? sEnd : tSuhoor;
      const f = fasting ? (now - sEnd) / Math.max(1, today.maghrib - sEnd) : 0;
      ramHtml = `<div class="rm"><div class="rmx"><small>${fasting ? (ar ? "الإفطار" : "Iftar") : ar ? "ينتهي السحور" : "Suhoor ends"}${hjNow.month === 9 ? ` · ${ar ? "اليوم" : "day"} ${ar ? easternDigits(hjNow.day) : hjNow.day}` : ""}</small><b class="num">${ar ? "بعد " : "in "}${esc(this.left(target - now))}</b><span class="num">${esc(this.clock(target))}</span></div>
        <div class="rmb"><i style="width:${(f * 100).toFixed(1)}%"></i><ha-icon icon="${fasting ? "mdi:weather-sunset-down" : "mdi:weather-night"}"></ha-icon></div></div>`;
    }
    const rowsHtml = keys.map((k) => {
      const d = today[k], past = d <= now && k !== nextKey, isNext = k === nextKey && nextAt && nextAt.toDateString() === now.toDateString();
      return `<div class="pr ${past ? "past" : ""} ${isNext ? "nx" : ""}" data-k="${k}">
        <span class="pi"><ha-icon icon="${PRAYER_NAMES[k][2]}"></ha-icon></span>
        <span class="pn t"${ar ? ' dir="rtl"' : ""}>${esc(this.label(k, now))}</span>
        ${isNext ? `<span class="in">${ar ? "بعد " : "in "}${esc(this.left(nextAt - now))}</span>` : past ? '<ha-icon class="ok" icon="mdi:check"></ha-icon>' : ""}
        <span class="pt num">${esc(this.clock(d))}</span>${bell(k)}</div>`;
    }).join("");
    const tilesHtml = keys.map((k) => { const d = today[k], isNext = k === nextKey && nextAt && nextAt.toDateString() === now.toDateString(), past = d <= now && !isNext;
      return `<div class="tl ${isNext ? "nx" : ""} ${past ? "past" : ""}"><ha-icon icon="${PRAYER_NAMES[k][2]}"></ha-icon><span class="t">${esc(this.label(k, now))}</span><b class="num">${esc(this.clock(d))}</b></div>`; }).join("");
    const pos = (d) => ((d.getHours() * 60 + d.getMinutes()) / 1440) * 100;
    const line = c.show_timeline ? `<div class="line"><i class="lf" data-bar="now" style="width:${pos(now).toFixed(1)}%"></i>${real.map((k) => `<span class="mk ${k === nextKey ? "on" : ""}" style="left:${pos(today[k]).toFixed(1)}%"></span>`).join("")}<span class="nw" style="left:${pos(now).toFixed(1)}%"></span></div>` : "";
    const head = c.show_header && nextKey ? `<div class="hd" style="background:${sky}">
        <div class="hx"${ar ? ' dir="rtl"' : ""}><small>${ar ? "الصلاة القادمة" : "Next prayer"}</small><b class="t"${ar ? ' dir="rtl"' : ""}>${esc(this.label(nextKey, nextAt))}</b><span class="num">${esc(this.clock(nextAt))}</span>
          <em class="t">${esc(greg)}${c.show_hijri && hijriText ? ` · ${esc(hijriText)}` : ""}</em></div>
        <div class="ring ${soon ? "soon" : ""}"><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="${R}" class="bg"/><circle cx="40" cy="40" r="${R}" class="fg" data-pop="${nextKey}" data-popkey="ring" style="stroke-dasharray:${C.toFixed(1)};stroke-dashoffset:${(C * (1 - done)).toFixed(1)}"/></svg><span class="num">${esc(this.left(nextAt - now))}</span></div>
        ${line}</div>` : line ? `<div style="padding:4px 2px 2px">${line}</div>` : "";
    const empty = !keys.length ? `<div class="empty t">${c.source === "sensors" ? "Choose your prayer time sensors in the card settings" : "No times for this place"}</div>` : "";
    const src = c.source === "sensors" ? (c.calendar_name ? `<div class="src t">${esc(c.calendar_name)}</div>` : "") : `<div class="src t">${esc((PRAYER_METHODS[c.method] || {}).name || "")}${c.asr === "hanafi" ? " · Hanafi Asr" : ""}${c.source === "online" ? (this._online ? " · online" : this._onlineFailed ? " · offline, calculated here" : " · loading online") : ""}</div>`;
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${c.frame ? `${panelCss(p, c.radius)};padding:12px` : "padding:0"};display:flex;flex-direction:column;gap:10px;color:${p.text}}
      .ti{font-size:17px;font-weight:700;padding:4px 6px 0}
      .hd{position:relative;border-radius:${Math.max(12, Number(c.radius) - 6)}px;padding:16px 16px 14px;color:#fff;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px 12px;align-items:center;overflow:hidden}
      .hd::after{content:"";position:absolute;inset:0;background:radial-gradient(120px 80px at 85% 20%,rgba(255,255,255,.18),transparent 70%);pointer-events:none}
      .hx{display:flex;flex-direction:column;gap:2px;min-width:0;position:relative;z-index:1}
      .hx small{font-size:12px;opacity:.85}
      .hx b{font-family:${FONT_NUM};font-size:clamp(22px,8cqw,30px);font-weight:700;line-height:1.1}
      .hx .num{font-size:15px;font-weight:600;opacity:.95}
      .hx em{font-style:normal;font-size:12px;opacity:.8;margin-top:4px}
      .ring{position:relative;width:84px;height:84px;z-index:1}
      .ring svg{width:100%;height:100%;transform:rotate(-90deg)}
      .ring .bg{fill:none;stroke:rgba(255,255,255,.18);stroke-width:6}
      .ring .fg{fill:none;stroke:#fff;stroke-width:6;stroke-linecap:round;transition:stroke-dashoffset .12s;filter:drop-shadow(0 0 6px rgba(255,255,255,.6))}
      .ring.soon .fg{animation:roost-breathe 1.4s ease-in-out infinite}
      .ring span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;text-align:center;padding:0 10px}
      .line{grid-column:1/3;position:relative;height:6px;border-radius:999px;background:rgba(255,255,255,.2);margin:10px 4px 2px;z-index:1}
      .card > div > .line, .card > .line{background:${p.track}}
      .lf{position:absolute;left:0;top:0;bottom:0;border-radius:999px;background:rgba(255,255,255,.75)}
      .mk{position:absolute;top:50%;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:rgba(255,255,255,.55)}
      .mk.on{width:12px;height:12px;margin:-6px 0 0 -6px;background:#fff;box-shadow:0 0 0 4px rgba(255,255,255,.25)}
      .nw{position:absolute;top:-5px;width:2px;height:16px;margin-left:-1px;border-radius:2px;background:#fff}
      .list{display:flex;flex-direction:column;gap:4px}
      .pr{display:grid;grid-template-columns:36px minmax(0,1fr) auto auto;align-items:center;gap:10px;padding:8px 10px;border-radius:14px}
      .pi{width:36px;height:36px;border-radius:12px;background:${p.inset};display:flex;align-items:center;justify-content:center;color:${p.muted};--mdc-icon-size:20px}
      .pn{font-size:15px;font-weight:600}
      .pt{font-size:14px;font-weight:700;font-family:${FONT_NUM}}
      .in{font-size:12px;font-weight:700;padding:4px 8px;border-radius:999px;background:rgba(255,255,255,.22)}
      .ok{--mdc-icon-size:16px;color:#34D399}
      .pr.past{opacity:.5}
      .pr.nx{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};box-shadow:0 10px 22px -12px ${g[2]}}
      .pr.nx .pi{background:rgba(255,255,255,.22);color:inherit;animation:roost-pulse 2.4s ease-in-out infinite}
      .tiles{display:grid;grid-template-columns:repeat(${Math.max(1, keys.length)},minmax(0,1fr));gap:6px}
      .tl{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 4px;border-radius:14px;background:${p.inset};text-align:center;--mdc-icon-size:20px}
      .tl span{font-size:12px;font-weight:600;color:${p.muted}}
      .tl b{font-size:13px;font-family:${FONT_NUM}}
      .tl.nx{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]}}
      .tl.nx span{color:inherit;opacity:.85}
      .tl.past{opacity:.5}
      @container (max-width: 330px){:host .tiles{grid-template-columns:repeat(3,minmax(0,1fr))}:host .ring{width:70px;height:70px}}
      .cp{display:flex;align-items:center;gap:10px;padding:6px 6px}
      .cp ha-icon{color:${g[this.dark ? 1 : 0]}}
      .cp b{font-size:15px}.cp span{margin-left:auto;font-size:13px;color:${p.muted};font-weight:600}
      .src{font-size:12px;color:${p.muted};padding:0 6px 2px}
      .empty{font-size:14px;color:${p.muted};text-align:center;padding:14px}
      .bl{width:32px;height:32px;border-radius:10px;border:0;background:transparent;color:inherit;opacity:.6;display:flex;align-items:center;justify-content:center;cursor:pointer;--mdc-icon-size:18px}
      .bl.on{opacity:1}
      .pr{grid-template-columns:36px minmax(0,1fr) auto auto auto}
      .rm{display:flex;flex-direction:column;gap:10px;padding:14px;border-radius:${Math.max(12, Number(c.radius) - 6)}px;background:linear-gradient(135deg,#1B1E52,#5B3290);color:#fff}
      .rmx{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
      .rmx small{flex-basis:100%;font-size:12px;opacity:.85}
      .rmx b{font-size:24px;font-family:${FONT_NUM}}
      .rmx span{margin-left:auto;font-size:14px;opacity:.9}
      .rmb{position:relative;height:8px;border-radius:999px;background:rgba(255,255,255,.2)}
      .rmb i{position:absolute;left:0;top:0;bottom:0;border-radius:999px;background:linear-gradient(90deg,#F5B94A,#FF8F6B)}
      .rmb ha-icon{position:absolute;right:-4px;top:-8px;--mdc-icon-size:22px;color:#F5B94A}
    </style>
    <div class="card">
      ${c.title ? `<div class="ti t">${esc(c.title)}</div>` : ""}
      ${c.layout === "compact" ? (nextKey ? `<div class="cp"><ha-icon icon="${PRAYER_NAMES[nextKey][2]}"></ha-icon><b class="t">${esc(this.label(nextKey, nextAt))} · <span class="num" style="margin:0;color:inherit">${esc(this.clock(nextAt))}</span></b><span>${ar ? "بعد " : "in "}${esc(this.left(nextAt - now))}</span></div>` : empty)
        : `${ramHtml}${head}${empty}${c.layout === "tiles" ? `<div class="tiles">${tilesHtml}</div>` : `<div class="list">${rowsHtml}</div>`}${src}`}
    </div>`;
    this.shadowRoot.querySelectorAll(".pr").forEach((el) => el.addEventListener("click", () => { const id = c[`${el.dataset.k}_entity`]; if (id) this.moreInfo(id); }));
    this.shadowRoot.querySelectorAll("[data-bell]").forEach((b) => b.addEventListener("click", (ev) => { ev.stopPropagation(); this.vibrate(); const id = b.dataset.bell; this.call(id.split(".")[0], "toggle", { entity_id: id }); }));
  }

  getCardSize() { return 5; }
}

// ------------------------------------------------------------------ Roost Clock
// A clock and nothing else, with many faces: digital, analog, minimal, flip, words, ring, neon and LCD.
// Any time zone, world clocks underneath, 12 or 24 hours, and Western, Eastern-Arabic or Roman numbers.
const CLOCK_WORDS = ["twelve", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven"];
function clockParts(tz) {
  const d = new Date();
  try {
    const f = new Intl.DateTimeFormat("en-GB", { timeZone: tz || undefined, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const o = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
    return { h: +o.hour % 24, m: +o.minute, s: +o.second, weekday: o.weekday, day: o.day, month: o.month, year: o.year, date: d };
  } catch (e) { return { h: d.getHours(), m: d.getMinutes(), s: d.getSeconds(), weekday: d.toLocaleDateString("en-GB", { weekday: "long" }), day: d.getDate(), month: d.toLocaleDateString("en-GB", { month: "long" }), year: d.getFullYear(), date: d }; }
}

class RoostClockFace extends RoostClockClassic {
  static get defaults() {
    return { ...super.defaults, face: "digital", hour24: false, seconds: false, date_format: "long", show_hijri: false, timezone: "", label: "", numerals: "western", ticks: "hours",
      hands: "classic", smooth: true, size: "large", align: "center", world: [], color: "active", frame: true, radius: 22, theme: "auto" };
  }

  static getConfigForm() {
    return {
      schema: [
        { name: "face", label: "Clock face", selector: pick([["times", "Big time with a line of the day's times (prayer times; good on wall panels)"], ["digital", "Digital"], ["analog", "Analog"], ["minimal", "Minimal analog"], ["flip", "Flip"], ["ring", "Ring"], ["word", "Words"], ["neon", "Neon"], ["lcd", "LCD"]]) },
        { type: "grid", name: "", schema: [{ name: "hour24", label: "24-hour", selector: { boolean: {} } }, { name: "seconds", label: "Seconds", selector: { boolean: {} } }] },
        { type: "grid", name: "", schema: [{ name: "date_format", label: "Date", selector: pick([["long", "Tuesday 17 November"], ["short", "Tue 17 Nov"], ["numeric", "17/11/2026"], ["none", "No date"]]) }, { name: "show_hijri", label: "Hijri date too", selector: { boolean: {} } }] },
        { type: "grid", name: "", schema: [{ name: "timezone", label: "Time zone (empty = here, or e.g. Asia/Riyadh)", selector: { text: {} } }, { name: "label", label: "Label (e.g. Makkah)", selector: { text: {} } }] },
        { type: "expandable", name: "", title: "Analog faces", icon: "mdi:clock-time-four-outline", schema: [
          { type: "grid", name: "", schema: [{ name: "numerals", label: "Numbers", selector: pick([["western", "1 2 3"], ["eastern", "١ ٢ ٣"], ["roman", "I II III"], ["none", "None"]]) }, { name: "ticks", label: "Marks", selector: pick([["hours", "Hours"], ["all", "Every minute"], ["none", "None"]]) }] },
          { type: "grid", name: "", schema: [{ name: "hands", selector: pick([["classic", "Classic"], ["slim", "Slim"], ["bold", "Bold"]]) }, { name: "smooth", label: "Sweeping seconds", selector: { boolean: {} } }] },
        ] },
        { type: "expandable", name: "", title: "Line of times (with the first face)", icon: "mdi:timeline-clock-outline", schema: [
          { name: "prayer_method", label: "Prayer times worked out here", selector: { select: { mode: "dropdown", options: [{ value: "", label: "Off (use the times below)" }, ...Object.entries(PRAYER_METHODS).map(([k, v]) => ({ value: k, label: v.name }))] } } },
          { name: "times", label: "Or my own times (sensors)", selector: { object: { multiple: true, label_field: "name", fields: {
            name: { label: "Name", required: true, selector: { text: {} } },
            short: { label: "Short name on the line (1–2 letters)", selector: { text: {} } },
            entity: { label: "Time (a sensor with a time)", required: true, selector: { entity: {} } },
            countdown: { label: "Count down to it", selector: { boolean: {} } },
          } } } },
          { name: "countdown_title", label: "Word before the next time", selector: { text: {} } },
          { name: "line", label: "The line", selector: pick([["sky", "Colours of the day's sky"], ["plain", "Plain, filled up to now"]]) },
        ] },
        { name: "world", label: "World clocks underneath", selector: { object: { multiple: true, label_field: "label", fields: {
          label: { label: "Name", required: true, selector: { text: {} } }, timezone: { label: "Time zone (e.g. Europe/London)", required: true, selector: { text: {} } } } } } },
        { type: "expandable", name: "", title: "Look", icon: "mdi:palette", schema: [
          { type: "grid", name: "", schema: [{ name: "size", selector: pick([["small", "Small"], ["medium", "Medium"], ["large", "Large"], ["huge", "Huge"]]) }, { name: "align", selector: pick([["center", "Centre"], ["left", "Left"]]) }] },
          ...colourFields("color", "Accent colour"),
          { type: "grid", name: "", schema: [{ name: "radius", selector: slider(0, 40, 2) }, { name: "frame", label: "Card background", selector: { boolean: {} } }] },
          THEME_FIELD,
        ] },
      ],
      computeLabel,
    };
  }

  static getStubConfig() { return { face: "analog", seconds: true }; }

  connectedCallback() {
    super.connectedCallback();
    const c = this._config || {};
    const every = c.seconds && !["analog", "minimal"].includes(c.face) ? 1000 : 15000;
    clearInterval(this._tick); this._tick = setInterval(() => { this._sig = null; if (this._hass) this.hass = this._hass; }, every);
  }

  setConfig(config) { this._raw = config || {}; super.setConfig(config); if (this.isConnected) this.connectedCallback(); }

  extraSignature() { const t = clockParts(this._config.timezone); return `${t.h}:${t.m}${this._config.seconds && !["analog", "minimal"].includes(this._config.face) ? `:${t.s}` : ""}`; }

  render() {
    const c = this._config;
    if (c && (c.face === "times" || (((Array.isArray(c.times) && c.times.length) || c.prayer_method) && !(this._raw && "face" in this._raw)))) { super.render(); return; } // older prayer-time setups keep working
    if (!this._hass || !c) return;
    const p = this.p, g = this.colour(), t = clockParts(c.timezone), num = (v) => (c.numerals === "eastern" ? easternDigits(v) : String(v));
    const h12 = t.h % 12 || 12, hh = c.hour24 ? String(t.h).padStart(2, "0") : String(h12), mm = String(t.m).padStart(2, "0"), ss = String(t.s).padStart(2, "0"), ap = t.h < 12 ? "AM" : "PM";
    const S = { small: 0.6, medium: 0.8, large: 1, huge: 1.3 }[c.size] || 1;
    const dateText = c.date_format === "none" ? "" : c.date_format === "short" ? t.date.toLocaleDateString("en-GB", { timeZone: c.timezone || undefined, weekday: "short", day: "numeric", month: "short" })
      : c.date_format === "numeric" ? t.date.toLocaleDateString("en-GB", { timeZone: c.timezone || undefined }) : `${t.weekday} ${t.day} ${t.month}`;
    let hij = "";
    if (c.show_hijri) { const x = RoostPrayer.prototype.hijri.call({ _config: { hijri_offset: 0 } }, t.date); if (x.year) hij = `${num(x.day)} ${x.name} ${num(x.year)}`; }
    const sub = [c.label, dateText, hij].filter(Boolean).join(" · ");
    const accent = g[this.dark ? 1 : 0];
    let face = "";
    const digits = `${num(hh)}:${num(mm)}`;
    if (c.face === "analog" || c.face === "minimal") {
      const min = c.face === "minimal", R = 100;
      const ROMAN = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
      let marks = "";
      const tk = min ? "hours" : c.ticks;
      for (let i = 0; i < 60; i++) {
        const hr = i % 5 === 0;
        if (tk === "none" || (tk === "hours" && !hr)) continue;
        const a = (i * 6 * Math.PI) / 180, r1 = hr ? (min ? 84 : 82) : 88, r2 = 92;
        marks += min ? (hr ? `<circle cx="${(R + Math.sin(a) * 86).toFixed(1)}" cy="${(R - Math.cos(a) * 86).toFixed(1)}" r="${i % 15 === 0 ? 4 : 2.2}" class="dt"/>` : "")
          : `<line x1="${(R + Math.sin(a) * r1).toFixed(1)}" y1="${(R - Math.cos(a) * r1).toFixed(1)}" x2="${(R + Math.sin(a) * r2).toFixed(1)}" y2="${(R - Math.cos(a) * r2).toFixed(1)}" class="${hr ? "tkh" : "tkm"}"/>`;
      }
      let nums = "";
      if (!min && c.numerals !== "none") for (let i = 0; i < 12; i++) { const a = (i * 30 * Math.PI) / 180, txt = c.numerals === "roman" ? ROMAN[i] : num(i === 0 ? 12 : i); nums += `<text x="${(R + Math.sin(a) * 68).toFixed(1)}" y="${(R - Math.cos(a) * 68 + 5).toFixed(1)}" class="nm">${txt}</text>`; }
      const sec = t.s, mAng = (t.m + sec / 60) * 6, hAng = ((t.h % 12) + t.m / 60 + sec / 3600) * 30, sAng = sec * 6;
      const w = { classic: [7, 4.5, 1.6], slim: [4, 2.5, 1], bold: [11, 7, 2.4] }[c.hands] || [7, 4.5, 1.6];
      const hand = (ang, len, wd, cls, period) => `<g transform="rotate(${ang.toFixed(2)} ${R} ${R})"><g class="sp" style="animation-duration:${period}s"><line x1="${R}" y1="${R + 12}" x2="${R}" y2="${R - len}" stroke-width="${wd}" class="${cls}"/></g></g>`;
      face = `<div class="an" style="width:${Math.round(220 * S)}px"><svg viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="97" class="dial"/>${marks}${nums}
        ${hand(hAng, 50, w[0], "hh", 43200)}${hand(mAng, 74, w[1], "mh", 3600)}
        ${c.seconds ? (c.smooth ? hand(sAng, 82, w[2], "sh", 60) : `<g transform="rotate(${sAng} ${R} ${R})"><line x1="${R}" y1="${R + 16}" x2="${R}" y2="${R - 82}" stroke-width="${w[2]}" class="sh"/></g>`) : ""}
        <circle cx="100" cy="100" r="${min ? 4 : 5.5}" class="pin"/></svg></div>`;
      if (c.seconds && !c.smooth) { clearInterval(this._tick); this._tick = setInterval(() => { this._sig = null; if (this._hass) this.hass = this._hass; }, 1000); }
    } else if (c.face === "flip") {
      const ds = (hh.length < 2 && !c.hour24 ? ` ${hh}` : hh) + mm + (c.seconds ? ss : "");
      // a real split-flap: the old top half falls, then the new bottom half drops into place
      const prev = this._flipPrev || {}, nowFlip = {};
      let still = false; try { still = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { /* old browser */ }
      const cells = [...ds].map((ch, i) => {
        const nw = num(ch.trim()), old = prev[i] ?? nw; nowFlip[i] = nw;
        const turn = old !== nw && !still;
        return `<span class="fc ${ch === " " ? "blank" : ""}"><span class="hf up"><b>${nw}</b></span><span class="hf dn"><b>${turn ? old : nw}</b></span>
          ${turn ? `<span class="hf up flap f1"><b>${old}</b></span><span class="hf dn flap f2"><b>${nw}</b></span>` : ""}</span>${i === 1 || (i === 3 && c.seconds) ? '<span class="fs">:</span>' : ""}`;
      }).join("");
      this._flipPrev = nowFlip;
      face = `<div class="fl">${cells}${c.hour24 ? "" : `<span class="fap">${ap}</span>`}</div>`;
    } else if (c.face === "ring") {
      const R = 88, C = 2 * Math.PI * R, k = c.seconds ? t.s / 60 : t.m / 60;
      face = `<div class="rg" style="width:${Math.round(220 * S)}px"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="${R}" class="rb"/><circle cx="100" cy="100" r="${R}" class="rf" style="stroke-dasharray:${C.toFixed(1)};stroke-dashoffset:${(C * (1 - k)).toFixed(1)}"/></svg>
        <div class="rt"><b class="num">${digits}${c.hour24 ? "" : `<span class="ap2">${ap}</span>`}</b>${c.seconds ? `<small class="num">${num(ss)}</small>` : ""}</div></div>`;
    } else if (c.face === "word") {
      const m5 = Math.round(t.m / 5) * 5, base = m5 > 30 ? (t.h + 1) % 12 : t.h % 12, hw = CLOCK_WORDS[base];
      const phrase = m5 === 0 || m5 === 60 ? ["It's", `<em>${hw}</em>`, "o'clock"] : m5 === 15 ? ["It's", "<em>quarter</em>", "past", `<em>${hw}</em>`] : m5 === 30 ? ["It's", "<em>half</em>", "past", `<em>${hw}</em>`]
        : m5 === 45 ? ["It's", "<em>quarter</em>", "to", `<em>${hw}</em>`] : m5 < 30 ? ["It's", `<em>${["", "five", "ten", "", "twenty", "twenty-five"][m5 / 5]}</em>`, "past", `<em>${hw}</em>`] : ["It's", `<em>${["", "five", "ten", "", "twenty", "twenty-five"][(60 - m5) / 5]}</em>`, "to", `<em>${hw}</em>`];
      face = `<div class="wd" data-pop="${m5}" data-popkey="wd">${phrase.join(" ")}</div><div class="wds num">${digits}${c.hour24 ? "" : ` ${ap}`}</div>`;
    } else {
      const cls = c.face === "neon" ? "neon" : c.face === "lcd" ? "lcd" : "dg";
      face = `<div class="${cls}">${c.face === "lcd" ? `<span class="ghost" aria-hidden="true"><span class="big">${hh.length < 2 ? "8" : "88"}:88${c.seconds ? '<span class="sec">:88</span>' : ""}</span></span>` : ""}<span class="num big">${digits}${c.seconds ? `<span class="sec">:${num(ss)}</span>` : ""}</span>${c.hour24 ? "" : `<span class="ap">${ap}</span>`}</div>`;
    }
    const world = (c.world || []).filter((w) => w && w.timezone).map((w) => {
      const x = clockParts(w.timezone), diffH = Math.round(((x.h * 60 + x.m) - (t.h * 60 + t.m)) / 60), dd = x.day !== t.day ? (diffH > 0 ? " · tomorrow" : " · yesterday") : "";
      const shown = c.hour24 ? `${String(x.h).padStart(2, "0")}:${String(x.m).padStart(2, "0")}` : `${x.h % 12 || 12}:${String(x.m).padStart(2, "0")} ${x.h < 12 ? "AM" : "PM"}`;
      return `<div class="wc"><span class="t">${esc(w.label)}</span><small>${diffH === 0 ? "same time" : `${diffH > 0 ? "+" : ""}${diffH < -12 ? diffH + 24 : diffH > 12 ? diffH - 24 : diffH}h`}${dd}</small><b class="num">${esc(num(shown))}</b></div>`;
    }).join("");
    const left = c.align === "left";
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${c.frame ? `${panelCss(p, c.radius)};padding:18px` : "padding:4px"};display:flex;flex-direction:column;align-items:${left ? "flex-start" : "center"};gap:10px;color:${p.text};text-align:${left ? "left" : "center"}}
      .sub{font-size:${(14 * S).toFixed(1)}px;color:${p.muted};font-weight:500}
      .dg,.neon,.lcd{position:relative;display:flex;align-items:baseline;gap:6px;line-height:1}
      .big{font-family:${FONT_NUM};font-weight:700;font-size:min(${Math.round(72 * S)}px,${Math.round(22 * S)}cqw);letter-spacing:-2px}
      .sec{font-size:.42em;letter-spacing:0;color:${p.muted};margin-left:2px}
      .ap{font-size:${Math.round(18 * S)}px;font-weight:700;color:${accent}}
      .neon .big{color:#fff;text-shadow:0 0 6px ${g[1]},0 0 18px ${g[0]},0 0 36px ${g[0]};animation:roost-breathe 3.2s ease-in-out infinite}
      .neon .sec{color:#fff}
      .lcd{padding:10px 16px;border-radius:12px;background:${this.dark ? "#0D1A10" : "#C9D8B6"};border:1px solid ${this.dark ? "#1F3A24" : "#9DB089"}}
      .lcd .big{font-family:ui-monospace,"Courier New",monospace;font-weight:700;letter-spacing:2px;color:${this.dark ? "#7CFF8A" : "#1C3018"};text-shadow:${this.dark ? "0 0 8px rgba(124,255,138,.55)" : "none"}}
      .lcd .ghost{position:absolute;left:16px;top:10px;opacity:${this.dark ? 0.1 : 0.14};text-shadow:none}
      .lcd .ghost .big{text-shadow:none}
      .lcd .ap,.lcd .sec{color:${this.dark ? "#7CFF8A" : "#1C3018"}}
      .an,.rg{position:relative;max-width:100%;aspect-ratio:1}
      .an svg,.rg svg{width:100%;height:100%;display:block}
      .dial{fill:${p.inset};stroke:${p.border};stroke-width:2}
      .tkh{stroke:${p.text};stroke-width:3;stroke-linecap:round}.tkm{stroke:${p.muted};stroke-width:1.2;opacity:.6}
      .dt{fill:${p.muted}}
      .nm{font-family:${FONT_NUM};font-size:15px;font-weight:600;fill:${p.text};text-anchor:middle}
      .hh,.mh{stroke:${p.text};stroke-linecap:round}.sh{stroke:${accent};stroke-linecap:round}
      .pin{fill:${accent};stroke:${p.inset};stroke-width:2}
      .sp{transform-origin:100px 100px;animation:roost-spin 60s linear infinite}
      .rb{fill:none;stroke:${p.track};stroke-width:8}
      .rf{fill:none;stroke:url(#none);stroke:${accent};stroke-width:8;stroke-linecap:round;transform:rotate(-90deg);transform-origin:100px 100px;filter:drop-shadow(0 0 6px ${g[2]})}
      .rt{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
      .rt b{font-family:${FONT_NUM};font-size:min(${Math.round(46 * S)}px,${Math.round(14 * S)}cqw);font-weight:700;letter-spacing:-1px}
      .rt small{font-size:13px;color:${p.muted};font-weight:600}
      .rt .ap2{font-size:12px;color:${accent};font-weight:700;margin-left:3px}
      .fl{display:flex;align-items:center;gap:${Math.round(6 * S)}px}
      .fc{position:relative;display:flex;align-items:center;justify-content:center;width:min(${Math.round(58 * S)}px,${c.seconds ? 12 : 15}cqw);height:min(${Math.round(80 * S)}px,${c.seconds ? 17 : 21}cqw);border-radius:12px;
        background:linear-gradient(180deg,${this.dark ? "#262C52" : "#FFFFFF"} 0 50%,${this.dark ? "#1D2244" : "#F1F3FB"} 50% 100%);box-shadow:0 8px 18px -10px rgba(0,0,0,.6),inset 0 0 0 1px ${p.border}}
      .fc::after{content:"";position:absolute;left:0;right:0;top:50%;height:1px;background:rgba(0,0,0,.35);z-index:3}
      .fc{perspective:300px}
      .hf{position:absolute;left:0;right:0;height:50%;overflow:hidden;display:flex;justify-content:center;backface-visibility:hidden}
      .hf.up{top:0;border-radius:12px 12px 0 0;background:${this.dark ? "#262C52" : "#FFFFFF"};align-items:flex-start}
      .hf.dn{bottom:0;border-radius:0 0 12px 12px;background:${this.dark ? "#1D2244" : "#F1F3FB"};align-items:flex-end}
      .hf b{display:flex;align-items:center;justify-content:center;height:200%;line-height:1}
      .hf.up b{margin-top:0}
      .hf.dn b{margin-bottom:0}
      .flap{z-index:2}
      .f1{transform-origin:bottom center;animation:roost-flip1 .3s ease-in forwards}
      .f2{transform-origin:top center;transform:rotateX(90deg);animation:roost-flip2 .3s ease-out .3s forwards}
      @keyframes roost-flip1{from{transform:rotateX(0)}to{transform:rotateX(-90deg);filter:brightness(.6)}}
      @keyframes roost-flip2{from{transform:rotateX(90deg);filter:brightness(1.3)}to{transform:rotateX(0)}}
      .fc b{font-family:${FONT_NUM};font-weight:700;font-size:min(${Math.round(54 * S)}px,${c.seconds ? 11 : 14}cqw)}
      .fc.blank{visibility:hidden;width:0;margin-left:-${Math.round(6 * S)}px}
      .fs{font-family:${FONT_NUM};font-weight:700;font-size:min(${Math.round(40 * S)}px,10cqw);color:${p.muted};animation:roost-breathe 2s ease-in-out infinite}
      .fap{font-size:14px;font-weight:700;color:${accent};align-self:flex-end}
      .wd{font-family:${FONT_NUM};font-size:min(${Math.round(34 * S)}px,${Math.round(10 * S)}cqw);font-weight:600;line-height:1.2;color:${p.muted}}
      .wd em{font-style:normal;color:${p.text};background:linear-gradient(135deg,${g[0]},${g[1]});-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
      .wds{font-size:13px;color:${p.muted};font-weight:600}
      .world{width:100%;display:flex;flex-direction:column;gap:6px;margin-top:4px}
      .wc{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:10px;padding:8px 12px;border-radius:12px;background:${p.inset};text-align:left}
      .wc span{font-size:13px;font-weight:600}.wc small{font-size:12px;color:${p.muted}}.wc b{font-size:14px;font-family:${FONT_NUM}}
    </style>
    <div class="card">${face}${sub ? `<div class="sub t">${esc(sub)}</div>` : ""}${world ? `<div class="world">${world}</div>` : ""}</div>`;
  }

  getCardSize() { return 4; }
}

// ------------------------------------------------------------------ Roost Title
// A section heading, with an optional small line under it and a "See all" link.
class RoostTitle extends RoostBase {
  static get defaults() { return { title: "Devices", size: 17, color: "active", link_text: "", tap_action: { action: "none" }, theme: "auto" }; }

  watched() { return [this._config.count_entity, this._config.temperature, this._config.humidity].filter(Boolean); }

  // "22.8°C · 52% humidity" from the room's sensors, or "Room sensor offline"
  reading() {
    const c = this._config;
    if (!c.temperature && !c.humidity) return "";
    const t = c.temperature ? num(this.sx(c.temperature)?.state) : null, h = c.humidity ? num(this.sx(c.humidity)?.state) : null;
    if (t == null && h == null) return "Room sensor offline";
    return [t != null ? `${fmt(t, 1)}°C` : "", h != null ? `${Math.round(h)}% humidity` : ""].filter(Boolean).join(" · ");
  }

  static getConfigForm() {
    return {
      schema: [
        { name: "title", required: true, selector: { text: {} } },
        { name: "subtitle", label: "Small line under it (optional)", selector: { text: {} } },
        { type: "grid", name: "", schema: [{ name: "temperature", label: "Or show this room's temperature", selector: { entity: { domain: "sensor" } } }, { name: "humidity", label: "and humidity", selector: { entity: { domain: "sensor" } } }] },
        { type: "grid", name: "", schema: [{ name: "icon", selector: { icon: {} } }, { name: "size", label: "Title size", selector: slider(13, 30) }] },
        { name: "badge", label: "Small badge next to it (for example “3 on”)", selector: { text: {} } },
        { name: "back", label: "Back button: where it goes (for example #rooms, or “back”)", selector: { text: {} } },
        { name: "anchor", label: "Jump name: a Roost Nav button set to #this-name scrolls here (empty = the title)", selector: { text: {} } },
        { type: "expandable", name: "", title: "Link on the right", icon: "mdi:link", schema: [
          { name: "link_text", label: "Link words (for example “See all”)", selector: { text: {} } },
          ACTION_FIELD("tap_action", "What the link does"),
          ...colourFields("color", "Link colour"),
          THEME_FIELD,
        ] },
      ],
      computeLabel,
    };
  }

  static getStubConfig() { return { title: "Devices", link_text: "See all" }; }

  getGridOptions() { return { columns: 12, rows: "auto" }; }

  render() {
    if (!this._config) return;
    const c = this._config, p = this.p, g = this.colour();
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .h{display:flex;align-items:center;gap:10px;padding:6px 4px 0;color:${p.text}}
      .h ha-icon{--mdc-icon-size:${Math.round(c.size * 1.2)}px;color:${g[this.dark ? 1 : 0]}}
      .tx{flex:1;min-width:0}
      .t1{font-size:${c.size}px;font-weight:700;letter-spacing:-.2px;line-height:1.2}
      .t2{font-size:13px;color:${p.muted};margin-top:2px}
      .bd{display:inline-block;margin-left:8px;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:600;vertical-align:middle;background:${g[0]}2E;color:${g[this.dark ? 1 : 0]}}
      .ln{flex:none;font-size:13px;font-weight:600;color:${g[this.dark ? 1 : 0]};background:none;border:0;cursor:pointer;padding:6px 4px;font-family:inherit;display:flex;align-items:center;gap:2px}
      .ln ha-icon{--mdc-icon-size:18px;color:inherit}
      .bk{flex:none;width:44px;height:44px;border-radius:15px;border:0;background:${p.inset};color:${p.text};display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .12s}
      .bk:active{transform:scale(.94)}
      .bk ha-icon{--mdc-icon-size:22px;color:inherit}
      .h.withback{gap:14px;padding-top:2px}
    </style>
    <div class="h${c.back ? " withback" : ""}">${c.back ? '<button class="bk" aria-label="Back"><ha-icon icon="mdi:chevron-left"></ha-icon></button>' : ""}${c.icon ? `<ha-icon icon="${esc(c.icon)}"></ha-icon>` : ""}
      <div class="tx"><div class="t1 t">${esc(c.title)}${c.badge ? `<span class="bd" data-pop="${esc(c.badge)}" data-popkey="bd">${esc(c.badge)}</span>` : ""}</div>${c.subtitle || this.reading() ? `<div class="t2 t">${esc(c.subtitle || this.reading())}</div>` : ""}</div>
      ${c.link_text ? `<button class="ln">${esc(c.link_text)}<ha-icon icon="mdi:chevron-right"></ha-icon></button>` : ""}</div>`;
    const ln = this.shadowRoot.querySelector(".ln");
    if (ln) ln.addEventListener("click", () => this.run(c.tap_action));
    const bk = this.shadowRoot.querySelector(".bk");
    if (bk) bk.addEventListener("click", () => {
      this.vibrate();
      if (c.back === "back" || c.back === true) { history.back(); return; }
      if (String(c.back).startsWith("#")) location.hash = c.back;
      else { history.pushState(null, "", c.back); this.fire("location-changed", { replace: false }); }
    });
  }

  set hass(h) { this._hass = h; const r = this.reading(); if (!this._drawn || this._lastDark !== this.dark || r !== this._lastR) { this._drawn = true; this._lastDark = this.dark; this._lastR = r; this.render(); } }

  get hass() { return this._hass; }
}

// ------------------------------------------------------------------ Roost Theme switch
// The sun / moon button: switches this phone or tablet between light and dark.
class RoostTheme extends RoostBase {
  static get defaults() { return { include_auto: false, show_label: false, shape: "rounded", size: 44, theme: "auto" }; }

  static getConfigForm() {
    return {
      schema: [
        { name: "include_auto", label: "Also “Automatic” (follow the phone's own setting)", selector: { boolean: {} } },
        { name: "entity", label: "Also switch this helper (on = dark), for automations or other screens", selector: { entity: { domain: "input_boolean" } } },
        { name: "show_label", label: "Show the word (Light / Dark)", selector: { boolean: {} } },
        { name: "full_width", label: "As wide as the card", selector: { boolean: {} } },
        { type: "grid", name: "", schema: [{ name: "shape", selector: pick([["rounded", "Rounded square"], ["circle", "Circle"], ["pill", "Pill"]]) }, { name: "size", selector: slider(32, 64, 2) }] },
      ],
      computeLabel,
    };
  }

  static getStubConfig() { return {}; }

  getGridOptions() { return { columns: 3, rows: "auto", min_columns: 2 }; }

  signature() { return `${this._hass?.themes?.darkMode ? 1 : 0}|${this._hass?.selectedTheme?.dark}`; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, d = !!this._hass.themes?.darkMode;
    const chosen = this._hass.selectedTheme?.dark;
    const mode = chosen === undefined && c.include_auto ? "auto" : d ? "dark" : "light";
    const icon = mode === "auto" ? "mdi:theme-light-dark" : d ? "mdi:weather-night" : "mdi:white-balance-sunny";
    const word = mode === "auto" ? "Automatic" : d ? "Dark" : "Light";
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      button{display:flex;align-items:center;justify-content:center;gap:8px;margin:0 auto;${c.full_width ? "width:100%;" : ""}height:${c.size}px;min-width:${c.size}px;padding:${c.show_label || c.shape === "pill" ? "0 14px" : 0};
        border-radius:${c.shape === "circle" || c.shape === "pill" ? 999 : Math.round(c.size / 3)}px;border:1px solid ${p.border};background:${d ? "#1D2244" : "#FFFFFF"};
        color:${d ? "#FCD34D" : "#6D4BFF"};cursor:pointer;font:inherit;font-size:13px;font-weight:600;-webkit-tap-highlight-color:transparent;transition:transform .12s}
      button:active{transform:scale(.92)}
      ha-icon{--mdc-icon-size:${Math.round(c.size / 2)}px;animation:roost-float 4s ease-in-out infinite}
      span{color:${p.text}}
    </style><button aria-label="Switch to ${d ? "light" : "dark"} mode"><ha-icon icon="${icon}"></ha-icon>${c.show_label ? `<span>${word}</span>` : ""}</button>`;
    this.shadowRoot.querySelector("button").addEventListener("click", () => {
      this.vibrate();
      // light -> dark -> (automatic) -> light
      const nextDark = mode === "light" ? true : mode === "dark" && c.include_auto ? undefined : false;
      this.fire("settheme", { dark: nextDark });
      if (c.entity && nextDark !== undefined) this.call("input_boolean", nextDark ? "turn_on" : "turn_off", { entity_id: c.entity });
    });
  }
}

// ------------------------------------------------------------------ Roost Media
// TV and sound: power, what is playing, volume, mute, play/pause and the input.
class RoostMedia extends RoostBase {
  static get defaults() { return { color: "purple", show_volume: true, show_sources: true, show_controls: true, max_sources: 6, radius: 22, theme: "auto" }; }

  validate(c) { if (!c.entity) throw new Error("Choose a TV or speaker (media player)"); }

  watched() { return [this._config.entity, this._config.volume_entity, this._config.power_entity].filter(Boolean); }

  static getConfigForm() {
    return {
      schema: [
        { name: "style", selector: pick([["full", "Full player"], ["compact", "Small (name, state and volume buttons)"]]) },
        { name: "entity", required: true, selector: { entity: { domain: "media_player" } } },
        { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "icon", selector: { icon: {} } }] },
        { type: "expandable", name: "", title: "Extra devices", icon: "mdi:speaker", schema: [
          { name: "volume_entity", label: "Sound bar or speaker for the volume (optional)", selector: { entity: { domain: "media_player" } } },
          { name: "power_entity", label: "Plug or switch that powers it (optional)", selector: { entity: { domain: ["switch", "remote", "input_boolean"] } } },
        ] },
        { type: "expandable", name: "", title: "What it shows", icon: "mdi:eye-outline", schema: [
          { type: "grid", name: "", schema: [{ name: "show_volume", label: "Volume", selector: { boolean: {} } }, { name: "show_controls", label: "Play / pause / skip", selector: { boolean: {} } }] },
          { type: "grid", name: "", schema: [{ name: "show_sources", label: "Inputs and apps", selector: { boolean: {} } }, { name: "max_sources", label: "How many inputs", selector: { number: { min: 1, max: 20, mode: "box" } } }] },
        ] },
        { type: "expandable", name: "", title: "Look", icon: "mdi:palette", schema: [...colourFields("color"), { name: "radius", selector: slider(0, 40, 2) }, THEME_FIELD] },
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) { return { entity: Object.keys(hass.states).find((id) => id.startsWith("media_player.")) || "" }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  // The small "TV & sound" card of the original: icon, name, state, and volume down / mute / up. It turns purple when on; tap it to switch on or off.
  renderCompact(on, playing, un, g, p, vs) {
    const c = this._config, s = this.st();
    const line = !s ? "Device not found" : un ? "Offline" : on ? (s.attributes.source || s.attributes.app_name ? `${s.attributes.app_name || s.attributes.source} · on` : "On") : "Off";
    const vid = c.volume_entity || c.entity;
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{border-radius:${c.radius === 22 ? 24 : c.radius}px;padding:16px;display:grid;grid-template-columns:auto 1fr auto;grid-template-areas:"i n eq" "i l eq" "vd mu vu";column-gap:12px;row-gap:4px;align-items:center;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .12s;opacity:${un ? 0.6 : 1};
        background:${on ? `linear-gradient(135deg,${g[0]} 0%,${g[1]} 100%)` : p.off};color:${on ? "#fff" : p.text};border:1px solid ${on ? "transparent" : p.border};box-shadow:${on ? `0 18px 36px -16px ${g[2]}` : "none"}}
      .card:active{transform:scale(.98)}
      .ic{grid-area:i;width:44px;height:44px;border-radius:15px;display:flex;align-items:center;justify-content:center;background:${on ? "rgba(255,255,255,.2)" : p.inset};color:inherit}
      .ic ha-icon{--mdc-icon-size:22px}
      .n{grid-area:n;font-size:15px;font-weight:600}
      .l{grid-area:l;font-size:12px;opacity:.85;${on ? "" : `color:${p.muted};opacity:1;`}}
      .eq{grid-area:eq;display:flex;align-items:flex-end;gap:3px;height:22px}
      .eq i{display:block;width:4px;height:22px;border-radius:2px;background:currentColor;transform-origin:bottom;animation:roost-eq .9s ease-in-out infinite}
      .b{margin-top:12px;width:40px;height:40px;border-radius:14px;border:0;background:${on ? "rgba(255,255,255,.2)" : p.inset};color:inherit;display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .12s}
      .b:active{transform:scale(.9)}
      .b ha-icon{--mdc-icon-size:20px}
      .vd{grid-area:vd;justify-self:start}.mu{grid-area:mu;justify-self:start}.vu{grid-area:vu;justify-self:end}
    </style>
    <div class="card" role="button" tabindex="0" aria-label="${esc(this.name(c.entity))}">
      <span class="ic" data-pop="${on ? 1 : 0}" data-popkey="ic"><ha-icon icon="${esc(c.icon || "mdi:television-play")}"></ha-icon></span>
      <span class="n t">${esc(this.name(c.entity))}</span><span class="l t">${esc(line)}</span>
      ${on ? `<span class="eq">${[0, 0.2, 0.4, 0.1].map((d) => `<i style="animation-delay:${d}s"></i>`).join("")}</span>` : ""}
      <button class="b vd" data-a="down" aria-label="Volume down"><ha-icon icon="mdi:volume-minus"></ha-icon></button>
      <button class="b mu" data-a="mute" aria-label="Mute"><ha-icon icon="mdi:volume-mute"></ha-icon></button>
      <button class="b vu" data-a="up" aria-label="Volume up"><ha-icon icon="mdi:volume-plus"></ha-icon></button>
    </div>`;
    const root = this.shadowRoot, muted = !!vs?.attributes.is_volume_muted;
    root.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", (e) => {
      e.stopPropagation(); this.vibrate();
      const act = b.dataset.a;
      if (act === "down") this.call("media_player", "volume_down", { entity_id: vid });
      else if (act === "up") this.call("media_player", "volume_up", { entity_id: vid });
      else this.call("media_player", "volume_mute", { entity_id: vid, is_volume_muted: !muted });
    }));
    this.press(root.querySelector(".card"), () => {
      if ((c.tap_action || {}).action && c.tap_action.action !== "none") this.run(c.tap_action, c.entity);
      else this.call("media_player", on ? "turn_off" : "turn_on", { entity_id: c.entity });
    }, () => this.moreInfo(c.entity));
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour(), s = this.st();
    const un = !s || UNAVAILABLE.includes(s.state);
    const on = !un && !["off", "standby"].includes(s.state);
    const playing = s?.state === "playing";
    const vs = this.sx(c.volume_entity || c.entity) || s;
    const vol = vs?.attributes.volume_level, muted = !!vs?.attributes.is_volume_muted;
    const a = s?.attributes || {};
    const now = [a.media_title, a.media_artist || a.media_series_title].filter(Boolean).join(" · ") || a.app_name || (a.source ? `Input: ${a.source}` : "");
    const line = !s ? "Device not found" : un ? "Offline" : !on ? "Off" : playing ? "Playing" : s.state === "paused" ? "Paused" : "On";
    const srcs = (a.source_list || []).slice(0, c.max_sources);
    const art = on && (a.entity_picture_local || a.entity_picture);
    if (c.style === "compact") { this.renderCompact(on, playing, un, g, p, vs); return; }
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${panelCss(p, c.radius)};padding:16px;display:flex;flex-direction:column;gap:14px;opacity:${un ? 0.6 : 1}}
      .top{display:flex;align-items:center;gap:12px}
      :host{container-type:inline-size}
      @container (max-width: 240px){:host .top{flex-wrap:wrap}:host .tx{flex:1 1 100%}}
      .ic{position:relative;width:48px;height:48px;border-radius:16px;flex:none;display:flex;align-items:center;justify-content:center;overflow:hidden;
        background:${on ? `linear-gradient(135deg,${g[0]},${g[1]})` : p.inset};color:${on ? g[3] : p.muted};box-shadow:${on ? `0 10px 22px -10px ${g[2]}` : "none"};cursor:pointer}
      .ic img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
      .ic ha-icon{--mdc-icon-size:24px}
      .tx{flex:1;min-width:0}
      .n{font-size:15px;font-weight:600;line-height:1.25}
      .l{font-size:13px;color:${p.muted};margin-top:2px;display:flex;align-items:center;gap:6px}
      .eq{display:inline-flex;gap:2px;align-items:flex-end;height:12px}
      .eq i{display:block;width:3px;height:12px;border-radius:2px;background:${g[1]};transform-origin:bottom;animation:roost-eq .9s ease-in-out infinite}
      .eq i:nth-child(2){animation-delay:.2s}.eq i:nth-child(3){animation-delay:.4s}
      .pw{width:44px;height:44px;border-radius:50%;flex:none;border:1px solid ${p.border};background:${on ? `linear-gradient(135deg,${g[0]},${g[1]})` : p.off};color:${on ? g[3] : p.text};cursor:pointer;display:flex;align-items:center;justify-content:center}
      .pw ha-icon{--mdc-icon-size:22px}
      .now{font-size:13px;line-height:1.35;color:${p.text};padding:10px 12px;border-radius:14px;background:${p.inset}}
      .row{display:flex;align-items:center;gap:8px}
      .b{width:42px;height:42px;border-radius:50%;flex:none;border:1px solid ${p.border};background:${p.off};${p.fx || ""};color:${p.text};cursor:pointer;display:flex;align-items:center;justify-content:center;-webkit-tap-highlight-color:transparent;transition:transform .12s}
      .b:active{transform:scale(.9)}
      .b.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};border-color:transparent}
      .b ha-icon{--mdc-icon-size:20px}
      @container (max-width: 300px){:host .row{flex-wrap:wrap;justify-content:center;gap:8px}:host .vol{flex-basis:100%;order:-1}:host .b{width:36px;height:36px}:host .ctl{gap:8px}}
      .vol{flex:1;position:relative;height:42px;border-radius:999px;background:${p.inset};overflow:hidden;cursor:pointer;touch-action:none}
      .vol .f{position:absolute;left:0;top:0;bottom:0;border-radius:999px;background:linear-gradient(90deg,${g[0]},${g[1]});opacity:${muted ? 0.4 : 1}}
      .vol .v{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:${p.text};mix-blend-mode:${this.dark ? "normal" : "multiply"}}
      .ctl{display:flex;justify-content:center;gap:14px}
      .src{display:flex;flex-wrap:wrap;gap:6px}
      .src button{padding:8px 12px;border-radius:999px;border:1px solid ${p.border};background:${p.off};${p.fx || ""};color:${p.text};font:inherit;font-size:13px;font-weight:600;cursor:pointer}
      .src button.on{background:${g[0]}2E;color:${g[this.dark ? 1 : 0]};border-color:transparent}
    </style>
    <div class="card">
      <div class="top"><span class="ic" data-more data-pop="${on ? 1 : 0}" data-popkey="ic">${art ? `<img src="${esc(art)}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('ha-icon'),{icon:'${esc(c.icon || "mdi:television")}'}))">` : `<ha-icon icon="${esc(c.icon || "mdi:television")}"></ha-icon>`}</span>
        <span class="tx"><div class="n t">${esc(this.name(c.entity))}</div><div class="l t">${playing ? '<span class="eq"><i></i><i></i><i></i></span>' : ""}${esc(line)}</div></span>
        <button class="pw" data-a="power" aria-label="Power"><ha-icon icon="mdi:power"></ha-icon></button></div>
      ${on && now ? `<div class="now t">${esc(now)}</div>` : ""}
      ${on && c.show_volume && vs ? `<div class="row">${vol == null ? '<button class="b" data-a="down" aria-label="Volume down"><ha-icon icon="mdi:volume-minus"></ha-icon></button>' : ""}
        ${vol != null ? `<div class="vol" role="slider" aria-valuenow="${Math.round(vol * 100)}"><span class="f" data-bar="vol" style="width:${(vol * 100).toFixed(0)}%"></span><span class="v num" ${muted ? "" : 'data-tw="vol"'}>${muted ? "Muted" : `${Math.round(vol * 100)}%`}</span></div>` : '<span style="flex:1"></span>'}
        <button class="b ${muted ? "on" : ""}" data-a="mute" aria-label="Mute"><ha-icon icon="${muted ? "mdi:volume-off" : "mdi:volume-mute"}"></ha-icon></button>
        ${vol == null ? '<button class="b" data-a="up" aria-label="Volume up"><ha-icon icon="mdi:volume-plus"></ha-icon></button>' : ""}</div>` : ""}
      ${on && c.show_controls ? `<div class="ctl"><button class="b" data-a="prev" aria-label="Previous"><ha-icon icon="mdi:skip-previous"></ha-icon></button>
        <button class="b on" data-a="play" aria-label="Play or pause"><ha-icon icon="${playing ? "mdi:pause" : "mdi:play"}"></ha-icon></button>
        <button class="b" data-a="next" aria-label="Next"><ha-icon icon="mdi:skip-next"></ha-icon></button></div>` : ""}
      ${on && c.show_sources && srcs.length ? `<div class="src">${srcs.map((x) => `<button class="${x === a.source ? "on" : ""}" data-src="${esc(x)}">${esc(x)}</button>`).join("")}</div>` : ""}
    </div>`;
    const vid = c.volume_entity || c.entity, root = this.shadowRoot;
    root.querySelector("[data-more]").addEventListener("click", () => this.moreInfo(c.entity));
    root.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => {
      this.vibrate();
      const act = b.dataset.a;
      if (act === "power") {
        if (c.power_entity && !on) return this.call("homeassistant", "turn_on", { entity_id: c.power_entity }).then(() => this.call("media_player", "turn_on", { entity_id: c.entity }));
        return this.call("media_player", on ? "turn_off" : "turn_on", { entity_id: c.entity });
      }
      if (act === "down") return this.call("media_player", "volume_down", { entity_id: vid });
      if (act === "up") return this.call("media_player", "volume_up", { entity_id: vid });
      if (act === "mute") return this.call("media_player", "volume_mute", { entity_id: vid, is_volume_muted: !muted });
      if (act === "play") return this.call("media_player", "media_play_pause", { entity_id: c.entity });
      if (act === "prev") return this.call("media_player", "media_previous_track", { entity_id: c.entity });
      if (act === "next") return this.call("media_player", "media_next_track", { entity_id: c.entity });
      return undefined;
    }));
    root.querySelectorAll("[data-src]").forEach((b) => b.addEventListener("click", () => { this.vibrate(); this.call("media_player", "select_source", { entity_id: c.entity, source: b.dataset.src }); }));
    const bar = root.querySelector(".vol");
    if (bar) {
      const set = (ev, done) => {
        const r = bar.getBoundingClientRect(), f = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
        bar.querySelector(".f").style.width = `${(f * 100).toFixed(0)}%`;
        bar.querySelector(".v").textContent = `${Math.round(f * 100)}%`;
        if (done) this.call("media_player", "volume_set", { entity_id: vid, volume_level: Math.round(f * 100) / 100 });
      };
      bar.addEventListener("pointerdown", (ev) => { bar.setPointerCapture(ev.pointerId); this._drag = true; set(ev); });
      bar.addEventListener("pointermove", (ev) => { if (this._drag) set(ev); });
      bar.addEventListener("pointerup", (ev) => { if (this._drag) { this._drag = false; set(ev, true); } });
    }
  }
}

// ------------------------------------------------------------------ Roost Room
// One room at a glance: its temperature (with a bar), humidity, and what is on, open or running. Tap to open the room.
class RoostRoom extends RoostBase {
  static get hasCards() { return true; }
  static get defaults() { return { color: "active", min: 18, max: 36, warn: 32, style: "row", bar: "temperature", radius: 16, entities: [], tap_action: { action: "none" }, cards: [], cards_look: "inside", cards_columns: 1, cards_fold: false, theme: "auto" }; }

  // Any cards under the room (Roost cards or Home Assistant's own), made once and kept, so they do not start again on every change.
  setConfig(config) {
    const key = JSON.stringify((config && config.cards) || []) + (config && config.theme);
    if (key !== this._kidsKey) { this._kidsKey = key; this._kids = null; this.buildKids(config); }
    super.setConfig(config);
  }

  async buildKids(config) {
    const list = Array.isArray(config?.cards) ? config.cards : [];
    if (!list.length) { this._kids = []; return; }
    const token = (this._kidsToken = {});
    const helpers = window.loadCardHelpers ? await window.loadCardHelpers() : null;
    if (token !== this._kidsToken) return;
    this._kids = list.map((cfg0) => {
      let el; const cfg = withTheme(cfg0, config.theme);
      try { el = helpers ? helpers.createCardElement(cfg) : document.createElement(String(cfg.type || "").replace(/^custom:/, "")); if (!helpers) el.setConfig?.(cfg); }
      catch (e) { el = document.createElement("div"); el.textContent = `Card problem: ${e.message}`; }
      if (this._hass) el.hass = this._hass;
      return el;
    });
    this._sig = null;
    if (this._hass) this.hass = this._realHass || this._hass; else this.render();
  }

  set hass(h) { super.hass = h; (this._kids || []).forEach((el) => { el.hass = this._hass; }); }
  get hass() { return this._hass; }

  extraSignature() { return `${(this._kids || []).length}|${this._kidsOpen ? 1 : 0}`; }

  // Puts the cards under the room after each redraw: in one box with it, or just below it. They can fold away behind a tap.
  placeKids() {
    const kids = this._kids || [], c = this._config, p = this.p;
    if (!kids.length) return;
    const root = this.shadowRoot, main = root.querySelector(".r");
    const inside = c.cards_look !== "below" && c.style !== "tile" && !c.plain;
    const cols = Math.max(1, Math.min(4, Number(c.cards_columns) || 1)), open = !c.cards_fold || this._kidsOpen;
    const css = document.createElement("style");
    css.textContent = `.wrap{display:flex;flex-direction:column;gap:12px;${inside ? `${panelCss(p, c.radius)};padding:${c.style === "card" ? 16 : 12}px ${c.style === "card" ? 16 : 14}px` : ""}}
      ${inside ? ".wrap > .r{background:none;border:0;box-shadow:none;padding:0;border-radius:0}" : ""}
      .kids{display:grid;grid-template-columns:repeat(${cols},minmax(0,1fr));gap:8px;--grid-card-gap:8px}
      .kids > *{min-width:0}.kids[hidden]{display:none}
      @container (max-width: 360px){:host .kids{grid-template-columns:minmax(0,1fr)}}
      .fold{display:flex;align-items:center;justify-content:center;gap:6px;height:28px;margin:-4px 0;border:0;background:none;color:${p.muted};font:inherit;font-size:12px;font-weight:600;cursor:pointer;--mdc-icon-size:18px}
      .fold ha-icon{transition:transform .12s;${open ? "transform:rotate(180deg)" : ""}}`;
    const wrap = document.createElement("div"); wrap.className = "wrap";
    main.replaceWith(wrap); wrap.appendChild(main);
    if (c.cards_fold) {
      const b = document.createElement("button"); b.className = "fold"; b.setAttribute("aria-expanded", String(open));
      b.innerHTML = `<span class="t">${open ? "Less" : `${kids.length} more`}</span><ha-icon icon="mdi:chevron-down"></ha-icon>`;
      b.addEventListener("click", () => { this.vibrate(); this._kidsOpen = !this._kidsOpen; this._sig = null; this.hass = this._realHass || this._hass; });
      wrap.appendChild(b);
    }
    const box = document.createElement("div"); box.className = "kids"; if (!open) box.hidden = true;
    kids.forEach((el) => box.appendChild(el));
    wrap.appendChild(box); root.appendChild(css);
  }

  validate(c) { if (!c.name) throw new Error("Give the room a name"); }

  ids() { return (this._config.entities || []).map((e) => (typeof e === "string" ? e : e?.entity)).filter(Boolean); }

  watched() { const c = this._config; return [c.temperature, c.humidity, ...this.ids()].filter(Boolean); }

  // Every device with its state, in plain words, the way the original Rooms page says it.
  summaryAll() {
    const c = this._config, parts = [], doors = [];
    for (const e of c.entities || []) {
      const id = typeof e === "string" ? e : e?.entity; const s = this.sx(id); if (!s) continue;
      const d = id.split(".")[0], cls = s.attributes.device_class;
      const word = (typeof e === "object" && e.name) || { climate: "AC", cover: /blind/i.test(s.attributes.friendly_name || "") ? "Blind" : "Curtain", media_player: "TV", fan: "Fan" }[d] || s.attributes.friendly_name || id;
      if (UNAVAILABLE.includes(s.state)) { parts.push(`${word} offline`); continue; }
      if (d === "binary_sensor" && ["door", "window", "garage_door", "opening"].includes(cls)) { doors.push(s.state === "on"); continue; }
      if (d === "binary_sensor" && ["occupancy", "presence", "motion"].includes(cls)) { parts.push(s.state === "on" ? "someone there" : "no one there"); continue; }
      if (d === "climate") parts.push(`${word} ${s.state === "off" ? "off" : s.state.replace("_only", "").replace("heat_cool", "auto")}`);
      else if (d === "cover") parts.push(`${word} ${coverView(s, typeof e === "object" && e.reverse).state}`);
      else if (d === "media_player") parts.push(`${word} ${["off", "standby"].includes(s.state) ? "off" : "on"}`);
      else if (d === "sensor") { const u = s.attributes.unit_of_measurement || ""; parts.push(`${word} ${fmt(num(s.state) ?? s.state, /^(W|kW|lx|ppm)$/.test(u) ? 0 : decOf(s.state))}${unitGap(u)}`); }
      else parts.push(`${word} ${s.state === "on" ? "on" : "off"}`);
    }
    if (doors.length) parts.unshift(doors.some(Boolean) ? (doors.length > 1 ? "A door is open" : "Door open") : doors.length > 1 ? "Doors closed" : "Door closed");
    const t = num(this.sx(c.temperature)?.state), h = num(this.sx(c.humidity)?.state);
    if (c.temperature && t != null && c.warn != null && t >= c.warn) parts.unshift("Too hot");
    if (!parts.length && h != null) parts.push(`${fmt(h, decOf(this.sx(c.humidity).state))}% humidity`);
    const out = parts.join(" · ");
    return out ? out.charAt(0).toUpperCase() + out.slice(1) : "All quiet";
  }

  static getConfigForm() {
    return {
      schema: [
        { type: "grid", name: "", schema: [{ name: "name", required: true, label: "Room name", selector: { text: {} } }, { name: "icon", selector: { icon: {} } }] },
        { type: "grid", name: "", schema: [{ name: "temperature", label: "Temperature sensor", selector: { entity: { domain: "sensor" } } }, { name: "humidity", label: "Humidity sensor", selector: { entity: { domain: "sensor" } } }] },
        { name: "entities", label: "Devices to sum up (lights, AC, curtain, TV)", selector: { entity: { multiple: true } } },
        ACTION_FIELD("tap_action", "Tap opens (for example the room's page)"),
        { type: "expandable", name: "", title: "Look", icon: "mdi:palette", schema: [
          { name: "style", selector: pick([["row", "Slim row with a bar"], ["card", "Card with an icon"], ["tile", "Big coloured tile (like the Rooms page)"]]) },
          { name: "subtitle", label: "Your own line under the name (leave empty for an automatic one)", selector: { text: {} } },
          { name: "summary", label: "Automatic line", selector: pick([["on", "Only what is on"], ["all", "Every device with its state"]]) },
          { name: "bar", label: "Under the name (slim row)", selector: pick([["temperature", "A bar for the temperature"], ["devices", "Small icons of the devices, lit when on"], ["none", "Nothing"]]) },
          ...colourFields("color", "Bar colour"),
          { type: "grid", name: "", schema: [{ name: "min", label: "Bar starts at (°)", selector: { number: { mode: "box" } } }, { name: "max", label: "Bar is full at (°)", selector: { number: { mode: "box" } } }] },
          { type: "grid", name: "", schema: [{ name: "warn", label: "Too hot from (°)", selector: { number: { mode: "box" } } }, { name: "radius", selector: slider(0, 32, 2) }] },
          { name: "plain", label: "No box around it (inside a Roost Panel)", selector: { boolean: {} } },
          { name: "light_slider", label: "One slider for all the room's lights (slim row and card)", selector: { boolean: {} } },
          THEME_FIELD,
        ] },
        { type: "expandable", name: "", title: "Big tile: layout and colour", icon: "mdi:view-grid-outline", schema: [
          { name: "layout", label: "Layout", selector: pick([["corners", "Corners: put the icon, temperature and buttons where you like"], ["halo", "Halo: name on top, big icon bottom left, buttons down the right"]]) },
          { name: "tile_color", label: "Colour the tile", selector: pick([["always", "Always"], ["active", "Only when something is on"], ["never", "Never (dark, calm)"]]) },
          { type: "grid", name: "", schema: [{ name: "fill", label: "Colour fill", selector: pick([["gradient", "Gradient"], ["solid", "Solid"], ["glass", "Tinted glass"], ["outline", "Outline"]]) }, { name: "glow", selector: pick([["soft", "Soft glow"], ["strong", "Strong glow"], ["none", "No glow"]]) }] },
          { type: "grid", name: "", schema: [{ name: "icon_position", label: "Icon corner", selector: pick(CORNERS) }, { name: "temp_position", label: "Temperature corner", selector: pick([...CORNERS, ["hidden", "Hidden"]]) }] },
          { type: "grid", name: "", schema: [{ name: "icon_shape", label: "Icon background", selector: pick([["rounded", "Rounded square"], ["circle", "Circle"], ["none", "No background"]]) }, { name: "icon_size", label: "Icon size", selector: slider(28, 64, 2) }] },
          { name: "badge", label: "Small badge on the icon", selector: pick([["activity", "Green dot when someone is there"], ["count", "How many devices are on"], ["none", "None"]]) },
          { name: "temp_bar", label: "Temperature bar inside the tile", selector: pick([["none", "None"], ["bottom", "Along the bottom"], ["top", "Along the top"], ["side", "Up the right side"]]) },
          { type: "grid", name: "", schema: [{ name: "show_humidity", label: "Humidity next to the temperature", selector: { boolean: {} } }, { name: "show_summary", label: "What is on (line under the name)", selector: { boolean: {} } }] },
          { type: "grid", name: "", schema: [{ name: "shape", label: "Shape", selector: pick(TILE_SHAPES) }, { name: "height", label: "Height (my own height)", selector: slider(110, 320, 10) }] },
          { name: "show_ago", label: "Since when (for 3 min)", selector: { boolean: {} } },
          { type: "grid", name: "", schema: [{ name: "name_size", label: "Name size", selector: slider(13, 24) }, { name: "temp_size", label: "Temperature size", selector: slider(13, 28) }] },
          { type: "grid", name: "", schema: [{ name: "background_image", label: "Photo behind the tile (link)", selector: { text: {} } }, { name: "image_dim", label: "Darken the photo (%)", selector: slider(0, 90, 5) }] },
          ACTION_FIELD("hold_action", "Long press opens"),
        ] },
        { type: "expandable", name: "", title: "Big tile: quick buttons", icon: "mdi:gesture-tap-button", schema: [
          { name: "buttons_entities", label: "Buttons: tap starts it, hold shows details (devices, scenes, scripts, automations)", selector: { entity: { multiple: true } } },
          { name: "buttons_auto", label: "Or use the room's own devices as buttons", selector: { boolean: {} } },
          { name: "buttons_position", label: "Where the buttons sit", selector: pick([...CORNERS, ["row", "In a row under the name"]]) },
          { type: "grid", name: "", schema: [{ name: "button_size", label: "Button size", selector: slider(26, 48, 2) }, { name: "buttons_max", label: "Most buttons (automatic)", selector: slider(1, 6) }] },
        ] },
        { type: "expandable", name: "", title: "How the cards under the room sit (add them below)", icon: "mdi:card-plus-outline", schema: [
          { name: "cards_look", label: "How they sit", selector: pick([["inside", "In one box with the room"], ["below", "Just below the room"]]) },
          { type: "grid", name: "", schema: [{ name: "cards_columns", label: "Cards side by side", selector: slider(1, 4) }, { name: "cards_fold", label: "Folded away until tapped", selector: { boolean: {} } }] },
        ] },
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) { return { name: "Living room", icon: "mdi:sofa", temperature: Object.keys(hass.states).find((id) => hass.states[id].attributes.device_class === "temperature") || "" }; }

  getGridOptions() { return this._config?.style === "tile" ? { columns: 6, rows: "auto", min_columns: 3 } : { columns: 12, rows: "auto", min_columns: 6 }; }

  // Like Homey's zone activity: is someone here, and which sensor saw them (or when it last did).
  activity() {
    const ms = this.ids().map((id) => this.sx(id)).filter((s) => s && s.entity_id.startsWith("binary_sensor.") && ["motion", "occupancy", "presence"].includes(s.attributes.device_class));
    if (!ms.length) return null;
    const live = ms.find((s) => s.state === "on");
    if (live) return { on: true, text: ms.length > 1 ? `Someone here · ${live.attributes.friendly_name || "sensor"}` : "Someone here" };
    const last = ms.map((s) => s.last_changed).sort().pop(), m = (Date.now() - new Date(last).getTime()) / 60000;
    return { on: false, text: m < 180 ? `Empty · movement ${ago(last)}` : "" };
  }

  summary() {
    const out = [], lights = [];
    const act = this.activity();
    if (act?.text) out.push(act.text);
    for (const id of this.ids()) {
      const s = this.sx(id); if (!s) continue;
      const d = id.split(".")[0], nm = s.attributes.friendly_name || id;
      if (UNAVAILABLE.includes(s.state)) { out.push(`${nm} offline`); continue; }
      if (d === "light" || (d === "switch" && /light|lamp/i.test(nm))) { if (s.state === "on") lights.push(nm); continue; }
      if (d === "climate") out.push(s.state === "off" ? "AC off" : `AC ${s.state.replace("_only", "").replace("heat_cool", "auto")}${s.attributes.temperature != null ? ` ${s.attributes.temperature}°` : ""}`);
      else if (d === "cover") out.push(`${/blind/i.test(nm) ? "Blind" : "Curtain"} ${s.state}`);
      else if (d === "media_player") { if (!["off", "standby"].includes(s.state)) out.push(`${/tv/i.test(nm) ? "TV" : nm} on`); }
      else if (d === "binary_sensor") { if (["motion", "occupancy", "presence"].includes(s.attributes.device_class)) continue; if (s.state === "on") out.push(`${nm} ${["door", "window", "opening"].includes(s.attributes.device_class) ? "open" : "on"}`); }
      else if (s.state === "on") out.push(`${nm} on`);
    }
    if (lights.length) out.splice(act?.text ? 1 : 0, 0, `${lights.length} light${lights.length > 1 ? "s" : ""} on`);
    return out.join(" · ") || "All quiet";
  }

  // Is anything in the room on right now (lights, AC, TV, fans, open curtains)?
  roomOn() {
    return this.ids().some((id) => {
      const s = this.sx(id); if (!s || UNAVAILABLE.includes(s.state)) return false;
      const d = id.split(".")[0];
      if (["sensor", "binary_sensor", "automation", "script", "scene", "button", "input_button", "lock", "alarm_control_panel", "person", "device_tracker"].includes(d)) return false;
      return !OFF_STATES.includes(s.state) && s.state !== "unavailable";
    });
  }

  // The small round buttons on a room tile: each one starts a device, a scene, a script or an automation.
  quickItems() {
    const c = this._config;
    if (c.buttons === "auto" || (c.buttons == null && c.buttons_auto)) return this.ids().filter((id) => this.sx(id) && !/^(sensor|binary_sensor|person|device_tracker)\./.test(id)).slice(0, Number(c.buttons_max) || 4).map((entity) => ({ entity }));
    if (!Array.isArray(c.buttons) && Array.isArray(c.buttons_entities)) return c.buttons_entities.filter(Boolean).slice(0, 6).map((entity) => ({ entity }));
    return Array.isArray(c.buttons) ? c.buttons.filter((b) => b && (b.entity || b.tap_action)).slice(0, 6) : [];
  }

  quickOn(b) {
    const s = this.sx(b.entity);
    if (!s || UNAVAILABLE.includes(s.state)) return false;
    const d = s.entity_id.split(".")[0];
    if (["automation", "script"].includes(d)) return s.state === "on" && d === "script";
    if (["scene", "button", "input_button"].includes(d)) return false;
    return !OFF_STATES.includes(s.state);
  }

  quickTap(b) {
    if (b.tap_action && b.tap_action.action !== "none") return this.run(b.tap_action, b.entity);
    const id = b.entity; if (!id) return undefined;
    const d = id.split(".")[0], s = this.sx(id);
    this.vibrate();
    if (d === "automation") return this.call("automation", "trigger", { entity_id: id });
    if (d === "script") return this.call("script", "turn_on", { entity_id: id });
    if (d === "scene") return this.call("scene", "turn_on", { entity_id: id });
    if (d === "button" || d === "input_button") return this.call(d, "press", { entity_id: id });
    if (d === "lock") return this.call("lock", s?.state === "locked" ? "unlock" : "lock", { entity_id: id });
    if (d === "cover") return this.call("cover", "toggle", { entity_id: id });
    return this.call("homeassistant", "toggle", { entity_id: id });
  }

  // The "halo" room tile: name and readings at the top, a big room icon in a soft circle at the bottom left,
  // and the quick buttons stacked down the right edge (the calm layout most room cards settle on).
  renderHalo(t, ts, hot, g) {
    const c = this._config, p = this.p;
    if (!c.color || c.color === "active") g = COLORS.purple; // the same gradient as the device tiles
    const lit = c.tile_color === "never" ? false : c.tile_color === "active" ? this.roomOn() : true;
    const look = lit ? fillLook(c.fill || "gradient", c.glow || "soft", g, p) : { bg: p.off, fg: p.text, border: p.border, shadow: "none", light: false };
    const img = String(c.background_image || "").trim();
    const light = look.light || !!img;
    const items = this.quickItems().slice(0, Number(c.buttons_max) || 3);
    const hs = this.sx(c.humidity), h = hs ? num(hs.state) : null;
    const reads = [t != null && c.temp_position !== "hidden" ? `<span data-tw="t">${fmt(t, 1)}°</span>` : "", c.show_humidity !== false && h != null ? `${Math.round(h)}%` : ""].filter(Boolean).join('<i class="sep"></i>');
    const onCount = this.ids().filter((id) => { const s = this.sx(id); return s && !UNAVAILABLE.includes(s.state) && !OFF_STATES.includes(s.state) && /^(light|switch|fan|climate|media_player|cover|humidifier|input_boolean|vacuum)\./.test(id); }).length;
    const act = this.activity();
    const badge = c.badge === "count" ? (onCount ? `<i class="bd">${onCount}</i>` : "") : c.badge !== "none" && act?.on ? '<i class="ad"></i>' : "";
    const f = t == null ? 0 : Math.max(0.04, Math.min(1, (t - c.min) / ((c.max - c.min) || 1)));
    const bsz = Number(c.button_size) || 36, hsz = Number(c.icon_size) || 84;
    const sub = c.show_summary ? `<div class="l t">${esc(c.subtitle || (c.summary === "all" ? this.summaryAll() : this.summary()))}</div>` : "";
    const dim = Number(c.image_dim ?? 45) / 100;
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .r{position:relative;${shapeCss(c.shape || "square", c.height, 160)};box-sizing:border-box;border-radius:${Number(c.radius) === 16 ? 24 : c.radius}px;padding:16px;overflow:hidden;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .12s,background .12s;
        display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:10px;
        background:${img ? `linear-gradient(180deg,rgba(0,0,0,${dim * 0.5}),rgba(0,0,0,${dim})),url("${esc(img)}") center/cover` : look.bg};color:${light ? "#FFFFFF" : p.text};border:1px solid ${img ? "transparent" : look.border};box-shadow:${look.light ? `inset 0 1px 0 rgba(255,255,255,.22),${look.shadow === "none" ? "0 0 0 transparent" : look.shadow}` : look.shadow}}
      .r:active{transform:scale(.97)}
      .tx{min-width:0;position:relative;z-index:1}
      .n{font-size:${Number(c.name_size) || 17}px;font-weight:700;line-height:1.2}
      .rd{display:flex;align-items:center;gap:6px;margin-top:4px;font-size:${Number(c.temp_size) || 13}px;font-weight:600;opacity:.9;${hot ? "color:#FFE1D1" : ""}}
      .rd .sep{width:3px;height:3px;border-radius:50%;background:currentColor;opacity:.6}
      .l{font-size:12px;line-height:1.35;opacity:.75;margin-top:4px}
      .halo{position:absolute;left:-${Math.round(hsz * 0.16)}px;bottom:-${Math.round(hsz * 0.16)}px;width:${hsz}px;height:${hsz}px;border-radius:50%;display:flex;align-items:center;justify-content:center;
        background:${light ? "rgba(255,255,255,.18)" : `color-mix(in srgb, ${g[0]} 22%, transparent)`};color:${light || this.dark ? "#FFFFFF" : g[0]};box-shadow:0 0 0 ${Math.round(hsz * 0.12)}px ${light ? "rgba(255,255,255,.07)" : `color-mix(in srgb, ${g[0]} 9%, transparent)`}}
      .halo ha-icon{--mdc-icon-size:${Math.round(hsz * 0.42)}px;transform:translate(${Math.round(hsz * 0.05)}px,-${Math.round(hsz * 0.05)}px)}
      .halo .ad{position:absolute;top:${Math.round(hsz * 0.14)}px;right:${Math.round(hsz * 0.14)}px;width:12px;height:12px;border-radius:50%;background:#10B981;border:2px solid ${light ? "rgba(255,255,255,.9)" : p.panel}}
      .halo .bd{position:absolute;top:${Math.round(hsz * 0.1)}px;right:${Math.round(hsz * 0.1)}px;min-width:20px;height:20px;padding:0 6px;box-sizing:border-box;border-radius:10px;background:#FFFFFF;color:${g[0]};font-style:normal;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.25)}
      .qs{display:flex;flex-direction:column;gap:8px;position:relative;z-index:1}
      .qb{width:${bsz}px;height:${bsz}px;border-radius:${Math.round(bsz * 0.36)}px;border:0;padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent;--mdc-icon-size:${Math.round(bsz * 0.5)}px;transition:transform .12s,background .12s,color .12s;
        background:${light ? "rgba(255,255,255,.16)" : p.track};color:${light ? "rgba(255,255,255,.85)" : this.dark ? "rgba(255,255,255,.75)" : p.muted}}
      .qb.on{background:${light ? "#FFFFFF" : `linear-gradient(135deg,${g[0]},${g[1]})`};color:${light ? g[0] : "#FFFFFF"};box-shadow:0 6px 14px -6px ${light ? "rgba(0,0,0,.35)" : g[2]}}
      .qb:active{transform:scale(.88)}
      .bar{position:absolute;left:${Math.round(hsz * 0.9)}px;right:16px;bottom:14px;height:4px;border-radius:999px;background:${light ? "rgba(255,255,255,.25)" : p.track};overflow:hidden}
      .bar i{display:block;height:100%;border-radius:999px;background:${hot ? "linear-gradient(90deg,#FF9F6B,#F43F6B)" : light ? "#FFFFFF" : `linear-gradient(90deg,${g[0]},${g[1]})`}}
    </style>
    <div class="r" role="button" tabindex="0" aria-label="${esc(c.name)}">
      <div class="tx"><div class="n t">${esc(c.name)}</div>${reads ? `<div class="rd num">${reads}</div>` : ""}${sub}</div>
      ${items.length ? `<div class="qs">${items.map((b, i) => `<button class="qb${this.quickOn(b) ? " on" : ""}" data-qb="${i}" aria-label="${esc(b.name || this.name(b.entity) || "Button")}"></button>`).join("")}</div>` : ""}
      ${c.icon_shape === "none" ? "" : `<span class="halo"><ha-icon icon="${esc(c.icon || "mdi:home-outline")}"></ha-icon>${badge}</span>`}
      ${c.temp_bar && c.temp_bar !== "none" && t != null ? `<span class="bar"><i data-bar="t" style="width:${(f * 100).toFixed(0)}%"></i></span>` : ""}
    </div>`;
    this.shadowRoot.querySelectorAll("[data-qb]").forEach((btn) => {
      const b = items[+btn.dataset.qb];
      this.icon(btn, b.icon, b.entity);
      ["pointerdown", "pointerup", "mousedown", "mouseup", "touchstart", "touchend", "click", "keydown"].forEach((ev) => btn.addEventListener(ev, (e) => e.stopPropagation()));
      this.press(btn, () => this.quickTap(b), () => (b.hold_action ? this.run(b.hold_action, b.entity) : this.moreInfo(b.entity)));
    });
    this.press(this.shadowRoot.querySelector(".r"), () => {
      if ((c.tap_action || {}).action && c.tap_action.action !== "none") this.run(c.tap_action);
      else if (c.temperature) this.moreInfo(c.temperature);
    }, () => (c.hold_action && c.hold_action.action !== "none" ? this.run(c.hold_action) : this.roomSheet()));
    this.placeKids();
  }

  // Holding a room tile opens the room's own sheet (its devices and one bar for its lights).
  roomSheet() {
    const c = this._config;
    if (c.details === "home-assistant" || !window.RoostSheet) { if (c.temperature) this.fire("hass-more-info", { entityId: c.temperature }); return; }
    const path = (c.tap_action || {}).action === "navigate" ? c.tap_action.navigation_path : null;
    window.RoostSheet.openRoom({ name: c.name, icon: c.icon, ids: this.ids(), temperature: c.temperature, humidity: c.humidity, path });
  }

  // The big room tile, laid out by the card's options: where the icon, the temperature and the buttons sit,
  // a temperature bar inside, a photo behind, and a colour that can follow whether anything is on.
  renderTile(t, ts, hot, g) {
    const c = this._config, p = this.p;
    if (!c.color || c.color === "active") g = COLORS.purple; // the same gradient as the device tiles
    const lit = c.tile_color === "never" ? false : c.tile_color === "active" ? this.roomOn() : true;
    const look = lit ? fillLook(c.fill || "gradient", c.glow || "soft", g, p) : { bg: p.off, fg: p.text, border: p.border, shadow: "none", light: false };
    const img = String(c.background_image || "").trim();
    const light = look.light || !!img;
    const fg = light ? "#FFFFFF" : p.text;
    const pos = (v, d) => (["top-left", "top-right", "bottom-left", "bottom-right"].includes(v) ? v : d);
    const iconAt = c.icon_shape === "none" && !c.icon ? "" : pos(c.icon_position, "top-left");
    const tempAt = c.temp_position === "hidden" ? "" : pos(c.temp_position, "top-right");
    const textAt = iconAt === "bottom-left" ? "top-left" : "bottom-left";
    const items = this.quickItems();
    const btnAt = c.buttons_position === "row" ? "row" : pos(c.buttons_position, "bottom-right");
    const hs = this.sx(c.humidity), h = hs ? num(hs.state) : null;
    const f = t == null ? 0 : Math.max(0.04, Math.min(1, (t - c.min) / ((c.max - c.min) || 1)));
    const isz = Number(c.icon_size) || 42, bsz = Number(c.button_size) || 34;
    const shape = c.icon_shape === "circle" ? "50%" : c.icon_shape === "none" ? "0" : `${Math.round(isz / 3)}px`;
    const act = this.activity();
    const onCount = this.ids().filter((id) => { const s = this.sx(id); return s && !UNAVAILABLE.includes(s.state) && !OFF_STATES.includes(s.state) && /^(light|switch|fan|climate|media_player|cover|humidifier|input_boolean|vacuum)\./.test(id); }).length;
    const badge = c.badge === "count" ? (onCount ? `<i class="bd">${onCount}</i>` : "") : c.badge === "activity" || (c.badge == null && act?.on) ? (act?.on ? '<i class="ad"></i>' : "") : "";
    const parts = { "top-left": [], "top-right": [], "bottom-left": [], "bottom-right": [] };
    if (iconAt) parts[iconAt].push(`<span class="ic"><ha-icon icon="${esc(c.icon || "mdi:home-outline")}"></ha-icon>${badge}</span>`);
    if (tempAt && t != null) parts[tempAt].push(`<span class="tp num"><span data-tw="t">${fmt(t, 1)}°</span>${c.show_humidity && h != null ? `<small> · ${Math.round(h)}%</small>` : ""}</span>`);
    const quick = items.length ? `<span class="qs">${items.map((b, i) => `<button class="qb${this.quickOn(b) ? " on" : ""}" data-qb="${i}" aria-label="${esc(b.name || this.name(b.entity) || "Button")}"></button>`).join("")}</span>` : "";
    const sub = c.show_summary === false ? "" : `<div class="l t">${esc(c.subtitle || (c.summary === "all" ? this.summaryAll() : this.summary()))}</div>`;
    const ago = c.show_ago !== false && ts && !UNAVAILABLE.includes(ts.state) ? `<div class="ago t">${esc(since(ts.last_changed))}</div>` : "";
    parts[textAt].push(`<div class="tx"><div class="n t">${esc(c.name)}</div>${sub}${ago}${btnAt === "row" ? quick : ""}</div>`);
    // Buttons asked for on the same line as the name get a line of their own on that side, so the name keeps its room.
    const clash = quick && btnAt !== "row" && btnAt.split("-")[0] === textAt.split("-")[0];
    if (quick && btnAt !== "row" && !clash) parts[btnAt].push(quick);
    const qline = clash ? `<div class="ql ${btnAt.endsWith("left") ? "lf" : ""}">${quick}</div>` : "";
    const tb = c.temp_bar && c.temp_bar !== "none" && t != null;
    const trackBg = light ? "rgba(255,255,255,.28)" : p.track;
    const barFill = hot ? "linear-gradient(90deg,#FF9F6B,#F43F6B)" : light ? "#FFFFFF" : `linear-gradient(90deg,${g[0]},${g[1]})`;
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .r{position:relative;${shapeCss(c.shape || "square", c.height, 170)};border-radius:${Number(c.radius) === 16 ? 22 : c.radius}px;padding:16px ${tb && c.temp_bar === "side" ? 26 : 16}px 16px 16px;display:grid;grid-template-rows:auto 1fr auto${tb && c.temp_bar === "bottom" ? " auto" : ""};gap:8px;overflow:hidden;box-sizing:border-box;
        background:${img ? `linear-gradient(180deg,rgba(0,0,0,${(Number(c.image_dim ?? 45) / 100) * 0.6}) 0%,rgba(0,0,0,${Number(c.image_dim ?? 45) / 100}) 100%),url("${esc(img)}") center/cover` : look.bg};color:${fg};border:1px solid ${img ? "transparent" : look.border};box-shadow:${look.shadow};cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .12s,background .12s}
      .r:active{transform:scale(.97)}
      .row{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;min-width:0}
      .row.b{align-items:flex-end;grid-row:3}
      .ql{grid-row:2;align-self:end;display:flex}.ql.q2{align-self:start}.ql .qs{width:100%}.ql.lf .qs{justify-content:flex-start}
      .row.t{grid-row:1}
      .c{display:flex;flex-direction:column;gap:6px;min-width:0}
      .c.l1{flex:1 0 auto;align-items:flex-start}.c.r1{align-items:flex-end;flex:0 1 auto;min-width:0;text-align:right}
      .row.b .c.l1:has(.ic:only-child){flex:none}
      .ic{position:relative;width:${isz}px;height:${isz}px;border-radius:${shape};display:flex;align-items:center;justify-content:center;flex:none;
        background:${c.icon_shape === "none" ? "transparent" : light ? "rgba(255,255,255,.22)" : `color-mix(in srgb, ${g[0]} 26%, transparent)`};color:${light ? "#FFFFFF" : g[this.dark ? 1 : 0]}}
      .ic ha-icon{--mdc-icon-size:${Math.round(isz * 0.54)}px}
      .ic .ad{position:absolute;top:-3px;right:-3px;width:12px;height:12px;border-radius:50%;background:#10B981;border:2px solid ${light ? "rgba(255,255,255,.9)" : p.panel}}
      .ic .ad::after{content:"";position:absolute;inset:-2px;border-radius:50%;background:#10B981;animation:roost-ping 2s ease-out infinite}
      .ic .bd{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;padding:0 6px;box-sizing:border-box;border-radius:9px;background:#FFFFFF;color:${g[0]};font-style:normal;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.25)}
      .tp{font-size:${Number(c.temp_size) || 17}px;font-weight:700;white-space:nowrap;${hot ? "color:#FFFFFF;text-shadow:0 0 12px rgba(255,159,107,.9)" : ""}}
      .tp small{font-size:.75em;font-weight:500;opacity:.8}
      .n{font-size:${Number(c.name_size) || 15}px;font-weight:600;line-height:1.2}
      .l{font-size:12px;line-height:1.3;opacity:.85;margin-top:2px}
      .ago{font-size:11px;margin-top:3px;opacity:.65}
      .qs{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end}
      .tx .qs{justify-content:flex-start;margin-top:8px}
      .qb{width:${bsz}px;height:${bsz}px;border-radius:50%;border:0;padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent;--mdc-icon-size:${Math.round(bsz * 0.5)}px;transition:transform .12s,background .12s,color .12s;
        background:${light ? "rgba(255,255,255,.2)" : p.track};color:${light ? "#FFFFFF" : p.muted}}
      .qb.on{background:${light ? "#FFFFFF" : `linear-gradient(135deg,${g[0]},${g[1]})`};color:${light ? g[0] : "#FFFFFF"};box-shadow:0 6px 14px -6px ${light ? "rgba(0,0,0,.35)" : g[2]}}
      .qb:active{transform:scale(.88)}
      .bar{grid-row:4;height:5px;border-radius:999px;background:${trackBg};overflow:hidden}
      .bar i,.sbar i{display:block;border-radius:999px;background:${barFill}}
      .bar i{height:100%}
      .sbar{position:absolute;right:10px;top:18px;bottom:18px;width:5px;border-radius:999px;background:${trackBg};display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden}
      .sbar i{width:100%;background:${hot ? "linear-gradient(0deg,#FF9F6B,#F43F6B)" : light ? "#FFFFFF" : `linear-gradient(0deg,${g[0]},${g[1]})`}}
      .tbar{position:absolute;left:16px;right:16px;top:8px;height:4px;border-radius:999px;background:${trackBg};overflow:hidden}
      .tbar i{display:block;height:100%;border-radius:999px;background:${barFill}}
    </style>
    <div class="r" role="button" tabindex="0" aria-label="${esc(c.name)}">
      <div class="row t"><div class="c l1">${parts["top-left"].join("")}</div><div class="c r1">${parts["top-right"].join("")}</div></div>
      ${qline && textAt.startsWith("top") ? qline.replace('class="ql', 'class="ql q2') : ""}
      ${qline && textAt.startsWith("bottom") ? qline : ""}
      <div class="row b"><div class="c l1">${parts["bottom-left"].join("")}</div><div class="c r1">${parts["bottom-right"].join("")}</div></div>
      ${tb && c.temp_bar === "bottom" ? `<span class="bar"><i data-bar="t" style="width:${(f * 100).toFixed(0)}%"></i></span>` : ""}
      ${tb && c.temp_bar === "side" ? `<span class="sbar"><i style="height:${(f * 100).toFixed(0)}%"></i></span>` : ""}
      ${tb && c.temp_bar === "top" ? `<span class="tbar"><i style="width:${(f * 100).toFixed(0)}%"></i></span>` : ""}
    </div>`;
    this.shadowRoot.querySelectorAll("[data-qb]").forEach((btn) => {
      const b = items[+btn.dataset.qb];
      this.icon(btn, b.icon, b.entity);
      ["pointerdown", "pointerup", "mousedown", "mouseup", "touchstart", "touchend", "click", "keydown"].forEach((ev) => btn.addEventListener(ev, (e) => e.stopPropagation()));
      this.press(btn, () => this.quickTap(b), () => (b.hold_action ? this.run(b.hold_action, b.entity) : this.moreInfo(b.entity)));
    });
    this.press(this.shadowRoot.querySelector(".r"), () => {
      if ((c.tap_action || {}).action && c.tap_action.action !== "none") this.run(c.tap_action);
      else if (c.temperature) this.moreInfo(c.temperature);
    }, () => (c.hold_action && c.hold_action.action !== "none" ? this.run(c.hold_action) : this.roomSheet()));
    this.placeKids();
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour();
    const ts = this.sx(c.temperature), t = ts ? num(ts.state) : null, hs = this.sx(c.humidity), h = hs ? num(hs.state) : null;
    const hot = t != null && c.warn != null && t >= c.warn;
    const f = t == null ? 0 : Math.max(0.06, Math.min(1, (t - c.min) / ((c.max - c.min) || 1)));
    const bar = hot ? "linear-gradient(90deg,#FF9F6B,#F43F6B)" : `linear-gradient(90deg,${g[0]},${g[1]})`;
    const card = c.style === "card";
    if (c.style === "tile") { if (c.layout === "halo") this.renderHalo(t, ts, hot, g); else this.renderTile(t, ts, hot, g); return; }
    // one slider for every light in the room, like Homey's zone lights
    const lights = this.ids().filter((id) => id.startsWith("light.")).map((id) => this.sx(id)).filter((x) => x && !UNAVAILABLE.includes(x.state));
    const lon = lights.filter((x) => x.state === "on");
    const lt = { show: c.light_slider && lights.length > 0, on: lon.length > 0, pct: lon.length ? Math.round(lon.reduce((a, x) => a + (x.attributes.brightness ?? 255), 0) / lon.length / 2.55) : 0 };
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .r{${c.plain ? "background:none;border:0;border-radius:0" : panelCss(p, c.radius)};padding:${c.plain ? "4px 0" : `${card ? 16 : 12}px ${card ? 16 : 14}px`};display:grid;grid-template-columns:${card ? "48px" : "14px"} minmax(0,1fr) minmax(0,max-content);column-gap:${card ? 14 : 10}px;row-gap:6px;align-items:center;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .12s}
      .r:active{transform:scale(.98)}
      .dot{grid-row:1/4;width:10px;height:10px;border-radius:50%;background:${hot ? "#FF9F6B" : t != null ? g[0] : p.knob};box-shadow:0 0 0 4px ${hot ? "rgba(255,159,107,.22)" : t != null ? `${g[0]}2E` : "transparent"};${hot ? "animation:roost-breathe 1.6s ease-in-out infinite" : ""};position:relative}
      .dot.act::after{content:"";position:absolute;inset:0;border-radius:50%;background:${g[0]};animation:roost-ping 2s ease-out infinite}
      .ic{grid-row:1/4;width:48px;height:48px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:${g[0]}24;color:${g[this.dark ? 1 : 0]}}
      .ic ha-icon{--mdc-icon-size:24px}
      .n{font-size:${card ? 16 : 14}px;font-weight:600;text-align:left}
      .tp{font-size:${card ? 16 : 14}px;font-weight:600;text-align:right;color:${hot ? "#FF9F6B" : p.text}}
      @container (max-width: 260px){:host .r{grid-template-columns:minmax(0,1fr)}:host .dot,:host .ic{display:none}:host .bar,:host .dv,:host .l,:host .n,:host .tp{grid-column:1/-1}:host .tp{text-align:left}}
      .bar{grid-column:2/4;height:4px;border-radius:999px;background:${p.track};overflow:hidden}
      .bar i{display:block;height:100%;border-radius:999px;background:${bar}}
      .l{grid-column:2/4;font-size:12px;color:${p.muted};line-height:1.35}
      .dv{grid-column:2/4;display:flex;flex-wrap:wrap;gap:6px}
      .dv .d{width:26px;height:26px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:${p.track};color:${p.muted};--mdc-icon-size:15px;transition:background .12s,color .12s}
      .dv .d.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:#FFFFFF;box-shadow:0 4px 12px -4px ${g[2]}}
      .ic{position:relative}.ic .ad{position:absolute;top:-3px;right:-3px;width:12px;height:12px;border-radius:50%;background:#10B981;border:2px solid ${this.dark ? "#141831" : "#fff"}}
      .ic .ad::after{content:"";position:absolute;inset:-2px;border-radius:50%;background:#10B981;animation:roost-ping 2s ease-out infinite}
      .lt{grid-column:2/4;display:flex;align-items:center;gap:10px;color:${lt.on ? (this.dark ? "#F5B94A" : "#B45309") : p.muted};--mdc-icon-size:18px}
      .lt ha-icon{flex:none}
      .lt input{-webkit-appearance:none;appearance:none;flex:1;height:28px;margin:0;background:transparent;cursor:pointer}
      .lt input::-webkit-slider-runnable-track{height:8px;border-radius:4px;background:linear-gradient(90deg,#F59E0B,#FDE68A) 0/var(--f) 100% no-repeat,${p.track}}
      .lt input::-moz-range-track{height:8px;border-radius:4px;background:${p.track}}.lt input::-moz-range-progress{height:8px;border-radius:4px;background:linear-gradient(90deg,#F59E0B,#FDE68A)}
      .lt input::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;margin-top:-7px;background:#fff;border:3px solid #F59E0B;box-shadow:0 2px 6px rgba(0,0,0,.25)}
      .lt input::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#fff;border:3px solid #F59E0B}
      .lt b{font-size:12px;font-weight:600;min-width:36px;text-align:right;font-family:${FONT_NUM}}
    </style>
    <div class="r" role="button" tabindex="0" aria-label="${esc(c.name)}">
      ${card ? `<span class="ic"><ha-icon icon="${esc(c.icon || "mdi:home-outline")}"></ha-icon>${this.activity()?.on ? '<i class="ad" aria-label="Someone here"></i>' : ""}</span>` : `<span class="dot ${this.activity()?.on ? "act" : ""}"></span>`}
      <span class="n t">${esc(c.name)}</span><span class="tp num">${t != null ? `<span data-tw="t">${fmt(t, 1)}°</span>` : c.temperature ? "No reading" : ""}${h != null ? `<span style="color:${p.muted};font-weight:500"> · ${Math.round(h)}%</span>` : ""}</span>
      ${c.bar === "devices" ? `<span class="dv">${this.ids().filter((id) => this.sx(id)).map((id) => { const x = this.sx(id), on = !UNAVAILABLE.includes(x.state) && !OFF_STATES.includes(x.state); return `<span class="d${on ? " on" : ""}" data-dv="${esc(id)}" title="${esc(this.name(id))}"></span>`; }).join("")}</span>` : c.temperature && c.bar !== "none" ? `<span class="bar"><i data-bar="t" style="width:${(f * 100).toFixed(0)}%"></i></span>` : ""}
      <span class="l t">${esc(c.subtitle || (c.summary === "all" ? this.summaryAll() : this.summary()))}</span>
      ${lt.show ? `<span class="lt" data-lt="1"><ha-icon icon="${lt.on ? "mdi:lightbulb-group" : "mdi:lightbulb-group-outline"}" data-pop="${lt.on ? 1 : 0}" data-popkey="lt"></ha-icon><input type="range" min="0" max="100" step="5" value="${lt.pct}" style="--f:${lt.pct}%" aria-label="All lights in ${esc(c.name)}"><b data-tw="lt">${lt.on ? `${lt.pct}%` : "Off"}</b></span>` : ""}
    </div>`;
    this.shadowRoot.querySelectorAll("[data-dv]").forEach((d) => this.icon(d, null, d.dataset.dv));
    const lr = this.shadowRoot.querySelector("[data-lt] input");
    if (lr) {
      const box = lr.parentElement;
      ["pointerdown", "pointerup", "mousedown", "mouseup", "touchstart", "touchend", "click"].forEach((ev) => box.addEventListener(ev, (e) => e.stopPropagation()));
      lr.addEventListener("input", () => { lr.style.setProperty("--f", `${lr.value}%`); box.querySelector("b").textContent = Number(lr.value) ? `${lr.value}%` : "Off"; });
      lr.addEventListener("change", () => { this.vibrate(); const v = Number(lr.value), ids = lights.map((x) => x.entity_id); if (v) this.call("light", "turn_on", { entity_id: ids, brightness_pct: v }); else this.call("light", "turn_off", { entity_id: ids }); });
    }
    this.press(this.shadowRoot.querySelector(".r"), () => {
      if ((c.tap_action || {}).action && c.tap_action.action !== "none") this.run(c.tap_action);
      else if (c.temperature) this.moreInfo(c.temperature);
    }, () => this.roomSheet());
    this.placeKids();
  }
}

// ------------------------------------------------------------------ Roost Alarm
// The alarm: its state in a big shield, arm and disarm buttons (with a question first), a keypad if it needs a code, and the doors.
class RoostAlarm extends RoostBase {
  static get defaults() { return { modes: ["arm_away", "arm_home", "arm_night"], doors: [], confirm: true, radius: 22, theme: "auto" }; }

  validate(c) { if (!c.entity) throw new Error("Choose the alarm"); }

  watched() { return [this._config.entity, ...(this._config.doors || [])]; }

  static getConfigForm() {
    return {
      schema: [
        { name: "entity", required: true, selector: { entity: { domain: "alarm_control_panel" } } },
        { name: "name", selector: { text: {} } },
        { name: "style", selector: pick([["card", "Compact: the state and a slim switch"], ["big", "Big shield with large buttons"], ["pills", "A row of pills (Disarm, Arm home, Arm away)"]]) },
        { name: "show_doors", label: "List the doors under it (compact)", selector: { boolean: {} } },
        { name: "modes", label: "Buttons", selector: { select: { multiple: true, mode: "list", options: [
          { value: "arm_away", label: "Away" }, { value: "arm_home", label: "Home" }, { value: "arm_night", label: "Night" }, { value: "arm_vacation", label: "Holiday" }] } } },
        { name: "doors", label: "Doors and windows to show", selector: { entity: { multiple: true, domain: "binary_sensor" } } },
        { type: "grid", name: "", schema: [{ name: "confirm", label: "Ask before arming or disarming", selector: { boolean: {} } }, { name: "radius", selector: slider(0, 40, 2) }] },
        THEME_FIELD,
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) { return { entity: Object.keys(hass.states).find((id) => id.startsWith("alarm_control_panel.")) || "" }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  look(state) {
    return {
      disarmed: ["Disarmed", "mdi:shield-off-outline", COLORS.green], armed_away: ["Armed · away", "mdi:shield-lock", COLORS.blue], armed_home: ["Armed · home", "mdi:shield-home", COLORS.teal],
      armed_night: ["Armed · night", "mdi:shield-moon", COLORS.purple], armed_vacation: ["Armed · holiday", "mdi:shield-airplane", COLORS.blue], armed_custom_bypass: ["Armed", "mdi:shield-half-full", COLORS.blue],
      arming: ["Arming", "mdi:shield-sync", COLORS.amber], pending: ["Pending", "mdi:shield-alert-outline", COLORS.amber], triggered: ["Alarm!", "mdi:bell-ring", COLORS.coral],
    }[state] || [state ? state.charAt(0).toUpperCase() + state.slice(1) : "Not found", "mdi:shield-outline", COLORS.slate];
  }

  // the original big shield with large buttons (style: big)
  bigHtml(c, p, s, word, icon, g, armed, busy, label, doors, open) {
    return `<style>${this.baseCss()}
      .card{${panelCss(p, c.radius)};padding:18px;display:flex;flex-direction:column;gap:16px}
      .top{display:flex;align-items:center;gap:16px}
      .sh{position:relative;width:72px;height:72px;border-radius:24px;flex:none;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};box-shadow:0 14px 30px -12px ${g[2]}}
      .sh ha-icon{--mdc-icon-size:36px;${s?.state === "triggered" ? "animation:roost-wiggle .5s ease-in-out infinite" : busy ? "animation:roost-pulse 1.2s ease-in-out infinite" : ""}}
      .sh::after{content:"";position:absolute;inset:0;border-radius:inherit;border:2px solid ${g[1]};${armed ? "animation:roost-halo 2.4s ease-out infinite" : "display:none"}}
      @keyframes roost-halo{0%{transform:scale(1);opacity:.8}100%{transform:scale(1.3);opacity:0}}
      .n{font-size:13px;color:${p.muted}}
      .w{font-size:24px;font-weight:700;line-height:1.2}
      .d{font-size:13px;color:${open.length ? "#FF9F6B" : p.muted};margin-top:3px}
      .btns{display:grid;grid-template-columns:repeat(${Math.max(1, (c.modes || []).length + 1)},minmax(0,1fr));gap:8px}
      .top > span:last-child{min-width:0}
      @container (max-width: 320px){:host .top{flex-direction:column;align-items:flex-start;gap:10px}:host .btns{grid-template-columns:repeat(2,minmax(0,1fr))}:host .sh{width:56px;height:56px;border-radius:18px}}
      .b{min-height:64px;border-radius:16px;border:1px solid ${p.border};background:${p.off};${p.fx || ""};color:${p.text};font:inherit;font-size:13px;font-weight:600;cursor:pointer;
        display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:6px 4px;-webkit-tap-highlight-color:transparent;transition:transform .12s}
      .b:active{transform:scale(.95)}
      .b ha-icon{--mdc-icon-size:22px}
      .b.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};border-color:transparent;box-shadow:0 10px 22px -10px ${g[2]}}
      .pad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
      .pad button{height:48px;border-radius:14px;border:1px solid ${p.border};background:${p.off};${p.fx || ""};color:${p.text};font:inherit;font-size:20px;font-weight:600;cursor:pointer}
      .code{text-align:center;font-size:24px;letter-spacing:8px;min-height:30px;color:${p.text}}
      .doors{display:flex;flex-wrap:wrap;gap:6px}
      .dr{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;font-size:13px;background:${p.inset};color:${p.text};cursor:pointer}
      .dr ha-icon{--mdc-icon-size:16px}
    </style>
    <div class="card">
      <div class="top"><span class="sh" data-pop="${esc(s?.state || "")}" data-popkey="sh"><ha-icon icon="${icon}"></ha-icon></span>
        <span><div class="n t">${esc(this.name(c.entity, "Alarm"))}</div><div class="w t">${esc(word)}</div>${doors.length ? `<div class="d t">${open.length ? `${open.length} open: ${esc(open.map((d) => d.attributes.friendly_name).join(", "))}` : "All doors closed"}</div>` : ""}</span></div>
      ${this._pending ? `<div class="code num">${"•".repeat(this._code.length) || "&nbsp;"}</div><div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, "×", 0, "✓"].map((k) => `<button data-k="${k}">${k}</button>`).join("")}</div>` : `
      <div class="btns">${(c.modes || []).map((m) => `<button class="b ${s?.state === m.replace("arm_", "armed_") ? "on" : ""}" data-m="${m}"><ha-icon icon="${label[m]?.[1] || "mdi:shield"}"></ha-icon>${esc(label[m]?.[0] || m)}</button>`).join("")}
        <button class="b ${s?.state === "disarmed" ? "on" : ""}" data-m="disarm"><ha-icon icon="mdi:shield-off-outline"></ha-icon>Off</button></div>`}
      ${doors.length ? `<div class="doors">${doors.map((d) => `<span class="dr" data-e="${esc(d.entity_id)}"><ha-icon icon="${d.state === "on" ? "mdi:door-open" : "mdi:door-closed"}" style="color:${d.state === "on" ? "#FF9F6B" : "#3DD68C"}"></ha-icon>${esc(d.attributes.friendly_name || d.entity_id)}</span>`).join("")}</div>` : ""}
    </div>`;
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, s = this.st();
    const [word, icon, g] = this.look(s?.state);
    const armed = s && s.state !== "disarmed" && !UNAVAILABLE.includes(s.state);
    const busy = ["arming", "pending", "triggered"].includes(s?.state);
    const needCode = !!s?.attributes.code_format && s?.attributes.code_arm_required !== false;
    const label = { arm_away: ["Away", "mdi:shield-lock"], arm_home: ["Home", "mdi:shield-home"], arm_night: ["Night", "mdi:shield-moon"], arm_vacation: ["Holiday", "mdi:shield-airplane"] };
    const doors = (c.doors || []).map((id) => this.sx(id)).filter(Boolean);
    const open = doors.filter((d) => d.state === "on");
    if (c.style === "pills" && !this._pending) {
      const PILLS = [["disarm", "Disarm", "linear-gradient(135deg,#10B981,#34D399)", "disarmed"], ["arm_home", "Arm home", "linear-gradient(135deg,#2F6BFF,#38BDF8)", "armed_home"], ["arm_away", "Arm away", "linear-gradient(135deg,#F43F6B,#FF8F6B)", "armed_away"], ["arm_night", "Arm night", "linear-gradient(135deg,#6D4BFF,#B794FF)", "armed_night"]]
        .filter(([m]) => m === "disarm" || (c.modes || []).includes(m));
      this.shadowRoot.innerHTML = `<style>${this.baseCss()}
        :host{padding:0 ${Number(c.inset ?? 8)}px}
        .tt{font-size:17px;font-weight:700;letter-spacing:-.2px;padding:10px 6px 4px;color:${p.text}}
        .ps{display:grid;grid-template-columns:repeat(${PILLS.length},minmax(0,1fr));gap:8px;margin-top:8px}
        .pl{padding:10px 0;border-radius:14px;border:0;font:inherit;font-size:13px;font-weight:600;cursor:pointer;background:${p.inset};color:${p.text};-webkit-tap-highlight-color:transparent;transition:transform .12s}
        .pl:active{transform:scale(.96)}
      </style>${c.name !== "" ? `<div class="tt t">${esc(c.name || "Alarm")}</div>` : ""}<div class="ps">${PILLS.map(([m, w, bg, st]) => `<button class="pl" data-m="${m}" style="${s?.state === st ? `background:${bg};color:#fff` : ""}">${w}</button>`).join("")}</div>`;
    } else if (c.style === "big") this.shadowRoot.innerHTML = this.bigHtml(c, p, s, word, icon, g, armed, busy, label, doors, open);
    else {
      // The compact alarm: one row with the state, then a slim segmented switch, the same size as the other cards.
      const modes = [...(c.modes || []), "disarm"];
      this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${panelCss(p, c.radius)};padding:16px;display:flex;flex-direction:column;gap:14px}
      .top{display:flex;align-items:center;gap:12px;min-width:0}
      .sh{position:relative;width:44px;height:44px;border-radius:14px;flex:none;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${g[0]},${g[1]});color:#FFFFFF;box-shadow:0 10px 22px -12px ${g[2]}}
      .sh ha-icon{--mdc-icon-size:22px;${s?.state === "triggered" ? "animation:roost-wiggle .5s ease-in-out infinite" : busy ? "animation:roost-pulse 1.2s ease-in-out infinite" : ""}}
      .sh::after{content:"";position:absolute;inset:0;border-radius:inherit;border:2px solid ${g[1]};${armed ? "animation:roost-halo 2.4s ease-out infinite" : "display:none"}}
      @keyframes roost-halo{0%{transform:scale(1);opacity:.8}100%{transform:scale(1.3);opacity:0}}
      .tx{flex:1;min-width:0}
      .w{font-size:15px;font-weight:600;line-height:1.25}
      .d{font-size:12px;color:${open.length ? "#FF9F6B" : p.muted};margin-top:2px}
      .seg{display:grid;grid-template-columns:repeat(${modes.length},minmax(0,1fr));gap:4px;padding:4px;border-radius:16px;background:${p.inset}}
      .b{height:40px;border-radius:12px;border:0;background:transparent;color:${p.muted};font:inherit;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;padding:0 6px;-webkit-tap-highlight-color:transparent;transition:transform .12s,background .12s,color .12s}
      .b:active{transform:scale(.95)}
      .b ha-icon{--mdc-icon-size:18px;flex:none}
      .b.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:#FFFFFF;box-shadow:0 8px 18px -10px ${g[2]}}
      @container (max-width: 300px){:host .b span{display:none}}
      .pad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
      .pad button{height:44px;border-radius:14px;border:1px solid ${p.border};background:${p.off};color:${p.text};font:inherit;font-size:17px;font-weight:600;cursor:pointer}
      .code{text-align:center;font-size:20px;letter-spacing:8px;min-height:24px;color:${p.text}}
      .doors{display:flex;flex-wrap:wrap;gap:6px}
      .dr{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;font-size:12px;background:${p.inset};color:${p.text};cursor:pointer}
      .dr ha-icon{--mdc-icon-size:16px}
    </style>
    <div class="card">
      <div class="top"><span class="sh" data-pop="${esc(s?.state || "")}" data-popkey="sh"><ha-icon icon="${icon}"></ha-icon></span>
        <span class="tx"><div class="w t">${esc(c.name || this.name(c.entity, "Alarm"))} · ${esc(word.replace("Armed · ", "armed ").replace(/^Disarmed$/, "off"))}</div>${doors.length ? `<div class="d t">${open.length ? `${open.length} open: ${esc(open.map((d) => d.attributes.friendly_name).join(", "))}` : "All doors closed"}</div>` : ""}</span></div>
      ${this._pending ? `<div class="code num">${"•".repeat(this._code.length) || "&nbsp;"}</div><div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, "×", 0, "✓"].map((k) => `<button data-k="${k}">${k}</button>`).join("")}</div>`
    : `<div class="seg" role="radiogroup">${modes.map((m) => { const on = m === "disarm" ? s?.state === "disarmed" : s?.state === m.replace("arm_", "armed_"); const [w, ic] = m === "disarm" ? ["Off", "mdi:shield-off-outline"] : label[m] || [m, "mdi:shield"]; return `<button class="b ${on ? "on" : ""}" data-m="${m}" role="radio" aria-checked="${on}" aria-label="${esc(w)}"><ha-icon icon="${ic}"></ha-icon><span>${esc(w)}</span></button>`; }).join("")}</div>`}
      ${c.show_doors && doors.length ? `<div class="doors">${doors.map((d) => `<span class="dr" data-e="${esc(d.entity_id)}"><ha-icon icon="${d.state === "on" ? "mdi:door-open" : "mdi:door-closed"}" style="color:${d.state === "on" ? "#FF9F6B" : "#3DD68C"}"></ha-icon>${esc(d.attributes.friendly_name || d.entity_id)}</span>`).join("")}</div>` : ""}
    </div>`;
    }
    const root = this.shadowRoot;
    root.querySelectorAll("[data-e]").forEach((el) => el.addEventListener("click", () => this.moreInfo(el.dataset.e)));
    root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", async () => {
      const m = b.dataset.m;
      const text = m === "disarm" ? "Turn the alarm off?" : `Arm the alarm (${label[m]?.[0] || m})?${open.length ? ` ${open.length} door${open.length > 1 ? "s are" : " is"} open.` : ""}`;
      if (c.confirm && !(await RoostPop.confirm(text))) return;
      this.vibrate();
      if (needCode || (m === "disarm" && s?.attributes.code_format)) { this._pending = m; this._code = ""; this._sig = null; this.render(); return; }
      this.call("alarm_control_panel", m === "disarm" ? "alarm_disarm" : `alarm_${m}`, { entity_id: c.entity });
    }));
    root.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.k;
      this.vibrate(8);
      if (k === "×") { this._pending = null; this._code = ""; }
      else if (k === "✓") { const m = this._pending; this._pending = null; this.call("alarm_control_panel", m === "disarm" ? "alarm_disarm" : `alarm_${m}`, { entity_id: c.entity, code: this._code }); this._code = ""; }
      else this._code += k;
      this._sig = null; this.render();
    }));
  }
}

// ------------------------------------------------------------------ Roost Light
// One light with its brightness you drag, warm-to-cool presets and colour dots.
// Warm whites and ambers keep the card's own amber gradient; a picked colour gets its own.
const warmTone = ([r, g, b]) => r > 200 && g > 120 && b < 200 && r - b > 60;

class RoostLight extends RoostBase {
  static get defaults() { return { color: "amber", show_presets: true, show_colors: true, radius: 22, theme: "auto" }; }

  validate(c) { if (!c.entity) throw new Error("Choose a light"); }

  static getConfigForm() {
    return {
      schema: [
        { name: "entity", required: true, selector: { entity: { domain: "light" } } },
        { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "icon", selector: { icon: {} } }] },
        { type: "grid", name: "", schema: [{ name: "show_presets", label: "Warm / neutral / cool buttons", selector: { boolean: {} } }, { name: "show_colors", label: "Colour dots (colour bulbs)", selector: { boolean: {} } }] },
        ...colourFields("color", "Bar colour"),
        { type: "grid", name: "", schema: [{ name: "radius", selector: slider(0, 40, 2) }, THEME_FIELD] },
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) { return { entity: Object.keys(hass.states).find((id) => id.startsWith("light.")) || "" }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour(), s = this.st();
    const un = !s || UNAVAILABLE.includes(s.state), on = s?.state === "on";
    const a = s?.attributes || {};
    const modes = a.supported_color_modes || [];
    const dims = modes.some((m) => m !== "onoff");
    const temps = modes.includes("color_temp");
    const colours = modes.some((m) => ["hs", "rgb", "rgbw", "rgbww", "xy"].includes(m));
    const pct = on ? (a.brightness != null ? Math.round(a.brightness / 2.55) : 100) : 0;
    const tint = on && a.rgb_color ? `rgb(${a.rgb_color.join(",")})` : g[1];
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${switchCss(p, g)}
      .card{${panelCss(p, c.radius)};padding:16px;display:flex;flex-direction:column;gap:14px;opacity:${un ? 0.6 : 1}}
      .top{display:flex;align-items:center;gap:12px}
      :host{container-type:inline-size}
      @container (max-width: 240px){:host .top{flex-wrap:wrap}:host .tx{flex:1 1 100%}}
      .ic{position:relative;width:48px;height:48px;border-radius:16px;flex:none;display:flex;align-items:center;justify-content:center;background:${on ? `linear-gradient(135deg,${g[0]},${g[1]})` : p.inset};color:${on ? g[3] : p.muted};cursor:pointer;
        box-shadow:${on ? `0 0 ${10 + pct / 3}px ${Math.round(pct / 12)}px ${tint}66` : "none"}}
      .ic ha-icon{--mdc-icon-size:24px;${on ? "animation:roost-glow 2.4s ease-in-out infinite" : ""}}
      .tx{flex:1;min-width:0}
      .n{font-size:15px;font-weight:600;line-height:1.25}
      .l{font-size:13px;color:${p.muted};margin-top:2px}
      .pc{font-size:32px;font-weight:700;color:${on ? p.text : p.muted}}
      .bar{position:relative;height:52px;border-radius:18px;background:${p.inset};overflow:hidden;cursor:pointer;touch-action:none}
      .bar .f{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,${on && a.rgb_color && !warmTone(a.rgb_color) ? `color-mix(in srgb, ${tint} 70%, #fff)` : g[0]},${tint});border-radius:18px}
      .bar ha-icon{position:absolute;left:14px;top:14px;--mdc-icon-size:24px;color:${on ? (a.rgb_color && !warmTone(a.rgb_color) ? "#fff" : g[3]) : p.muted}}
      .chips{display:flex;flex-wrap:wrap;gap:8px}
      .chips button{flex:none;height:36px;padding:0 12px;border-radius:999px;border:1px solid ${p.border};background:${p.off};${p.fx || ""};color:${p.text};font:inherit;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px}
      .chips button i{display:block;width:14px;height:14px;border-radius:50%}
      .dotc{width:36px;padding:0!important;justify-content:center}
    </style>
    <div class="card">
      <div class="top"><span class="ic" data-more data-pop="${on ? 1 : 0}" data-popkey="ic"><ha-icon icon="${esc(c.icon || (on ? "mdi:lightbulb-on" : "mdi:lightbulb-outline"))}"></ha-icon></span>
        <span class="tx"><div class="n t">${esc(this.name(c.entity))}</div><div class="l t">${!s ? "Device not found" : un ? "Offline" : on ? "On" : "Off"}</div></span>
        ${dims ? `<span class="pc num" data-tw="pc">${pct}%</span>` : ""}<span class="sw ${on ? "on" : ""}" role="switch" aria-checked="${on}"></span></div>
      ${dims ? `<div class="bar" role="slider" aria-valuenow="${pct}"><span class="f" data-bar="br" style="width:${pct}%"></span><ha-icon icon="mdi:brightness-6"></ha-icon></div>` : ""}
      ${(temps && c.show_presets) || (colours && c.show_colors) ? `<div class="chips">
        ${temps && c.show_presets ? [["Warm", 2700, "#FFB45A"], ["Neutral", 4000, "#FFE7C2"], ["Cool", 6000, "#CFE6FF"]].map(([w, k, col]) => `<button data-k="${k}"><i style="background:${col}"></i>${w}</button>`).join("") : ""}
        ${colours && c.show_colors ? ["#FF5A5F", "#FFB020", "#3DD68C", "#38BDF8", "#8B6CFF", "#F472B6"].map((col) => `<button class="dotc" data-rgb="${col}" aria-label="Colour"><i style="background:${col}"></i></button>`).join("") : ""}</div>` : ""}
    </div>`;
    const root = this.shadowRoot;
    root.querySelector("[data-more]").addEventListener("click", () => this.moreInfo(c.entity));
    root.querySelector(".sw").addEventListener("click", () => { this.vibrate(); this.call("light", "toggle", { entity_id: c.entity }); });
    root.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => { this.vibrate(); this.call("light", "turn_on", { entity_id: c.entity, color_temp_kelvin: +b.dataset.k }); }));
    root.querySelectorAll("[data-rgb]").forEach((b) => b.addEventListener("click", () => {
      this.vibrate();
      const h = b.dataset.rgb.slice(1);
      this.call("light", "turn_on", { entity_id: c.entity, rgb_color: [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) });
    }));
    const bar = root.querySelector(".bar");
    if (bar) {
      const set = (ev, done) => {
        const r = bar.getBoundingClientRect(), f = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
        bar.querySelector(".f").style.width = `${Math.round(f * 100)}%`;
        const pc = root.querySelector(".pc"); if (pc) pc.textContent = `${Math.round(f * 100)}%`;
        if (done) this.call("light", f < 0.01 ? "turn_off" : "turn_on", f < 0.01 ? { entity_id: c.entity } : { entity_id: c.entity, brightness_pct: Math.max(1, Math.round(f * 100)) });
      };
      bar.addEventListener("pointerdown", (ev) => { bar.setPointerCapture(ev.pointerId); this._drag = true; set(ev); });
      bar.addEventListener("pointermove", (ev) => { if (this._drag) set(ev); });
      bar.addEventListener("pointerup", (ev) => { if (this._drag) { this._drag = false; this.vibrate(); set(ev, true); } });
    }
  }
}

// ------------------------------------------------------------------ water that moves like water
// The surface is a row of small springs (the classic wave simulation): each point is pulled back to the water level
// and tugs on its neighbours, so a ripple travels across and fades out. When the level changes the whole body of
// water overshoots, rocks from side to side and settles, like a tank being filled. Bubbles, a pump or a falling
// stream keep stirring it; a tap on the water makes a splash. One shared loop, paused off screen, in hidden tabs and
// for people who ask their phone for reduced motion.
class RoostWaterSim {
  constructor(n = 26) { this.n = n; this.h = new Float32Array(n); this.v = new Float32Array(n); this.y = null; this.vy = 0; this.target = 0; this.tilt = 0; this.vt = 0; this.t = 0; this.next = 0; this.visible = true; }

  setLevel(l) {
    if (this.y == null) { this.y = l; this.target = l; return; }
    const d = l - this.target;
    if (Math.abs(d) > 0.003) { this.vt += Math.sign(d) * Math.min(0.05, Math.abs(d) * 0.5); this.poke(0.5, Math.max(-6, Math.min(6, -d * 40))); }
    this.target = l;
  }

  poke(xf, f) {
    const i = Math.round(Math.max(0, Math.min(1, xf)) * (this.n - 1));
    for (let k = -2; k <= 2; k++) { const j = i + k; if (j >= 0 && j < this.n) this.v[j] += f * (1 - Math.abs(k) / 3); }
  }

  step() {
    const o = this.opts || {}, n = this.n, h = this.h, v = this.v;
    // the whole body of water: an under-damped spring, so a new level overshoots a little and settles
    this.vy += (this.target - this.y) * 0.01 - this.vy * 0.12; this.y += this.vy;
    // rocking from side to side after a change, fading away
    this.vt += -this.tilt * 0.018 - this.vt * 0.03; this.tilt += this.vt;
    for (let i = 0; i < n; i++) { v[i] += -h[i] * 0.02 - v[i] * 0.028; h[i] += v[i]; }
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < n; i++) {
        if (i > 0) { const d = 0.22 * (h[i] - h[i - 1]); v[i - 1] += d; }
        if (i < n - 1) { const d = 0.22 * (h[i] - h[i + 1]); v[i + 1] += d; }
      }
    }
    // a living surface: small random touches, more when something stirs the water
    if (this.t >= this.next) { this.poke(Math.random(), (Math.random() - 0.5) * (0.5 + (o.stir || 0) * 2.6)); this.next = this.t + 18 + Math.random() * 36 * (1 - (o.stir || 0) * 0.6); }
    if (o.drip != null && this.t % 16 === 0) this.poke(o.drip + (Math.random() - 0.5) * 0.04, 0.9);
    this.t++;
  }

  draw() {
    const o = this.opts, f = this.svg?.querySelector("[data-wf]");
    if (!o || !f) return;
    const n = this.n, w = o.x1 - o.x0, ly = o.bottom - Math.max(0, Math.min(1.02, this.y)) * (o.bottom - o.top);
    const pt = (i, k, mirror) => [o.x0 + (w * i) / (n - 1), ly + (mirror ? -this.h[n - 1 - i] * 0.6 - 2 : this.h[i]) + this.tilt * (i / (n - 1) - 0.5) * w * k];
    const front = Array.from({ length: n }, (_, i) => pt(i, 1)), back = Array.from({ length: n }, (_, i) => pt(i, 0.7, true));
    const close = (pts) => `${curvePath(pts)} L${o.x1 + 4},${o.bottom + 8} L${o.x0 - 4},${o.bottom + 8} Z`;
    f.setAttribute("d", close(front));
    this.svg.querySelector("[data-wb]")?.setAttribute("d", close(back));
    this.svg.querySelector("[data-ws]")?.setAttribute("d", curvePath(front));
  }
}

const RoostWater = {
  sims: new Set(), raf: 0, last: 0, acc: 0, io: null,

  still() { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } },

  // card: the card keeping the water; key: which water in it; svg: holds [data-wf] (front), [data-wb] (back), [data-ws] (shine)
  // opts: { x0, x1, top, bottom } in the svg's units, level 0..1, stir 0..1, drip: 0..1 (where a stream falls) or null
  bind(card, key, svg, opts) {
    if (!svg) return;
    const sims = card._waters || (card._waters = {});
    const sim = sims[key] || (sims[key] = new RoostWaterSim(opts.points || 26));
    sim.opts = opts; sim.setLevel(opts.level);
    if (sim.svg !== svg) {
      sim.svg = svg;
      svg.addEventListener("pointerdown", (e) => { const b = svg.getBoundingClientRect(); sim.poke((e.clientX - b.left) / b.width, 7); sim.vt += (Math.random() - 0.5) * 0.02; });
      try { if (!this.io && window.IntersectionObserver) this.io = new IntersectionObserver((es) => es.forEach((x) => { x.target.__roostSim && (x.target.__roostSim.visible = x.isIntersecting); })); svg.__roostSim = sim; this.io?.observe(svg); } catch (e) { /* old browser: always drawn */ }
    }
    sim.draw();
    this.sims.add(sim);
    if (!this.raf && !this.still()) this.raf = (window.requestAnimationFrame || ((fn) => setTimeout(() => fn(performance.now()), 16)))((t) => this.loop(t));
  },

  loop(t) {
    this.raf = 0;
    const dt = this.last ? Math.min(100, t - this.last) : 16.7; this.last = t;
    this.acc += dt;
    const steps = Math.min(4, Math.floor(this.acc / 16.7)); this.acc -= steps * 16.7;
    for (const s of this.sims) {
      if (!s.svg || !s.svg.isConnected) { this.sims.delete(s); continue; }
      if (document.hidden || !s.visible) continue;
      for (let k = 0; k < steps; k++) s.step();
      s.draw();
    }
    if (this.sims.size && !this.still()) this.raf = (window.requestAnimationFrame || ((fn) => setTimeout(() => fn(performance.now()), 16)))((tt) => this.loop(tt));
    else this.last = 0;
  },
};

// ------------------------------------------------------------------ Roost Graph
// A smooth line of one reading over the last hours, with now, lowest and highest.
// A calm line for sensor history: readings are grouped into small time slots and
// gently evened out, so tiny ups and downs read as one smooth curve. A real jump
// (bigger than about a tenth of the chart) is kept sharp and is never smoothed away.
function smoothLine(xy, W, h) {
  if (xy.length < 3) return xy;
  const slot = W / 60, out = [];
  for (const [x, y] of xy) {
    const last = out[out.length - 1];
    if (last && x - last.x0 < slot) { last.sy += y; last.n++; last.x = x; } else out.push({ x0: x, x, sy: y, n: 1 });
  }
  let pts = out.map((b) => [b.x, b.sy / b.n]);
  if (pts.length > 1) pts[pts.length - 1] = xy[xy.length - 1];
  const jump = h * 0.1;
  for (let pass = 0; pass < 3; pass++) {
    pts = pts.map((pt, i) => {
      if (i === 0 || i === pts.length - 1) return pt;
      const a = pts[i - 1][1], b = pts[i + 1][1];
      if (Math.abs(pt[1] - a) > jump || Math.abs(pt[1] - b) > jump) return pt;
      return [pt[0], (a + 2 * pt[1] + b) / 4];
    });
  }
  return pts;
}

// Smooth path through points that never overshoots (no fake bumps above or below the readings).
function curvePath(pts) {
  const n = pts.length;
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  if (n < 3) return d + pts.slice(1).map(([x, y]) => ` L${x.toFixed(1)},${y.toFixed(1)}`).join("");
  const dx = [], m = [], t = [];
  for (let i = 0; i < n - 1; i++) { dx[i] = (pts[i + 1][0] - pts[i][0]) || 1e-6; m[i] = (pts[i + 1][1] - pts[i][1]) / dx[i]; }
  t[0] = m[0]; t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]);
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], h3 = dx[i] / 3;
    d += ` C${(x0 + h3).toFixed(1)},${(y0 + t[i] * h3).toFixed(1)} ${(x1 - h3).toFixed(1)},${(y1 - t[i + 1] * h3).toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
  }
  return d;
}

class RoostGraph extends RoostBase {
  static get defaults() { return { hours: 24, color: "blue", height: 90, show_stats: true, fill: true, radius: 22, theme: "auto" }; }

  validate(c) { if (!c.entity) throw new Error("Choose a reading (sensor)"); }

  static getConfigForm() {
    return {
      schema: [
        { name: "entity", required: true, selector: { entity: {} } },
        { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "hours", label: "Hours to show", selector: { number: { min: 1, max: 168, mode: "box" } } }] },
        { type: "expandable", name: "", title: "Look", icon: "mdi:palette", schema: [
          ...colourFields("color", "Line colour"),
          { type: "grid", name: "", schema: [{ name: "height", label: "Graph height", selector: slider(50, 200, 10) }, { name: "radius", selector: slider(0, 40, 2) }] },
          { type: "grid", name: "", schema: [{ name: "fill", label: "Soft colour under the line", selector: { boolean: {} } }, { name: "show_stats", label: "Now / lowest / highest", selector: { boolean: {} } }] },
          { type: "grid", name: "", schema: [{ name: "unit", selector: { text: {} } }, { name: "decimals", selector: { number: { min: 0, max: 3, mode: "box" } } }] },
          THEME_FIELD,
        ] },
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) { return { entity: Object.keys(hass.states).find((id) => id.startsWith("sensor.") && num(hass.states[id].state) != null) || "" }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  connectedCallback() { this._timer = setInterval(() => this.load(), 5 * 60000); }

  disconnectedCallback() { clearInterval(this._timer); }

  async load() {
    const c = this._config, h = this._hass;
    if (!h?.callWS || !c?.entity) return;
    const start = new Date(Date.now() - c.hours * 3600e3).toISOString();
    try {
      const r = await h.callWS({ type: "history/history_during_period", start_time: start, entity_ids: [c.entity], minimal_response: true, no_attributes: true, significant_changes_only: false });
      const rows = r?.[c.entity] || [];
      this._points = rows.map((x) => [new Date((x.lu ?? x.lc ?? 0) * 1000 || x.last_updated || x.last_changed).getTime(), num(x.s ?? x.state)]).filter((x) => x[1] != null && x[0]);
    } catch (e) { this._points = this._points || []; }
    this._loadedFor = `${c.entity}|${c.hours}`;
    this._sig = null;
    this.hass = this._hass;
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour(), s = this.st();
    if (this._loadedFor !== `${c.entity}|${c.hours}` && !this._loading) { this._loading = true; this.load().finally(() => { this._loading = false; }); }
    const now = s ? num(s.state) : null;
    const pts = [...(this._points || [])];
    if (now != null) pts.push([Date.now(), now]);
    // the reading was already this before the first change in the window, so the line starts at the left edge
    if (pts.length && pts[0][0] > Date.now() - c.hours * 3600e3) pts.unshift([Date.now() - c.hours * 3600e3, pts[0][1]]);
    const vals = pts.map((x) => x[1]);
    const lo = vals.length ? Math.min(...vals) : null, hi = vals.length ? Math.max(...vals) : null;
    const unit = c.unit != null && c.unit !== "" ? c.unit : s?.attributes.unit_of_measurement || "";
    const u2 = unitGap(unit);
    const W = 300, H = c.height, t0 = Date.now() - c.hours * 3600e3;
    let path = "", area = "";
    if (pts.length > 1) {
      const flat = hi === lo, span = (hi - lo) || 1;
      const xy = pts.map(([t, v]) => [Math.max(0, (t - t0) / (c.hours * 3600e3)) * W, flat ? H * 0.55 : H - 6 - ((v - lo) / span) * (H - 16)]);
      this._end = xy[xy.length - 1];
      const sm = smoothLine(xy, W, H - 16);
      path = curvePath(sm);
      area = `${path} L${sm[sm.length - 1][0].toFixed(1)},${H} L${sm[0][0].toFixed(1)},${H} Z`;
    }
    const st = (w, v) => `<div class="s"><span>${w}</span><b class="num">${v == null ? "" : esc(fmt(v, c.decimals) + u2)}</b></div>`;
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${panelCss(p, c.radius)};padding:16px;display:flex;flex-direction:column;gap:10px;cursor:pointer}
      .top{display:flex;justify-content:space-between;align-items:baseline;gap:10px}
      .n{font-size:15px;font-weight:600}
      .v{font-size:24px;font-weight:700}
      svg{display:block;width:100%;height:${H}px}
      .gw{position:relative}
      .nd{position:absolute;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;background:${g[1]};box-shadow:0 0 0 3px ${p.panel.startsWith("rgba") ? (this.dark ? "#141831" : "#fff") : p.panel}}
      .nd i{position:absolute;inset:0;border-radius:50%;background:${g[1]};animation:roost-ping 2s ease-out infinite}
      .ln{fill:none;stroke:url(#lg);stroke-width:3;stroke-linecap:round}
      .stats{display:flex;justify-content:space-between;gap:8px}
      .s{display:flex;flex-direction:column;font-size:12px;color:${p.muted}}
      .s b{font-size:14px;color:${p.text}}
      .wait{height:${H}px;display:flex;align-items:center;justify-content:center;color:${p.muted};font-size:13px}
    </style>
    <div class="card" role="button" tabindex="0">
      <div class="top"><span class="n t">${esc(this.name(c.entity))}</span><span class="v num" ${now != null ? 'data-tw="now"' : ""}>${now != null ? esc(fmt(now, c.decimals ?? decOf(s.state, unit)) + u2) : s ? esc(s.state) : "Not found"}</span></div>
      ${path ? `<div class="gw"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs>
          <linearGradient id="lg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="0"><stop offset="0" stop-color="${g[0]}"/><stop offset="1" stop-color="${g[1]}"/></linearGradient>
          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${g[1]}" stop-opacity="${hi === lo ? ".18" : ".35"}"/><stop offset="1" stop-color="${g[1]}" stop-opacity="0"/></linearGradient></defs>
          ${c.fill ? `<path d="${area}" fill="url(#ag)"/>` : ""}<path class="ln" d="${path}" vector-effect="non-scaling-stroke"/></svg>
          ${now != null && this._end ? `<span class="nd" style="left:${((this._end[0] / W) * 100).toFixed(1)}%;top:${this._end[1].toFixed(1)}px"><i></i></span>` : ""}</div>`
        : `<div class="wait t">${this._loadedFor ? "Not enough readings yet" : "Loading"}</div>`}
      ${c.show_stats ? `<div class="stats">${lo != null ? st("Lowest", lo) : ""}<div class="s" style="text-align:center"><span>Last ${c.hours} h</span></div>${hi != null ? st("Highest", hi) : ""}</div>` : ""}
    </div>`;
    this.press(this.shadowRoot.querySelector(".card"), () => this.moreInfo(c.entity), () => this.moreInfo(c.entity));
  }
}

// ------------------------------------------------------------------ Roost People
// Who is home: a picture (or initials) with a green ring when home, and for how long.
class RoostPeople extends ticking(RoostBase, 60000) {
  static get defaults() { return { entities: [], layout: "row", size: 56, show_since: true, theme: "auto" }; }

  validate(c) { if (!Array.isArray(c.entities) || !c.entities.length) throw new Error("Pick the people"); }

  watched() { return this._config.entities; }

  static getConfigForm() {
    return {
      schema: [
        { name: "entities", label: "People", selector: { entity: { multiple: true, domain: ["person", "device_tracker"] } } },
        { type: "grid", name: "", schema: [{ name: "layout", selector: pick([["row", "Side by side"], ["list", "A list"]]) }, { name: "size", label: "Picture size", selector: slider(36, 96, 2) }] },
        { name: "show_since", label: "How long home or away", selector: { boolean: {} } },
        THEME_FIELD,
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) { return { entities: Object.keys(hass.states).filter((id) => id.startsWith("person.")).slice(0, 3) }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, list = c.layout === "list";
    const ppl = c.entities.map((id) => this.sx(id)).filter(Boolean);
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .wrap{${panelCss(p)};padding:16px;display:${list ? "flex;flex-direction:column;gap:12px" : `grid;grid-template-columns:repeat(auto-fit,minmax(${c.size + 24}px,1fr));gap:12px`}}
      .pp{display:flex;${list ? "flex-direction:row;align-items:center;gap:12px" : "flex-direction:column;align-items:center;gap:6px;text-align:center"};cursor:pointer}
      .av{position:relative;width:${c.size}px;height:${c.size}px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${Math.round(c.size * 0.36)}px;overflow:hidden}
      .av img{width:100%;height:100%;object-fit:cover}
      .ring{position:relative;padding:4px;border-radius:50%}
      .ring.home{background:linear-gradient(135deg,#10B981,#6EE7B7)}
      .ring.away{background:${p.track}}
      .ring.away .av{filter:grayscale(.7);opacity:.75}
      .b{position:absolute;right:0;bottom:0;width:${Math.round(c.size * 0.3)}px;height:${Math.round(c.size * 0.3)}px;border-radius:50%;border:3px solid ${this.dark ? "#141831" : "#fff"};display:flex;align-items:center;justify-content:center;font-size:0}
      .home .b{background:#10B981}
      .ring.home::after{content:"";position:absolute;inset:0;border-radius:50%;border:2px solid #10B981;animation:roost-halo2 2.6s ease-out infinite;pointer-events:none}
      @keyframes roost-halo2{0%{transform:scale(1);opacity:.6}100%{transform:scale(1.22);opacity:0}}
      .away .b{background:${p.knob}}
      .n{font-size:14px;font-weight:600;color:${p.text}}
      .l{font-size:12px;color:${p.muted}}
    </style>
    <div class="wrap">${ppl.map((s) => {
      const home = s.state === "home", pic = s.attributes.entity_picture;
      const nm = s.attributes.friendly_name || s.entity_id;
      const where = home ? "Home" : s.state === "not_home" ? "Away" : UNAVAILABLE.includes(s.state) ? "Location off" : nice(s.state);
      const hue = [...nm].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 360;
      return `<div class="pp" data-e="${esc(s.entity_id)}" role="button" tabindex="0"><span class="ring ${home ? "home" : "away"}" data-pop="${home ? 1 : 0}" data-popkey="${esc(s.entity_id)}"><span class="av" style="background:hsl(${hue} 55% 50%);color:#fff">${pic ? `<img src="${esc(pic)}" alt="">` : esc(nm.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase())}</span><span class="b"></span></span>
        <span><div class="n t">${esc(nm.split(" ")[0])}</div><div class="l t">${esc(where)}${c.show_since && !UNAVAILABLE.includes(s.state) ? ` · ${esc(since(s.last_changed).replace(/^for /, ""))}` : ""}</div></span></div>`;
    }).join("")}</div>`;
    this.shadowRoot.querySelectorAll("[data-e]").forEach((el) => el.addEventListener("click", () => this.moreInfo(el.dataset.e)));
  }
}

// ------------------------------------------------------------------ Roost Alerts
// Only shows when something needs you: a low battery, a device that went offline, a door left open, or your own rules.
class RoostAlerts extends ticking(RoostBase, 60000) {
  static get defaults() { return { battery_below: 20, batteries: true, offline: [], doors: [], door_minutes: 10, rules: [], show_all_good: false, max: 5, theme: "auto" }; }

  watched() {
    const c = this._config, h = this._hass;
    const bats = c.batteries ? Object.keys(h?.states || {}).filter((id) => h.states[id].attributes.device_class === "battery" && id.startsWith("sensor.")) : [];
    return [...bats, ...(c.offline || []), ...(c.doors || []), ...(c.rules || []).map((r) => r.entity)].filter(Boolean);
  }

  static getConfigForm() {
    return {
      schema: [
        { type: "grid", name: "", schema: [{ name: "batteries", label: "Low batteries (all battery sensors)", selector: { boolean: {} } }, { name: "battery_below", label: "Low below", selector: slider(5, 50, 5, "%") }] },
        { name: "offline", label: "Tell me when these go offline", selector: { entity: { multiple: true } } },
        { name: "doors", label: "Doors and windows left open", selector: { entity: { multiple: true, domain: "binary_sensor" } } },
        { name: "door_minutes", label: "Open for longer than (minutes)", selector: { number: { min: 1, max: 240, mode: "box" } } },
        { name: "rules", label: "My own alerts", selector: { object: { multiple: true, label_field: "message", fields: {
          entity: { label: "Device or reading", required: true, selector: { entity: {} } },
          state: { label: "When it is (a word, for example on)", selector: { text: {} } },
          above: { label: "Or when above", selector: { number: { mode: "box" } } },
          below: { label: "Or when below", selector: { number: { mode: "box" } } },
          message: { label: "Message", required: true, selector: { text: {} } },
          icon: { label: "Icon", selector: { icon: {} } },
        } } } },
        { type: "grid", name: "", schema: [{ name: "show_all_good", label: "Say “All good” when there is nothing", selector: { boolean: {} } }, { name: "max", label: "Show at most", selector: { number: { min: 1, max: 20, mode: "box" } } }] },
        THEME_FIELD,
      ],
      computeLabel,
    };
  }

  static getStubConfig() { return { batteries: true }; }

  getGridOptions() { return { columns: 12, rows: "auto" }; }

  alerts() {
    const c = this._config, h = this._hass, out = [];
    const nm = (id) => h.states[id]?.attributes.friendly_name || id;
    for (const r of c.rules || []) {
      const s = h.states[r.entity]; if (!s) continue;
      const v = num(s.state);
      const hit = (r.state != null && r.state !== "" && s.state === String(r.state)) || (r.above != null && r.above !== "" && v != null && v > r.above) || (r.below != null && r.below !== "" && v != null && v < r.below);
      if (hit) out.push({ id: r.entity, icon: r.icon || "mdi:alert-circle-outline", text: r.message, tone: "#FF9F6B" });
    }
    for (const id of c.doors || []) {
      const s = h.states[id];
      if (s?.state === "on" && (Date.now() - new Date(s.last_changed)) / 60000 >= c.door_minutes) out.push({ id, icon: "mdi:door-open", text: `${nm(id)} open ${since(s.last_changed).replace(/^for /, "for ")}`, tone: "#FF9F6B" });
    }
    for (const id of c.offline || []) if (UNAVAILABLE.includes(h.states[id]?.state)) out.push({ id, icon: "mdi:lan-disconnect", text: `${nm(id)} is offline`, tone: "#F43F6B" });
    if (c.batteries) {
      Object.keys(h.states).filter((id) => id.startsWith("sensor.") && h.states[id].attributes.device_class === "battery").forEach((id) => {
        const v = num(h.states[id].state);
        if (v != null && v < c.battery_below) out.push({ id, icon: v < 10 ? "mdi:battery-alert-variant-outline" : "mdi:battery-low", text: `${nm(id).replace(/\s*battery$/i, "")} battery ${Math.round(v)}%`, tone: "#FCD34D" });
      });
    }
    return out;
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, list = this.alerts();
    if (!list.length && !c.show_all_good) { this.shadowRoot.innerHTML = "<style>:host{display:none}</style>"; this.style.display = "none"; return; }
    this.style.display = "";
    const shown = list.slice(0, c.max);
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .wrap{display:flex;flex-direction:column;gap:8px}
      .a{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:16px;background:${p.panel};${p.fx || ""};border:1px solid ${p.border};color:${p.text};cursor:pointer;border-left-width:4px}
      .a ha-icon{--mdc-icon-size:22px;flex:none;animation:roost-breathe 1.8s ease-in-out infinite}
      .a span{flex:1;font-size:13px;font-weight:600;line-height:1.3}
      .ok{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:16px;background:${p.panel};${p.fx || ""};border:1px solid ${p.border};color:${p.muted};font-size:13px}
      .ok ha-icon{color:#3DD68C;--mdc-icon-size:22px}
      .more{font-size:12px;color:${p.muted};text-align:center}
    </style>
    <div class="wrap">${shown.length ? shown.map((a) => `<div class="a" data-e="${esc(a.id)}" data-k="${esc(a.id + a.text)}" style="border-left-color:${a.tone}"><ha-icon icon="${esc(a.icon)}" style="color:${a.tone}"></ha-icon><span class="t">${esc(a.text)}</span></div>`).join("")
      : '<div class="ok"><ha-icon icon="mdi:check-circle-outline"></ha-icon><span class="t">All good</span></div>'}
      ${list.length > shown.length ? `<div class="more t">and ${list.length - shown.length} more</div>` : ""}</div>`;
    this.shadowRoot.querySelectorAll("[data-e]").forEach((el) => el.addEventListener("click", () => this.moreInfo(el.dataset.e)));
    // a new alert gives a little nudge so the eye catches it
    const keys = [...this.shadowRoot.querySelectorAll("[data-k]")].map((el) => el.dataset.k), before = this._alertKeys;
    this._alertKeys = keys;
    let still = false;
    try { still = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { /* old browser */ }
    if (before && !still) this.shadowRoot.querySelectorAll("[data-k]").forEach((el) => { if (!before.includes(el.dataset.k)) { try { el.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(5px)" }, { transform: "translateX(-3px)" }, { transform: "translateX(0)" }], { duration: 520, easing: "ease-out" }); } catch (e) { /* still */ } } });
  }

  getCardSize() { return this.style.display === "none" ? 0 : 2; }
}

// ------------------------------------------------------------------ helpers for the cards below
// all entities of one device (the frontend keeps a small registry in hass.entities)
const deviceEntities = (hass, deviceId) => Object.values(hass?.entities || {}).filter((e) => e.device_id === deviceId).map((e) => e.entity_id);
const findBySuffix = (ids, suffix) => ids.find((id) => id.endsWith(suffix));

// ------------------------------------------------------------------ Roost Remote
// A real remote-control pad. Works with an Athom Hub remote (its buttons), a "remote" entity, or a TV (media player).
const REMOTE_RULES = [
  [["power", "on"], "power_on"], [["power", "off"], "power_off"], [["power"], "power"],
  [["vol", "up"], "vol_up"], [["volume", "up"], "vol_up"], [["vol", "+"], "vol_up"], [["vol", "down"], "vol_down"], [["volume", "down"], "vol_down"], [["vol", "-"], "vol_down"],
  [["mute"], "mute"], [["ch", "up"], "ch_up"], [["channel", "up"], "ch_up"], [["ch", "down"], "ch_down"], [["channel", "down"], "ch_down"],
  [["up"], "up"], [["down"], "down"], [["left"], "left"], [["right"], "right"], [["ok"], "ok"], [["enter"], "ok"], [["select"], "ok"],
  [["back"], "back"], [["return"], "back"], [["home"], "home"], [["menu"], "menu"], [["input"], "source"], [["source"], "source"],
  [["play", "pause"], "play_pause"], [["play"], "play"], [["pause"], "pause"], [["info"], "info"],
  [["rewind"], "rewind"], [["rew"], "rewind"], [["fast", "forward"], "fast_forward"], [["ff"], "fast_forward"], [["forward"], "fast_forward"],
  [["previous"], "prev"], [["prev"], "prev"], [["next"], "next"], [["red"], "red"], [["green"], "green"], [["yellow"], "yellow"], [["blue"], "blue"],
  [["guide"], "guide"], [["epg"], "guide"], [["settings"], "settings"], [["exit"], "exit"],
];
const roleOfName = (name) => {
  const words = String(name).toLowerCase().replace(/[^a-z0-9+\-]+/g, " ").split(" ").filter(Boolean);
  const digit = words.find((w) => /^[0-9]$/.test(w));
  if (digit && words.length <= 3) return `n${digit}`;
  for (const [need, role] of REMOTE_RULES) if (need.every((w) => words.includes(w))) return role;
  return null;
};

class RoostRemote extends RoostBase {
  static get defaults() { return { color: "purple", pad_style: "buttons", show_pad: true, show_extra: true, show_volume: true, show_media: false, show_colors: false, show_numbers: false,
    shortcuts: [], key_size: 56, radius: 26, theme: "auto" }; }

  validate(c) { if (!c.athom_remote && !c.entity && !(c.buttons || []).length) throw new Error("Choose an Athom Hub remote, a remote, or a TV"); }

  static getConfigForm() {
    return {
      schema: [
        { name: "sample", label: "Show sample data (try the card without the device)", selector: { boolean: {} } },
        { name: "athom_remote", label: "Athom Hub remote (its name)", selector: { text: {} } },
        { name: "entity", label: "Or a remote / TV entity", selector: { entity: { domain: ["remote", "media_player"] } } },
        { name: "buttons", label: "Or pick buttons (named Power, Up, OK, Vol up and so on)", selector: { entity: { multiple: true, domain: "button" } } },
        { name: "name", selector: { text: {} } },
        { type: "expandable", name: "", title: "What the remote shows", icon: "mdi:remote-tv", schema: [
          { name: "pad_style", label: "Arrows and OK", selector: pick([["buttons", "Round pad with arrow buttons"], ["touchpad", "Touch pad: swipe to move, tap for OK, hold for Back"]]) },
          { type: "grid", name: "", schema: [{ name: "show_pad", label: "Arrows and OK", selector: { boolean: {} } }, { name: "show_extra", label: "Back, home, menu, input", selector: { boolean: {} } }] },
          { type: "grid", name: "", schema: [{ name: "show_volume", label: "Volume and channels", selector: { boolean: {} } }, { name: "show_media", label: "Play, pause, skip", selector: { boolean: {} } }] },
          { type: "grid", name: "", schema: [{ name: "show_colors", label: "Red, green, yellow, blue keys", selector: { boolean: {} } }, { name: "show_numbers", label: "Number keys", selector: { boolean: {} } }] },
        ] },
        { name: "shortcuts", label: "Shortcut buttons (apps, scenes, scripts)", selector: { object: { multiple: true, label_field: "name", fields: {
          name: { label: "Name", required: true, selector: { text: {} } },
          icon: { label: "Icon", selector: { icon: {} } },
          color: { label: "Colour", selector: { select: { mode: "dropdown", options: COLOR_OPTIONS.filter((o) => o.value !== "custom") } } },
          tap_action: { label: "What it does", selector: { ui_action: {} } },
        } } } },
        { type: "expandable", name: "", title: "Look", icon: "mdi:palette", schema: [...colourFields("color"), { type: "grid", name: "", schema: [{ name: "key_size", label: "Button size", selector: slider(40, 72, 2) }, { name: "radius", selector: slider(0, 40, 2) }] }, THEME_FIELD] },
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) {
    const b = Object.values(hass.states).find((s) => s.entity_id.startsWith("button.") && s.attributes.remote);
    return b ? { athom_remote: b.attributes.remote } : { entity: Object.keys(hass.states).find((id) => id.startsWith("media_player.")) || "" };
  }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  // role -> button entity
  map() {
    const c = this._config, h = this._hass, out = {};
    let ids = c.buttons || [];
    if (c.athom_remote) ids = Object.keys(h.states).filter((id) => id.startsWith("button.") && h.states[id].attributes.remote === c.athom_remote);
    for (const id of ids) {
      const r = roleOfName((h.states[id]?.attributes.friendly_name || id).replace(c.athom_remote || "", ""));
      if (r && !out[r]) out[r] = id;
    }
    return out;
  }

  watched() { return [this._config.entity].filter(Boolean); }

  signature() { return `${this.dark}|${this._config.entity ? JSON.stringify(this.st()?.attributes || {}) + this.st()?.state : Object.keys(this._hass?.states || {}).length}`; }

  has(role, map) {
    if (map[role]) return true;
    const c = this._config, d = (c.entity || "").split(".")[0];
    if (d === "remote") return true;
    if (d === "media_player") return ["power", "vol_up", "vol_down", "mute", "ch_up", "ch_down", "play_pause", "source", "prev", "next"].includes(role);
    return false;
  }

  press_(role, map) {
    const c = this._config;
    this.vibrate(10);
    if (c.actions && c.actions[role]) return this.run(c.actions[role], c.entity);
    if (map[role]) return this.call("button", "press", { entity_id: map[role] });
    const d = (c.entity || "").split(".")[0];
    if (d === "remote") {
      const cmd = { power: "power", vol_up: "volume_up", vol_down: "volume_down", ch_up: "channel_up", ch_down: "channel_down", play_pause: "play_pause", ok: "select" }[role] || role.replace(/^n/, "");
      return this.call("remote", "send_command", { entity_id: c.entity, command: cmd });
    }
    if (d === "media_player") {
      const s = this.st();
      const svc = { power: s && s.state !== "off" ? "turn_off" : "turn_on", vol_up: "volume_up", vol_down: "volume_down", ch_up: "media_next_track", ch_down: "media_previous_track", play_pause: "media_play_pause", prev: "media_previous_track", next: "media_next_track" }[role];
      if (role === "mute") return this.call("media_player", "volume_mute", { entity_id: c.entity, is_volume_muted: !s?.attributes.is_volume_muted });
      if (svc) return this.call("media_player", svc, { entity_id: c.entity });
    }
    return undefined;
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour(), map = this.map();
    const can = (role) => this.has(role, map) || !!(c.actions && c.actions[role]);
    const k = (role, icon, cls = "") => `<button class="k ${cls} ${can(role) ? "" : "no"}" data-r="${role}" aria-label="${role.replace("_", " ")}"${can(role) ? "" : " disabled"}>${icon.startsWith("mdi:") ? `<ha-icon icon="${icon}"></ha-icon>` : `<span>${icon}</span>`}</button>`;
    const title = c.name || c.athom_remote || (c.entity ? this.name(c.entity) : "Remote");
    const pw = map.power ? "power" : map.power_on ? "power_on" : "power";
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      :host{container-type:inline-size}
      .card{${panelCss(p, c.radius)};padding:18px;display:flex;flex-direction:column;gap:16px;align-items:center;--k:min(${Math.max(40, Number(c.key_size) || 56)}px,15cqw)}
      .touch{position:relative;width:100%;max-width:300px;aspect-ratio:4/3;border-radius:24px;background:${p.inset};border:1px solid ${p.border};touch-action:none;cursor:pointer;overflow:hidden;
        display:flex;align-items:center;justify-content:center;color:${p.muted};font-size:12px;-webkit-tap-highlight-color:transparent}
      .touch .hint{display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none}
      .touch .hint ha-icon{--mdc-icon-size:26px;opacity:.7}
      .touch .dot{position:absolute;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:radial-gradient(circle,${g[1]}AA,${g[1]}00 70%);pointer-events:none;opacity:0}
      .touch .arr{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:0;color:${g[1]}}
      .touch .arr ha-icon{--mdc-icon-size:44px}
      .k.c-red{color:#F43F6B}.k.c-green{color:#34D399}.k.c-yellow{color:#F5B94A}.k.c-blue{color:#38BDF8}
      .k.cbar{width:calc(var(--k) * .9);height:16px;border-radius:999px}
      .k.c-red.cbar{background:#F43F6B}.k.c-green.cbar{background:#34D399}.k.c-yellow.cbar{background:#F5B94A}.k.c-blue.cbar{background:#38BDF8}
      .sc{display:flex;gap:10px;overflow-x:auto;scrollbar-width:none;width:100%;justify-content:${(c.shortcuts || []).length > 3 ? "flex-start" : "center"}}
      .sc::-webkit-scrollbar{display:none}
      .s{flex:none;display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:0;color:${p.text};font:inherit;font-size:11px;font-weight:600;cursor:pointer;padding:0;width:64px}
      .s i{width:46px;height:46px;border-radius:15px;display:flex;align-items:center;justify-content:center;font-style:normal}
      .s ha-icon{--mdc-icon-size:22px}
      .s:active i{transform:scale(.92)}
      .top{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px}
      .n{font-size:15px;font-weight:600}
      .k{width:var(--k);height:var(--k);border-radius:50%;border:1px solid ${p.border};background:${p.off};${p.fx || ""};color:${p.text};cursor:pointer;display:flex;align-items:center;justify-content:center;font:inherit;font-size:20px;font-weight:600;
        -webkit-tap-highlight-color:transparent;transition:transform .12s,background .12s}
      .k:active{transform:scale(.88);background:${g[0]}33}
      .k{padding:0;flex:none;overflow:hidden}
      .k ha-icon{--mdc-icon-size:calc(var(--k) * .43);width:calc(var(--k) * .43);height:calc(var(--k) * .43)}
      .k.no{opacity:.28;cursor:default}
      .k.pw{width:48px;height:48px;flex:none;background:linear-gradient(135deg,#F43F6B,#FF8F6B);color:#fff;border-color:transparent;box-shadow:0 10px 22px -10px rgba(244,63,107,.7)}
      .pad{position:relative;width:min(190px,62cqw);aspect-ratio:1;border-radius:50%;background:${p.inset};border:1px solid ${p.border}}
      .pad .k{position:absolute;background:transparent;border:0;transform:translate(-50%,-50%)}
      .pad .k:active{transform:translate(-50%,-50%) scale(.88)}
      .pad .up{left:50%;top:17%}.pad .down{left:50%;top:83%}.pad .left{left:17%;top:50%}.pad .right{left:83%;top:50%}
      .pad .ok{left:50%;top:50%;width:38%;height:38%;background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};box-shadow:0 12px 26px -10px ${g[2]}}
      .row{display:flex;gap:min(14px,3cqw);justify-content:center;width:100%;flex-wrap:wrap}
      .rock{display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px;border-radius:999px;background:${p.inset};border:1px solid ${p.border}}
      .rock .k{background:transparent;border:0;width:min(48px,13cqw);height:min(48px,13cqw)}
      .rock small{font-size:11px;color:${p.muted};letter-spacing:1px}
      .mid{display:flex;flex-direction:column;gap:10px;justify-content:center}
      .nums{display:grid;grid-template-columns:repeat(3,var(--k));gap:10px}
    </style>
    <div class="card">
      <div class="top"><span class="n t">${esc(title)}</span>${k(pw, "mdi:power", "pw")}</div>
      ${(c.shortcuts || []).length ? `<div class="sc">${c.shortcuts.map((x, i) => { const sg = x.color ? (x.color === "active" ? ACTIVE : COLORS[x.color] || g) : g; return `<button class="s" data-s="${i}"><i style="background:linear-gradient(135deg,${sg[0]},${sg[1]});color:${sg[3]};box-shadow:0 10px 20px -10px ${sg[2]}"><ha-icon icon="${esc(x.icon || "mdi:application")}"></ha-icon></i><span class="t">${esc(x.name || "")}</span></button>`; }).join("")}</div>` : ""}
      ${c.show_pad === false ? "" : c.pad_style === "touchpad" ? '<div class="touch" role="button" aria-label="Touch pad: swipe to move, tap for OK, hold for back"><span class="hint t"><ha-icon icon="mdi:gesture-swipe"></ha-icon>Swipe to move · tap for OK · hold for Back</span><span class="dot"></span><span class="arr"><ha-icon icon="mdi:chevron-up"></ha-icon></span></div>'
    : `<div class="pad">${k("up", "mdi:chevron-up", "up")}${k("left", "mdi:chevron-left", "left")}${k("ok", "OK", "ok")}${k("right", "mdi:chevron-right", "right")}${k("down", "mdi:chevron-down", "down")}</div>`}
      ${c.show_extra ? `<div class="row">${k("back", "mdi:arrow-u-left-top")}${k("home", "mdi:home-outline")}${k("menu", "mdi:menu")}${k("source", "mdi:import")}</div>` : ""}
      ${c.show_media ? `<div class="row">${k("rewind", "mdi:rewind")}${k("prev", "mdi:skip-previous")}${k("play_pause", "mdi:play-pause")}${k("next", "mdi:skip-next")}${k("fast_forward", "mdi:fast-forward")}</div>` : ""}
      ${c.show_colors ? `<div class="row">${["red", "green", "yellow", "blue"].map((x) => k(x, "", `c-${x} cbar`)).join("")}</div>` : ""}
      ${c.show_volume === false ? "" : `<div class="row"><div class="rock">${k("vol_up", "mdi:plus")}<small>VOL</small>${k("vol_down", "mdi:minus")}</div>
        <div class="mid">${k("mute", "mdi:volume-off")}${c.show_media ? k("info", "mdi:information-outline") : k("play_pause", "mdi:play-pause")}</div>
        <div class="rock">${k("ch_up", "mdi:chevron-up")}<small>CH</small>${k("ch_down", "mdi:chevron-down")}</div></div>`}
      ${c.show_numbers ? `<div class="nums">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => k(`n${n}`, String(n))).join("")}<span></span>${k("n0", "0")}</div>` : ""}
    </div>`;
    this.shadowRoot.querySelectorAll(".k:not(.no)").forEach((b) => b.addEventListener("click", () => {
      try { if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) b.animate([{ boxShadow: `0 0 0 0 ${g[2]}` }, { boxShadow: "0 0 0 12px rgba(0,0,0,0)" }], { duration: 450, easing: "ease-out" }); } catch (e) { /* no glow */ }
      this.press_(b.dataset.r, map);
    }));
    this.shadowRoot.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { this.vibrate(10); const x = c.shortcuts[+b.dataset.s]; if (x?.tap_action) this.run(x.tap_action, c.entity); }));
    const tp = this.shadowRoot.querySelector(".touch");
    if (tp) {
      const dot = tp.querySelector(".dot"), arr = tp.querySelector(".arr"), ico = arr.querySelector("ha-icon");
      let x0 = 0, y0 = 0, t0 = 0, held = null, moved = false;
      const flash = (role) => {
        ico.setAttribute("icon", { up: "mdi:chevron-up", down: "mdi:chevron-down", left: "mdi:chevron-left", right: "mdi:chevron-right", ok: "mdi:circle-medium", back: "mdi:arrow-u-left-top" }[role]);
        try { arr.animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: 400, easing: "ease-out" }); } catch (e) { /* no motion */ }
      };
      const go = (role) => { if (can(role)) { flash(role); this.press_(role, map); } };
      tp.addEventListener("pointerdown", (ev) => {
        tp.setPointerCapture?.(ev.pointerId); x0 = ev.clientX; y0 = ev.clientY; t0 = Date.now(); moved = false;
        const b = tp.getBoundingClientRect(); dot.style.left = `${ev.clientX - b.left}px`; dot.style.top = `${ev.clientY - b.top}px`; dot.style.opacity = 1;
        held = setTimeout(() => { held = null; if (!moved) go("back"); }, 600);
      });
      tp.addEventListener("pointermove", (ev) => {
        const b = tp.getBoundingClientRect(); dot.style.left = `${ev.clientX - b.left}px`; dot.style.top = `${ev.clientY - b.top}px`;
        const dx = ev.clientX - x0, dy = ev.clientY - y0;
        if (Math.hypot(dx, dy) > 34) { moved = true; clearTimeout(held); held = null; go(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up")); x0 = ev.clientX; y0 = ev.clientY; }
      });
      const end = () => { dot.style.opacity = 0; if (held) { clearTimeout(held); held = null; if (!moved && Date.now() - t0 < 600) go("ok"); } };
      tp.addEventListener("pointerup", end); tp.addEventListener("pointercancel", () => { dot.style.opacity = 0; clearTimeout(held); held = null; });
    }
  }
}

// ------------------------------------------------------------------ Roost Presence map
// The room from above as a presence radar (for example the LD2450 in an Athom presence sensor) sees it: people as moving dots, and its zones.
const ZONE_COLOURS = ["#8B6CFF", "#2BC4A8", "#FF8F6B"];
class RoostPresence extends RoostBase {
  static get defaults() { return { range: 6, show_zones: true, show_grid: true, radius: 22, color: "active", theme: "auto" }; }

  validate(c) { if (!c.device) throw new Error("Choose the presence sensor (device)"); }

  ids() { return deviceEntities(this._hass, this._config.device); }

  watched() { return this._hass ? this.ids().filter((id) => /target_\d_[xy]$|zone_\d_|presence|occupancy|target_count/.test(id)) : []; }

  static getConfigForm() {
    return {
      schema: [
        { name: "device", label: "Presence sensor", required: true, selector: { device: {} } },
        { name: "name", selector: { text: {} } },
        { type: "grid", name: "", schema: [{ name: "range", label: "Room depth to show (metres)", selector: slider(2, 8, 0.5, "m") }, { name: "radius", selector: slider(0, 40, 2) }] },
        { type: "grid", name: "", schema: [{ name: "show_zones", label: "Zones", selector: { boolean: {} } }, { name: "show_grid", label: "Metre lines", selector: { boolean: {} } }] },
        ...colourFields("color", "Dot colour"),
        THEME_FIELD,
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) {
    const e = Object.values(hass.entities || {}).find((x) => /target_1_x$/.test(x.entity_id));
    return { device: e?.device_id || "" };
  }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  val(ids, suffix) { const id = findBySuffix(ids, suffix); return id ? num(this.sx(id)?.state) : null; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour(), ids = this.ids();
    const R = c.range * 1000, s60 = Math.sin(Math.PI / 3), c60 = Math.cos(Math.PI / 3);
    const targets = [1, 2, 3].map((n) => ({ n, x: this.val(ids, `target_${n}_x`), y: this.val(ids, `target_${n}_y`) })).filter((t) => t.x != null && t.y != null && !(t.x === 0 && t.y === 0)).map((t) => ({ ...t, y: Math.abs(t.y) }));
    const occ = ids.map((id) => this.sx(id)).find((s) => s && s.entity_id.startsWith("binary_sensor.") && ["occupancy", "presence"].includes(s.attributes.device_class));
    const zones = c.show_zones ? [1, 2, 3].map((n) => {
      const z = { x1: this.val(ids, `zone_${n}_x1`), y1: this.val(ids, `zone_${n}_y1`), x2: this.val(ids, `zone_${n}_x2`), y2: this.val(ids, `zone_${n}_y2`) };
      if ([z.x1, z.x2, z.y1, z.y2].some((v) => v == null) || (!z.x1 && !z.x2 && !z.y1 && !z.y2)) return "";
      const cnt = this.val(ids, `zone_${n}_all_target_count`) ?? this.val(ids, `zone_${n}_target_count`);
      const x = Math.min(z.x1, z.x2) * (Math.abs(z.x1) < 20 ? 1000 : 1), y = Math.min(z.y1, z.y2) * (Math.abs(z.y1) < 20 ? 1000 : 1);
      const w = Math.abs(z.x2 - z.x1) * (Math.abs(z.x1) < 20 ? 1000 : 1), hgt = Math.abs(z.y2 - z.y1) * (Math.abs(z.y1) < 20 ? 1000 : 1);
      const on = cnt > 0;
      return `<rect x="${x}" y="${y}" width="${w}" height="${hgt}" rx="120" fill="${ZONE_COLOURS[n - 1]}" fill-opacity="${on ? 0.3 : 0.1}" stroke="${ZONE_COLOURS[n - 1]}" stroke-width="${on ? 50 : 25}"/>
        <text x="${x + 140}" y="${y + 340}" font-size="280" font-weight="700" fill="${ZONE_COLOURS[n - 1]}">${n}${cnt ? ` · ${cnt}` : ""}</text>`;
    }).join("") : "";
    let grid = "";
    if (c.show_grid) for (let d = 1000; d <= R; d += 1000) grid += `<path d="M${-d * s60} ${d * c60} A${d} ${d} 0 0 0 ${d * s60} ${d * c60}" fill="none" stroke="${p.text}" stroke-opacity=".08" stroke-width="22"/><text x="${d * s60 + 120}" y="${d * c60}" font-size="230" fill="${p.muted}">${d / 1000} m</text>`;
    const n = targets.length;
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${panelCss(p, c.radius)};padding:16px;display:flex;flex-direction:column;gap:10px}
      .top{display:flex;justify-content:space-between;align-items:baseline;gap:10px}
      .n{font-size:15px;font-weight:600}
      .l{font-size:13px;font-weight:600;color:${n ? g[this.dark ? 1 : 0] : p.muted}}
      svg{display:block;width:100%;height:auto}
      .dot{transition:transform .12s linear}
      .sweep{transform-origin:0 0;animation:roost-spin 6s linear infinite}
    </style>
    <div class="card">
      <div class="top"><span class="n t">${esc(c.name || this._hass.devices?.[c.device]?.name_by_user || this._hass.devices?.[c.device]?.name || "Presence")}</span>
        <span class="l t">${n ? `${n} ${n > 1 ? "people" : "person"} here` : occ?.state === "on" ? "Someone is still" : "Nobody here"}</span></div>
      <svg viewBox="${-R * s60 - 300} -300 ${2 * R * s60 + 1300} ${R + 500}">
        <defs><radialGradient id="fov" cx="0.5" cy="0" r="1"><stop offset="0" stop-color="${g[0]}" stop-opacity=".28"/><stop offset="1" stop-color="${g[1]}" stop-opacity=".04"/></radialGradient>
          <radialGradient id="dg"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="${g[1]}"/><stop offset="1" stop-color="${g[0]}" stop-opacity="0"/></radialGradient></defs>
        <path d="M0 0 L${R * s60} ${R * c60} A${R} ${R} 0 0 1 ${-R * s60} ${R * c60} Z" fill="url(#fov)" stroke="${g[0]}" stroke-opacity=".35" stroke-width="25"/>
        ${grid}${zones}
        <rect x="-260" y="-200" width="520" height="200" rx="60" fill="${g[0]}"/>
        ${targets.map((t) => `<g class="dot" data-glide="${t.n}" style="transform:translate(${t.x}px,${t.y}px)"><circle r="520" fill="url(#dg)" opacity=".55"><animate attributeName="r" values="380;620;380" dur="2s" repeatCount="indefinite"/></circle><circle r="170" fill="${g[1]}" stroke="#fff" stroke-width="45"/></g>`).join("")}
      </svg>
    </div>`;
  }
}

// ------------------------------------------------------------------ Roost Weather
// Now, with an animated picture of the sky, and the next days or hours.
const WX_ICON = { "clear-night": "mdi:weather-night", cloudy: "mdi:weather-cloudy", exceptional: "mdi:alert-circle-outline", fog: "mdi:weather-fog", hail: "mdi:weather-hail", lightning: "mdi:weather-lightning",
  "lightning-rainy": "mdi:weather-lightning-rainy", partlycloudy: "mdi:weather-partly-cloudy", pouring: "mdi:weather-pouring", rainy: "mdi:weather-rainy", snowy: "mdi:weather-snowy",
  "snowy-rainy": "mdi:weather-snowy-rainy", sunny: "mdi:weather-sunny", windy: "mdi:weather-windy", "windy-variant": "mdi:weather-windy-variant" };
const wxWord = (s) => String(s || "").replace("partlycloudy", "partly cloudy").replace("clear-night", "clear").replace(/-/g, " ");
class RoostWeather extends RoostBase {
  static get defaults() { return { forecast: "daily", count: 5, show_details: true, radius: 22, theme: "auto" }; }

  validate(c) { if (!c.entity) throw new Error("Choose the weather"); }

  static getConfigForm() {
    return {
      schema: [
        { name: "entity", required: true, selector: { entity: { domain: "weather" } } },
        { name: "name", selector: { text: {} } },
        { type: "grid", name: "", schema: [{ name: "forecast", selector: pick([["daily", "Next days"], ["hourly", "Next hours"], ["none", "No forecast"]]) }, { name: "count", label: "How many", selector: { number: { min: 3, max: 10, mode: "box" } } }] },
        { type: "grid", name: "", schema: [{ name: "show_details", label: "Humidity and wind", selector: { boolean: {} } }, { name: "radius", selector: slider(0, 40, 2) }] },
        THEME_FIELD,
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) { return { entity: Object.keys(hass.states).find((id) => id.startsWith("weather.")) || "" }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  extraSignature() { return JSON.stringify(this._fc || []); }

  subscribe() {
    const c = this._config, conn = this._hass?.connection;
    const key = `${c.entity}|${c.forecast}`;
    if (!conn?.subscribeMessage || c.forecast === "none" || this._subKey === key) return;
    this._unsub?.then?.((u) => u()).catch(() => {});
    this._subKey = key;
    this._unsub = conn.subscribeMessage((m) => { this._fc = m.forecast || []; this._sig = null; this.hass = this._hass; }, { type: "weather/subscribe_forecast", forecast_type: c.forecast, entity_id: c.entity });
    this._unsub.catch?.(() => { this._fc = this.st()?.attributes.forecast || []; });
  }

  disconnectedCallback() { this._unsub?.then?.((u) => u()).catch(() => {}); this._subKey = null; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, s = this.st();
    this.subscribe();
    const a = s?.attributes || {}, cond = s?.state || "", unit = (a.temperature_unit || "°C").replace(/^°?C$/, "°").replace(/^°?F$/, "°");
    const day = cond !== "clear-night" && (this.sx("sun.sun")?.state ?? "above_horizon") !== "below_horizon";
    const grey = /rain|pour|light|cloudy|fog|snow|hail/.test(cond) && cond !== "partlycloudy";
    const sky = !day ? "linear-gradient(135deg,#1B1E52,#38287E)" : grey ? "linear-gradient(135deg,#64748B,#94A3B8)" : "linear-gradient(135deg,#2563EB,#60A5FA 60%,#FDBA74)";
    const fc = (this._fc || a.forecast || []).slice(0, c.count);
    const hourly = c.forecast === "hourly";
    let fx = "";
    const r = (i, m) => ((i * 37 + 13) % m);
    if (/rain|pour/.test(cond)) for (let i = 0; i < 16; i++) fx += `<i class="drop" style="left:${r(i * 3, 100)}%;animation-duration:${(0.6 + (i % 4) * 0.12).toFixed(2)}s;animation-delay:-${((i % 7) * 0.13).toFixed(2)}s"></i>`;
    if (/snow/.test(cond)) for (let i = 0; i < 14; i++) fx += `<i class="flake" style="left:${r(i * 5, 100)}%;animation-duration:${(3 + (i % 5) * 0.6).toFixed(1)}s;animation-delay:-${((i % 9) * 0.5).toFixed(1)}s"></i>`;
    if (/cloud|rain|pour|lightning|snow/.test(cond)) { let cl = ""; for (let i = 0; i < 3; i++) cl += `<i class="cloud" style="top:${14 + i * 22}%;animation-duration:${20 + i * 8}s;animation-delay:-${i * 7}s"></i>`; fx += `<i class="sky">${cl}</i>`; }
    if (/lightning/.test(cond)) fx += '<i class="flash"></i>';
    if (!day && !grey) for (let i = 0; i < 8; i++) fx += `<i class="star" style="left:${r(i * 7, 95)}%;top:${r(i * 11, 70)}%;animation-delay:${(i * 0.4).toFixed(1)}s"></i>`;
    const orb = !grey ? `<span class="orb ${day ? "sun" : "moon"}"></span>` : "";
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      @keyframes roost-wdrift{from{transform:translateX(-90px)}to{transform:translateX(260px)}}
      @keyframes roost-rain{from{transform:translateY(-20px)}to{transform:translateY(190px)}}
      @keyframes roost-snow{from{transform:translate(0,-10px)}to{transform:translate(14px,190px)}}
      @keyframes roost-flash{0%,92%,100%{opacity:0}94%,97%{opacity:.6}}
      .card{${panelCss(p, c.radius)};overflow:hidden}
      .now{position:relative;overflow:hidden;padding:18px;min-height:150px;background:${sky};color:#fff}
      .now > i{position:absolute;display:block}
      .sky{top:0;bottom:0;left:46%;right:0;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 30%);mask-image:linear-gradient(90deg,transparent,#000 30%)}
      .cloud{position:absolute;left:0;width:80px;height:24px;border-radius:999px;background:rgba(255,255,255,.75);animation:roost-wdrift linear infinite}
      .cloud::before{content:"";position:absolute;left:16px;top:-14px;width:34px;height:34px;border-radius:50%;background:inherit}
      .drop{top:0;width:2px;height:12px;border-radius:2px;background:rgba(220,235,255,.85);animation:roost-rain linear infinite}
      .flake{top:0;width:5px;height:5px;border-radius:50%;background:#fff;animation:roost-snow linear infinite}
      .flash{inset:0;background:#fff;animation:roost-flash 5s linear infinite}
      .star{width:2px;height:2px;border-radius:50%;background:#fff;animation:roost-twinkle 3s ease-in-out infinite}
      .orb{position:absolute;right:20px;top:18px;width:58px;height:58px;border-radius:50%;animation:roost-float 6s ease-in-out infinite}
      .sun{background:radial-gradient(circle at 38% 36%,#FFF7D6,#FDE047 55%,#F59E0B);box-shadow:0 0 40px 10px rgba(253,224,71,.45)}
      .moon{background:radial-gradient(circle at 36% 34%,#FFFBEA,#E2C273);box-shadow:0 0 30px 6px rgba(255,234,170,.25)}
      .info{position:relative;z-index:1;padding-right:76px;text-shadow:0 1px 6px rgba(10,8,40,.35)}
      .nm{font-size:13px;opacity:.85}
      .tmp{font-size:48px;font-weight:700;line-height:1;margin-top:4px;letter-spacing:-1px}
      .cd{font-size:15px;font-weight:600;text-transform:capitalize;margin-top:4px}
      .dt{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
      .dt span{font-size:12px;padding:4px 10px;border-radius:999px;background:rgba(10,8,40,.25)}
      .fc{display:grid;grid-template-columns:repeat(${Math.max(1, fc.length)},minmax(0,1fr));gap:4px;padding:12px 10px}
      .d{display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;color:${p.text}}
      .d small{font-size:12px;color:${p.muted}}
      .d ha-icon{--mdc-icon-size:24px;color:${p.text}}
      .d b{font-size:14px}
      .d em{font-style:normal;font-size:12px;color:${p.muted}}
    </style>
    <div class="card">
      <div class="now" role="button" tabindex="0">${fx}${orb}
        <div class="info"><div class="nm t">${esc(c.name || a.friendly_name || "Weather")}</div>
          <div class="tmp num" data-tw="tmp">${a.temperature != null ? `${Math.round(a.temperature)}${unit}` : ""}</div><div class="cd t">${esc(s ? wxWord(cond) : "Not found")}</div>
          ${c.show_details ? `<div class="dt">${a.humidity != null ? `<span>Humidity ${Math.round(a.humidity)}%</span>` : ""}${a.wind_speed != null ? `<span>Wind ${Math.round(a.wind_speed)} ${esc(a.wind_speed_unit || "km/h")}</span>` : ""}${a.apparent_temperature != null ? `<span>Feels ${Math.round(a.apparent_temperature)}${unit}</span>` : ""}</div>` : ""}</div></div>
      ${c.forecast !== "none" && fc.length ? `<div class="fc">${fc.map((f) => {
        const d = new Date(f.datetime);
        const lab = hourly ? d.toLocaleTimeString([], { hour: "numeric" }) : d.toLocaleDateString(undefined, { weekday: "short" });
        return `<div class="d"><small>${esc(lab)}</small><ha-icon icon="${WX_ICON[f.condition] || "mdi:weather-cloudy"}"></ha-icon><b class="num">${f.temperature != null ? Math.round(f.temperature) + unit : ""}</b>${!hourly && f.templow != null ? `<em class="num">${Math.round(f.templow)}${unit}</em>` : ""}</div>`;
      }).join("")}</div>` : ""}
    </div>`;
    this.shadowRoot.querySelector(".now").addEventListener("click", () => this.moreInfo(c.entity));
  }
}

// ------------------------------------------------------------------ Roost Energy
// Power now (all chosen plugs added up), today against yesterday, and the hungriest devices.
class RoostEnergy extends ticking(RoostBase, 300000) {
  static get defaults() { return { devices: [], color: "green", count: 5, radius: 22, theme: "auto" }; }

  validate(c) { if (!c.energy && !(c.devices || []).length) throw new Error("Choose a daily energy reading or some power readings"); }

  watched() { return [this._config.energy, ...(this._config.devices || []).map((e) => (typeof e === "string" ? e : e?.entity))].filter(Boolean); }

  static getConfigForm() {
    return {
      schema: [
        { name: "energy", label: "Energy used (kWh, a meter that counts up)", selector: { entity: { domain: "sensor" } } },
        { name: "devices", label: "Power readings of devices (W)", selector: { entity: { multiple: true, domain: "sensor" } } },
        { type: "grid", name: "", schema: [{ name: "count", label: "Devices to show", selector: { number: { min: 1, max: 15, mode: "box" } } }, { name: "radius", selector: slider(0, 40, 2) }] },
        { type: "expandable", name: "", title: "Electricity bill", icon: "mdi:cash", schema: [
          { type: "grid", name: "", schema: [{ name: "price", label: "Price for 1 kWh (for example 0.016)", selector: { number: { mode: "box", step: "any" } } }, { name: "currency", label: "Money sign (BD, SAR, $)", selector: { text: {} } }] },
          { name: "tiers", label: "Or prices that change with use (YAML: - {upto: 3000, price: 0.003})", selector: { object: {} } },
          { name: "budget", label: "Monthly budget (optional)", selector: { number: { mode: "box", step: "any" } } },
        ] },
        ...colourFields("color"),
        THEME_FIELD,
      ],
      computeLabel,
    };
  }

  // what a number of kWh costs, with stepped prices when they are set
  cost(kwh) {
    const c = this._config;
    if (kwh == null) return null;
    if (Array.isArray(c.tiers) && c.tiers.length) {
      let left = kwh, from = 0, sum = 0;
      for (const t of [...c.tiers].sort((a, b) => (a.upto ?? 1e12) - (b.upto ?? 1e12))) {
        const top = Number(t.upto ?? 1e12), use = Math.max(0, Math.min(left, top - from));
        sum += use * Number(t.price || 0); left -= use; from = top;
        if (left <= 0) break;
      }
      return sum;
    }
    return c.price != null && c.price !== "" ? kwh * Number(c.price) : null;
  }

  money(v) { const cur = this._config.currency || "BD"; return v == null ? "" : `${cur} ${v.toFixed(/^(BD|BHD|KWD|KD|OMR)$/i.test(cur) ? 3 : 2)}`; }

  static getStubConfig(hass) {
    const ids = Object.keys(hass.states);
    return { energy: ids.find((id) => hass.states[id].attributes.device_class === "energy") || "", devices: ids.filter((id) => hass.states[id].attributes.device_class === "power").slice(0, 5) };
  }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  extraSignature() { return JSON.stringify(this._days || {}); }

  async loadDays() {
    const c = this._config, h = this._hass;
    if (!c.energy || !h?.callWS || this._loading) return;
    if (this._loadedAt && Date.now() - this._loadedAt < 290000 && this._loadedFor === c.energy) return;
    this._loading = true;
    try {
      // today so far, against yesterday up to the same time (a fair comparison all day long)
      const get = (start, end) => h.callWS({ type: "recorder/statistic_during_period", statistic_id: c.energy, fixed_period: { start: start.toISOString(), end: end.toISOString() }, types: ["change"] });
      const now = new Date(), midnight = new Date(now); midnight.setHours(0, 0, 0, 0);
      const billing = c.price != null || (c.tiers || []).length;
      const m0 = new Date(now.getFullYear(), now.getMonth(), 1), p0 = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const [t, y, m, lm] = await Promise.all([get(midnight, now), get(new Date(midnight.getTime() - 86400e3), new Date(now.getTime() - 86400e3)),
        billing ? get(m0, now) : null, billing ? get(p0, m0) : null]);
      this._days = { today: t?.change, yesterday: y?.change, month: m?.change, last: lm?.change };
    } catch (e) { this._days = {}; }
    this._loading = false; this._loadedAt = Date.now(); this._loadedFor = c.energy;
    this._sig = null; this.hass = this._hass;
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour();
    this.loadDays();
    const devs = (c.devices || []).map((e) => (typeof e === "string" ? { id: e } : { id: e?.entity, nm: e?.name })).map((d) => ({ ...d, s: this.sx(d.id) })).filter((d) => d.s).map((d) => ({ ...d, w: num(d.s.state) ?? 0 }));
    const total = devs.reduce((a, d) => a + d.w, 0);
    const top = [...devs].sort((a, b) => b.w - a.w).slice(0, c.count);
    const max = Math.max(1, ...top.map((d) => d.w));
    const { today, yesterday, month, last } = this._days || {};
    const diff = today != null && yesterday ? Math.round(((today - yesterday) / yesterday) * 100) : null;
    const billNow = this.cost(month), billLast = this.cost(last);
    const nowD = new Date(), dim = new Date(nowD.getFullYear(), nowD.getMonth() + 1, 0).getDate(), dayF = (nowD.getDate() - 1 + nowD.getHours() / 24) / dim;
    const billEnd = billNow != null && dayF > 0.03 ? billNow / dayF : null;
    const budget = Number(c.budget) || null;
    const kw = (w) => (w >= 1000 ? `${(w / 1000).toFixed(1)} kW` : `${Math.round(w)} W`);
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${panelCss(p, c.radius)};padding:16px;display:flex;flex-direction:column;gap:14px}
      .top{display:flex;gap:10px;flex-wrap:wrap}
      .box{flex:1 1 120px;min-width:0;padding:12px 14px;border-radius:16px;background:${p.inset}}
      .box small{display:block;font-size:12px;color:${p.muted}}
      .box b{display:block;font-size:clamp(17px, 7.5cqw, 24px);font-weight:700;margin-top:2px;overflow-wrap:anywhere}
      .box b.wait{font-size:13px;font-weight:600;color:${p.muted};margin-top:6px}
      .box em{font-style:normal;font-size:12px;font-weight:600}
      .bolt{animation:roost-pulse 1.6s ease-in-out infinite;--mdc-icon-size:18px;color:${g[1]};vertical-align:-3px}
      .dv{display:flex;flex-direction:column;gap:9px}
      .row{display:grid;grid-template-columns:1fr auto;gap:4px 10px;align-items:center;cursor:pointer}
      .row span{font-size:13px;font-weight:600;color:${p.text};min-width:0;overflow-wrap:anywhere}
      .row b{font-size:13px;color:${p.muted}}
      .bar{grid-column:1/3;height:6px;border-radius:999px;background:${p.track};overflow:hidden}
      .bar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,${g[0]},${g[1]})}
      .bill{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px 14px;padding:14px;border-radius:16px;background:linear-gradient(135deg,${g[0]}2E,${g[1]}14);border:1px solid ${g[1]}40}
      .bill small{display:block;font-size:12px;color:${p.muted}}
      .bill b{display:block;font-size:24px;font-weight:700;margin-top:2px}
      .bill em{font-style:normal;font-size:12px;color:${p.muted}}
      .bill .lm{text-align:right}.bill .lm b{font-size:17px}.bill .lm em{font-weight:700}
      .bud{grid-column:1/-1;display:flex;flex-direction:column;gap:6px}
    </style>
    <div class="card">
      ${billNow != null ? `<div class="bill"><div><small>This month so far</small><b class="num">${esc(this.money(billNow))}</b>${billEnd != null ? `<em>About ${esc(this.money(billEnd))} by the end of the month</em>` : ""}</div>
        ${billLast != null ? `<div class="lm"><small>Last month</small><b class="num">${esc(this.money(billLast))}</b>${billEnd != null && billLast ? `<em style="color:${billEnd > billLast ? "#FF9F6B" : "#3DD68C"}">${billEnd > billLast ? "▲" : "▼"} ${Math.abs(Math.round(((billEnd - billLast) / billLast) * 100))}%</em>` : ""}</div>` : ""}
        ${budget ? `<div class="bud"><span class="bar"><i style="width:${Math.min(100, (billNow / budget) * 100).toFixed(0)}%;background:${billEnd > budget ? "linear-gradient(90deg,#FF9F6B,#F43F6B)" : `linear-gradient(90deg,${g[0]},${g[1]})`}"></i></span><small>${billEnd > budget ? "Likely over your budget of" : "Budget"} ${esc(this.money(budget))}</small></div>` : ""}</div>` : ""}
      <div class="top">
        ${devs.length ? `<div class="box"><small>Using now</small><b class="num"><ha-icon class="bolt" icon="mdi:flash"></ha-icon> <span data-tw="tot">${kw(total)}</span></b></div>` : ""}
        ${c.energy ? `<div class="box"><small>Today</small>${today != null ? `<b class="num">${today.toFixed(today < 1 ? 2 : 1)} kWh</b>` : `<b class="wait">${this._days ? "No history yet" : "Loading"}</b>`}${diff != null ? `<em style="color:${diff > 0 ? "#FF9F6B" : "#3DD68C"}">${diff > 0 ? "▲" : "▼"} ${Math.abs(diff)}% vs this time yesterday</em>` : yesterday != null ? `<em style="color:${p.muted}">Yesterday ${yesterday.toFixed(1)} kWh</em>` : ""}</div>` : ""}
      </div>
      ${top.length ? `<div class="dv">${top.map((d) => `<div class="row" data-e="${esc(d.id)}"><span class="t">${esc(d.nm || d.s.attributes.friendly_name || d.id)}</span><b class="num" data-tw="${esc(d.id)}">${kw(d.w)}</b><span class="bar"><i data-bar="${esc(d.id)}" style="width:${((d.w / max) * 100).toFixed(0)}%"></i></span></div>`).join("")}</div>` : ""}
    </div>`;
    this.shadowRoot.querySelectorAll("[data-e]").forEach((el) => el.addEventListener("click", () => this.moreInfo(el.dataset.e)));
  }
}

// ------------------------------------------------------------------ Roost Timer
// A countdown ring for a Home Assistant timer (kettle, washing), with start, pause, cancel and quick times.
class RoostTimer extends RoostBase {
  static get defaults() { return { presets: [], dial: true, dial_max: 60, color: "coral", radius: 22, theme: "auto" }; }

  validate(c) { if (!c.entity) throw new Error("Choose a timer (Settings → Helpers → Timer)"); }

  signature() { return this._drag ? this._sig : super.signature(); }

  static getConfigForm() {
    return {
      schema: [
        { name: "sample", label: "Show sample data (try the card without the device)", selector: { boolean: {} } },
        { name: "entity", required: true, selector: { entity: { domain: "timer" } } },
        { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "icon", selector: { icon: {} } }] },
        { type: "grid", name: "", schema: [{ name: "dial", label: "Turn the ring to set the time", selector: { boolean: {} } }, { name: "dial_max", label: "Longest time on the ring (minutes)", selector: slider(5, 180, 5) }] },
        { name: "presets", label: "Quick time buttons too (minutes, optional)", selector: { select: { multiple: true, custom_value: true, mode: "dropdown", options: ["1", "2", "3", "4", "5", "10", "15", "20", "30", "45", "60"] } } },
        ...colourFields("color"),
        { type: "grid", name: "", schema: [{ name: "radius", selector: slider(0, 40, 2) }, THEME_FIELD] },
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) { return { entity: Object.keys(hass.states).find((id) => id.startsWith("timer.")) || "" }; }

  getGridOptions() { return { columns: 6, rows: "auto", min_columns: 4 }; }

  connectedCallback() { this._t = setInterval(() => { if (this.st()?.state === "active") this.paint(); }, 1000); }

  disconnectedCallback() { clearInterval(this._t); }

  secs(v) { if (v == null) return 0; if (typeof v === "number") return v; const [h, m, s] = String(v).split(":").map(Number); return (h || 0) * 3600 + (m || 0) * 60 + (s || 0); }

  left() {
    const s = this.st(); if (!s) return 0;
    if (s.state === "active" && s.attributes.finishes_at) return Math.max(0, Math.round((new Date(s.attributes.finishes_at) - Date.now()) / 1000));
    if (s.state === "paused") return this.secs(s.attributes.remaining);
    if (this._dial != null) return this._dial * 60;
    return this.secs(s.attributes.duration);
  }

  paint() {
    const v = this.shadowRoot.querySelector(".v"), arc = this.shadowRoot.querySelector(".arc"), s = this.st();
    if (!v || !s) return;
    const max = Math.max(1, Number(this._config.dial_max) || 60);
    const left = this.left(), tot = this.secs(s.attributes.duration) || 1;
    const f = s.state === "idle" ? (this._config.dial ? Math.min(1, left / 60 / max) : 1) : left / tot;
    const m = Math.floor(left / 60), sec = left % 60;
    v.textContent = `${m >= 60 ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}` : m}:${String(sec).padStart(2, "0")}`;
    const L = 2 * Math.PI * 80 * 0.75, C = 2 * Math.PI * 80;
    if (arc) { arc.setAttribute("stroke-dasharray", `${(L * Math.max(0.0001, f)).toFixed(1)} ${C.toFixed(1)}`); arc.setAttribute("opacity", f > 0 ? 1 : 0); }
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour(), s = this.st();
    const state = s?.state || "missing";
    const word = { active: "Running", paused: "Paused", idle: "Ready", missing: "Timer not found" }[state] || state;
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${panelCss(p, c.radius)};padding:16px;display:flex;flex-direction:column;align-items:center;gap:12px}
      .n{font-size:15px;font-weight:600;display:flex;align-items:center;gap:8px}
      .n ha-icon{--mdc-icon-size:20px;color:${g[this.dark ? 1 : 0]};${state === "active" ? "animation:roost-wiggle 1.2s ease-in-out infinite" : ""}}
      .ring{position:relative;width:100%;max-width:200px;${state === "idle" && c.dial ? "touch-action:none;cursor:grab;" : ""}}
      .knob{position:absolute;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:#fff;border:3px solid ${g[1]};box-shadow:0 3px 8px rgba(0,0,0,.35);pointer-events:none}
      .ring svg{display:block;width:100%}
      .in{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
      .v{font-size:40px;font-weight:700}
      .w{font-size:12px;color:${state === "active" ? g[this.dark ? 1 : 0] : p.muted}}
      .btns{display:flex;gap:10px}
      .b{width:52px;height:52px;border-radius:50%;border:1px solid ${p.border};background:${p.off};${p.fx || ""};color:${p.text};cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .12s}
      .b:active{transform:scale(.9)}
      .b.main{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};border-color:transparent;box-shadow:0 10px 22px -10px ${g[2]}}
      .b ha-icon{--mdc-icon-size:24px}
      .q{display:flex;flex-wrap:wrap;justify-content:center;gap:6px}
      .q button{height:32px;padding:0 12px;border-radius:999px;border:1px solid ${p.border};background:${p.off};${p.fx || ""};color:${p.text};font:inherit;font-size:13px;font-weight:600;cursor:pointer}
    </style>
    <div class="card">
      <div class="n t"><ha-icon icon="${esc(c.icon || "mdi:timer-outline")}"></ha-icon>${esc(this.name(c.entity, "Timer"))}</div>
      <div class="ring">${ringSvg({ f: 1, track: p.track, from: g[0], to: g[1], id: "tg", inner: 58, innerFill: p.dial })}<div class="in"><span class="v num"></span><span class="w t">${esc(word)}</span></div>${state === "idle" && c.dial ? '<span class="knob"></span>' : ""}</div>
      ${s ? `<div class="btns">${state === "active" ? '<button class="b main" data-a="pause" aria-label="Pause"><ha-icon icon="mdi:pause"></ha-icon></button>' : '<button class="b main" data-a="start" aria-label="Start"><ha-icon icon="mdi:play"></ha-icon></button>'}
        ${state !== "idle" ? '<button class="b" data-a="cancel" aria-label="Cancel"><ha-icon icon="mdi:stop"></ha-icon></button>' : ""}</div>
      ${(c.presets || []).length ? `<div class="q">${c.presets.map((m) => `<button data-m="${esc(m)}">${esc(m)} min</button>`).join("")}</div>` : ""}` : ""}
    </div>`;
    if (state !== "idle") this._dial = null;
    this.paint();
    const ring = this.shadowRoot.querySelector(".ring"), knob = this.shadowRoot.querySelector(".knob");
    const max = Math.max(1, Number(c.dial_max) || 60);
    const placeKnob = () => {
      if (!knob) return;
      const f = Math.min(1, this.left() / 60 / max), t = ((135 + 270 * f) * Math.PI) / 180, w = ring.clientWidth;
      knob.style.left = `${(w / 2 + (80 / 210) * w * Math.cos(t)).toFixed(1)}px`; knob.style.top = `${(w / 2 + (80 / 210) * w * Math.sin(t)).toFixed(1)}px`;
    };
    (window.requestAnimationFrame || setTimeout)(placeKnob);
    if (knob) {
      const minsAt = (ev) => {
        const b = ring.getBoundingClientRect(); let a = (Math.atan2(ev.clientY - (b.top + b.width / 2), ev.clientX - (b.left + b.width / 2)) * 180) / Math.PI;
        a = (a - 135 + 360) % 360; if (a > 270) a = a > 315 ? 0 : 270;
        return Math.max(1, Math.round((a / 270) * max));
      };
      const set = (ev) => { const m = minsAt(ev); if (m !== this._dial) { this._dial = m; if (max <= 60 || m % 5 === 0) this.vibrate(); this.paint(); placeKnob(); } };
      ring.addEventListener("pointerdown", (ev) => { this._drag = true; ring.setPointerCapture?.(ev.pointerId); set(ev); });
      ring.addEventListener("pointermove", (ev) => { if (this._drag) set(ev); });
      const end = () => { this._drag = false; };
      ring.addEventListener("pointerup", end); ring.addEventListener("pointercancel", end);
    }
    const hms = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}:00`;
    this.shadowRoot.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => {
      this.vibrate();
      if (b.dataset.a === "start" && state === "idle" && this._dial != null) this.call("timer", "start", { entity_id: c.entity, duration: hms(this._dial) });
      else this.call("timer", b.dataset.a, { entity_id: c.entity });
    }));
    this.shadowRoot.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => {
      this.vibrate();
      const m = Number(b.dataset.m);
      this.call("timer", "start", { entity_id: c.entity, duration: `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}:00` });
    }));
  }
}

// ------------------------------------------------------------------ Roost Fan
// A fan that spins as fast as it is set, with speed buttons, swing and its modes.
class RoostFan extends RoostBase {
  static get defaults() { return { color: "teal", radius: 22, style: "dial", theme: "auto" }; }

  watched() { return [this._config.entity, this._config.temperature, this._config.humidity].filter(Boolean); }

  validate(c) { if (!c.entity) throw new Error("Choose a fan"); }

  // While a finger is on the dial, or a list is open, Home Assistant's updates must not redraw it.
  signature() { return this._drag || this._menuOpen ? this._sig : super.signature(); }

  static getConfigForm() {
    return {
      schema: [
        { name: "sample", label: "Show sample data (try the card without the device)", selector: { boolean: {} } },
        { name: "entity", required: true, selector: { entity: { domain: "fan" } } },
        { name: "style", label: "Look", selector: pick([["dial", "Dial beside the name"], ["big", "Big dial in a square card (like the thermostat)"], ["buttons", "A button for each speed and mode"]]) },
        { type: "grid", name: "", schema: [{ name: "temperature", label: "Room temperature (optional)", selector: { entity: { domain: "sensor" } } }, { name: "humidity", label: "Room humidity (optional)", selector: { entity: { domain: "sensor" } } }] },
        { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "radius", selector: slider(0, 40, 2) }] },
        ...colourFields("color"),
        THEME_FIELD,
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) { return { entity: Object.keys(hass.states).find((id) => id.startsWith("fan.")) || "" }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  render() {
    if (!this._hass || !this._config) return;
    if (this._menuOpen) return; // a list is open: redraw when it closes
    if (this._config.style === "buttons") { this.renderButtons(); return; }
    const c = this._config, p = this.p, g = this.colour(), s = this.st();
    const on = s?.state === "on", a = s?.attributes || {};
    const hasPct = a.percentage != null || a.percentage_step != null;
    const step = Number(a.percentage_step) || 33.34;
    const raw = hasPct ? Math.round(100 / step) : 1;
    const smooth = raw > 6; // many speeds: the dial turns smoothly
    const speeds = smooth ? 100 : Math.max(1, raw);
    const pct = on ? (hasPct ? Number(a.percentage ?? 100) : 100) : 0;
    const names = speeds === 3 ? ["Off", "Low", "Medium", "High"] : speeds === 2 ? ["Off", "Low", "High"] : speeds === 1 ? ["Off", "On"] : null;
    const word = (v) => (v <= 0 ? "Off" : smooth ? `${Math.round(v)}%` : names ? names[Math.round(v / (100 / speeds))] || "On" : `Speed ${Math.round(v / (100 / speeds))}`);
    const modes = a.preset_modes || [];
    const oscil = a.oscillating != null, dir = a.direction != null;
    const offline = !s || UNAVAILABLE.includes(s.state);
    const big = c.style === "big", D = big ? 240 : 168, R = big ? 96 : 64, C = D / 2, HUB = big ? 150 : 100, SW = 270, L = 2 * Math.PI * R * (SW / 360);
    const rd = (id, u) => { const x = id ? this.sx(id) : null; const v = x ? num(x.state) : null; return v == null ? "" : `${fmt(v, Math.min(2, decOf(x.state)))}${u}`; };
    const room = [rd(c.temperature, "°"), rd(c.humidity, "%")].filter(Boolean).join(" · ");
    const at = (f) => { const t = ((135 + SW * f) * Math.PI) / 180; return [C + R * Math.cos(t), C + R * Math.sin(t)]; };
    const stops = smooth ? [0, 1] : Array.from({ length: speeds + 1 }, (_, i) => i / speeds);
    const spin = (v) => (v > 0 ? Math.max(0.28, 2.4 - (v / 100) * 2.1).toFixed(2) : 0);
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${panelCss(p, c.radius)};padding:16px 18px;display:grid;grid-template-columns:${D}px minmax(0,1fr);align-items:center;column-gap:18px;row-gap:12px;position:relative}
      .chips{grid-column:1/-1}
      @container (max-width: 330px){:host .card{grid-template-columns:minmax(0,1fr)}:host .dial{justify-self:center}}
      ${big ? `.card{grid-template-columns:minmax(0,1fr);justify-items:center;padding:20px 18px}.side{width:100%;flex-direction:row;align-items:center;justify-content:space-between}
        .side .sub{display:none}.pill{font-size:12px;font-weight:600;padding:6px 12px;border-radius:999px;background:${on ? `${g[0]}33` : p.inset};color:${on ? g[1] : p.muted}}
        .hub{flex-direction:column;gap:2px}.hub .blades{position:absolute;opacity:${on ? 0.22 : 0.14}}.hub .hw{position:relative;font-size:11px;letter-spacing:1px;color:${p.muted}}
        .hub .hv{position:relative;font-size:32px;font-weight:700;line-height:1.05;color:${on ? p.text : p.muted}}.hub .hr{position:relative;font-size:12px;color:${p.muted}}` : ""}
      .dial{position:relative;width:${D}px;height:${D}px;flex:none;touch-action:none;cursor:pointer;-webkit-tap-highlight-color:transparent}
      .dial svg{position:absolute;inset:0;overflow:visible}
      .arc{transition:stroke-dasharray .12s ease-out}
      .on .arc{animation:roost-fanglow 3s ease-in-out infinite}
      @keyframes roost-fanglow{0%,100%{filter:drop-shadow(0 0 4px ${g[2]})}50%{filter:drop-shadow(0 0 14px ${g[2]})}}
      .knob{transition:cx .12s ease-out,cy .12s ease-out}
      .drag .arc,.drag .knob{transition:none}
      .hub{position:absolute;left:${(D - HUB) / 2}px;top:${(D - HUB) / 2}px;width:${HUB}px;height:${HUB}px;border-radius:50%;display:flex;align-items:center;justify-content:center;
        background:radial-gradient(circle at 40% 30%,${this.dark ? "#232856,#12152E" : "#FFFFFF,#E9ECF8"});box-shadow:inset 0 2px 12px rgba(255,255,255,.06),0 14px 30px -12px rgba(0,0,0,.5)}
      .blades{--mdc-icon-size:${big ? 120 : 62}px;display:flex;color:${on ? g[1] : p.muted}}
      .blades.go{animation:roost-spin var(--spin) linear infinite}
      .air{position:absolute;inset:-6px;border-radius:50%;border:2px solid ${g[1]};opacity:0;pointer-events:none}
      .on .air{animation:roost-air var(--air) ease-out infinite}
      .on .air.b2{animation-delay:calc(var(--air) / 2)}
      @keyframes roost-air{0%{transform:scale(.72);opacity:.55}100%{transform:scale(1.18);opacity:0}}
      .lbl{position:absolute;font-size:11px;font-weight:600;color:${p.muted};transform:translate(-50%,-50%);pointer-events:none}
      .lbl.on2{color:${g[1]}}
      .side{flex:1;min-width:0;display:flex;flex-direction:column;gap:10px}
      .n{font-size:15px;font-weight:600}
      .big{font-size:24px;font-weight:700;letter-spacing:-.4px;line-height:1.1;color:${on ? p.text : p.muted}}
      .l{font-size:13px;color:${p.muted}}
      .chips{display:flex;flex-wrap:nowrap;gap:8px;width:100%}
      .chips .chip{flex:1 1 0;min-width:0;justify-content:center;padding:0 8px}
      @container (max-width: 300px){:host .chips .chip .cw{display:none}}
      .chip{height:40px;padding:0 14px;border-radius:999px;border:1px solid ${p.border};background:${p.off};${p.fx || ""};color:${p.text};font:inherit;font-size:13px;font-weight:600;
        display:inline-flex;align-items:center;gap:7px;cursor:pointer;-webkit-tap-highlight-color:transparent}
      .chip ha-icon{--mdc-icon-size:18px}
      .chip.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};border-color:transparent;box-shadow:0 8px 18px -10px ${g[2]}}
      .chip.on.sw ha-icon{animation:roost-swing 2.2s ease-in-out infinite}
      @keyframes roost-swing{0%,100%{transform:rotate(-28deg)}50%{transform:rotate(28deg)}}
      .chip:active{transform:scale(.95)}
      .menu{position:absolute;right:14px;bottom:14px;z-index:3;min-width:150px;max-height:220px;overflow:auto;padding:6px;border-radius:16px;border:1px solid ${p.border};
        background:${this.dark ? "#1A1F3D" : "#FFFFFF"};box-shadow:0 18px 40px -12px rgba(0,0,0,.55);display:flex;flex-direction:column;gap:2px}
      .menu[hidden]{display:none}
      .mi{all:unset;padding:10px 12px;border-radius:10px;font-size:14px;cursor:pointer;color:${p.text};display:flex;align-items:center;justify-content:space-between;gap:10px}
      .mi:hover,.mi.on{background:${g[0]}2E}
    </style>
    <div class="card">
      <div class="dial ${on ? "on" : ""}" role="slider" tabindex="0" aria-label="Fan speed" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}" aria-valuetext="${esc(word(pct))}"
        style="--spin:${spin(pct)}s;--air:${on ? Math.max(0.7, 2.6 - (pct / 100) * 1.8).toFixed(2) : 2}s">
        <svg width="${D}" height="${D}" viewBox="0 0 ${D} ${D}" aria-hidden="true">
          <defs><linearGradient id="fg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${g[0]}"/><stop offset="1" stop-color="${g[1]}"/></linearGradient></defs>
          <circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="${p.track}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${L.toFixed(1)} 999" transform="rotate(135 ${C} ${C})"/>
          <circle class="arc" cx="${C}" cy="${C}" r="${R}" fill="none" stroke="url(#fg)" stroke-width="12" stroke-linecap="round" stroke-dasharray="0 999" transform="rotate(135 ${C} ${C})"/>
          ${stops.map((f) => { const [x, y] = at(f); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="${this.dark ? "#0B0D17" : "#FFFFFF"}" opacity=".9"/>`; }).join("")}
          <circle class="knob" r="11" fill="#fff" stroke="${g[1]}" stroke-width="3" cx="0" cy="0" style="filter:drop-shadow(0 3px 6px rgba(0,0,0,.35))"/>
        </svg>
        ${!smooth && speeds <= 4 ? stops.map((f, i) => { const [x, y] = at(f); const dx = (x - C) * 0.32, dy = (y - C) * 0.32; return `<span class="lbl" data-i="${i}" style="left:${(x + dx).toFixed(1)}px;top:${(y + dy).toFixed(1)}px">${esc((names || [])[i] || i)}</span>`; }).join("") : ""}
        <span class="hub" role="button" aria-label="Turn the fan on or off"><span class="air"></span><span class="air b2"></span>
          <ha-icon class="blades ${on ? "go" : ""}" icon="mdi:fan"></ha-icon>${big ? `<span class="hw">SPEED</span><span class="hv num">${offline ? "Offline" : esc(word(pct))}</span>${room ? `<span class="hr t">Room ${esc(room)}</span>` : ""}` : ""}</span>
      </div>
      <div class="side"${big ? ' style="order:-1"' : ""}>
        <div class="n t">${esc(this.name(c.entity, "Fan"))}</div>${big ? `<span class="pill">${on ? `On${hasPct ? ` · ${Math.round(pct)}%` : ""}` : "Off"}</span>` : ""}
        <div class="sub"><div class="big num" aria-live="polite">${offline ? "Offline" : esc(word(pct))}</div>
          <div class="l t">${on && hasPct ? `${Math.round(pct)}%` : on ? "On" : "Turn the dial or tap the fan"}${a.preset_mode && on ? ` · ${esc(nice(a.preset_mode))}` : ""}${room ? ` · Room ${esc(room)}` : ""}</div></div>
      </div>
        ${oscil || dir || modes.length ? `<div class="chips">
          ${oscil ? `<button class="chip sw ${a.oscillating ? "on" : ""}" data-o="1" aria-pressed="${!!a.oscillating}"><ha-icon icon="mdi:arrow-oscillating"></ha-icon><span class="cw">Swing</span></button>` : ""}
          ${dir ? `<button class="chip" data-d="1" aria-label="Direction"><ha-icon icon="${a.direction === "reverse" ? "mdi:rotate-left" : "mdi:rotate-right"}"></ha-icon><span class="cw">${a.direction === "reverse" ? "Reverse" : "Forward"}</span></button>` : ""}
          ${modes.length ? `<button class="chip ${a.preset_mode ? "on" : ""}" data-menu="1" aria-haspopup="true"><ha-icon icon="mdi:tune-variant"></ha-icon><span class="cw">${esc(nice(a.preset_mode) || "Mode")}</span><ha-icon icon="mdi:chevron-down" style="--mdc-icon-size:16px;margin-right:-4px"></ha-icon></button>` : ""}
        </div>` : ""}
      ${modes.length ? `<div class="menu" hidden role="menu">${a.preset_mode ? `<button class="mi" data-m="">None</button>` : ""}${modes.map((m) => `<button class="mi ${a.preset_mode === m ? "on" : ""}" role="menuitem" data-m="${esc(m)}">${esc(m)}${a.preset_mode === m ? '<ha-icon icon="mdi:check" style="--mdc-icon-size:16px"></ha-icon>' : ""}</button>`).join("")}</div>` : ""}
    </div>`;
    const r = this.shadowRoot, dial = r.querySelector(".dial"), arc = r.querySelector(".arc"), knob = r.querySelector(".knob"), bigEl = r.querySelector(big ? ".hv" : ".big");
    const paint = (v) => {
      const f = Math.max(0, Math.min(1, v / 100));
      arc.setAttribute("stroke-dasharray", `${(L * f).toFixed(1)} 999`);
      arc.style.opacity = f > 0 ? 1 : 0;
      const [x, y] = at(f); knob.setAttribute("cx", x.toFixed(1)); knob.setAttribute("cy", y.toFixed(1));
      r.querySelectorAll(".lbl").forEach((el) => el.classList.toggle("on2", Math.abs(+el.dataset.i / speeds - f) < 0.001));
    };
    (window.requestAnimationFrame || setTimeout)(() => paint(pct));
    const snap = (v) => (smooth ? Math.round(v) : Math.round(v / (100 / speeds)) * (100 / speeds));
    const valueAt = (ev) => {
      const b = dial.getBoundingClientRect(); const dx = ev.clientX - (b.left + b.width / 2), dy = ev.clientY - (b.top + b.height / 2);
      let ang = (Math.atan2(dy, dx) * 180) / Math.PI; ang = (ang - 135 + 360) % 360;
      if (ang > SW) ang = ang > SW + (360 - SW) / 2 ? 0 : SW;
      return (ang / SW) * 100;
    };
    const send = (v) => {
      this.vibrate();
      if (v <= 0) this.call("fan", "turn_off", { entity_id: c.entity });
      else if (hasPct) this.call("fan", "set_percentage", { entity_id: c.entity, percentage: Math.round(Math.min(100, v)) });
      else this.call("fan", "turn_on", { entity_id: c.entity });
    };
    let moved = false, startV = 0;
    dial.addEventListener("pointerdown", (ev) => {
      if (ev.target.closest(".hub")) return;
      this._drag = true; moved = false; startV = pct; dial.classList.add("drag");
      dial.setPointerCapture?.(ev.pointerId);
      const v = snap(valueAt(ev)); paint(v); bigEl && (bigEl.textContent = word(v)); this._dv = v;
    });
    dial.addEventListener("pointermove", (ev) => {
      if (!this._drag) return;
      moved = true; const v = snap(valueAt(ev)); if (v !== this._dv) { this._dv = v; paint(v); bigEl && (bigEl.textContent = word(v)); if (!smooth) this.vibrate(); }
    });
    const end = () => {
      if (!this._drag) return;
      this._drag = false; dial.classList.remove("drag");
      if (this._dv !== startV || !moved) send(this._dv);
    };
    dial.addEventListener("pointerup", end);
    dial.addEventListener("pointercancel", () => { this._drag = false; dial.classList.remove("drag"); paint(pct); bigEl && (bigEl.textContent = word(pct)); });
    dial.addEventListener("keydown", (ev) => {
      const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[ev.key];
      if (!d) return; ev.preventDefault();
      send(Math.max(0, Math.min(100, snap(pct + d * (smooth ? 10 : 100 / speeds)))));
    });
    r.querySelector(".hub").addEventListener("click", (ev) => { ev.stopPropagation(); this.vibrate(); this.call("fan", "toggle", { entity_id: c.entity }); });
    r.querySelectorAll("[data-o]").forEach((b) => b.addEventListener("click", () => { this.vibrate(); this.call("fan", "oscillate", { entity_id: c.entity, oscillating: !a.oscillating }); }));
    r.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", () => { this.vibrate(); this.call("fan", "set_direction", { entity_id: c.entity, direction: a.direction === "reverse" ? "forward" : "reverse" }); }));
    const menu = r.querySelector(".menu");
    this._menuOpen = false;
    r.querySelectorAll("[data-menu]").forEach((b) => b.addEventListener("click", (ev) => {
      ev.stopPropagation(); menu.hidden = !menu.hidden; this._menuOpen = !menu.hidden;
      if (this._menuOpen) {
        const away = (e) => { if (!e.composedPath().includes(this)) { window.removeEventListener("pointerdown", away, true); menu.hidden = true; this._menuOpen = false; this._sig = null; this.hass = this._hass; } };
        window.addEventListener("pointerdown", away, true);
      }
    }));
    r.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => {
      this.vibrate(); menu.hidden = true; this._menuOpen = false; this._sig = null;
      if (b.dataset.m) this.call("fan", "set_preset_mode", { entity_id: c.entity, preset_mode: b.dataset.m });
      else this.call("fan", "set_percentage", { entity_id: c.entity, percentage: Math.round(pct || 100 / speeds) });
    }));
    r.querySelector(".card").addEventListener("click", (ev) => { if (menu && !menu.hidden && !ev.target.closest(".menu,[data-menu]")) { menu.hidden = true; this._menuOpen = false; } });
  }

  renderButtons() {
    const c = this._config, p = this.p, g = this.colour(), s = this.st();
    const on = s?.state === "on", a = s?.attributes || {};
    const pct = on ? a.percentage ?? 100 : 0;
    const step = a.percentage_step || 33.34;
    const speeds = a.percentage != null || a.percentage_step ? Math.min(6, Math.max(1, Math.round(100 / step))) : 0;
    const oscil = a.oscillating != null;
    const modes = a.preset_modes || [];
    const dur = on ? Math.max(0.25, 2.2 - (pct / 100) * 1.9).toFixed(2) : 0;
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      :host{container-type:inline-size}
      .card{${panelCss(p, c.radius)};padding:16px;display:flex;flex-direction:column;gap:14px}
      .top{display:flex;align-items:center;gap:14px}
      @container (max-width: 260px){:host .top{flex-direction:column;align-items:flex-start;gap:10px}}
      .ic{width:64px;height:64px;border-radius:20px;flex:none;display:flex;align-items:center;justify-content:center;cursor:pointer;
        background:${on ? `linear-gradient(135deg,${g[0]},${g[1]})` : p.inset};color:${on ? g[3] : p.muted};box-shadow:${on ? `0 12px 26px -12px ${g[2]}` : "none"}}
      .ic ha-icon{--mdc-icon-size:36px;${on ? `animation:roost-spin ${dur}s linear infinite` : ""}}
      .tx{flex:1;min-width:0}
      .n{font-size:15px;font-weight:600}
      .l{font-size:13px;color:${p.muted};margin-top:2px}
      .row{display:flex;gap:8px;flex-wrap:wrap}
      .b{flex:1;min-width:52px;height:44px;border-radius:14px;border:1px solid ${p.border};background:${p.off};${p.fx || ""};color:${p.text};font:inherit;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px}
      .b.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};border-color:transparent}
      .b ha-icon{--mdc-icon-size:18px}
    </style>
    <div class="card">
      <div class="top"><span class="ic" role="button" tabindex="0" aria-label="On or off" data-pop="${on ? 1 : 0}" data-popkey="ic"><ha-icon icon="mdi:fan"></ha-icon></span>
        <span class="tx"><div class="n t">${esc(this.name(c.entity, "Fan"))}</div><div class="l t">${!s ? "Device not found" : UNAVAILABLE.includes(s.state) ? "Offline" : on ? `On${a.percentage != null ? ` · ${Math.round(pct)}%` : ""}${a.preset_mode ? ` · ${esc(nice(a.preset_mode))}` : ""}` : "Off"}</div></span></div>
      ${speeds > 1 ? `<div class="row"><button class="b ${!on ? "on" : ""}" data-p="0">Off</button>${Array.from({ length: speeds }, (_, i) => {
        const v = Math.round(Math.min(100, (i + 1) * step));
        return `<button class="b ${on && Math.abs(pct - v) < step / 2 ? "on" : ""}" data-p="${v}">${speeds === 3 ? ["Low", "Medium", "High"][i] : i + 1}</button>`;
      }).join("")}</div>` : ""}
      ${oscil || modes.length ? `<div class="row">${oscil ? `<button class="b ${a.oscillating ? "on" : ""}" data-o="1"><ha-icon icon="mdi:arrow-oscillating"></ha-icon>Swing</button>` : ""}${modes.map((m) => `<button class="b ${a.preset_mode === m ? "on" : ""}" data-m="${esc(m)}">${esc(m)}</button>`).join("")}</div>` : ""}
    </div>`;
    const r = this.shadowRoot;
    r.querySelector(".ic").addEventListener("click", () => { this.vibrate(); this.call("fan", "toggle", { entity_id: c.entity }); });
    r.querySelectorAll("[data-p]").forEach((b) => b.addEventListener("click", () => { this.vibrate(); const v = +b.dataset.p; this.call("fan", v ? "set_percentage" : "turn_off", v ? { entity_id: c.entity, percentage: v } : { entity_id: c.entity }); }));
    r.querySelectorAll("[data-o]").forEach((b) => b.addEventListener("click", () => { this.vibrate(); this.call("fan", "oscillate", { entity_id: c.entity, oscillating: !a.oscillating }); }));
    r.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { this.vibrate(); this.call("fan", "set_preset_mode", { entity_id: c.entity, preset_mode: b.dataset.m }); }));
  }
}

// ------------------------------------------------------------------ Roost Vacuum
// A robot vacuum seen from above on a little floor: it drives in lanes while it cleans (a wet trail when it mops), spirals for a spot clean,
// heads home to its dock, charges there, and says when something needs care. One big button, the dock, and the rest tucked away.
const VAC_SHAPES = [["auto", "Find it from the brand"], ["lidar", "Round with a laser tower (Roborock, Dreame, Xiaomi, Eufy X, Tapo)"], ["lidar_rear", "Round, tower at the back (Ecovacs Deebot)"],
  ["flush", "Round, tower hidden inside (Dreame X40/X50, Roborock Qrevo Curv)"], ["round", "Round without a tower (Roomba i/j, Eufy G, Shark ION)"], ["shark", "Shark AI / Matrix"],
  ["d_shape", "Flat front (Roomba s9, Neato, Ecovacs X2)"], ["slim", "Slim disc (Eufy RoboVac 11S/15C/30C)"]];

// The robot as a clean line drawing, from above, facing up. 100 × 100.
function vacSvg(shape, g, p, dark, wet) {
  const body = "url(#vb)", line = dark ? "#D6DAF7" : "#2A3060", soft = dark ? "#5A6199" : "#B7BEE0";
  const defs = `<defs><radialGradient id="vb" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="${dark ? "#3A4280" : "#FFFFFF"}"/><stop offset="1" stop-color="${dark ? "#1D2350" : "#DDE1F0"}"/></radialGradient></defs>`;
  const brush = (x, y) => `<g class="sb" style="transform-origin:${x}px ${y}px"><circle cx="${x}" cy="${y}" r="2.2" fill="${line}"/>${[0, 72, 144, 216, 288].map((a) => `<line x1="${x}" y1="${y}" x2="${(x + 12 * Math.cos((a * Math.PI) / 180)).toFixed(1)}" y2="${(y + 12 * Math.sin((a * Math.PI) / 180)).toFixed(1)}" stroke="${line}" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>`).join("")}</g>`;
  const two = shape === "shark" || shape === "slim" || shape === "d_shape";
  const brushes = two ? brush(16, 20) + brush(84, 20) : brush(17, 20);
  const pads = wet ? `<g class="pads"><circle cx="33" cy="84" r="13" fill="#38BDF8" opacity=".35"/><circle cx="67" cy="84" r="13" fill="#38BDF8" opacity=".35"/>
    <circle class="pd" cx="33" cy="84" r="13" fill="none" stroke="#38BDF8" stroke-width="1.6" stroke-dasharray="5 3" style="transform-origin:33px 84px"/><circle class="pd" cx="67" cy="84" r="13" fill="none" stroke="#38BDF8" stroke-width="1.6" stroke-dasharray="5 3" style="transform-origin:67px 84px"/></g>` : "";
  const outline = shape === "d_shape" ? "M8 34 Q8 8 22 8 H78 Q92 8 92 34 V54 A42 42 0 0 1 8 54 Z" : "";
  const shell = outline ? `<path d="${outline}" fill="${body}" stroke="${line}" stroke-width="2"/>` : `<circle cx="50" cy="50" r="${shape === "slim" ? 44 : 43}" fill="${body}" stroke="${line}" stroke-width="2"/>`;
  const bumper = outline ? `<path d="M10 30 Q10 11 22 11 H78 Q90 11 90 30" fill="none" stroke="${soft}" stroke-width="3" stroke-linecap="round"/>`
    : `<path d="M14 38 A38 38 0 0 1 86 38" fill="none" stroke="${soft}" stroke-width="3" stroke-linecap="round"/>`;
  const tower = (cy, r) => `<circle cx="50" cy="${cy}" r="${r}" fill="${dark ? "#141831" : "#FFFFFF"}" stroke="${line}" stroke-width="1.4"/><g class="ld" style="transform-origin:50px ${cy}px"><path d="M50 ${cy} L50 ${cy - r + 2.5}" stroke="${g[1]}" stroke-width="2" stroke-linecap="round"/><circle cx="50" cy="${cy}" r="${r - 4}" fill="none" stroke="${soft}" stroke-width="1"/></g>`;
  const top = {
    lidar: tower(36, 11),
    lidar_rear: tower(64, 11) + `<rect x="40" y="18" width="20" height="5" rx="2.5" fill="${soft}"/>`,
    flush: `<circle cx="50" cy="38" r="10" fill="none" stroke="${soft}" stroke-width="1.2" stroke-dasharray="2 2"/><g class="ld" style="transform-origin:50px 38px"><path d="M50 38 L50 30" stroke="${g[1]}" stroke-width="1.6" stroke-linecap="round"/></g>`,
    round: `<circle cx="50" cy="50" r="12" fill="none" stroke="${soft}" stroke-width="1.4"/><circle cx="50" cy="50" r="5" fill="${g[1]}" opacity=".85"/><path d="M38 70 H62" stroke="${soft}" stroke-width="2" stroke-linecap="round"/>`,
    shark: `<path d="M24 26 Q50 14 76 26" fill="none" stroke="${g[1]}" stroke-width="3" stroke-linecap="round" opacity=".9"/><circle cx="50" cy="54" r="9" fill="none" stroke="${soft}" stroke-width="1.4"/><circle cx="50" cy="54" r="3.5" fill="${line}"/><path d="M30 72 Q50 80 70 72" fill="none" stroke="${soft}" stroke-width="1.6"/>`,
    d_shape: `<rect x="34" y="30" width="32" height="14" rx="7" fill="none" stroke="${soft}" stroke-width="1.4"/><circle cx="50" cy="58" r="6" fill="${g[1]}" opacity=".85"/>`,
    slim: `<circle cx="50" cy="50" r="7" fill="none" stroke="${soft}" stroke-width="1.4"/><circle cx="50" cy="50" r="2.5" fill="${g[1]}"/><path d="M26 74 Q50 84 74 74" fill="none" stroke="${soft}" stroke-width="1.6"/>`,
  }[shape] || "";
  return `<svg viewBox="0 0 100 100" aria-hidden="true" style="overflow:visible">${defs}${pads}${brushes}${shell}${bumper}${top}<circle cx="${shape === "d_shape" ? 50 : 50}" cy="${shape === "d_shape" ? 12 : 9}" r="1.6" fill="${g[1]}"/></svg>`;
}

class RoostVacuum extends RoostBase {
  static get defaults() {
    return { color: "purple", shape: "auto", image: "", view: "robot", rooms: [], show_rooms: true, show_care: true, show_chips: true, radius: 22, theme: "auto" };
  }

  validate(c) { if (!c.entity) throw new Error("Choose a robot vacuum"); }

  static getConfigForm() {
    return {
      schema: [
        { name: "sample", label: "Show sample data (try the card without the robot)", selector: { boolean: {} } },
        { name: "entity", required: true, selector: { entity: { domain: "vacuum" } } },
        { name: "name", selector: { text: {} } },
        { type: "expandable", name: "", title: "Picture", icon: "mdi:robot-vacuum", schema: [
          { name: "shape", label: "Drawing of the robot", selector: pick(VAC_SHAPES) },
          { name: "image", label: "Or a picture of your robot from above (for example /local/robot.png)", selector: { text: {} } },
          { name: "map", label: "Map from the robot (a camera or image entity, optional)", selector: { entity: { domain: ["camera", "image"] } } },
          { name: "view", label: "Show first", selector: pick([["robot", "The robot on its floor"], ["map", "The map (when there is one)"]]) },
        ] },
        { type: "expandable", name: "", title: "Rooms to clean", icon: "mdi:floor-plan", schema: [
          { name: "rooms", label: "Rooms (pick the Home Assistant area; map the robot's rooms to areas in the vacuum's settings first)", selector: { object: { multiple: true, label_field: "name", fields: {
            name: { label: "Name", required: true, selector: { text: {} } },
            icon: { label: "Icon", selector: { icon: {} } },
            area: { label: "Area", selector: { area: {} } },
            tap_action: { label: "Or what to do (for older robots: a script or a command)", selector: { ui_action: {} } },
          } } } },
          { name: "show_rooms", label: "Show the rooms", selector: { boolean: {} } },
        ] },
        { type: "expandable", name: "", title: "More readings (found by themselves; pick here to change)", icon: "mdi:tune", schema: [
          { name: "battery", selector: { entity: { domain: "sensor" } } },
          { type: "grid", name: "", schema: [{ name: "area_sensor", label: "Area cleaned", selector: { entity: { domain: "sensor" } } }, { name: "time_sensor", label: "Cleaning time", selector: { entity: { domain: "sensor" } } }] },
          { name: "error_sensor", label: "Error", selector: { entity: { domain: "sensor" } } },
          { name: "consumables", label: "Filter, brushes, mop pad (care)", selector: { entity: { multiple: true, domain: "sensor" } } },
          { name: "selects", label: "Settings shown as chips (water flow, mop mode)", selector: { entity: { multiple: true, domain: "select" } } },
          { name: "buttons", label: "Dock buttons (empty dustbin, wash mop)", selector: { entity: { multiple: true, domain: "button" } } },
          { type: "grid", name: "", schema: [{ name: "show_chips", label: "Suction and settings chips", selector: { boolean: {} } }, { name: "show_care", label: "Care (filter, brushes)", selector: { boolean: {} } }] },
        ] },
        { type: "expandable", name: "", title: "Look", icon: "mdi:palette", schema: [...colourFields("color"), { type: "grid", name: "", schema: [{ name: "radius", selector: slider(0, 40, 2) }, THEME_FIELD] }] },
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) { return { entity: Object.keys(hass.states).find((id) => id.startsWith("vacuum.")) || "" }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  connectedCallback() {
    // the map is a picture that changes while the robot cleans
    this._mapTick = setInterval(() => { if (this._showMap && this.st()?.state === "cleaning") { const im = this.shadowRoot?.querySelector(".map img"); if (im && this._mapSrc) im.src = `${this._mapSrc}${this._mapSrc.includes("?") ? "&" : "?"}t=${Date.now()}`; } }, 6000);
  }

  disconnectedCallback() { clearInterval(this._mapTick); clearTimeout(this._locT); }

  // Everything that belongs to the robot: what the card is told, else what sits on the same device.
  parts() {
    const c = this._config, h = this._hass, id = c.entity;
    const dev = h?.entities?.[id]?.device_id;
    const mine = dev ? deviceEntities(h, dev) : [];
    const S = (x) => h.states[x], nm = (x) => `${x} ${(S(x)?.attributes.friendly_name || "").toLowerCase()}`;
    const sensors = mine.filter((x) => x.startsWith("sensor."));
    const pickS = (re, test = () => true) => sensors.find((x) => re.test(nm(x)) && test(S(x)));
    const CARE = /filter|brush|mop_pad|mop pad|mopping pad|\bpad\b|sensor_dirty|sensors? dirty|dust_bag|dust bag|strainer|cleaning_brush|dirty water|roller/;
    return {
      battery: c.battery || sensors.find((x) => S(x)?.attributes.device_class === "battery"),
      area: c.area_sensor || pickS(/clean(ing|ed)?_?area|cleaned area|cleaning area/, (s) => /m²|m2|ft²/.test(s?.attributes.unit_of_measurement || "")),
      time: c.time_sensor || pickS(/clean(ing)?_?(time|duration)/, (s) => s?.attributes.device_class === "duration" || /min|h|s/.test(s?.attributes.unit_of_measurement || "")),
      error: c.error_sensor || pickS(/error/),
      care: c.consumables || sensors.filter((x) => CARE.test(nm(x)) && !/total|count|last|reset/.test(nm(x)) && (/%|h|min|s|d/.test(S(x)?.attributes.unit_of_measurement || "") || S(x)?.attributes.device_class === "duration")),
      selects: c.selects || mine.filter((x) => x.startsWith("select.") && !/map|language|volume|voice/.test(nm(x))),
      buttons: c.buttons || mine.filter((x) => x.startsWith("button.") && !/reset|restart|identify|reboot/.test(nm(x))),
      map: c.map || mine.find((x) => /^(camera|image)\./.test(x) && /map/.test(nm(x))),
      mopOn: mine.find((x) => x.startsWith("binary_sensor.") && /mop(_pad)?_(attached|installed)|mop attached|mop installed/.test(nm(x)) && S(x)?.state === "on"),
    };
  }

  watched() {
    if (!this._hass) return [this._config.entity];
    const q = this.parts();
    return [this._config.entity, q.battery, q.area, q.time, q.error, q.map, q.mopOn, ...(q.care || []), ...(q.selects || [])].filter(Boolean);
  }

  extraSignature() { return `${this._showMap ? 1 : 0}|${(this._rooms || []).join(",")}|${this._careOpen ? 1 : 0}`; }

  shape() {
    const c = this._config;
    if (c.shape && c.shape !== "auto") return c.shape;
    const h = this._hass, d = h?.devices?.[h?.entities?.[c.entity]?.device_id];
    const who = `${d?.manufacturer || ""} ${d?.model || ""} ${d?.name || ""} ${this.st()?.attributes.friendly_name || ""}`.toLowerCase();
    if (/roomba|irobot/.test(who)) return /\bs9|s 9/.test(who) ? "d_shape" : "round";
    if (/neato|botvac/.test(who)) return "d_shape";
    if (/shark/.test(who)) return "shark";
    if (/ecovacs|deebot/.test(who)) return /\bx2\b/.test(who) ? "d_shape" : "lidar_rear";
    if (/eufy|anker|robovac/.test(who)) return /\b(x8|x9|x10|l35|l50|l60|s1|e20|e25|c20|omni|g40)/.test(who) ? "lidar" : "slim";
    if (/dreame/.test(who) && /\bx(4|5)0|l40s? ultra|aqua10/.test(who)) return "flush";
    if (/qrevo curv|saros/.test(who)) return "flush";
    return "lidar";
  }

  render() {
    if (!this._hass || !this._config) return;
    if (this._menuOpen) return; // a list is open: redraw when it closes
    const c = this._config, p = this.p, g = this.colour(), s = this.st(), a = s?.attributes || {}, q = this.parts(), S = (x) => (x ? this.sx(x) : null);
    const state = s?.state || "missing";
    const offline = !s || UNAVAILABLE.includes(state);
    const st2 = String(a.status || "").toLowerCase();
    const spot = state === "cleaning" && /spot/.test(st2);
    const errText = state === "error" ? (S(q.error)?.state && !/^(unknown|unavailable)$/.test(S(q.error).state) ? String(S(q.error).state).replace(/_/g, " ") : a.status || "Needs help") : "";
    const mopSel = (q.selects || []).map((x) => S(x)).find((x) => x && /water|mop|scrub/.test(`${x.entity_id} ${x.attributes.friendly_name || ""}`.toLowerCase()));
    const wet = !!q.mopOn || /mop/.test(st2) || (mopSel && !/^(off|none|vacuum|no|closed|0|unavailable|unknown)$/i.test(mopSel.state) && !/^vacuum$/i.test(mopSel.state));
    const batS = S(q.battery);
    const bat = batS ? num(batS.state) : num(a.battery_level);
    const charging = state === "docked" && (bat == null || bat < 100 || /charg/.test(st2));
    const word = offline ? "Offline" : { cleaning: spot ? "Spot cleaning" : "Cleaning", docked: charging ? "Charging" : "Docked", returning: "Going home", paused: "Paused", idle: "Ready", error: "Needs help" }[state] || state;
    const rd = (x) => { const v = S(x); if (!v || UNAVAILABLE.includes(v.state)) return ""; const n = num(v.state); const u = v.attributes.unit_of_measurement || ""; return n == null ? v.state : `${fmt(n, decOf(v.state, u))}${/^(%|°|°C)$/.test(u) ? u : u ? ` ${u}` : ""}`; };
    const areaTxt = rd(q.area) || (a.cleaned_area ? `${fmt(Number(a.cleaned_area), decOf(a.cleaned_area))} m²` : "");
    const facts = [state === "cleaning" || state === "paused" || state === "returning" ? areaTxt : "", state === "cleaning" || state === "paused" ? rd(q.time) : "", a.fan_speed && state === "cleaning" ? String(a.fan_speed) : ""].filter(Boolean);
    const shape = this.shape();
    const pic = c.image === "entity" ? a.entity_picture : c.image;
    const mapSt = S(q.map);
    this._mapSrc = mapSt?.attributes.entity_picture || "";
    if (this._showMap == null) this._showMap = c.view === "map" && !!this._mapSrc;
    const showMap = this._showMap && this._mapSrc;
    const rooms = (c.show_rooms !== false && c.rooms) || [];
    const sel = (this._rooms || []).filter((i) => rooms[i]);
    const busy = state === "cleaning" || state === "returning";
    const mainLabel = state === "cleaning" ? "Pause" : state === "paused" ? "Resume" : state === "returning" ? "Pause" : sel.length ? `Clean ${sel.length === 1 ? rooms[sel[0]].name : `${sel.length} rooms`}` : "Start";
    const mainIcon = state === "cleaning" || state === "returning" ? "mdi:pause" : "mdi:play";
    // care: the weakest part first
    const care = (q.care || []).map((x) => {
      const v = S(x); if (!v || UNAVAILABLE.includes(v.state)) return null;
      const n = num(v.state); if (n == null) return null;
      const u = v.attributes.unit_of_measurement || "", dc = v.attributes.device_class;
      let hours = null, pct = null;
      if (u === "%") pct = n; else if (dc === "duration" || /^(h|min|s|d)$/.test(u)) hours = u === "min" ? n / 60 : u === "s" ? n / 3600 : u === "d" ? n * 24 : n;
      const name = (v.attributes.friendly_name || x).replace(new RegExp(`^${(this.name(c.entity) || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "i"), "").replace(/\b(left|remaining|time left|life)\b/gi, "").trim();
      return { id: x, name: name ? name.charAt(0).toUpperCase() + name.slice(1) : "Part", pct, hours, low: pct != null ? pct <= 15 : hours != null ? hours <= 10 : false };
    }).filter(Boolean).sort((x, y) => (x.pct ?? (x.hours ?? 999) / 3) - (y.pct ?? (y.hours ?? 999) / 3));
    const lowCare = care.filter((x) => x.low);
    const chips = [];
    if ((a.fan_speed_list || []).length) chips.push({ key: "fan", icon: "mdi:fan", label: a.fan_speed ? String(a.fan_speed).charAt(0).toUpperCase() + String(a.fan_speed).slice(1) : "Suction", list: a.fan_speed_list, cur: a.fan_speed });
    (q.selects || []).forEach((x) => { const v = S(x); if (v && (v.attributes.options || []).length) chips.push({ key: x, icon: /water|mop|scrub/.test(`${x} ${v.attributes.friendly_name || ""}`.toLowerCase()) ? "mdi:water" : "mdi:tune-variant", label: String(v.state).charAt(0).toUpperCase() + String(v.state).slice(1), list: v.attributes.options, cur: v.state, title: (v.attributes.friendly_name || x).replace(this.name(c.entity) || "", "").trim() }); });
    const shown = c.show_chips === false ? [] : chips.slice(0, 3), hidden = c.show_chips === false ? chips : chips.slice(3);
    const sf = a.supported_features, can = (bit) => sf == null || (Number(sf) & bit) > 0;
    const pos = { docked: [21, 50], returning: [21, 50], paused: [56, 48], idle: [42, 52], error: [52, 50], missing: [42, 52] }[state] || [42, 52];
    const dur = 18, ph = `${(-((Date.now() / 1000) % dur)).toFixed(2)}s`; // the robot carries on from where it was after a redraw
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${panelCss(p, c.radius)};padding:16px;display:flex;flex-direction:column;gap:14px;position:relative}
      .top{display:flex;align-items:center;gap:12px}
      .tx{flex:1;min-width:0}
      .n{font-size:15px;font-weight:600}
      .l{font-size:13px;color:${state === "error" ? "#F43F6B" : p.muted};margin-top:2px}
      .bat{display:inline-flex;align-items:center;gap:4px;height:30px;padding:0 10px;border-radius:999px;background:${p.inset};font-size:12px;font-weight:600;color:${bat != null && bat <= 20 ? "#F43F6B" : p.text};flex:none}
      .bat ha-icon{--mdc-icon-size:17px;color:${bat != null && bat <= 20 ? "#F43F6B" : charging ? "#34D399" : p.muted}}
      ${charging ? ".bat ha-icon{animation:roost-breathe 1.8s ease-in-out infinite}" : ""}
      .tg{width:34px;height:34px;border-radius:12px;border:1px solid ${p.border};background:${showMap ? `linear-gradient(135deg,${g[0]},${g[1]})` : p.off};color:${showMap ? g[3] : p.muted};display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none}
      .tg ha-icon{--mdc-icon-size:18px}
      .stage{position:relative;height:178px;border-radius:18px;overflow:hidden;background:${p.inset};border:1px solid ${p.border};container-type:inline-size}
      .floor{position:absolute;inset:0;background-image:linear-gradient(${this.dark ? "rgba(255,255,255,.035)" : "rgba(40,48,96,.05)"} 1px,transparent 1px),linear-gradient(90deg,${this.dark ? "rgba(255,255,255,.035)" : "rgba(40,48,96,.05)"} 1px,transparent 1px);background-size:22px 22px}
      .dust{position:absolute;width:2px;height:2px;border-radius:50%;background:${p.muted};opacity:.35}
      .lane{position:absolute;left:22%;right:6%;height:18%;transform-origin:left center;transform:scaleX(0);
        background:${wet ? "linear-gradient(90deg,rgba(56,189,248,.22),rgba(56,189,248,.12))" : `linear-gradient(90deg,${g[0]}24,${g[1]}14)`}}
      .lane.r{transform-origin:right center}
      .dock{position:absolute;left:3%;top:50%;width:13%;max-width:64px;min-width:40px;aspect-ratio:1/1.35;transform:translateY(-50%);border-radius:12px 12px 10px 10px;
        background:${this.dark ? "#141831" : "#FFFFFF"};border:1.5px solid ${this.dark ? "#3A4170" : "#C9CEF2"};display:flex;align-items:flex-start;justify-content:center;padding-top:8%}
      .dock::after{content:"";position:absolute;right:-3px;top:38%;width:4px;height:24%;border-radius:2px;background:${charging ? "#34D399" : this.dark ? "#3A4170" : "#C9CEF2"}}
      .dock ha-icon{--mdc-icon-size:16px;color:${charging ? "#34D399" : p.muted}}
      ${charging ? ".dock ha-icon{animation:roost-breathe 1.6s ease-in-out infinite}" : ""}
      .bot{position:absolute;left:${pos[0]}%;top:${pos[1]}%;width:62px;height:62px;margin:-31px 0 0 -31px;z-index:2}
      .body{position:absolute;inset:0;transform:rotate(${state === "returning" ? 270 : state === "docked" ? 90 : 0}deg);filter:drop-shadow(0 6px 10px rgba(0,0,0,${this.dark ? 0.45 : 0.18}))}
      .body svg,.body img{width:100%;height:100%;display:block}
      .body img{border-radius:50%;object-fit:cover}
      .sb{animation:${busy ? "roost-spin .5s linear infinite" : "none"}}
      .ld{animation:${busy ? "roost-spin 1.2s linear infinite" : "none"}}
      .pd{animation:${state === "cleaning" && wet ? "roost-spin 1.4s linear infinite" : "none"}}
      ${state === "cleaning" && !spot ? `
      .bot{animation:roost-vlanes ${dur}s linear ${ph} infinite}
      .body{animation:roost-vturn ${dur}s linear ${ph} infinite}
      @keyframes roost-vlanes{0%{left:24%;top:22%}23%{left:90%;top:22%}29%{left:90%;top:40%}52%{left:24%;top:40%}58%{left:24%;top:58%}81%{left:90%;top:58%}87%{left:90%;top:76%}93.5%{left:57%;top:76%}100%{left:24%;top:22%}}
      @keyframes roost-vturn{0%{transform:rotate(90deg)}22%{transform:rotate(90deg)}24%{transform:rotate(180deg)}28%{transform:rotate(180deg)}30%{transform:rotate(270deg)}51%{transform:rotate(270deg)}53%{transform:rotate(180deg)}57%{transform:rotate(180deg)}59%{transform:rotate(90deg)}80%{transform:rotate(90deg)}82%{transform:rotate(180deg)}86%{transform:rotate(180deg)}88%{transform:rotate(270deg)}93%{transform:rotate(320deg)}100%{transform:rotate(450deg)}}
      .lane.a{animation:roost-vl1 ${dur}s linear ${ph} infinite}.lane.b{animation:roost-vl2 ${dur}s linear ${ph} infinite}.lane.c{animation:roost-vl3 ${dur}s linear ${ph} infinite}
      @keyframes roost-vl1{0%{transform:scaleX(0)}23%,97%{transform:scaleX(1)}100%{transform:scaleX(0)}}
      @keyframes roost-vl2{0%,29%{transform:scaleX(0)}52%,97%{transform:scaleX(1)}100%{transform:scaleX(0)}}
      @keyframes roost-vl3{0%,58%{transform:scaleX(0)}81%,97%{transform:scaleX(1)}100%{transform:scaleX(0)}}` : ""}
      ${spot ? `.orbit{position:absolute;left:55%;top:50%;width:0;height:0;animation:roost-spin 3s linear ${ph} infinite}.orbit .bot{left:0;top:0;animation:roost-vspiral 9s ease-in-out ${ph} infinite}
      @keyframes roost-vspiral{0%,100%{transform:translateX(0)}50%{transform:translateX(52px)}}
      .ring{position:absolute;left:55%;top:50%;width:150px;height:150px;margin:-75px 0 0 -75px;border-radius:50%;background:radial-gradient(circle,${wet ? "rgba(56,189,248,.18)" : `${g[0]}22`},transparent 70%)}` : ""}
      ${state === "returning" ? `.bot{animation:roost-vhome 5s ease-in-out ${(-((Date.now() / 1000) % 5)).toFixed(2)}s infinite}@keyframes roost-vhome{0%{left:70%}80%,100%{left:21%}}
      .path{position:absolute;left:18%;right:28%;top:50%;border-top:2px dashed ${g[1]};opacity:.55}` : ""}
      ${state === "error" ? `.bot::before{content:"";position:absolute;inset:-10px;border-radius:50%;border:2px solid #F43F6B;animation:roost-ping 1.6s ease-out infinite}
      .bot{animation:roost-wiggle .5s ease-in-out 2}` : ""}
      ${state === "paused" ? `.bot::after{content:"";position:absolute;inset:-8px;border-radius:50%;border:2px solid ${g[1]};animation:roost-breathe 1.6s ease-in-out infinite}` : ""}
      .loc{position:absolute;inset:-8px;border-radius:50%;border:2px solid ${g[1]};opacity:0;pointer-events:none}
      .bot.locate .loc{animation:roost-ping 1.1s ease-out 3}.bot.locate .loc.b{animation-delay:.35s}
      .badge{position:absolute;right:-4px;top:-4px;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;z-index:3}
      .badge ha-icon{--mdc-icon-size:14px}
      .say{position:absolute;left:12px;bottom:10px;right:12px;font-size:12px;color:${state === "error" ? "#F43F6B" : p.muted};text-align:right}
      .map{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:${p.inset}}
      .map img{max-width:100%;max-height:100%;object-fit:contain}
      .rooms{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}
      .rooms::-webkit-scrollbar{display:none}
      .rm{flex:none;height:38px;padding:0 14px;border-radius:999px;border:1px solid ${p.border};background:${p.off};color:${p.text};font:inherit;font-size:13px;font-weight:600;display:inline-flex;align-items:center;gap:6px;cursor:pointer}
      .rm ha-icon{--mdc-icon-size:17px}
      .rm.on{background:linear-gradient(135deg,${ACTIVE[0]},${ACTIVE[1]});color:#fff;border-color:transparent;box-shadow:0 8px 20px -8px rgba(109,75,255,.9)}
      .ctl{display:flex;gap:10px;align-items:center}
      .go{flex:1;height:52px;border-radius:18px;border:0;background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};font:inherit;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;box-shadow:0 12px 24px -12px ${g[2]}}
      .go ha-icon{--mdc-icon-size:22px}
      .rb{width:52px;height:52px;border-radius:18px;border:1px solid ${p.border};background:${p.off};${p.fx || ""};color:${p.text};display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none}
      .rb.on{color:${g[1]}}
      .rb ha-icon{--mdc-icon-size:22px}
      .go:active,.rb:active,.rm:active,.chip:active{transform:scale(.95)}
      .chips{display:flex;gap:8px}
      .chip{flex:1 1 0;min-width:0;min-height:40px;padding:4px 10px;line-height:1.15;text-align:left;border-radius:999px;border:1px solid ${p.border};background:${p.off};color:${p.text};font:inherit;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer}
      .chip ha-icon{--mdc-icon-size:17px;color:${g[1]}}
      @container (max-width: 300px){:host .chip .cw{display:none}}
      .care{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:${p.inset};cursor:pointer;font-size:13px}
      .care ha-icon{--mdc-icon-size:18px;color:${lowCare.length ? "#FF9F6B" : "#34D399"}}
      .care b{flex:1;font-weight:600}
      .care .cv{color:${p.muted};transition:transform .12s}
      .care.open .cv{transform:rotate(180deg)}
      .parts{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:10px}
      .part{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;font-size:12px;color:${p.muted}}
      .part .rg{position:relative;width:52px;height:52px}
      .part .rg svg{width:100%;height:100%;transform:rotate(-90deg)}
      .part .rg span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:${p.text}}
      .menu{position:absolute;right:14px;bottom:14px;z-index:5;min-width:180px;max-width:calc(100% - 28px);max-height:260px;overflow:auto;padding:6px;border-radius:16px;border:1px solid ${p.border};
        background:${this.dark ? "#1A1F3D" : "#FFFFFF"};box-shadow:0 18px 40px -12px rgba(0,0,0,.55);display:flex;flex-direction:column;gap:2px}
      .menu[hidden]{display:none}
      .menu .h{font-size:11px;color:${p.muted};padding:6px 12px 2px;letter-spacing:.5px}
      .mi{all:unset;padding:10px 12px;border-radius:10px;font-size:14px;cursor:pointer;color:${p.text};display:flex;align-items:center;gap:10px}
      .mi ha-icon{--mdc-icon-size:18px;color:${p.muted}}
      .mi:hover,.mi.on{background:${g[0]}2E}
      .mi .ck{margin-left:auto;color:${g[1]}}
    </style>
    <div class="card">
      <div class="top"><div class="tx"><div class="n t">${esc(c.name || this.name(c.entity, "Robot vacuum"))}</div>
        <div class="l t" aria-live="polite">${esc(word)}${facts.length ? ` · ${esc(facts.join(" · "))}` : ""}</div></div>
        ${bat != null ? `<span class="bat num"><ha-icon icon="${charging ? "mdi:battery-charging" : bat >= 95 ? "mdi:battery" : `mdi:battery-${Math.max(10, Math.round(bat / 10) * 10)}`}"></ha-icon>${Math.round(bat)}%</span>` : ""}
        ${this._mapSrc ? `<button class="tg" data-map="1" aria-label="${showMap ? "Show the robot" : "Show the map"}"><ha-icon icon="${showMap ? "mdi:robot-vacuum" : "mdi:map-outline"}"></ha-icon></button>` : ""}</div>
      <div class="stage">
        ${showMap ? `<div class="map"><img src="${esc(this._mapSrc)}" alt="Map from the robot"></div>` : `<div class="floor"></div>
        ${[[30, 30], [62, 26], [80, 46], [44, 64], [70, 72], [34, 80], [88, 30], [52, 42]].map(([x, y]) => `<span class="dust" style="left:${x}%;top:${y}%"></span>`).join("")}
        ${state === "cleaning" && !spot ? '<span class="lane a" style="top:13%"></span><span class="lane b r" style="top:31%"></span><span class="lane c" style="top:49%"></span>' : ""}
        ${spot ? '<span class="ring"></span>' : ""}
        ${state === "returning" ? '<span class="path"></span>' : ""}
        <div class="dock" aria-hidden="true"><ha-icon icon="${charging ? "mdi:lightning-bolt" : "mdi:home-outline"}"></ha-icon></div>
        ${spot ? '<div class="orbit">' : ""}<div class="bot" role="img" aria-label="${esc(word)}"><span class="loc"></span><span class="loc b"></span>
          <div class="body">${pic ? `<img src="${esc(pic)}" alt="">` : vacSvg(shape, g, p, this.dark, wet && (state === "cleaning" || state === "paused"))}</div>
          ${state === "error" ? '<span class="badge" style="background:#F43F6B"><ha-icon icon="mdi:exclamation"></ha-icon></span>' : state === "paused" ? `<span class="badge" style="background:${g[1]}"><ha-icon icon="mdi:pause"></ha-icon></span>` : ""}</div>${spot ? "</div>" : ""}
        ${errText ? `<span class="say t">${esc(errText.charAt(0).toUpperCase() + errText.slice(1))}</span>` : state === "docked" && bat != null && bat >= 100 ? '<span class="say t">Fully charged</span>' : ""}`}
      </div>
      ${rooms.length ? `<div class="rooms" role="group" aria-label="Rooms">${rooms.map((r, i) => `<button class="rm ${sel.includes(i) ? "on" : ""}" data-room="${i}" aria-pressed="${sel.includes(i)}">${r.icon ? `<ha-icon icon="${esc(r.icon)}"></ha-icon>` : ""}${esc(r.name || `Room ${i + 1}`)}</button>`).join("")}</div>` : ""}
      ${offline ? "" : `<div class="ctl"><button class="go" data-go="1"><ha-icon icon="${mainIcon}"></ha-icon>${esc(mainLabel)}</button>
        ${can(16) ? `<button class="rb ${state === "docked" || state === "returning" ? "on" : ""}" data-dock="1" aria-label="Send home to the dock"><ha-icon icon="mdi:home-import-outline"></ha-icon></button>` : ""}
        <button class="rb" data-more="1" aria-label="More" aria-haspopup="true"><ha-icon icon="mdi:dots-horizontal"></ha-icon></button></div>`}
      ${shown.length && !offline ? `<div class="chips">${shown.map((x, i) => `<button class="chip" data-chip="${i}" aria-haspopup="true" aria-label="${esc(x.title || "Suction")}: ${esc(x.label)}"><ha-icon icon="${x.icon}"></ha-icon><span class="cw t" style="text-align:left"><small style="display:block;font-size:11px;font-weight:500;opacity:.7">${esc(String(x.title || "Suction").split(" ")[0].replace(/^./, (ch) => ch.toUpperCase()))}</small>${esc(nice(x.label))}</span></button>`).join("")}</div>` : ""}
      ${c.show_care !== false && care.length ? `<div class="care ${this._careOpen ? "open" : ""}" role="button" tabindex="0" aria-expanded="${!!this._careOpen}"><ha-icon icon="${lowCare.length ? "mdi:wrench-clock" : "mdi:check-circle-outline"}"></ha-icon>
        <b class="t">${lowCare.length ? `${esc(lowCare.map((x) => x.name).join(", "))} ${lowCare.length > 1 ? "need" : "needs"} care soon` : "Filter and brushes are fine"}</b><ha-icon class="cv" icon="mdi:chevron-down"></ha-icon></div>
        ${this._careOpen ? `<div class="parts">${care.map((x) => { const f = x.pct != null ? x.pct / 100 : Math.min(1, (x.hours || 0) / 150); const col = x.low ? "#FF9F6B" : g[1]; return `<div class="part"><div class="rg"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="none" stroke="${p.track}" stroke-width="4"/><circle cx="18" cy="18" r="15" fill="none" stroke="${col}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${(94.2 * Math.max(0.02, f)).toFixed(1)} 94.2"/></svg><span class="num">${x.pct != null ? `${Math.round(x.pct)}%` : `${Math.round(x.hours)} h`}</span></div><span class="t">${esc(x.name)}</span></div>`; }).join("")}</div>` : ""}` : ""}
      <div class="menu" hidden role="menu"></div>
    </div>`;
    const r = this.shadowRoot, menu = r.querySelector(".menu");
    const open = (title, items) => {
      menu.innerHTML = `${title ? `<div class="h t">${esc(title)}</div>` : ""}${items.map((it, i) => `<button class="mi ${it.on ? "on" : ""}" role="menuitem" data-i="${i}">${it.icon ? `<ha-icon icon="${it.icon}"></ha-icon>` : ""}<span class="t">${esc(it.label)}</span>${it.on ? '<ha-icon class="ck" icon="mdi:check"></ha-icon>' : ""}</button>`).join("")}`;
      menu.hidden = false; this._menuOpen = true;
      const away = (e) => { if (!e.composedPath().includes(this)) { window.removeEventListener("pointerdown", away, true); menu.hidden = true; this._menuOpen = false; this._sig = null; this.hass = this._hass; } };
      window.addEventListener("pointerdown", away, true);
      menu.querySelectorAll(".mi").forEach((b) => b.addEventListener("click", (ev) => { ev.stopPropagation(); menu.hidden = true; this._menuOpen = false; this.vibrate(); items[+b.dataset.i].run(); this._sig = null; this.hass = this._hass; }));
    };
    const pickChip = (x) => open(x.title || "Suction", x.list.map((o) => ({ label: String(o).replace(/_/g, " "), on: o === x.cur, run: () => (x.key === "fan" ? this.call("vacuum", "set_fan_speed", { entity_id: c.entity, fan_speed: o }) : this.call("select", "select_option", { entity_id: x.key, option: o })) })));
    r.querySelectorAll("[data-chip]").forEach((b) => b.addEventListener("click", (ev) => { ev.stopPropagation(); pickChip(shown[+b.dataset.chip]); }));
    r.querySelector("[data-map]")?.addEventListener("click", () => { this._showMap = !this._showMap; this._sig = null; this.render(); });
    r.querySelectorAll("[data-room]").forEach((b) => b.addEventListener("click", () => {
      const i = +b.dataset.room, cur = new Set(this._rooms || []);
      if (cur.has(i)) cur.delete(i); else cur.add(i);
      this._rooms = [...cur]; this.vibrate(); this._sig = null; this.render();
    }));
    r.querySelector("[data-go]")?.addEventListener("click", () => {
      this.vibrate();
      if (state === "cleaning" || state === "returning") return this.call("vacuum", "pause", { entity_id: c.entity });
      if (state !== "paused" && sel.length) {
        this._rooms = [];
        const areas = sel.map((i) => rooms[i].area).filter(Boolean);
        if (areas.length) this.call("vacuum", "clean_area", { entity_id: c.entity, cleaning_area_id: areas });
        const acts = sel.filter((i) => !rooms[i].area && rooms[i].tap_action);
        acts.forEach((i) => this.run(rooms[i].tap_action, c.entity));
        if (!areas.length && !acts.length) this.call("vacuum", "start", { entity_id: c.entity });
        return undefined;
      }
      return this.call("vacuum", "start", { entity_id: c.entity });
    });
    r.querySelector("[data-dock]")?.addEventListener("click", () => { this.vibrate(); this.call("vacuum", "return_to_base", { entity_id: c.entity }); });
    r.querySelector("[data-more]")?.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const items = [
        ...(can(1024) ? [{ icon: "mdi:target", label: "Spot clean", run: () => this.call("vacuum", "clean_spot", { entity_id: c.entity }) }] : []),
        ...(can(512) ? [{ icon: "mdi:map-marker-radius-outline", label: "Find my robot (it makes a sound)", run: () => { this.call("vacuum", "locate", { entity_id: c.entity }); const bt = r.querySelector(".bot"); if (bt) { bt.classList.remove("locate"); void bt.offsetWidth; bt.classList.add("locate"); } } }] : []),
        ...((state === "cleaning" || state === "paused" || state === "returning") && can(8) ? [{ icon: "mdi:stop", label: "Stop", run: () => this.call("vacuum", "stop", { entity_id: c.entity }) }] : []),
        ...(q.buttons || []).filter((x) => S(x)).map((x) => ({ icon: S(x).attributes.icon || "mdi:gesture-tap-button", label: (S(x).attributes.friendly_name || x).replace(this.name(c.entity) || "", "").trim() || x, run: () => this.call("button", "press", { entity_id: x }) })),
        ...hidden.map((x) => ({ icon: x.icon, label: `${x.title || "Suction"}: ${String(x.label).replace(/_/g, " ")}`, run: () => setTimeout(() => pickChip(x), 0) })),
      ];
      open("", items);
    });
    const careEl = r.querySelector(".care");
    careEl?.addEventListener("click", () => { this._careOpen = !this._careOpen; this._sig = null; this.render(); });
    r.querySelector(".card").addEventListener("click", (ev) => { if (!menu.hidden && !ev.target.closest(".menu,[data-more],[data-chip]")) { menu.hidden = true; this._menuOpen = false; this._sig = null; this.hass = this._hass; } });
    this._menuOpen = false;
  }
}

// ================================================================== Twelve more cards (1.5.0)
// Shared look for these cards: the same header as the other Roost cards (42 px icon box, name, one state line).
const headCss = (p, g, on) => `.card{${panelCss(p, 22)};padding:16px;display:flex;flex-direction:column;gap:14px;position:relative}
  .top{display:flex;align-items:center;gap:12px}
  .ic{width:42px;height:42px;border-radius:14px;flex:none;display:flex;align-items:center;justify-content:center;cursor:pointer;
    background:${on ? `linear-gradient(135deg,${g[0]},${g[1]})` : p.inset};color:${on ? g[3] : p.muted};box-shadow:${on ? `0 10px 22px -10px ${g[2]}` : "none"}}
  .ic ha-icon{--mdc-icon-size:22px}
  .tx{flex:1;min-width:0}
  .n{font-size:15px;font-weight:600;line-height:1.2}
  .l{font-size:12px;color:${p.muted};margin-top:3px}
  .chips{display:flex;gap:8px}
  .chip{flex:1 1 0;min-width:0;min-height:40px;padding:4px 10px;line-height:1.15;border-radius:999px;border:1px solid ${p.border};background:${p.off};${p.fx || ""};color:${p.text};font:inherit;font-size:13px;font-weight:600;
    display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;-webkit-tap-highlight-color:transparent}
  .chip ha-icon{--mdc-icon-size:17px}
  .chip.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};border-color:transparent;box-shadow:0 8px 18px -10px ${g[2]}}
  .chip:active,.ic:active,.big:active{transform:scale(.95)}
  @container (max-width: 300px){:host .chip .cw{display:none}}
  .stat{display:grid;grid-template-columns:repeat(auto-fit,minmax(86px,1fr));gap:8px}
  .stat:empty{display:none}
  .st{min-width:0;padding:10px 12px;border-radius:14px;background:${p.inset}}
  .st b{display:block;font-size:17px;font-weight:700;font-family:${FONT_NUM};white-space:nowrap}
  .st span{font-size:12px;color:${p.muted};overflow-wrap:normal;word-break:keep-all}
  .big{height:48px;border-radius:16px;border:0;background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};font:inherit;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;box-shadow:0 12px 24px -12px ${g[2]};padding:0 16px}
  .big.off{background:${p.off};color:${p.text};border:1px solid ${p.border};box-shadow:none}
  .big ha-icon{--mdc-icon-size:20px}`;
const head = (icon, name, line, extra = "") => `<div class="top"><span class="ic" data-ic="1" role="button" tabindex="0"><ha-icon icon="${esc(icon)}"></ha-icon></span>
  <div class="tx"><div class="n t">${esc(name)}</div><div class="l t" aria-live="polite">${esc(line)}</div></div>${extra}</div>`;
const stat = (label, value) => (value ? `<div class="st"><b class="num t">${esc(value)}</b><span class="t">${esc(label)}</span></div>` : "");
const minsText = (m) => { if (m == null) return ""; const t = Math.max(0, Math.round(m)); return t >= 60 ? `${Math.floor(t / 60)} h${t % 60 ? ` ${t % 60} min` : ""}` : `${t} min`; };
// a device's own words as people say them: "eco_mode" -> "Eco mode", "electric" -> "Electric"
const nice = (w) => { const t = String(w ?? "").replace(/_/g, " ").trim(); return t ? t.charAt(0).toUpperCase() + t.slice(1) : t; };
// minutes from a sensor: minutes, hours, seconds, "1:23:00", or a finish time
function minutesOf(st) {
  if (!st || UNAVAILABLE.includes(st.state)) return null;
  const u = st.attributes.unit_of_measurement, v = num(st.state);
  if (st.attributes.device_class === "timestamp" || /T\d\d:/.test(st.state)) { const t = new Date(st.state).getTime(); return Number.isFinite(t) ? (t - Date.now()) / 60000 : null; }
  if (/^\d+:\d\d(:\d\d)?$/.test(st.state)) { const [h, m, x] = st.state.split(":").map(Number); return h * 60 + m + (x || 0) / 60; }
  if (v == null) return null;
  return u === "h" ? v * 60 : u === "s" ? v / 60 : u === "d" ? v * 1440 : v;
}

// ------------------------------------------------------------------ Roost Air
// An air purifier (or just a room's air): a ring coloured by how clean the air is, air drawn into the purifier, mode and filter.
const AQ_STEPS = { pm25: [[12, "Clean", "#34D399"], [35, "Fair", "#F5B94A"], [55, "Poor", "#FF9F6B"], [150, "Unhealthy", "#F43F6B"], [1e9, "Very bad", "#B794FF"]],
  aqi: [[50, "Clean", "#34D399"], [100, "Fair", "#F5B94A"], [150, "Poor", "#FF9F6B"], [200, "Unhealthy", "#F43F6B"], [1e9, "Very bad", "#B794FF"]],
  co2: [[800, "Fresh", "#34D399"], [1000, "Fair", "#F5B94A"], [1500, "Stuffy", "#FF9F6B"], [1e9, "Open a window", "#F43F6B"]] };
class RoostAir extends RoostBase {
  static get defaults() { return { color: "teal", scale: "auto", theme: "auto" }; }

  validate(c) { if (!c.entity && !c.air) throw new Error("Choose an air purifier or an air reading"); }

  watched() { const c = this._config; return [c.entity, c.air, c.filter, c.humidity, c.temperature].filter(Boolean); }

  static getConfigForm() {
    return { schema: [
      { name: "sample", label: "Show sample data", selector: { boolean: {} } },
      { name: "entity", label: "Air purifier (optional)", selector: { entity: { domain: ["fan", "humidifier", "switch"] } } },
      { name: "air", label: "Air reading (PM2.5, air quality index or CO₂)", selector: { entity: { domain: "sensor" } } },
      { name: "scale", label: "The reading is", selector: pick([["auto", "Found by itself"], ["pm25", "PM2.5 (µg/m³)"], ["aqi", "Air quality index"], ["co2", "CO₂ (ppm)"]]) },
      { type: "grid", name: "", schema: [{ name: "filter", label: "Filter life", selector: { entity: { domain: "sensor" } } }, { name: "name", selector: { text: {} } }] },
      { type: "grid", name: "", schema: [{ name: "temperature", selector: { entity: { domain: "sensor" } } }, { name: "humidity", selector: { entity: { domain: "sensor" } } }] },
      ...colourFields("color"), THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig(hass) { const ids = Object.keys(hass.states); return { entity: ids.find((i) => i.startsWith("fan.") && /purif|air/.test(i)) || "", air: ids.find((i) => i.startsWith("sensor.") && /pm2|aqi|air_quality/.test(i)) || "" }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour(), s = this.st(), a = s?.attributes || {}, on = s?.state === "on";
    const airS = this.sx(c.air), v = this.n(c.air), unit = airS?.attributes.unit_of_measurement || "";
    const scale = c.scale !== "auto" ? c.scale : /ppm/.test(unit) || /co2/.test(c.air || "") ? "co2" : /µg|ug/.test(unit) || /pm/.test(c.air || "") ? "pm25" : "aqi";
    const step = v == null ? null : AQ_STEPS[scale].find(([max]) => v <= max);
    const col = step ? step[2] : p.muted, top = AQ_STEPS[scale][AQ_STEPS[scale].length - 2][0] * 1.3;
    const f = v == null ? 0 : Math.min(1, v / top);
    const pct = on ? Number(a.percentage ?? 60) : 0, modes = a.preset_modes || [];
    const name = c.name || (c.entity ? this.name(c.entity, "Air purifier") : this.name(c.air, "Air"));
    const line = [!s ? "" : UNAVAILABLE.includes(s.state) ? "Offline" : on ? `Cleaning${a.preset_mode ? ` · ${nice(a.preset_mode)}` : a.percentage != null ? ` · ${Math.round(pct)}%` : ""}` : "Off", !on && step ? `Air is ${step[1].toLowerCase()}` : ""].filter(Boolean).join(" · ");
    const dur = on ? Math.max(1.2, 4 - pct / 40).toFixed(2) : 0, ph = (-((Date.now() / 1000) % 4)).toFixed(2);
    const R = 66, C = 2 * Math.PI * R;
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, on)}${this.menuCss()}
      .mid{display:grid;grid-template-columns:150px minmax(0,1fr);gap:16px;align-items:center}
      @container (max-width: 320px){:host .mid{grid-template-columns:minmax(0,1fr);justify-items:center}}
      .ring{position:relative;width:150px;height:150px}
      .ring svg{position:absolute;inset:0}
      .ring .in{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
      .ring .v{font-size:32px;font-weight:700;line-height:1;color:${col}}
      .ring .u{font-size:11px;color:${p.muted}}
      .ring .w{font-size:12px;font-weight:600;color:${col}}
      .pt{position:absolute;width:4px;height:4px;border-radius:50%;background:${col};opacity:0;left:50%;top:50%}
      ${on ? `.pt{animation:roost-airin ${dur}s linear ${ph}s infinite}@keyframes roost-airin{0%{opacity:0;transform:rotate(var(--a)) translateX(74px)}20%{opacity:.8}100%{opacity:0;transform:rotate(calc(var(--a) + 70deg)) translateX(8px)}}` : ""}
      .side{display:flex;flex-direction:column;gap:10px;min-width:0;width:100%}
    </style>
    <div class="card">
      ${head(c.entity ? "mdi:air-purifier" : "mdi:weather-windy", name, line, "")}
      <div class="mid">
        <div class="ring" role="img" aria-label="${esc(step ? `Air ${step[1]}` : "No reading")}">
          <svg viewBox="0 0 150 150"><circle cx="75" cy="75" r="${R}" fill="none" stroke="${p.track}" stroke-width="10"/>
            <circle cx="75" cy="75" r="${R}" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${(C * Math.max(0.02, f)).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 75 75)" style="filter:drop-shadow(0 0 8px ${col}66)"/></svg>
          ${Array.from({ length: 10 }, (_, i) => `<span class="pt" style="--a:${i * 36}deg;animation-delay:calc(${ph}s + ${(i * 0.37).toFixed(2)}s)"></span>`).join("")}
          <div class="in"><span class="v num" data-tw="aq">${v == null ? "–" : esc(fmt(v, 0))}</span><span class="u">${esc(scale === "co2" ? "ppm" : scale === "pm25" ? "µg/m³" : "AQI")}</span>${step ? `<span class="w">${esc(step[1])} air</span>` : ""}</div>
        </div>
        <div class="side">
          <div class="stat">${stat("Filter", this.val(c.filter))}${stat("Temperature", this.val(c.temperature))}${stat("Humidity", this.val(c.humidity))}</div>

        </div>
      </div>
          ${s ? `<div class="chips"><button class="chip ${on ? "on" : ""}" data-pw="1" aria-pressed="${on}"><ha-icon icon="mdi:power"></ha-icon><span class="cw">${on ? "On" : "Off"}</span></button>
            ${modes.length ? `<button class="chip" data-mode="1" aria-haspopup="true"><ha-icon icon="mdi:tune-variant"></ha-icon><span class="cw t">${esc(nice(a.preset_mode) || "Mode")}</span></button>` : ""}
            ${a.percentage != null ? `<button class="chip" data-sp="1" aria-haspopup="true"><ha-icon icon="mdi:fan"></ha-icon><span class="cw">${on ? `${Math.round(pct)}%` : "Speed"}</span></button>` : ""}</div>` : ""}
      <div class="menu" hidden role="menu"></div>
    </div>`;
    const r = this.shadowRoot, dom = (c.entity || "").split(".")[0];
    r.querySelector("[data-ic]").addEventListener("click", () => this.moreInfo(c.air || c.entity));
    r.querySelector("[data-pw]")?.addEventListener("click", () => { this.vibrate(); this.call(dom === "switch" ? "switch" : dom, "toggle", { entity_id: c.entity }); });
    r.querySelector("[data-mode]")?.addEventListener("click", (e) => { e.stopPropagation(); this.openMenu("Mode", modes.map((m) => ({ label: m, on: m === a.preset_mode, run: () => this.call("fan", "set_preset_mode", { entity_id: c.entity, preset_mode: m }) }))); });
    r.querySelector("[data-sp]")?.addEventListener("click", (e) => { e.stopPropagation(); this.openMenu("Speed", [25, 50, 75, 100].map((x) => ({ label: `${x}%`, on: on && Math.abs(pct - x) < 13, run: () => this.call("fan", "set_percentage", { entity_id: c.entity, percentage: x }) }))); });
  }
}

// ------------------------------------------------------------------ Roost Water Heater
// A tank that shows how hot the water is, rising bubbles while it heats, the set temperature and a "heat for 30 min" button.
class RoostWaterHeater extends RoostBase {
  static get defaults() { return { color: "coral", boost: [30, 60], theme: "auto" }; }

  validate(c) { if (!c.entity) throw new Error("Choose a water heater (or its switch)"); }

  watched() { const c = this._config; return [c.entity, c.temperature, c.timer].filter(Boolean); }

  static getConfigForm() {
    return { schema: [
      { name: "sample", label: "Show sample data", selector: { boolean: {} } },
      { name: "entity", required: true, selector: { entity: { domain: ["water_heater", "switch", "climate", "input_boolean"] } } },
      { type: "grid", name: "", schema: [{ name: "temperature", label: "Water temperature (if the heater has none)", selector: { entity: { domain: "sensor" } } }, { name: "name", selector: { text: {} } }] },
      { name: "timer", label: "Timer helper for the “heat for” buttons (an automation turns the heater off when it ends)", selector: { entity: { domain: "timer" } } },
      { name: "boost", label: "“Heat for” buttons (minutes)", selector: { select: { multiple: true, custom_value: true, mode: "dropdown", options: ["15", "30", "45", "60", "90", "120"] } } },
      ...colourFields("color"), THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig(hass) { return { entity: Object.keys(hass.states).find((i) => i.startsWith("water_heater.")) || "" }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour(), s = this.st(), a = s?.attributes || {}, dom = c.entity.split(".")[0];
    const on = s ? (dom === "water_heater" ? s.state !== "off" : s.state === "on" || s.state === "heat") : false;
    const cur = this.n(c.temperature) ?? num(a.current_temperature), set = num(a.temperature);
    const lo = num(a.min_temp) ?? 30, hi = num(a.max_temp) ?? 75;
    const f = cur == null ? 0.5 : Math.max(0.08, Math.min(1, (cur - 15) / (hi - 15)));
    const heating = on && (set == null || cur == null || cur < set - 0.5);
    const tm = this.sx(c.timer), tLeft = tm?.state === "active" && tm.attributes.finishes_at ? (new Date(tm.attributes.finishes_at) - Date.now()) / 60000 : null;
    const since = on && s?.last_changed ? (Date.now() - new Date(s.last_changed)) / 60000 : null;
    const line = !s ? "Device not found" : UNAVAILABLE.includes(s.state) ? "Offline" : on ? [heating ? "Heating" : "Hot and ready", tLeft != null ? `off in ${minsText(tLeft)}` : since != null && since >= 1 ? `on for ${minsText(since)}` : ""].filter(Boolean).join(" · ") : "Off";
    const hot = cur == null ? g[1] : cur >= 50 ? "#F43F6B" : cur >= 38 ? "#FF8F6B" : "#38BDF8";
    const modes = dom === "water_heater" ? a.operation_list || [] : [];
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, on)}${this.menuCss()}
      .mid{display:grid;grid-template-columns:96px minmax(0,1fr);gap:18px;align-items:center}
      .tank{position:relative;width:96px;height:150px;border-radius:40px 40px 22px 22px;border:2px solid ${p.border};background:${p.inset};overflow:hidden}
      .wsv{position:absolute;inset:0;width:100%;height:100%;cursor:pointer;touch-action:manipulation}
      .water{position:absolute;left:0;right:0;bottom:0;height:${(f * 100).toFixed(0)}%;pointer-events:none}
      .bub{position:absolute;bottom:4px;width:6px;height:6px;border-radius:50%;border:1.5px solid rgba(255,255,255,.7);opacity:0}
      ${heating ? ".bub{animation:roost-bub 2.4s ease-in infinite}@keyframes roost-bub{0%{opacity:0;transform:translateY(0)}15%{opacity:.9}100%{opacity:0;transform:translateY(-110px)}}" : ""}
      .tank .t2{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.35)}
      .tank .t2 b{font-size:24px;font-family:${FONT_NUM}}
      .tank .t2 span{font-size:11px;opacity:.9}
      .flame{position:absolute;left:50%;bottom:-2px;transform:translateX(-50%);color:${heating ? "#FF8F6B" : p.muted}}
      ${heating ? ".flame{animation:roost-breathe 1.2s ease-in-out infinite}" : ""}
      .side{display:flex;flex-direction:column;gap:10px;min-width:0}
      .setr{display:flex;align-items:center;gap:10px}
      .pm{width:44px;height:44px;border-radius:50%;border:1px solid ${p.border};background:${p.off};color:${p.text};display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none}
      .setr .sv{flex:1;text-align:center}
      .setr .sv b{display:block;font-size:24px;font-family:${FONT_NUM}}
      .setr .sv span{font-size:11px;color:${p.muted}}
    </style>
    <div class="card">
      ${head("mdi:water-boiler", c.name || this.name(c.entity, "Water heater"), line)}
      <div class="mid">
        <div class="tank" role="img" aria-label="Water ${cur == null ? "" : `${fmt(cur, 0)}°`}"><svg class="wsv" viewBox="0 0 96 150" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="whg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hot}"/><stop offset="1" stop-color="${hot}" stop-opacity=".45"/></linearGradient></defs><path data-wb="1" fill="${hot}" opacity=".35"/><path data-wf="1" fill="url(#whg)"/><path data-ws="1" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg><div class="water">${[18, 46, 70].map((x, i) => `<span class="bub" style="left:${x}%;animation-delay:${i * 0.8}s"></span>`).join("")}</div>
          <div class="t2">${cur != null ? `<b data-tw="wt">${esc(fmt(cur, decOf(String(cur))))}°</b><span>Water</span>` : ""}</div>
          <ha-icon class="flame" icon="mdi:fire" style="--mdc-icon-size:18px"></ha-icon></div>
        <div class="side">
          ${set != null ? `<div class="setr"><button class="pm" data-d="-1" aria-label="Cooler"><ha-icon icon="mdi:minus"></ha-icon></button><div class="sv"><b class="num">${esc(fmt(set, 0))}°</b><span>Set to</span></div><button class="pm" data-d="1" aria-label="Hotter"><ha-icon icon="mdi:plus"></ha-icon></button></div>` : ""}
          <button class="big ${on ? "off" : ""}" data-pw="1"><ha-icon icon="mdi:power"></ha-icon>${on ? "Turn off" : "Turn on"}</button>
          <div class="chips">${(c.boost || []).slice(0, 3).map((m) => `<button class="chip" data-b="${esc(m)}" aria-label="Heat for ${esc(m)} minutes"><span style="white-space:nowrap">${esc(m)} min</span></button>`).join("")}
            ${modes.length > 1 ? `<button class="chip" data-mode="1" aria-label="Mode"><span class="t">${esc(nice(a.operation_mode || s.state))}</span></button>` : ""}</div>
        </div>
      </div>
      <div class="menu" hidden role="menu"></div>
    </div>`;
    const r = this.shadowRoot;
    const turn = (want) => {
      if (dom === "water_heater") return this.call("water_heater", want ? "turn_on" : "turn_off", { entity_id: c.entity });
      if (dom === "climate") return this.call("climate", want ? "turn_on" : "turn_off", { entity_id: c.entity });
      return this.call(dom === "input_boolean" ? "input_boolean" : "switch", want ? "turn_on" : "turn_off", { entity_id: c.entity });
    };
    r.querySelector("[data-ic]").addEventListener("click", () => this.moreInfo(c.entity));
    RoostWater.bind(this, "heater", r.querySelector(".wsv"), { x0: -2, x1: 98, top: 4, bottom: 150, level: f, stir: heating ? 0.8 : 0.05 });
    r.querySelector("[data-pw]").addEventListener("click", () => { this.vibrate(); turn(!on); if (on && c.timer && tm?.state === "active") this.call("timer", "cancel", { entity_id: c.timer }); });
    r.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", () => { this.vibrate(); this.call(dom === "climate" ? "climate" : "water_heater", "set_temperature", { entity_id: c.entity, temperature: Math.max(lo, Math.min(hi, set + Number(b.dataset.d))) }); }));
    r.querySelectorAll("[data-b]").forEach((b) => b.addEventListener("click", () => {
      this.vibrate(); turn(true);
      const m = Number(b.dataset.b);
      if (c.timer) this.call("timer", "start", { entity_id: c.timer, duration: `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}:00` });
    }));
    r.querySelector("[data-mode]")?.addEventListener("click", (e) => { e.stopPropagation(); this.openMenu("Mode", modes.map((m) => ({ label: String(m).replace(/_/g, " "), on: m === (a.operation_mode || s.state), run: () => this.call("water_heater", "set_operation_mode", { entity_id: c.entity, operation_mode: m }) }))); });
  }
}

// ------------------------------------------------------------------ Roost Doorbell
// The door camera, a banner when someone rings, the last rings, and the door lock in one place.
class RoostDoorbell extends ticking(RoostBase, 30000) {
  static get defaults() { return { color: "coral", theme: "auto" }; }

  validate(c) { if (!c.camera && !c.ring) throw new Error("Choose the doorbell camera or its ring sensor"); }

  watched() { const c = this._config; return [c.camera, c.ring, c.lock, c.motion].filter(Boolean); }

  static getConfigForm() {
    return { schema: [
      { name: "sample", label: "Show sample data", selector: { boolean: {} } },
      { name: "camera", selector: { entity: { domain: ["camera", "image"] } } },
      { type: "grid", name: "", schema: [{ name: "ring", label: "Ring (button pressed)", selector: { entity: { domain: ["binary_sensor", "event", "sensor"] } } }, { name: "motion", label: "Someone at the door (optional)", selector: { entity: { domain: "binary_sensor" } } }] },
      { type: "grid", name: "", schema: [{ name: "lock", label: "Door lock (optional)", selector: { entity: { domain: ["lock", "switch", "button"] } } }, { name: "name", selector: { text: {} } }] },
      ...colourFields("color"), THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig(hass) { const ids = Object.keys(hass.states); return { camera: ids.find((i) => i.startsWith("camera.") && /door/.test(i)) || ids.find((i) => i.startsWith("camera.")) || "", ring: ids.find((i) => /doorbell|ring/.test(i)) || "" }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  connectedCallback() { super.connectedCallback(); clearInterval(this._pic); this._pic = setInterval(() => { const im = this.shadowRoot?.querySelector(".pic"); const src = this.sx(this._config?.camera)?.attributes.entity_picture; if (im && src && !src.startsWith("data:")) im.src = `${src}${src.includes("?") ? "&" : "?"}t=${Date.now()}`; }, 10000); }

  disconnectedCallback() { super.disconnectedCallback(); clearInterval(this._pic); }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour();
    const cam = this.sx(c.camera), ring = this.sx(c.ring), lock = this.sx(c.lock), mo = this.sx(c.motion);
    const rangAt = ring ? (ring.entity_id.startsWith("event.") || ring.entity_id.startsWith("sensor.") ? ring.state : ring.last_changed) : null;
    const rangMin = rangAt && !UNAVAILABLE.includes(rangAt) ? (Date.now() - new Date(rangAt)) / 60000 : null;
    const ringing = ring && (ring.state === "on" || (rangMin != null && rangMin < 1.5 && !ring.entity_id.startsWith("binary_sensor.")));
    // remember the last few rings on this screen
    const key = `roost-rings:${c.ring}`;
    let rings = []; try { rings = JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) { rings = []; }
    if (ringing && rangAt && !rings.includes(rangAt)) { rings = [rangAt, ...rings].slice(0, 5); try { localStorage.setItem(key, JSON.stringify(rings)); } catch (e) { /* private mode */ } }
    const locked = lock ? lock.state === "locked" : null;
    const src = cam?.attributes.entity_picture;
    const line = ringing ? "Someone is at the door" : mo?.state === "on" ? "Someone is outside" : rangMin != null && rangMin < 1440 * 7 ? `Last ring ${ago(rangAt)}` : "No one rang";
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, ringing)}
      .cam{position:relative;border-radius:18px;overflow:hidden;background:${p.inset};aspect-ratio:16/10;cursor:pointer}
      .cam img{width:100%;height:100%;object-fit:cover;display:block}
      .cam .none{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:${p.muted}}
      .live{position:absolute;left:10px;top:10px;display:flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;background:rgba(10,8,40,.55);color:#fff;font-size:12px;font-weight:600}
      .live i{width:7px;height:7px;border-radius:50%;background:#F43F6B;animation:roost-breathe 1.6s ease-in-out infinite}
      .ban{position:absolute;left:10px;right:10px;bottom:10px;display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};font-weight:700;font-size:14px;box-shadow:0 10px 24px -10px ${g[2]}}
      .ban ha-icon{animation:roost-wiggle .6s ease-in-out infinite}
      .ic ha-icon{${ringing ? "animation:roost-wiggle .6s ease-in-out infinite" : ""}}
      .rows{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none}
      .rows::-webkit-scrollbar{display:none}
      .rg{flex:none;padding:6px 12px;border-radius:999px;background:${p.inset};font-size:12px;color:${p.muted};display:flex;align-items:center;gap:6px}
      .rg ha-icon{--mdc-icon-size:14px}
    </style>
    <div class="card">
      ${head(ringing ? "mdi:bell-ring" : "mdi:doorbell-video", c.name || this.name(c.camera || c.ring, "Front door"), line)}
      ${c.camera ? `<div class="cam" data-cam="1" role="button" aria-label="Open the camera">${src ? `<img class="pic" src="${esc(src)}" alt="Door camera">` : '<div class="none t">Camera offline</div>'}
        ${src ? '<span class="live"><i></i>Live</span>' : ""}${ringing ? '<div class="ban"><ha-icon icon="mdi:bell-ring"></ha-icon><span class="t">Someone rang the bell</span></div>' : ""}</div>` : ""}
      ${rings.length ? `<div class="rows">${rings.map((t) => `<span class="rg"><ha-icon icon="mdi:bell-outline"></ha-icon>${esc(new Date(t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }))}</span>`).join("")}</div>` : ""}
      ${lock ? `<button class="big ${locked ? "" : "off"}" data-lock="1"><ha-icon icon="${locked === false ? "mdi:lock-open-variant" : "mdi:lock"}"></ha-icon>${lock.entity_id.startsWith("lock.") ? (locked ? (Date.now() - (this._sure || 0) < 3000 ? "Tap again to unlock" : "Unlock the door") : "Lock the door") : "Open the door"}</button>` : ""}
    </div>`;
    const r = this.shadowRoot;
    r.querySelector("[data-ic]").addEventListener("click", () => this.moreInfo(c.ring || c.camera));
    r.querySelector("[data-cam]")?.addEventListener("click", () => this.moreInfo(c.camera));
    r.querySelector("[data-lock]")?.addEventListener("click", () => {
      if (lock.entity_id.startsWith("lock.") && locked && Date.now() - (this._sure || 0) >= 3000) { this._sure = Date.now(); this._sig = null; this.render(); clearTimeout(this._sureT); this._sureT = setTimeout(() => { this._sig = null; this.render(); }, 3000); return; }
      this._sure = 0;
      this.vibrate();
      const d = lock.entity_id.split(".")[0];
      if (d === "lock") this.call("lock", locked ? "unlock" : "lock", { entity_id: c.lock });
      else if (d === "button") this.call("button", "press", { entity_id: c.lock });
      else this.call("switch", "turn_on", { entity_id: c.lock });
    });
  }
}

// ------------------------------------------------------------------ Roost Laundry
// A washer or dryer: the drum turns (water sloshes while washing, clothes tumble while drying), the steps of the cycle, time left, and "ready to unload".
const WASH_STEPS = [["wash", /wash|main|pre/], ["rinse", /rins/], ["spin", /spin|drain/], ["done", /done|end|finish|complete|ready/]];
const DRY_STEPS = [["dry", /dry|heat|tumble/], ["cool", /cool/], ["done", /done|end|finish|complete|ready/]];
class RoostLaundry extends ticking(RoostBase, 30000) {
  static get defaults() { return { kind: "washer", color: "blue", theme: "auto" }; }

  validate(c) { if (!c.entity) throw new Error("Choose the washer or dryer (its state or power)"); }

  watched() { const c = this._config; return [c.entity, c.remaining, c.progress, c.stage, c.door].filter(Boolean); }

  static getConfigForm() {
    return { schema: [
      { name: "sample", label: "Show sample data", selector: { boolean: {} } },
      { name: "kind", label: "It is a", selector: pick([["washer", "Washing machine"], ["dryer", "Dryer"], ["dishwasher", "Dishwasher"]]) },
      { name: "entity", label: "Running or not (its state, a power reading, or a switch)", required: true, selector: { entity: {} } },
      { type: "grid", name: "", schema: [{ name: "remaining", label: "Time left / finishes at", selector: { entity: { domain: "sensor" } } }, { name: "progress", label: "Progress (%)", selector: { entity: { domain: "sensor" } } }] },
      { type: "grid", name: "", schema: [{ name: "stage", label: "Step of the cycle", selector: { entity: { domain: ["sensor", "select"] } } }, { name: "door", label: "Door (optional)", selector: { entity: { domain: "binary_sensor" } } }] },
      { type: "grid", name: "", schema: [{ name: "power_on", label: "Running above (W, for power readings)", selector: { number: { mode: "box" } } }, { name: "name", selector: { text: {} } }] },
      ...colourFields("color"), THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig(hass) { return { entity: Object.keys(hass.states).find((i) => /wash|laundry|dryer/.test(i)) || "" }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour(), s = this.st();
    const st = String(s?.state || "").toLowerCase(), stageS = this.sx(c.stage), stage = String(stageS?.state || st).toLowerCase();
    const w = this.n(c.entity);
    const running = !s ? false : /^(on|run|running|wash|washing|rinse|spin|dry|drying|active|in_?progress|working|cooling)/.test(st) || (w != null && s.attributes.unit_of_measurement === "W" && w > (Number(c.power_on) || 5));
    const steps = c.kind === "dryer" ? DRY_STEPS : WASH_STEPS;
    let at = steps.findIndex(([, re]) => re.test(stage));
    const left = minutesOf(this.sx(c.remaining)), prog = this.n(c.progress);
    const done = !running && (/done|end|finish|complete|ready/.test(stage) || (this._wasRunning && !running));
    if (running) this._wasRunning = true; else if (this.sx(c.door)?.state === "on") this._wasRunning = false;
    if (done) at = steps.length - 1;
    const icon = { washer: "mdi:washing-machine", dryer: "mdi:tumble-dryer", dishwasher: "mdi:dishwasher" }[c.kind] || "mdi:washing-machine";
    const line = !s ? "Device not found" : UNAVAILABLE.includes(s.state) ? "Offline" : running ? [at >= 0 ? steps[at][0].replace(/^./, (x) => x.toUpperCase()) : "Running", left != null && left > 0 ? `${minsText(left)} left` : ""].filter(Boolean).join(" · ") : done ? "Ready to unload" : "Off";
    const pct = prog != null ? prog : left != null && running ? null : done ? 100 : 0;
    const spin = /spin|drain/.test(stage) ? 0.5 : c.kind === "dryer" ? 2.2 : 3;
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, running || done)}
      .mid{display:grid;grid-template-columns:120px minmax(0,1fr);gap:16px;align-items:center}
      .mach{position:relative;width:120px;height:130px;border-radius:18px;background:${p.inset};border:1px solid ${p.border}}
      .mach .panel{position:absolute;left:10px;right:10px;top:8px;height:12px;display:flex;gap:6px;align-items:center}
      .mach .panel i{width:8px;height:8px;border-radius:50%;background:${running ? g[1] : p.track}}
      .mach .panel i:first-child{width:30px;border-radius:4px;background:${p.track}}
      .door{position:absolute;left:50%;top:30px;width:88px;height:88px;margin-left:-44px;border-radius:50%;border:6px solid ${this.dark ? "#2A3066" : "#C9CEE8"};background:${this.dark ? "#141831" : "#F4F5FC"};overflow:hidden}
      .drum{position:absolute;inset:0;border-radius:50%}
      ${running ? `.drum{animation:roost-spin ${spin}s linear infinite}` : ""}
      .cl{position:absolute;width:26px;height:16px;border-radius:8px}
      .wv{position:absolute;left:-20%;right:-20%;bottom:-10%;height:46%;background:${c.kind === "dryer" ? "transparent" : "rgba(56,189,248,.35)"};border-radius:40%}
      ${running && c.kind !== "dryer" ? ".wv{animation:roost-slosh 1.6s ease-in-out infinite}@keyframes roost-slosh{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}" : ""}
      ${c.kind === "dryer" && running ? ".heat{position:absolute;inset:0;background:radial-gradient(circle,rgba(255,159,107,.25),transparent 70%);animation:roost-breathe 2s ease-in-out infinite}" : ""}
      .side{display:flex;flex-direction:column;gap:12px;min-width:0}
      .steps{display:flex;gap:6px}
      .sp{flex:1 1 0;min-width:0;text-align:center;font-size:11px;color:${p.muted}}
      .sp i{display:block;height:6px;border-radius:3px;background:${p.track};margin-bottom:5px}
      .sp.past i{background:${g[1]}}
      .sp.now i{background:linear-gradient(90deg,${g[0]},${g[1]});box-shadow:0 0 10px ${g[2]}}
      .sp.now{color:${p.text};font-weight:600}
      .bar{height:8px;border-radius:4px;background:${p.track};overflow:hidden}
      .bar i{display:block;height:100%;border-radius:4px;background:linear-gradient(90deg,${g[0]},${g[1]})}
      .rd{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:linear-gradient(135deg,#10B981,#6EE7B7);color:#03241B;font-weight:700;font-size:14px}
      .rd ha-icon{animation:roost-bounce 1.6s ease-in-out infinite}
    </style>
    <div class="card">
      ${head(icon, c.name || this.name(c.entity, c.kind === "dryer" ? "Dryer" : c.kind === "dishwasher" ? "Dishwasher" : "Washing machine"), line)}
      <div class="mid">
        <div class="mach" role="img" aria-label="${esc(line)}"><div class="panel"><i></i><i></i><i></i></div>
          <div class="door"><div class="wv"></div><div class="heat"></div><div class="drum">
            <span class="cl" style="left:18px;top:20px;background:#F43F6B99"></span><span class="cl" style="left:42px;top:44px;background:#38BDF899;transform:rotate(30deg)"></span><span class="cl" style="left:22px;top:50px;background:#F5B94A99;transform:rotate(-20deg)"></span></div></div></div>
        <div class="side">
          <div class="steps">${steps.map(([n], i) => `<div class="sp ${i < at ? "past" : i === at ? "now" : ""}"><i></i><span class="t">${esc(n.replace(/^./, (x) => x.toUpperCase()))}</span></div>`).join("")}</div>
          ${pct != null && running ? `<div class="bar" role="progressbar" aria-valuenow="${Math.round(pct)}"><i data-bar="lp" style="width:${Math.min(100, Math.max(0, pct)).toFixed(0)}%"></i></div>` : ""}
          <div class="stat">${stat("Time left", running && left != null ? minsText(left) : "")}${stat("Done", running && pct != null ? `${Math.round(pct)}%` : "")}${stat("Finishes", running && left != null ? new Date(Date.now() + left * 60000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "")}</div>
          ${done ? '<div class="rd"><ha-icon icon="mdi:check-circle"></ha-icon><span class="t">Ready to unload</span></div>' : ""}
        </div>
      </div>
    </div>`;
    this.shadowRoot.querySelector("[data-ic]").addEventListener("click", () => this.moreInfo(c.entity));
  }
}

// ------------------------------------------------------------------ Roost Garage
// A garage door that rolls up and down in panels (or a gate that slides), how long it has been open, and a warning when it stays open.
class RoostGarage extends ticking(RoostBase, 30000) {
  static get defaults() { return { style: "garage", door: "classic", finish: "white", warn_after: 10, color: "amber", theme: "auto" }; }

  validate(c) { if (!c.entity) throw new Error("Choose the garage door or gate"); }

  watched() { const c = this._config; return [c.entity, c.sensor].filter(Boolean); }

  static getConfigForm() {
    return { schema: [
      { name: "sample", label: "Show sample data", selector: { boolean: {} } },
      { name: "entity", required: true, selector: { entity: { domain: ["cover", "switch", "button", "lock"] } } },
      { type: "grid", name: "", schema: [{ name: "style", label: "Look", selector: pick([["garage", "Garage door that rolls up"], ["gate", "Gate that slides"], ["swing", "Gate with two wings"]]) }, { name: "name", selector: { text: {} } }] },
      { type: "grid", name: "", schema: [
        { name: "door", label: "Garage door look", selector: pick([["classic", "Classic stripes (bright, simple)"], ["sectional", "Sectional panel door with windows"], ["shutter", "Aluminium roller shutter"]]) },
        { name: "finish", label: "Finish", selector: pick([["white", "White"], ["anthracite", "Anthracite"], ["oak", "Golden oak"], ["silver", "Silver"], ["walnut", "Walnut"], ["sand", "Sand"]]) }] },
      { type: "grid", name: "", schema: [{ name: "sensor", label: "Open/closed sensor (for switch or button doors)", selector: { entity: { domain: "binary_sensor" } } }, { name: "warn_after", label: "Warn when open longer than (min)", selector: slider(1, 60) }] },
      ...colourFields("color"), THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig(hass) { return { entity: Object.keys(hass.states).find((i) => i.startsWith("cover.") && /garage|gate/.test(i)) || "" }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour(), s = this.st(), sen = this.sx(c.sensor);
    const st = sen ? (sen.state === "on" ? "open" : "closed") : String(s?.state || "");
    const moving = st === "opening" || st === "closing";
    const pos = num(s?.attributes.current_position);
    const open = st === "open" || st === "opening";
    const f = moving ? (st === "opening" ? 0.85 : 0.15) : pos != null ? pos / 100 : open ? 1 : 0;
    const since = (sen || s)?.last_changed ? (Date.now() - new Date((sen || s).last_changed)) / 60000 : null;
    const late = open && !moving && since != null && since > (Number(c.warn_after) || 10);
    const line = !s ? "Device not found" : UNAVAILABLE.includes(s.state) ? "Offline" : moving ? (st === "opening" ? "Opening" : "Closing") : open ? `Open${since != null ? ` for ${minsText(since)}` : ""}` : "Closed";
    const sty = c.style;
    const dur = moving ? 6 : 0;
    // a real-looking door: panels or slats in a finish, inside a wall, with a car behind it
    const real = sty === "garage" && c.door && c.door !== "classic";
    const FIN = { white: [236, 236, 232], anthracite: [64, 68, 76], oak: [176, 120, 64], silver: [178, 184, 192], walnut: [96, 64, 44], sand: [206, 190, 160] };
    const tone = FIN[c.finish] || FIN.white, wood = c.finish === "oak" || c.finish === "walnut";
    const mx = (k) => `rgb(${tone.map((v) => Math.max(0, Math.min(255, Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k))))).join(",")})`;
    const grain = wood ? "repeating-linear-gradient(90deg,rgba(0,0,0,.10) 0 2px,rgba(0,0,0,0) 2px 5px,rgba(255,255,255,.06) 5px 8px,rgba(0,0,0,.08) 8px 11px)," : "";
    const DH = 112; // the door's full height in px
    const doorBg = c.door === "shutter"
      ? `linear-gradient(180deg,${mx(0.3)} 0,${mx(0.02)} 40%,${mx(-0.25)} 85%,${mx(-0.5)} 100%) 0 0/100% 5px`
      : `repeating-linear-gradient(90deg,${mx(-0.32)} 0 3%,rgba(0,0,0,0) 3% 24%,${mx(-0.32)} 24% 25%) bottom/100% ${DH}px,
         ${wood ? "" : `linear-gradient(180deg,rgba(0,0,0,0) 4.5%,#8FB0D8 4.5%,#3D5274 18%,rgba(0,0,0,0) 18%) bottom/100% ${DH}px no-repeat,`}
         repeating-linear-gradient(180deg,rgba(0,0,0,0) 0 4%,${mx(0.35)} 4% 5%,rgba(0,0,0,0) 5% 19%,${mx(-0.3)} 19% 20%,rgba(0,0,0,0) 20% 24%,${mx(-0.4)} 24% 25%) bottom/100% ${DH}px,
         ${grain}linear-gradient(180deg,${mx(0.12)},${mx(0)} 50%,${mx(-0.18)}) bottom/100% ${(DH / 4).toFixed(1)}px`;
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, open)}
      .scene{position:relative;height:150px;border-radius:18px;overflow:hidden;background:${p.inset};border:1px solid ${late ? "#F43F6B" : p.border}}
      .frame{position:absolute;left:12%;right:12%;top:18%;bottom:0;border:6px solid ${this.dark ? "#2A3066" : "#C9CEE8"};border-bottom:0;border-radius:10px 10px 0 0;background:${this.dark ? "#0F1228" : "#E4E7F4"};overflow:hidden}
      .car{position:absolute;left:50%;bottom:6px;transform:translateX(-50%);color:${p.muted};opacity:.6}
      .rol{position:absolute;left:0;right:0;top:0;height:${((1 - f) * 100).toFixed(0)}%;background:repeating-linear-gradient(180deg,${g[0]} 0 13px,${g[1]} 13px 16px)}
      ${moving ? `.rol{animation:roost-${st === "opening" ? "up" : "down"} ${dur}s ease-in-out infinite}@keyframes roost-up{from{height:100%}to{height:8%}}@keyframes roost-down{from{height:8%}to{height:100%}}` : ""}
      .gate{position:absolute;top:22%;bottom:0;width:${sty === "swing" ? "50%" : "100%"};background:repeating-linear-gradient(90deg,${g[0]} 0 4px,transparent 4px 18px),linear-gradient(${g[1]},${g[1]}) top/100% 4px no-repeat,linear-gradient(${g[1]},${g[1]}) bottom 10px left 0/100% 4px no-repeat}
      .g1{left:${sty === "swing" ? 0 : (f * 88).toFixed(0)}%;transform-origin:left center;transform:${sty === "swing" ? `perspective(300px) rotateY(${(-f * 70).toFixed(0)}deg)` : "none"}}
      .g2{right:0;transform-origin:right center;transform:perspective(300px) rotateY(${(f * 70).toFixed(0)}deg)}
      ${real ? `.scene{background:linear-gradient(180deg,#2B3150,#3A4062);height:170px}
      .scene::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.10) 0 1px,rgba(0,0,0,0) 1px 14px),repeating-linear-gradient(90deg,rgba(0,0,0,0) 0 40px,rgba(0,0,0,.07) 40px 41px)}
      .lamp{position:absolute;left:5%;top:10%;width:14px;height:20px;border-radius:4px;background:radial-gradient(circle at 50% 40%,#FFE6A8,#D8A24A 60%,#6B5226);box-shadow:0 0 22px 7px rgba(255,214,140,${open ? ".25" : ".4"})}
      .frame{left:13%;right:13%;top:22%;bottom:18px;border:0;border-radius:0;background:linear-gradient(180deg,#0A0C16,#1A1D2C);box-shadow:0 0 0 7px #262B45,inset 0 8px 10px rgba(0,0,0,.6)}
      .drive{position:absolute;left:0;right:0;bottom:0;height:18px;background:linear-gradient(180deg,#6B6F7E,#4E5262);clip-path:polygon(10% 0,90% 0,100% 100%,0 100%)}
      .auto{position:absolute;left:50%;bottom:4px;width:74%;height:56%;transform:translateX(-50%);border-radius:44% 44% 10px 10px/60% 60% 10px 10px;background:linear-gradient(180deg,#5A6788,#2E3550 60%,#1B1F33)}
      .auto::before{content:"";position:absolute;left:18%;right:18%;top:8%;height:30%;border-radius:30px 30px 4px 4px;background:linear-gradient(180deg,#A9C4E6,#5D7397)}
      .auto::after{content:"";position:absolute;left:8%;right:8%;bottom:22%;height:12%;background:radial-gradient(circle at 8% 50%,#FFE3A6 0 9%,rgba(0,0,0,0) 10%),radial-gradient(circle at 92% 50%,#FFE3A6 0 9%,rgba(0,0,0,0) 10%)}
      .rol{background:${doorBg};box-shadow:0 6px 12px rgba(0,0,0,.5)}
      .rol::after{content:"";position:absolute;left:44%;width:12%;bottom:7%;height:3px;border-radius:2px;background:linear-gradient(180deg,#D9DCE2,#7B808A)}` : ""}
      .wa{position:absolute;left:10px;right:10px;bottom:10px;display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:12px;background:#F43F6B;color:#fff;font-weight:700;font-size:13px}
      .ctl{display:flex;gap:10px}
      .ctl .big{flex:1}
    </style>
    <div class="card">
      ${head(sty === "garage" ? (open ? "mdi:garage-open-variant" : "mdi:garage-variant") : open ? "mdi:gate-open" : "mdi:gate", c.name || this.name(c.entity, sty === "garage" ? "Garage" : "Gate"), line)}
      <div class="scene" role="img" aria-label="${esc(line)}">
        ${real ? `<span class="lamp"></span><div class="frame"><i class="auto"></i><div class="rol"></div></div><i class="drive"></i>`
    : sty === "garage" ? `<div class="frame"><ha-icon class="car" icon="mdi:car-side" style="--mdc-icon-size:54px"></ha-icon><div class="rol"></div></div>`
    : `<div class="frame" style="border-radius:0;left:4%;right:4%;top:34%;border-width:0 6px"><ha-icon class="car" icon="mdi:car-side" style="--mdc-icon-size:54px"></ha-icon></div><div class="gate g1"></div>${sty === "swing" ? '<div class="gate g2"></div>' : ""}`}
        ${late ? `<div class="wa"><ha-icon icon="mdi:alert"></ha-icon><span class="t">Open for ${esc(minsText(since))}</span></div>` : ""}
      </div>
      ${s ? `<div class="ctl">${s.entity_id.startsWith("cover.") && moving ? '<button class="big off" data-a="stop"><ha-icon icon="mdi:stop"></ha-icon>Stop</button>' : ""}
        <button class="big ${open ? "off" : ""}" data-a="go"><ha-icon icon="${open ? "mdi:arrow-down" : "mdi:arrow-up"}"></ha-icon>${open ? "Close" : Date.now() - (this._sure || 0) < 3000 ? "Tap again to open" : "Open"}</button></div>` : ""}
    </div>`;
    const r = this.shadowRoot, d = c.entity.split(".")[0];
    r.querySelector("[data-ic]").addEventListener("click", () => this.moreInfo(c.entity));
    r.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => {
      this.vibrate();
      if (b.dataset.a === "stop") return this.call("cover", "stop_cover", { entity_id: c.entity });
      if (!open && Date.now() - (this._sure || 0) >= 3000) { this._sure = Date.now(); this._sig = null; this.render(); clearTimeout(this._sureT); this._sureT = setTimeout(() => { this._sig = null; this.render(); }, 3000); return undefined; }
      this._sure = 0;
      if (d === "cover") return this.call("cover", open ? "close_cover" : "open_cover", { entity_id: c.entity });
      if (d === "button") return this.call("button", "press", { entity_id: c.entity });
      if (d === "lock") return this.call("lock", open ? "lock" : "open", { entity_id: c.entity });
      return this.call("switch", "toggle", { entity_id: c.entity });
    }));
  }
}

// ------------------------------------------------------------------ Roost Energy Flow
// Sun, house, battery and grid with dots flowing along the lines: faster when more power moves, the way it is going.
class RoostFlow extends RoostBase {
  static get defaults() { return { battery_invert: false, grid_invert: false, color: "amber", theme: "auto" }; }

  validate(c) { if (!c.solar && !c.grid && !c.home) throw new Error("Choose at least the solar, grid or house power"); }

  watched() { const c = this._config; return [c.solar, c.battery, c.battery_level, c.grid, c.home].filter(Boolean); }

  static getConfigForm() {
    return { schema: [
      { name: "sample", label: "Show sample data", selector: { boolean: {} } },
      { type: "grid", name: "", schema: [{ name: "solar", label: "Solar power", selector: { entity: { domain: "sensor" } } }, { name: "home", label: "House uses", selector: { entity: { domain: "sensor" } } }] },
      { type: "grid", name: "", schema: [{ name: "grid", label: "Grid power (+ buying, − selling)", selector: { entity: { domain: "sensor" } } }, { name: "grid_invert", label: "Grid sign is the other way", selector: { boolean: {} } }] },
      { type: "grid", name: "", schema: [{ name: "battery", label: "Battery power (+ giving, − charging)", selector: { entity: { domain: "sensor" } } }, { name: "battery_invert", label: "Battery sign is the other way", selector: { boolean: {} } }] },
      { type: "grid", name: "", schema: [{ name: "battery_level", label: "Battery level (%)", selector: { entity: { domain: "sensor" } } }, { name: "name", selector: { text: {} } }] },
      THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig() { return { sample: true }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  w(id) { const s = this.sx(id); const v = this.n(id); if (v == null) return null; const u = s.attributes.unit_of_measurement; return u === "kW" ? v * 1000 : u === "MW" ? v * 1e6 : v; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p;
    const sol = Math.max(0, this.w(c.solar) ?? 0), bat0 = this.w(c.battery), grid0 = this.w(c.grid);
    const bat = bat0 == null ? null : (c.battery_invert ? -bat0 : bat0), grid = grid0 == null ? null : (c.grid_invert ? -grid0 : grid0);
    const home = this.w(c.home) ?? Math.max(0, sol + (bat ?? 0) + (grid ?? 0));
    const lvl = this.n(c.battery_level);
    const fw = (v) => { if (v == null) return ""; const a = Math.abs(v); return a >= 1000 ? `${fmt(a / 1000, a >= 10000 ? 1 : 2)} kW` : `${Math.round(a)} W`; };
    const N = { sun: [50, 14], home: [50, 86], bat: [14, 50], grid: [86, 50] };
    const lines = [];
    const add = (from, to, v, col) => { if (!v || Math.abs(v) < 5) return; const d = Math.max(0.6, 3.2 - Math.log10(Math.abs(v)) * 0.75).toFixed(2); lines.push({ from, to, col, d }); };
    add("sun", "home", Math.min(sol, home), "#F5B94A");
    if (bat != null) { if (bat > 0) add("bat", "home", bat, "#34D399"); else add("sun", "bat", -bat, "#34D399"); }
    if (grid != null) { if (grid > 0) add("grid", "home", grid, "#38BDF8"); else add("sun", "grid", -grid, "#B794FF"); }
    const node = (k, icon, label, v, col, extra = "") => `<div class="nd ${k}" style="left:${N[k][0]}%;top:${N[k][1]}%"><span class="ci" style="border-color:${col};color:${col}"><ha-icon icon="${icon}"></ha-icon>${extra}</span><b class="num t">${esc(v)}</b><span class="t">${esc(label)}</span></div>`;
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, COLORS.amber, sol > 0)}
      .flow{position:relative;height:270px}
      .flow svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
      .nd{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:2px;text-align:center;width:96px}
      .ci{position:relative;width:52px;height:52px;border-radius:50%;border:2.5px solid;background:${p.inset};display:flex;align-items:center;justify-content:center}
      .ci ha-icon{--mdc-icon-size:24px}
      .ci .lv{position:absolute;left:0;right:0;bottom:0;border-radius:0 0 26px 26px;background:#34D39940}
      .nd b{font-size:14px;font-weight:700}
      .nd span{font-size:11px;color:${p.muted}}
      .dot{offset-rotate:0deg}
    </style>
    <div class="card">
      ${head("mdi:transmission-tower", c.name || "Energy now", sol > 0 ? `Sun gives ${fw(sol)}${grid != null && grid < 0 ? ` · selling ${fw(grid)}` : ""}` : grid != null && grid > 0 ? `Buying ${fw(grid)} from the grid` : "No sun right now")}
      <div class="flow">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          ${[["sun", "home"], ["sun", "bat"], ["sun", "grid"], ["bat", "home"], ["grid", "home"]].map(([a, b]) => `<path d="M${N[a][0]} ${N[a][1]} Q50 50 ${N[b][0]} ${N[b][1]}" fill="none" stroke="${p.track}" stroke-width="2" vector-effect="non-scaling-stroke"/>`).join("")}
        </svg>
        ${lines.map((l, i) => [0, 1, 2].map((k) => `<span class="dot" style="position:absolute;left:0;top:0;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:${l.col};box-shadow:0 0 8px ${l.col}" data-from="${l.from}" data-to="${l.to}" data-d="${l.d}" data-k="${k}"></span>`).join("")).join("")}
        ${c.solar ? node("sun", "mdi:solar-power-variant", "Solar", fw(sol), "#F5B94A") : ""}
        ${node("home", "mdi:home-lightning-bolt-outline", "House", fw(home), p.text)}
        ${c.battery || c.battery_level ? node("bat", "mdi:home-battery-outline", bat == null ? "Battery" : bat > 5 ? "Battery gives" : bat < -5 ? "Charging" : "Battery", lvl != null ? `${Math.round(lvl)}%` : fw(bat), "#34D399", lvl != null ? `<span class="lv" style="height:${Math.max(4, lvl)}%"></span>` : "") : ""}
        ${c.grid ? node("grid", "mdi:transmission-tower", grid == null ? "Grid" : grid > 5 ? "Buying" : grid < -5 ? "Selling" : "Grid", fw(grid), grid != null && grid < 0 ? "#B794FF" : "#38BDF8") : ""}
      </div>
    </div>`;
    // the dots travel along each line; the path is measured in pixels so it bends like the drawn line
    const box = this.shadowRoot.querySelector(".flow");
    const lay = () => {
      const W = box.clientWidth, H = box.clientHeight;
      if (!W) return;
      box.querySelectorAll(".dot").forEach((d) => {
        const [x1, y1] = N[d.dataset.from], [x2, y2] = N[d.dataset.to], k = +d.dataset.k, dur = +d.dataset.d;
        d.style.offsetPath = `path('M${(x1 * W) / 100} ${(y1 * H) / 100} Q${W / 2} ${H / 2} ${(x2 * W) / 100} ${(y2 * H) / 100}')`;
        try { d.animate([{ offsetDistance: "0%", opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.85 }, { offsetDistance: "100%", opacity: 0 }], { duration: dur * 1000, iterations: Infinity, delay: -((Date.now() + (k * dur * 1000) / 3) % (dur * 1000)) }); } catch (e) { /* no motion */ }
      });
    };
    (window.requestAnimationFrame || setTimeout)(lay);
    this.shadowRoot.querySelector("[data-ic]").addEventListener("click", () => this.moreInfo(c.home || c.solar || c.grid));
    this.shadowRoot.querySelectorAll(".nd").forEach((el) => el.addEventListener("click", () => this.moreInfo({ sun: c.solar, home: c.home, bat: c.battery_level || c.battery, grid: c.grid }[el.classList[1]])));
  }
}

// ------------------------------------------------------------------ Roost Irrigation
// Garden zones: tap one to water it for a few minutes, see which is watering and for how long, and skip when rain is coming.
class RoostIrrigation extends ticking(RoostBase, 20000) {
  static get defaults() { return { zones: [], minutes: 10, color: "teal", theme: "auto" }; }

  validate(c) { if (!(c.zones || []).length) throw new Error("Add the garden zones (valves or switches)"); }

  watched() { const c = this._config; return [...(c.zones || []).map((z) => z.entity), c.rain].filter(Boolean); }

  static getConfigForm() {
    return { schema: [
      { name: "sample", label: "Show sample data", selector: { boolean: {} } },
      { name: "zones", label: "Zones", selector: { object: { multiple: true, label_field: "name", fields: {
        entity: { label: "Valve or switch", required: true, selector: { entity: { domain: ["valve", "switch"] } } },
        name: { label: "Name", selector: { text: {} } }, icon: { label: "Icon", selector: { icon: {} } },
        remaining: { label: "Time left (optional sensor)", selector: { entity: { domain: "sensor" } } },
      } } } },
      { type: "grid", name: "", schema: [{ name: "minutes", label: "Water for (minutes)", selector: slider(1, 60) }, { name: "timer", label: "Timer helper (an automation stops the water)", selector: { entity: { domain: "timer" } } }] },
      { type: "grid", name: "", schema: [{ name: "rain", label: "Rain today or soon (mm sensor, or rain sensor)", selector: { entity: { domain: ["sensor", "binary_sensor"] } } }, { name: "name", selector: { text: {} } }] },
      ...colourFields("color"), THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig() { return { sample: true }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour();
    const zones = (c.zones || []).map((z) => { const s = this.sx(z.entity); const on = s && (s.state === "on" || s.state === "open" || s.state === "opening"); return { ...z, s, on, since: on && s.last_changed ? (Date.now() - new Date(s.last_changed)) / 60000 : null, left: minutesOf(this.sx(z.remaining)) }; });
    const rs = this.sx(c.rain), rainMm = this.n(c.rain);
    const rainy = rs ? (rs.entity_id.startsWith("binary_sensor.") ? rs.state === "on" : rainMm != null && rainMm >= 2) : false;
    const busy = zones.filter((z) => z.on);
    const line = busy.length ? `Watering ${busy.map((z) => z.name || this.name(z.entity)).join(", ")}` : rainy ? "Rain is coming, watering can wait" : "All zones off";
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, busy.length > 0)}
      .zs{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px}
      .z{position:relative;overflow:hidden;min-height:96px;padding:12px;border-radius:18px;border:1px solid ${p.border};background:${p.off};color:${p.text};font:inherit;text-align:left;cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;gap:8px}
      .z.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};border-color:transparent;box-shadow:0 12px 24px -12px ${g[2]}}
      .z ha-icon{--mdc-icon-size:22px}
      .z b{font-size:14px;font-weight:600;line-height:1.2}
      .z span{font-size:12px;opacity:.85}
      .drop{position:absolute;top:-10px;width:3px;height:10px;border-radius:2px;background:rgba(255,255,255,.7)}
      .z.on .drop{animation:roost-rain .9s linear infinite}
      @keyframes roost-rain{0%{transform:translateY(0);opacity:0}30%{opacity:.8}100%{transform:translateY(34px);opacity:0}}
      .rain{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:${p.inset};font-size:13px}
      .rain ha-icon{color:#38BDF8}
    </style>
    <div class="card">
      ${head("mdi:sprinkler-variant", c.name || "Garden", line)}
      ${rs ? `<div class="rain"><ha-icon icon="${rainy ? "mdi:weather-pouring" : "mdi:weather-partly-cloudy"}"></ha-icon><span class="t">${rainy ? `Rain expected${rainMm != null ? ` (${fmt(rainMm, 1)} mm)` : ""}: no need to water today` : "No rain expected"}</span></div>` : ""}
      <div class="zs">${zones.map((z, i) => `<button class="z ${z.on ? "on" : ""}" data-z="${i}" aria-pressed="${!!z.on}">
        ${z.on ? [54, 66, 78, 90].map((x, k) => `<i class="drop" style="left:${x}%;animation-delay:${(k * 0.23).toFixed(2)}s"></i>`).join("") : ""}
        <ha-icon icon="${esc(z.icon || "mdi:sprinkler")}"></ha-icon><div><b class="t">${esc(z.name || this.name(z.entity))}</b><br><span class="t">${!z.s ? "Not found" : z.on ? (z.left != null ? `${minsText(z.left)} left` : z.since != null && z.since >= 1 ? `Watering for ${minsText(z.since)}` : "Watering") : `Tap: water ${c.minutes} min`}</span></div></button>`).join("")}</div>
    </div>`;
    const r = this.shadowRoot;
    r.querySelector("[data-ic]").addEventListener("click", () => this.moreInfo(c.rain || zones[0]?.entity));
    r.querySelectorAll("[data-z]").forEach((b) => b.addEventListener("click", () => {
      const z = zones[+b.dataset.z]; if (!z.s) return;
      this.vibrate();
      const d = z.entity.split(".")[0];
      if (z.on) { this.call(d, d === "valve" ? "close_valve" : "turn_off", { entity_id: z.entity }); return; }
      this.call(d, d === "valve" ? "open_valve" : "turn_on", { entity_id: z.entity });
      const m = Number(c.minutes) || 10;
      if (c.timer) this.call("timer", "start", { entity_id: c.timer, duration: `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}:00` });
    }));
  }
}

// ------------------------------------------------------------------ Roost EV
// An electric car from the side with its battery filling, power flowing in while it charges, range, the limit and when it will be full.
class RoostEV extends ticking(RoostBase, 60000) {
  static get defaults() { return { capacity: 60, color: "green", theme: "auto" }; }

  validate(c) { if (!c.battery) throw new Error("Choose the car's battery level"); }

  watched() { const c = this._config; return [c.battery, c.range, c.power, c.charging, c.plugged, c.limit].filter(Boolean); }

  static getConfigForm() {
    return { schema: [
      { name: "sample", label: "Show sample data", selector: { boolean: {} } },
      { type: "grid", name: "", schema: [{ name: "battery", label: "Battery level (%)", required: true, selector: { entity: { domain: "sensor" } } }, { name: "range", label: "Range", selector: { entity: { domain: "sensor" } } }] },
      { type: "grid", name: "", schema: [{ name: "power", label: "Charging power", selector: { entity: { domain: "sensor" } } }, { name: "charging", label: "Charging on/off", selector: { entity: { domain: ["switch", "binary_sensor", "sensor"] } } }] },
      { type: "grid", name: "", schema: [{ name: "plugged", label: "Plugged in", selector: { entity: { domain: "binary_sensor" } } }, { name: "limit", label: "Charge limit", selector: { entity: { domain: ["number", "sensor"] } } }] },
      { type: "grid", name: "", schema: [{ name: "capacity", label: "Battery size (kWh, for the time to full)", selector: { number: { mode: "box" } } }, { name: "name", selector: { text: {} } }] },
      { name: "image", label: "Picture of your car from the side (optional, for example /local/my-car.png; a see-through PNG looks best)", selector: { text: {} } },
      ...colourFields("color"), THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig() { return { sample: true }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour();
    const lvl = this.n(c.battery), lim = this.n(c.limit) ?? 100;
    const pw = (() => { const v = this.n(c.power); if (v == null) return null; const u = this.sx(c.power).attributes.unit_of_measurement; return u === "W" ? v / 1000 : v; })();
    const chS = this.sx(c.charging);
    const charging = chS ? /^(on|charging)$/i.test(chS.state) : pw != null && pw > 0.1;
    const plugged = c.plugged ? this.on(c.plugged) : charging;
    const toFull = charging && pw && lvl != null && lvl < lim ? ((lim - lvl) / 100 * (Number(c.capacity) || 60)) / pw * 60 : null;
    const line = lvl == null ? "No reading" : charging ? `Charging${toFull != null ? ` · full ${new Date(Date.now() + toFull * 60000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : ""}` : plugged ? (lvl >= lim - 1 ? "Charged" : "Plugged in") : "Not plugged in";
    const col = lvl != null && lvl <= 20 ? "#F43F6B" : g[1];
    const cells = 10, full = lvl == null ? 0 : Math.round((lvl / 100) * cells), limCell = Math.round((lim / 100) * cells);
    const paint = [g[1], g[0]], glass = this.dark ? ["#3B4A9A", "#0B0E24"] : ["#A9B8EE", "#2E3A78"];
    // wheels: 70 cm tyres on a 4.7 m car (1 m = 66 px), drawn like a CAD side elevation
    const rim = (cx) => `<g><circle cx="${cx}" cy="87" r="23" fill="#0B0D17"/><circle cx="${cx}" cy="87" r="22" fill="none" stroke="#2A3066" stroke-width="1"/>
      <circle cx="${cx}" cy="87" r="15.5" fill="url(#evrim)"/>
      ${[0, 72, 144, 216, 288].map((a) => { const r1 = ((a - 90) * Math.PI) / 180; return `<path d="M${(cx + 4 * Math.cos(r1 - 0.5)).toFixed(1)} ${(87 + 4 * Math.sin(r1 - 0.5)).toFixed(1)} L${(cx + 14.5 * Math.cos(r1 - 0.2)).toFixed(1)} ${(87 + 14.5 * Math.sin(r1 - 0.2)).toFixed(1)} A14.5 14.5 0 0 1 ${(cx + 14.5 * Math.cos(r1 + 0.2)).toFixed(1)} ${(87 + 14.5 * Math.sin(r1 + 0.2)).toFixed(1)} L${(cx + 4 * Math.cos(r1 + 0.5)).toFixed(1)} ${(87 + 4 * Math.sin(r1 + 0.5)).toFixed(1)} Z" fill="#1A1F3D" opacity=".78"/>`; }).join("")}
      <path d="M${cx + 6} ${87 - 13} A14 14 0 0 1 ${cx + 13.5} ${87 - 3}" fill="none" stroke="${g[1]}" stroke-width="3.2" stroke-linecap="round"/>
      <circle cx="${cx}" cy="87" r="4.2" fill="#DDE1F0"/><circle cx="${cx}" cy="87" r="1.6" fill="#1A1F3D"/></g>`;
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, charging)}
      .hero{display:flex;align-items:flex-end;justify-content:space-between;gap:12px}
      .hero .pc{font-size:48px;font-weight:700;line-height:1;font-family:${FONT_NUM};color:${col};letter-spacing:-1px}
      .hero .pc small{font-size:20px}
      .hero .sub{font-size:12px;color:${p.muted};margin-top:4px}
      .hero .rg{text-align:right}
      .hero .rg b{display:block;font-size:24px;font-family:${FONT_NUM}}
      .hero .rg span{font-size:12px;color:${p.muted}}
      .car{position:relative;border-radius:18px;overflow:hidden;background:radial-gradient(120% 90% at 60% 110%,${g[0]}33,transparent 60%),${p.inset}}
      .car svg{display:block;width:100%;height:auto}
      .cell.next{animation:roost-breathe 1.2s ease-in-out infinite}
      .photo{padding:12px 12px 14px;display:flex;flex-direction:column;align-items:center;gap:10px}
      .photo img{width:100%;max-height:150px;object-fit:contain;filter:drop-shadow(0 12px 14px rgba(0,0,0,${this.dark ? 0.55 : 0.2}))}
      .pack{display:flex;align-items:center;gap:4px;padding:4px 8px;border-radius:999px;background:${this.dark ? "rgba(11,13,23,.45)" : "rgba(255,255,255,.7)"}}
      .pack i{display:block;width:18px;height:10px;border-radius:3px}
      .pack .pb{--mdc-icon-size:16px;color:${g[1]};margin-left:2px;animation:roost-breathe 1.4s ease-in-out infinite}
      .flow{stroke-dasharray:2 10}
      ${charging ? `.flow{animation:roost-dash .7s linear infinite}@keyframes roost-dash{to{stroke-dashoffset:-12}}.led{animation:roost-breathe 1.4s ease-in-out infinite}
      .wave{animation:roost-wave 2.4s ease-in-out infinite}@keyframes roost-wave{0%{transform:translateX(-60px);opacity:0}30%{opacity:.9}100%{transform:translateX(150px);opacity:0}}
      .port{animation:roost-breathe 1.4s ease-in-out infinite}` : ""}
    </style>
    <div class="card">
      ${head(charging ? "mdi:ev-station" : "mdi:car-electric", c.name || "Car", line)}
      <div class="hero"><div><div class="pc num" data-tw="ev">${lvl == null ? "" : `${Math.round(lvl)}<small>%</small>`}</div><div class="sub t">${lim < 100 ? `Charges to ${Math.round(lim)}%` : "Battery"}</div></div>
        ${this.val(c.range) ? `<div class="rg"><b class="num">${esc(this.val(c.range))}</b><span>range</span></div>` : ""}</div>
      ${c.image ? `<div class="car photo" role="img" aria-label="Battery ${lvl == null ? "unknown" : `${Math.round(lvl)}%`}${charging ? ", charging" : ""}">
        <img src="${esc(c.image)}" alt="${esc(c.name || "Car")}">
        <div class="pack">${Array.from({ length: cells }, (_, k) => `<i class="cell ${charging && k === full && k < limCell ? "next" : ""}" style="background:${k < full ? `linear-gradient(90deg,${g[0]},${col})` : k < limCell ? p.track : "transparent"};${k < limCell ? "" : `border:1px dashed ${p.track}`}"></i>`).join("")}
          ${charging ? '<ha-icon icon="mdi:lightning-bolt" class="pb"></ha-icon>' : ""}</div>
      </div>` : `<div class="car" role="img" aria-label="Battery ${lvl == null ? "unknown" : `${Math.round(lvl)}%`}${charging ? ", charging" : ""}">
        <svg viewBox="-4 4 380 116" aria-hidden="true">
          <defs>
            <linearGradient id="evbody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${paint[0]}"/><stop offset=".42" stop-color="${paint[1]}"/><stop offset=".43" stop-color="${paint[1]}"/><stop offset="1" stop-color="${this.dark ? "#0E1530" : "#2A3060"}"/></linearGradient>
            <linearGradient id="evspec" x1="0" x2="1"><stop offset="0" stop-color="rgba(255,255,255,0)"/><stop offset=".5" stop-color="rgba(255,255,255,.55)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></linearGradient>
            <linearGradient id="evglass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${glass[0]}"/><stop offset="1" stop-color="${glass[1]}"/></linearGradient>
            <linearGradient id="evcell" x1="0" x2="1"><stop offset="0" stop-color="${g[0]}"/><stop offset="1" stop-color="${col}"/></linearGradient>
            <radialGradient id="evrim" cx="40%" cy="35%"><stop offset="0" stop-color="#F4F5FC"/><stop offset=".6" stop-color="#A9B0D6"/><stop offset="1" stop-color="#5A6199"/></radialGradient>
            <radialGradient id="evshadow"><stop offset="0" stop-color="rgba(0,0,0,${this.dark ? 0.6 : 0.25})"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></radialGradient>
            <linearGradient id="evbeam" x1="0" x2="1"><stop offset="0" stop-color="rgba(125,211,252,.4)"/><stop offset="1" stop-color="rgba(125,211,252,0)"/></linearGradient>
            <clipPath id="evclip"><path d="M24 101 L53 101 A28 28 0 0 1 109 101 L244 101 A28 28 0 0 1 300 101 L322 101 C328 100 331 94 331 86 L330 72 C330 64 326 58 318 54 L262 45 C252 40 238 22 212 15 C196 11 150 11 134 15 C112 21 90 34 72 44 L36 47 C26 48 20 52 19 60 L18 82 C18 94 20 101 24 101 Z"/></clipPath>
          </defs>
          <ellipse cx="200" cy="111" rx="160" ry="7" fill="url(#evshadow)"/>
          <path d="M356 62 L376 52 L376 80 Z" fill="url(#evbeam)"/>
          ${plugged ? `<rect x="3" y="30" width="20" height="46" rx="7" fill="${this.dark ? "#141831" : "#FFFFFF"}" stroke="${p.border}" stroke-width="1.5"/><rect x="7.5" y="37" width="11" height="4.5" rx="2.2" class="led" fill="${charging ? "#34D399" : p.muted}"/>
            <path d="M13 76 C13 100 40 104 56 92 C62 84 64 64 72 57" fill="none" stroke="${this.dark ? "#3A4170" : "#9AA3D9"}" stroke-width="4" stroke-linecap="round"/>
            <path class="flow" d="M13 76 C13 100 40 104 56 92 C62 84 64 64 72 57" fill="none" stroke="${charging ? "#FFFFFF" : "transparent"}" stroke-width="2.2" stroke-linecap="round"/>` : ""}
          <g transform="translate(26 0)">
            <path d="M24 101 L53 101 A28 28 0 0 1 109 101 L244 101 A28 28 0 0 1 300 101 L322 101 C328 100 331 94 331 86 L330 72 C330 64 326 58 318 54 L262 45 C252 40 238 22 212 15 C196 11 150 11 134 15 C112 21 90 34 72 44 L36 47 C26 48 20 52 19 60 L18 82 C18 94 20 101 24 101 Z" fill="url(#evbody)" stroke="${this.dark ? "#5A6BC0" : "#3A4170"}" stroke-width=".8"/>
            <g clip-path="url(#evclip)" fill="none" stroke="${this.dark ? "rgba(11,13,23,.55)" : "rgba(42,48,96,.45)"}" stroke-width=".9">
              <path d="M30 62 C120 58 230 58 324 62" stroke="url(#evspec)" stroke-width="2.2"/>
              <path d="M106 48 C106 62 106 74 112 82 L114 96"/><path d="M168 46 L168 96"/><path d="M238 46 C238 60 240 72 242 82"/>
              <path d="M112 96 L242 96"/><path d="M40 52 L52 51 L52 59 L40 60 Z"/>
              <path d="M53 101 A28 28 0 0 1 109 101" stroke-width="2.5"/><path d="M244 101 A28 28 0 0 1 300 101" stroke-width="2.5"/>
              ${charging ? `<rect class="wave" x="120" y="80" width="40" height="18" fill="${col}" opacity="0" style="filter:blur(6px)" stroke="none"/>` : ""}
            </g>
            <path d="M80 45 C96 36 114 26 136 19 C152 15 196 15 210 18 C228 23 242 34 251 43 L245 46 L84 46 Z" fill="url(#evglass)"/>
            <rect x="165" y="16" width="6" height="30" fill="${paint[1]}" opacity=".95"/><path d="M100 45 L112 29" stroke="${paint[1]}" stroke-width="3"/>
            <path d="M120 40 L134 23" stroke="rgba(255,255,255,.3)" stroke-width="3" stroke-linecap="round"/><path d="M192 42 L204 22" stroke="rgba(255,255,255,.22)" stroke-width="2.4" stroke-linecap="round"/>
            <path d="M246 41 C250 37 256 37 258 41 L256 45 L247 45 Z" fill="${paint[1]}" stroke="${this.dark ? "rgba(11,13,23,.55)" : "rgba(42,48,96,.45)"}" stroke-width=".8"/>
            <rect x="140" y="54" width="14" height="2.6" rx="1.3" fill="rgba(255,255,255,.55)"/><rect x="208" y="54" width="14" height="2.6" rx="1.3" fill="rgba(255,255,255,.55)"/>
            <path d="M306 57 C314 57 322 58 328 61 L328 64 C320 62 312 61 306 61 Z" fill="#E0F2FE" style="filter:drop-shadow(0 0 4px #7DD3FC)"/>
            <path d="M19 57 L36 52 L36 56 L19 61 Z" fill="#F43F6B" style="filter:drop-shadow(0 0 4px #F43F6B)"/>
            ${plugged ? `<circle class="port" cx="46" cy="55.5" r="2.6" fill="${charging ? "#34D399" : p.muted}" style="filter:drop-shadow(0 0 5px ${charging ? "#34D399" : "transparent"})"/>` : ""}
            <rect x="116" y="84" width="124" height="10" rx="5" fill="rgba(11,13,23,.4)" stroke="rgba(255,255,255,.28)" stroke-width=".8"/>
            ${Array.from({ length: cells }, (_, k) => `<rect class="cell ${charging && k === full && k < limCell ? "next" : ""}" x="${118.5 + k * 12}" y="86" width="10" height="6" rx="1.8" fill="${k < full ? "url(#evcell)" : k < limCell ? "rgba(255,255,255,.18)" : "transparent"}" stroke="${k < limCell ? "none" : "rgba(255,255,255,.35)"}" stroke-dasharray="${k < limCell ? "" : "2 2"}"/>`).join("")}
            ${rim(81)}${rim(272)}
          </g>
        </svg>
      </div>`}
      <div class="stat">${stat("Charging at", charging && pw != null ? `${fmt(pw, 1)} kW` : "")}${stat("Full in", toFull != null ? minsText(toFull) : "")}</div>
      ${chS && chS.entity_id.startsWith("switch.") ? `<button class="big ${charging ? "off" : ""}" data-ch="1"><ha-icon icon="${charging ? "mdi:stop" : "mdi:lightning-bolt"}"></ha-icon>${charging ? "Stop charging" : "Start charging"}</button>` : ""}
    </div>`;
    const r = this.shadowRoot;
    r.querySelector("[data-ic]").addEventListener("click", () => this.moreInfo(c.battery));
    r.querySelector("[data-ch]")?.addEventListener("click", () => { this.vibrate(); this.call("switch", charging ? "turn_off" : "turn_on", { entity_id: c.charging }); });
  }
}

// ------------------------------------------------------------------ Roost Plant
// A potted plant: the soil darkens with water, the leaves droop when it is thirsty, and it says what it needs.
const PLANT_RANGES = { moisture: [20, 60], light: [1500, 40000], temperature: [12, 32], conductivity: [350, 2000] };
// A lifelike monstera: wide heart-shaped leaves with real splits and holes, stems and a terracotta pot.
// health 0..1 (thirsty leaves droop and fade to yellow); soil colour shows how wet it is.
function monsteraSvg({ w = 150, h = 220, health = 1, soil = "#4A3424", id = "m", pot = true, potTop = 150 }) {
  const lerp = (a, b, k) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(",")})`;
  const dark = lerp([128, 120, 52], [34, 98, 52], health), mid = lerp([176, 160, 70], [62, 142, 78], health), lite = lerp([206, 186, 96], [110, 186, 110], health);
  const droop = (1 - health) * 22;
  // [x of base, angle, length]
  const L = [[-30, -48, 62], [28, 46, 64], [-12, -14, 70], [12, 18, 66], [0, -2, 50]];
  // a heart-shaped leaf: two round lobes at the stem, a pointed tip
  const leaf = (len) => { const q = (v) => (v * len).toFixed(1); return `M0 ${q(-0.08)} C${q(-0.28)} ${q(0.1)} ${q(-0.84)} ${q(0.02)} ${q(-0.8)} ${q(-0.44)} C${q(-0.76)} ${q(-0.84)} ${q(-0.3)} ${q(-1.04)} 0 ${q(-1.1)} C${q(0.3)} ${q(-1.04)} ${q(0.76)} ${q(-0.84)} ${q(0.8)} ${q(-0.44)} C${q(0.84)} ${q(0.02)} ${q(0.28)} ${q(0.1)} 0 ${q(-0.08)} Z`; };
  // deep splits from the edge almost to the middle vein, rising a little towards it
  const cuts = (len) => [0.12, 0.3, 0.48, 0.66, 0.82].flatMap((y) => [-1, 1].map((sd) => `M${(sd * 1.0 * len).toFixed(1)} ${(-y * len + 0.04 * len).toFixed(1)} L${(sd * 0.13 * len).toFixed(1)} ${(-y * len - 0.1 * len).toFixed(1)}`)).join(" ");
  const holes = (len) => [0.4, 0.58].flatMap((y) => [-1, 1].map((sd) => `<ellipse cx="${(sd * 0.2 * len).toFixed(1)}" cy="${(-y * len).toFixed(1)}" rx="${(0.04 * len).toFixed(1)}" ry="${(0.025 * len).toFixed(1)}" fill="#000"/>`)).join("");
  const base = [w / 2, potTop + 2];
  let defs = `<linearGradient id="${id}g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${dark}"/><stop offset=".6" stop-color="${mid}"/><stop offset="1" stop-color="${lite}"/></linearGradient>
    <linearGradient id="${id}p" x1="0" x2="1"><stop offset="0" stop-color="#8E4528"/><stop offset=".42" stop-color="#C96E43"/><stop offset="1" stop-color="#743620"/></linearGradient>`;
  let stems = "", leaves = "";
  L.forEach(([dx, ang, len], i) => {
    const a = ang + (ang >= 0 ? droop : -droop) * (Math.abs(ang) > 20 ? 1.3 : 0.6), rad = (a * Math.PI) / 180;
    const sx = base[0] + dx * 0.25, sy = base[1] - 4, ex = base[0] + dx + Math.sin(rad) * len * 0.55, ey = base[1] - 40 - Math.cos(rad) * len * 0.55 + droop * 0.8;
    stems += `<path d="M${sx.toFixed(1)} ${sy} Q${(sx + (ex - sx) * 0.2).toFixed(1)} ${(sy - 30).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="${dark}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    const sc = 0.6;
    defs += `<mask id="${id}k${i}"><rect x="-99" y="-99" width="198" height="198" fill="#fff"/><path d="${cuts(len)}" stroke="#000" stroke-width="${(0.06 * len).toFixed(1)}" stroke-linecap="butt"/>${holes(len)}</mask>`;
    leaves += `<g transform="translate(${ex.toFixed(1)} ${ey.toFixed(1)}) rotate(${(a * 0.6).toFixed(1)}) scale(${sc})"><g mask="url(#${id}k${i})"><path d="${leaf(len)}" fill="url(#${id}g)"/>
      <path d="M0 0 L0 ${(-0.96 * len).toFixed(1)}" stroke="${lite}" stroke-width="1.6" opacity=".7"/>
      <path d="M0 ${(-0.3 * len).toFixed(1)} Q${(-0.25 * len).toFixed(1)} ${(-0.36 * len).toFixed(1)} ${(-0.45 * len).toFixed(1)} ${(-0.3 * len).toFixed(1)} M0 ${(-0.3 * len).toFixed(1)} Q${(0.25 * len).toFixed(1)} ${(-0.36 * len).toFixed(1)} ${(0.45 * len).toFixed(1)} ${(-0.3 * len).toFixed(1)} M0 ${(-0.58 * len).toFixed(1)} Q${(-0.2 * len).toFixed(1)} ${(-0.64 * len).toFixed(1)} ${(-0.34 * len).toFixed(1)} ${(-0.6 * len).toFixed(1)} M0 ${(-0.58 * len).toFixed(1)} Q${(0.2 * len).toFixed(1)} ${(-0.64 * len).toFixed(1)} ${(0.34 * len).toFixed(1)} ${(-0.6 * len).toFixed(1)}" stroke="${lite}" stroke-width=".9" fill="none" opacity=".45"/>
      <path d="${leaf(len)}" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1"/></g></g>`;
  });
  const potSvg = pot ? `<ellipse cx="${w / 2}" cy="${h - 8}" rx="${w * 0.3}" ry="6" fill="rgba(0,0,0,.35)"/>
    <path d="M${w / 2 - 38} ${potTop} L${w / 2 + 38} ${potTop} L${w / 2 + 30} ${h - 12} Q${w / 2 + 29} ${h - 8} ${w / 2 + 25} ${h - 8} L${w / 2 - 25} ${h - 8} Q${w / 2 - 29} ${h - 8} ${w / 2 - 30} ${h - 12} Z" fill="url(#${id}p)"/>
    <rect x="${w / 2 - 42}" y="${potTop - 6}" width="84" height="13" rx="4" fill="#D98A5B"/><rect x="${w / 2 - 42}" y="${potTop - 6}" width="84" height="4" rx="2" fill="rgba(255,255,255,.18)"/>
    <ellipse cx="${w / 2}" cy="${potTop}" rx="37" ry="4" fill="${soil}"/>
    <path d="M${w / 2 - 24} ${potTop + 14} L${w / 2 - 20} ${h - 18}" stroke="rgba(255,255,255,.14)" stroke-width="5" stroke-linecap="round"/>` : "";
  return { defs, body: `${stems}${leaves}${potSvg}` };
}

class RoostPlant extends RoostBase {
  static get defaults() { return { color: "green", look: "classic", theme: "auto" }; }

  validate(c) { if (!c.moisture && !c.entity) throw new Error("Choose the plant's soil moisture (or the plant)"); }

  watched() { const c = this._config; return [c.entity, c.moisture, c.light, c.temperature, c.conductivity].filter(Boolean); }

  static getConfigForm() {
    return { schema: [
      { name: "sample", label: "Show sample data", selector: { boolean: {} } },
      { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "entity", label: "Plant (optional)", selector: { entity: { domain: "plant" } } }] },
      { type: "grid", name: "", schema: [{ name: "moisture", label: "Soil moisture", selector: { entity: { domain: "sensor" } } }, { name: "light", selector: { entity: { domain: "sensor" } } }] },
      { type: "grid", name: "", schema: [{ name: "temperature", selector: { entity: { domain: "sensor" } } }, { name: "conductivity", label: "Food (conductivity)", selector: { entity: { domain: "sensor" } } }] },
      { type: "grid", name: "", schema: [{ name: "min_moisture", label: "Water when below (%)", selector: { number: { mode: "box" } } }, { name: "max_moisture", label: "Too wet above (%)", selector: { number: { mode: "box" } } }] },
      { name: "look", label: "Look", selector: pick([["classic", "Classic (small plant and tips)"], ["portrait", "Living portrait: a real plant and its good ranges"], ["ring", "Health ring: one ring per need and a score"], ["pot", "See inside the pot: how deep the water reaches"]]) },
      ...colourFields("color"), THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig() { return { sample: true, look: "portrait" }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour(), pl = this.sx(c.entity)?.attributes || {};
    const val = (k) => this.n(c[k]) ?? num(pl[k] ?? (k === "light" ? pl.brightness : undefined));
    const m = val("moisture"), lo = Number(c.min_moisture) || PLANT_RANGES.moisture[0], hi = Number(c.max_moisture) || PLANT_RANGES.moisture[1];
    const needs = [];
    if (m != null && m < lo) needs.push(["Needs water", "mdi:water-alert", "#38BDF8"]);
    if (m != null && m > hi) needs.push(["Too wet, let it dry", "mdi:water-off", "#38BDF8"]);
    const li = val("light"); if (li != null && li < PLANT_RANGES.light[0]) needs.push(["Needs more light", "mdi:white-balance-sunny", "#F5B94A"]);
    const t = val("temperature"); if (t != null && (t < PLANT_RANGES.temperature[0] || t > PLANT_RANGES.temperature[1])) needs.push([t < PLANT_RANGES.temperature[0] ? "Too cold" : "Too hot", "mdi:thermometer-alert", "#FF9F6B"]);
    const co = val("conductivity"); if (co != null && co < PLANT_RANGES.conductivity[0]) needs.push(["Needs plant food", "mdi:sprout", "#34D399"]);
    const thirsty = m != null && m < lo, droop = thirsty ? 26 : 0;
    const wet = m == null ? 0.5 : Math.max(0, Math.min(1, m / 80));
    const soil = `rgb(${Math.round(150 - wet * 90)},${Math.round(110 - wet * 70)},${Math.round(80 - wet * 50)})`;
    const leaf = thirsty ? "#9CB86A" : "#34D399";
    const line = needs.length ? needs.map((x) => x[0]).join(" · ") : "Happy";
    if (c.look && c.look !== "classic") return this.renderLook({ c, p, g, m, lo, hi, li, t, co, needs, thirsty, line, wet });
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, !needs.length)}
      .mid{display:grid;grid-template-columns:110px minmax(0,1fr);gap:16px;align-items:center}
      .pot{width:110px;height:130px}
      .lf{transform-box:fill-box;transform-origin:bottom center;animation:roost-sway 4s ease-in-out infinite}
      .side{display:flex;flex-direction:column;gap:8px;min-width:0}
      .need{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:12px;background:${p.inset};font-size:13px;font-weight:600}
      .need ha-icon{--mdc-icon-size:18px}
      .ok{color:#34D399}
      .stat{flex-wrap:nowrap}
    </style>
    <div class="card">
      ${head(thirsty ? "mdi:flower-outline" : "mdi:flower", c.name || this.name(c.entity || c.moisture, "Plant"), line)}
      <div class="mid">
        <svg class="pot" viewBox="0 0 110 130" aria-hidden="true">
          <g transform="translate(55 78)">${[[-34, 0], [-14, 1], [10, 2], [32, 3]].map(([a, i]) => `<path class="lf" style="animation-delay:${i * 0.4}s" d="M0 0 Q${a * 0.4} -30 ${a} ${-46 + Math.abs(a) * 0.5 + droop} Q${a * 0.7} -18 0 0" fill="${leaf}" opacity="${0.85 - i * 0.08}" transform="rotate(${a > 0 ? droop / 2 : -droop / 2})"/>`).join("")}
            <path d="M0 0 V-40" stroke="${leaf}" stroke-width="3" stroke-linecap="round" transform="rotate(${droop / 3})"/></g>
          <path d="M22 78 H88 L80 126 H30 Z" fill="${this.dark ? "#B4593E" : "#D9774F"}"/><rect x="18" y="72" width="74" height="12" rx="4" fill="${this.dark ? "#C96748" : "#E58A62"}"/>
          <ellipse cx="55" cy="78" rx="34" ry="4" fill="${soil}"/>
          ${thirsty ? '<path d="M92 30 q4 6 0 9 q-4 -3 0 -9" fill="#38BDF8" style="animation:roost-bounce 1.6s ease-in-out infinite"/>' : ""}
        </svg>
        <div class="side">
          ${needs.length ? needs.map(([w, ic, col]) => `<div class="need"><ha-icon icon="${ic}" style="color:${col}"></ha-icon><span class="t">${esc(w)}</span></div>`).join("") : '<div class="need"><ha-icon class="ok" icon="mdi:check-circle"></ha-icon><span class="t">All good</span></div>'}
          <div class="stat">${stat("Soil", m != null ? `${Math.round(m)}%` : "")}${stat("Light", li != null ? `${fmt(li, 0)} lx` : "")}${stat("Warmth", this.val(c.temperature) || (t != null ? `${fmt(t, decOf(String(t)))}°` : ""))}</div>
        </div>
      </div>
    </div>`;
    this.shadowRoot.querySelector("[data-ic]").addEventListener("click", () => this.moreInfo(c.moisture || c.entity));
  }

  renderLook({ c, p, g, m, lo, hi, li, t, co, needs, thirsty, line, wet }) {
    const R = PLANT_RANGES, health = m == null ? 1 : Math.max(0, Math.min(1, (m - 5) / Math.max(10, lo + 10)));
    const soil = `rgb(${Math.round(186 - wet * 112)},${Math.round(160 - wet * 108)},${Math.round(130 - wet * 94)})`;
    const noData = m == null && li == null && t == null && co == null;
    const tooWet = m != null && m > hi, word = noData ? "No reading" : thirsty ? "Thirsty" : tooWet ? "Too wet" : needs.length ? "Needs care" : "Happy";
    let chipBg = thirsty || needs.length ? (this.dark ? "#3A2A0A" : "#FEF3C7") : this.dark ? "#12352C" : "#D1FAE5", chipFg = thirsty || needs.length ? (this.dark ? "#FCD34D" : "#92400E") : this.dark ? "#6EE7B7" : "#065F46";
    if (noData) { chipBg = this.dark ? "#1B2045" : "#EEF1FB"; chipFg = this.dark ? "#A9B0D6" : "#4B5280"; }
    const nameTxt = c.name || this.name(c.entity || c.moisture, "Plant");
    // a reading against its good range: the green part is good, the dot is now
    const rows = [["Water", m, lo, hi, 0, 100, m != null ? `${Math.round(m)}%` : ""], ["Light", li, R.light[0], R.light[1], 0, R.light[1] * 1.2, li != null ? `${fmt(li, 0)} lx` : ""],
      ["Warmth", t, R.temperature[0], R.temperature[1], 5, 40, t != null ? `${fmt(t, decOf(String(t)))}°` : ""], ["Food", co, R.conductivity[0], R.conductivity[1], 0, R.conductivity[1] * 1.2, co != null ? `${fmt(co, 0)} µS` : ""]].filter((r) => r[1] != null);
    const bad = (r) => r[1] < r[2] || r[1] > r[3], pctOf = (v, a, b) => Math.max(0, Math.min(100, ((v - a) / (b - a || 1)) * 100));
    const bars = rows.map((r) => `<div class="rw"><div class="rh"><span>${r[0]}</span><b class="num">${esc(r[6])}</b></div><div class="rb"><i class="gd" style="left:${pctOf(r[2], r[4], r[5]).toFixed(1)}%;width:${(pctOf(r[3], r[4], r[5]) - pctOf(r[2], r[4], r[5])).toFixed(1)}%"></i><i class="dt ${bad(r) ? "bad" : ""}" data-glide="pl${r[0]}" style="left:${pctOf(r[1], r[4], r[5]).toFixed(1)}%"></i></div></div>`).join("");
    const pl = monsteraSvg({ w: 150, h: 220, health, soil, id: `m${c.look}` });
    let body = "";
    if (c.look === "portrait") {
      body = `<div class="pt"><div class="pic"><svg viewBox="0 0 150 220" role="img" aria-label="${esc(`${nameTxt}: ${word}`)}"><defs>${pl.defs}</defs><g class="sway">${pl.body}</g>
        ${thirsty ? '<path class="drop" d="M128 104 C128 104 120 116 120 121 C120 126 124 129 128 129 C132 129 136 126 136 121 C136 116 128 104 128 104 Z" fill="#60A5FA"/>' : ""}</svg></div>
        <div class="bars">${bars || '<div class="rh"><span>Add the plant\'s sensors in its settings</span></div>'}</div></div>`;
    } else if (c.look === "ring") {
      const ring = (r, k, ok) => `<circle cx="120" cy="120" r="${r}" fill="none" stroke="${p.track}" stroke-width="11"/><circle cx="120" cy="120" r="${r}" fill="none" stroke="${ok ? "#34D399" : "#F59E0B"}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${(2 * Math.PI * r * Math.max(0.02, k)).toFixed(1)} 999" transform="rotate(-90 120 120)"/>`;
      const score = rows.length ? Math.round(rows.reduce((a, r) => a + (bad(r) ? 0.5 : 1), 0) / rows.length * 100) : 100;
      const fr = (r) => { const pos = pctOf(r[1], r[4], r[5]) / 100; return bad(r) ? Math.min(pos, 0.45) : 0.65 + 0.35 * (1 - Math.abs(pos - pctOf((r[2] + r[3]) / 2, r[4], r[5]) / 100)); };
      body = `<div class="rg"><svg viewBox="0 0 240 240" role="img" aria-label="${esc(`${nameTxt}: ${score} out of 100`)}">${rows.map((r, i) => ring(104 - i * 16, fr(r), !bad(r))).join("")}
        <defs>${pl.defs}</defs><g transform="translate(78 64) scale(.56)"><g class="sway">${pl.body}</g></g></svg>
        </div><div class="sc"><b class="num" data-tw="sc">${score}</b><span>out of 100 · ${score >= 90 ? "thriving" : score >= 70 ? "doing fine" : "needs care"}</span></div>
        <div class="lg">${rows.map((r) => `<div class="li"><i style="background:${bad(r) ? "#F59E0B" : "#34D399"}"></i><span>${r[0]}</span><b class="num">${esc(r[6])}</b></div>`).join("")}</div>`;
    } else {
      const wetY = 216 - 98 * Math.min(1, (m ?? 40) / 80);
      body = `<svg class="cut" viewBox="0 0 320 230" role="img" aria-label="${esc(`Inside the pot: ${m != null ? Math.round(m) : "?"}% wet`)}"><defs>${pl.defs}<clipPath id="soilcut"><path d="M88 118 L232 118 L216 216 L104 216 Z"/></clipPath></defs>
        <g transform="translate(85 -40) scale(.98)"><g class="sway">${monsteraSvg({ w: 150, h: 220, health, soil, id: "mpot", pot: false }).body}</g></g>
        <path d="M80 112 L240 112 L222 222 L98 222 Z" fill="#7E3D24"/><path d="M88 118 L232 118 L216 216 L104 216 Z" fill="#B99A7A"/>
        <g clip-path="url(#soilcut)">${m != null ? `<rect class="wet" x="80" y="${wetY.toFixed(0)}" width="170" height="130" fill="#4A3424"/><rect x="80" y="${wetY.toFixed(0)}" width="170" height="3" fill="#60A5FA" opacity=".75"/>` : ""}
          <path d="M160 118 C158 140 140 150 132 176 M160 118 C163 146 182 158 188 190 M160 118 C160 150 156 178 160 206 M140 150 C130 154 120 152 114 160 M178 150 C190 152 200 150 206 158" stroke="#E9D9B8" stroke-width="2" fill="none" opacity=".75"/></g>
        <rect x="74" y="104" width="172" height="14" rx="4" fill="#D98A5B"/>
        ${m != null ? `<path d="M244 ${wetY.toFixed(0)} L262 ${wetY.toFixed(0)}" stroke="#60A5FA" stroke-width="2"/>
        <text x="266" y="${(wetY + 4).toFixed(0)}" fill="${this.dark ? "#93C5FD" : "#1D4ED8"}" font-size="12" font-weight="600">${Math.round(m)}% wet</text>` : `<text x="246" y="170" fill="${p.muted}" font-size="12">No soil reading</text>`}
        <text x="8" y="136" fill="${p.muted}" font-size="11">Top soil</text><text x="8" y="210" fill="${p.muted}" font-size="11">Roots</text></svg>
        <div class="stat">${stat("Light", li != null ? `${fmt(li, 0)} lx` : "")}${stat("Warmth", t != null ? `${fmt(t, decOf(String(t)))}°` : "")}${stat("Food", co != null ? (co < R.conductivity[0] ? "Low" : "Good") : "")}</div>`;
    }
    const next = thirsty ? "Water it now" : tooWet ? "Let it dry a little" : m != null ? `Next water in about ${Math.max(1, Math.round((m - lo) / 8))} days` : line;
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, !needs.length)}
      .chip2{margin-left:auto;min-height:28px;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:600;display:flex;align-items:center;background:${chipBg};color:${chipFg};flex:none}
      .hd{display:flex;align-items:center;gap:8px}
      .pt{display:grid;grid-template-columns:140px minmax(0,1fr);gap:14px;align-items:center}
      .pic{height:200px;border-radius:18px;background:radial-gradient(ellipse at 50% 20%,${this.dark ? "#26305E" : "#E7ECFA"},transparent 70%)}
      .pic svg{width:100%;height:100%}
      .sway{transform-box:fill-box;transform-origin:50% 100%;animation:roost-sway 6s ease-in-out infinite}
      .drop{animation:roost-bounce 1.6s ease-in-out infinite}
      .bars{display:flex;flex-direction:column;gap:12px;min-width:0}
      .rh{display:flex;justify-content:space-between;gap:8px;font-size:13px;color:${p.muted}}.rh b{color:${p.text};font-weight:700}
      .rb{position:relative;height:8px;border-radius:4px;background:${p.track};margin-top:6px}
      .rb .gd{position:absolute;top:0;bottom:0;border-radius:4px;background:rgba(52,211,153,.4)}
      .rb .dt{position:absolute;top:-4px;width:16px;height:16px;margin-left:-8px;border-radius:50%;background:#34D399;box-shadow:0 0 0 3px ${p.panel.startsWith("rgba") ? (this.dark ? "#141831" : "#fff") : p.panel}}
      .rb .dt.bad{background:#F59E0B;animation:roost-breathe 1.8s ease-in-out infinite}
      .rg{position:relative;width:240px;max-width:100%;margin:0 auto}.rg svg{width:100%;height:auto;display:block}
      .sc{display:flex;align-items:baseline;justify-content:center;gap:6px;margin-top:-6px}.sc b{font-size:24px}.sc span{font-size:13px;color:${p.muted}}
      .lg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
      .li{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:12px;background:${p.inset};font-size:13px}.li i{width:10px;height:10px;border-radius:50%;flex:none}.li span{color:${p.muted}}.li b{margin-left:auto}
      .cut{width:100%;height:auto;display:block;font-family:inherit}
      .stat{flex-wrap:nowrap}
    </style>
    <div class="card">
      <div class="hd">${head(thirsty ? "mdi:flower-outline" : "mdi:flower", nameTxt, c.look === "pot" ? next : line)}<span class="chip2">${word}</span></div>
      ${body}
    </div>`;
    this.shadowRoot.querySelector("[data-ic]")?.addEventListener("click", () => this.moreInfo(c.moisture || c.entity));
  }
}

// ------------------------------------------------------------------ Roost Printer
// Ink or toner levels as little bottles, or a 3D print growing layer by layer with the nozzle moving, time left and temperatures.
class RoostPrinter extends ticking(RoostBase, 60000) {
  static get defaults() { return { kind: "ink", inks: [], color: "purple", theme: "auto" }; }

  validate(c) { if (c.kind === "3d" ? !c.progress && !c.entity : !(c.inks || []).length && !c.entity) throw new Error("Choose the printer's ink levels or print progress"); }

  watched() { const c = this._config; return [c.entity, c.progress, c.remaining, c.nozzle, c.bed, c.camera, ...(c.inks || []).map((i) => i.entity)].filter(Boolean); }

  static getConfigForm() {
    return { schema: [
      { name: "sample", label: "Show sample data", selector: { boolean: {} } },
      { type: "grid", name: "", schema: [{ name: "kind", label: "Printer", selector: pick([["ink", "Paper printer (ink or toner)"], ["3d", "3D printer"]]) }, { name: "name", selector: { text: {} } }] },
      { name: "entity", label: "Printer state (optional)", selector: { entity: {} } },
      { name: "inks", label: "Ink or toner levels", selector: { object: { multiple: true, label_field: "name", fields: {
        entity: { label: "Level (%)", required: true, selector: { entity: { domain: "sensor" } } }, name: { label: "Name", selector: { text: {} } },
        color: { label: "Colour", selector: { select: { mode: "dropdown", options: [{ value: "#1F2333", label: "Black" }, { value: "#22D3EE", label: "Cyan" }, { value: "#EC4899", label: "Magenta" }, { value: "#FACC15", label: "Yellow" }, { value: "#94A3B8", label: "Grey" }] } } },
      } } } },
      { type: "expandable", name: "", title: "3D printer", icon: "mdi:printer-3d", schema: [
        { type: "grid", name: "", schema: [{ name: "progress", label: "Progress (%)", selector: { entity: { domain: "sensor" } } }, { name: "remaining", label: "Time left / finishes at", selector: { entity: { domain: "sensor" } } }] },
        { type: "grid", name: "", schema: [{ name: "nozzle", label: "Nozzle temperature", selector: { entity: { domain: "sensor" } } }, { name: "bed", label: "Bed temperature", selector: { entity: { domain: "sensor" } } }] },
        { name: "camera", selector: { entity: { domain: ["camera", "image"] } } },
      ] },
      ...colourFields("color"), THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig() { return { sample: true }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour(), s = this.st();
    const state = s && !UNAVAILABLE.includes(s.state) ? String(s.state).replace(/_/g, " ") : "";
    if (c.kind === "3d") {
      const pr = this.n(c.progress), left = minutesOf(this.sx(c.remaining));
      const printing = pr != null && pr > 0 && pr < 100 && !/idle|off|paused|error/i.test(state);
      const layers = 14, done = Math.round(((pr ?? 0) / 100) * layers);
      const cam = this.sx(c.camera)?.attributes.entity_picture;
      const line = [state ? state.charAt(0).toUpperCase() + state.slice(1) : printing ? "Printing" : "Idle", printing && left != null ? `${minsText(left)} left` : ""].filter(Boolean).join(" · ");
      this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, printing)}
        .mid{display:grid;grid-template-columns:140px minmax(0,1fr);gap:16px;align-items:center}
        .pr{position:relative;width:140px;height:130px;border-radius:16px;background:${p.inset};overflow:hidden}
        .pr img{width:100%;height:100%;object-fit:cover}
        .gan{position:absolute;left:10px;right:10px;top:16px;height:6px;border-radius:3px;background:${p.track}}
        .noz{position:absolute;top:12px;width:16px;height:18px;margin-left:-8px;border-radius:3px 3px 8px 8px;background:${p.muted};left:30%}
        ${printing ? ".noz{animation:roost-noz 2.4s ease-in-out infinite}@keyframes roost-noz{0%,100%{left:28%}50%{left:72%}}" : ""}
        .bed{position:absolute;left:14px;right:14px;bottom:14px;height:5px;border-radius:2px;background:${p.muted}}
        .lay{position:absolute;left:50%;width:56px;margin-left:-28px;height:5px;border-radius:2px}
        .side{display:flex;flex-direction:column;gap:10px;min-width:0}
        .bar{height:8px;border-radius:4px;background:${p.track};overflow:hidden}
        .bar i{display:block;height:100%;background:linear-gradient(90deg,${g[0]},${g[1]})}
        .big2{font-size:32px;font-weight:700;font-family:${FONT_NUM}}
      </style>
      <div class="card">
        ${head("mdi:printer-3d", c.name || this.name(c.entity || c.progress, "3D printer"), line)}
        <div class="mid">
          <div class="pr" role="img" aria-label="${esc(line)}">${cam ? `<img src="${esc(cam)}" alt="Printer camera">` : `<div class="gan"></div><div class="noz"></div><div class="bed"></div>
            ${Array.from({ length: done }, (_, i) => `<div class="lay" style="bottom:${19 + i * 6}px;background:${i % 2 ? g[1] : g[0]};width:${56 - Math.abs(i - layers / 2) * 2}px;margin-left:${-(56 - Math.abs(i - layers / 2) * 2) / 2}px"></div>`).join("")}`}</div>
          <div class="side">
            <div class="big2" data-tw="pp">${pr != null ? `${Math.round(pr)}%` : ""}</div>
            ${pr != null ? `<div class="bar"><i data-bar="pp" style="width:${Math.round(pr)}%"></i></div>` : ""}
            <div class="stat">${stat("Left", printing && left != null ? minsText(left) : "")}${stat("Nozzle", this.val(c.nozzle))}${stat("Bed", this.val(c.bed))}</div>
          </div>
        </div>
      </div>`;
    } else {
      const inks = (c.inks || []).map((i) => ({ ...i, v: this.n(i.entity) })).filter((i) => this.sx(i.entity));
      const low = inks.filter((i) => i.v != null && i.v <= 15);
      const line = [state ? state.charAt(0).toUpperCase() + state.slice(1) : "", low.length ? `${low.map((i) => i.name || this.name(i.entity)).join(", ")} running low` : inks.length ? "Ink is fine" : ""].filter(Boolean).join(" · ");
      this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, !low.length)}
        .inks{display:grid;grid-template-columns:repeat(${Math.max(1, inks.length)},minmax(0,1fr));gap:10px;align-items:end}
        .ink{display:flex;flex-direction:column;align-items:center;gap:6px;font-size:12px;color:${p.muted};text-align:center}
        .bt{position:relative;width:44px;height:86px;border-radius:10px 10px 12px 12px;background:${p.inset};border:1.5px solid ${p.border};overflow:hidden}
        .bt::before{content:"";position:absolute;left:14px;right:14px;top:-1px;height:8px;border-radius:0 0 4px 4px;background:${p.border}}
        .bt i{position:absolute;left:0;right:0;bottom:0;transition:height .12s}
        .bt i::after{content:"";position:absolute;left:0;right:0;top:-3px;height:6px;border-radius:50%;background:inherit;filter:brightness(1.2)}
        .ink b{font-size:13px;color:${p.text};font-family:${FONT_NUM}}
        .ink.low b{color:#F43F6B}
      </style>
      <div class="card">
        ${head("mdi:printer", c.name || this.name(c.entity, "Printer"), line)}
        <div class="inks">${inks.map((i, k) => { const col = i.color || ["#1F2333", "#22D3EE", "#EC4899", "#FACC15"][k % 4]; return `<div class="ink ${i.v != null && i.v <= 15 ? "low" : ""}"><div class="bt"><i style="height:${Math.max(3, i.v ?? 0)}%;background:${col === "#1F2333" && this.dark ? "#5A6199" : col}"></i></div><b>${i.v != null ? `${Math.round(i.v)}%` : ""}</b><span class="t">${esc(i.name || this.name(i.entity).replace(/ink|toner|level/gi, "").trim())}</span></div>`; }).join("")}</div>
      </div>`;
    }
    this.shadowRoot.querySelector("[data-ic]").addEventListener("click", () => this.moreInfo(c.entity || c.progress || c.inks?.[0]?.entity));
  }
}

// ------------------------------------------------------------------ Roost Moments
// The day in moments (morning, work, evening, bedtime): the card suggests the scene for now, and shows the rest of the day as a strip.
class RoostMoments extends ticking(RoostBase, 60000) {
  static get defaults() {
    return { color: "purple", moments: [
      { name: "Morning", icon: "mdi:weather-sunset-up", from: "05:30" }, { name: "Day", icon: "mdi:white-balance-sunny", from: "09:00" },
      { name: "Evening", icon: "mdi:weather-sunset-down", from: "17:30" }, { name: "Bedtime", icon: "mdi:weather-night", from: "22:00" }], theme: "auto" };
  }

  validate(c) { if (!(c.moments || []).length) throw new Error("Add the moments of your day"); }

  watched() { return (this._config.moments || []).map((m) => m.entity).filter(Boolean); }

  static getConfigForm() {
    return { schema: [
      { name: "name", selector: { text: {} } },
      { name: "moments", label: "Moments (each starts at its time and lasts until the next)", selector: { object: { multiple: true, label_field: "name", fields: {
        name: { label: "Name", required: true, selector: { text: {} } }, icon: { label: "Icon", selector: { icon: {} } },
        from: { label: "Starts at (HH:MM)", required: true, selector: { text: {} } },
        entity: { label: "Scene or script to suggest", selector: { entity: { domain: ["scene", "script", "automation"] } } },
        tap_action: { label: "Or what to do", selector: { ui_action: {} } },
      } } } },
      ...colourFields("color"), THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig() { return {}; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour(), now = new Date();
    const mins = (t) => { const m = String(t || "").match(/^(\d{1,2}):(\d{2})/); return m ? +m[1] * 60 + +m[2] : 0; };
    const list = [...(c.moments || [])].map((m, i) => ({ ...m, i, at: mins(m.from) })).sort((a, b) => a.at - b.at);
    const nowM = now.getHours() * 60 + now.getMinutes();
    let cur = list.filter((m) => m.at <= nowM).pop() || list[list.length - 1];
    const next = list[(list.indexOf(cur) + 1) % list.length];
    const toNext = ((next.at - nowM + 1440) % 1440) || 1440;
    const what = cur.entity ? this.name(cur.entity) : cur.tap_action ? "Run it" : "";
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, true)}
      .now{display:flex;align-items:center;gap:14px;padding:14px;border-radius:18px;background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};box-shadow:0 14px 28px -14px ${g[2]}}
      .now ha-icon{--mdc-icon-size:30px}
      .now .w{flex:1;min-width:0}
      .now b{display:block;font-size:20px;font-family:${FONT_NUM}}
      .now span{font-size:13px;opacity:.9}
      .go{height:40px;padding:0 14px;border-radius:999px;border:0;background:rgba(255,255,255,.22);color:inherit;font:inherit;font-weight:700;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:6px;flex:none}
      .strip{display:flex;gap:6px}
      .m{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 4px;border-radius:14px;background:${p.inset};border:0;color:${p.muted};font:inherit;font-size:12px;cursor:pointer;text-align:center}
      .m ha-icon{--mdc-icon-size:20px}
      .m.on{background:${g[0]}33;color:${p.text};font-weight:600}
      .m small{font-size:11px;opacity:.8}
    </style>
    <div class="card">
      ${head("mdi:clock-time-four-outline", c.name || "Right now", `${cur.name} until ${next.from} · ${minsText(toNext)} left`)}
      <div class="now"><ha-icon icon="${esc(cur.icon || "mdi:star-four-points")}"></ha-icon><div class="w"><b class="t">${esc(cur.name)}</b><span class="t">${what ? `Suggested: ${esc(what)}` : `Next: ${esc(next.name)} at ${esc(next.from)}`}</span></div>
        ${cur.entity || cur.tap_action ? '<button class="go" data-go="1"><ha-icon icon="mdi:play" style="--mdc-icon-size:18px"></ha-icon>Go</button>' : ""}</div>
      <div class="strip">${list.map((m) => `<button class="m ${m === cur ? "on" : ""}" data-m="${m.i}"><ha-icon icon="${esc(m.icon || "mdi:star-four-points")}"></ha-icon><span class="t">${esc(m.name)}</span><small>${esc(m.from)}</small></button>`).join("")}</div>
    </div>`;
    const go = (m) => { this.vibrate(); if (m.tap_action) return this.run(m.tap_action, m.entity); if (!m.entity) return undefined; const d = m.entity.split(".")[0]; return this.call(d, d === "automation" ? "trigger" : "turn_on", { entity_id: m.entity }); };
    const r = this.shadowRoot;
    r.querySelector("[data-go]")?.addEventListener("click", () => go(cur));
    r.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => go(c.moments[+b.dataset.m])));
  }
}

// ------------------------------------------------------------------ Roost Family Map
// Where everyone is, drawn simply (no map tiles, nothing leaves the house): home in the middle, places as circles, people as faces with how far away.
class RoostFamilyMap extends RoostBase {
  static get defaults() { return { entities: [], zones: [], color: "active", theme: "auto" }; }

  validate(c) { if (!(c.entities || []).length) throw new Error("Pick the people"); }

  watched() { const c = this._config; return [...(c.entities || []), ...(c.zones || [])]; }

  static getConfigForm() {
    return { schema: [
      { name: "sample", label: "Show sample data", selector: { boolean: {} } },
      { name: "entities", label: "People", selector: { entity: { multiple: true, domain: ["person", "device_tracker"] } } },
      { name: "zones", label: "Places to draw (home is always there)", selector: { entity: { multiple: true, domain: "zone" } } },
      { name: "name", selector: { text: {} } },
      THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig(hass) { return { entities: Object.keys(hass.states).filter((i) => i.startsWith("person.")).slice(0, 4) }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, h = this._hass;
    const homeZ = this.sx(c.zone_home || "zone.home") || this.sx("zone.sample_home");
    const lat0 = num(homeZ?.attributes.latitude) ?? h.config?.latitude ?? 0, lon0 = num(homeZ?.attributes.longitude) ?? h.config?.longitude ?? 0;
    const km = (lat, lon) => { const x = (lon - lon0) * 111.32 * Math.cos((lat0 * Math.PI) / 180), y = (lat - lat0) * 110.57; return [x, y]; };
    const people = (c.entities || []).map((id, k) => { const s = this.sx(id); if (!s) return null; const a = s.attributes; const has = num(a.latitude) != null; const [x, y] = has ? km(a.latitude, a.longitude) : [0, 0]; return { id, s, x, y, has, d: Math.hypot(x, y), k }; }).filter(Boolean);
    const zones = [homeZ, ...(c.zones || []).map((z) => this.sx(z))].filter(Boolean).map((z) => { const [x, y] = km(z.attributes.latitude, z.attributes.longitude); return { z, x, y, r: (num(z.attributes.radius) || 100) / 1000 }; });
    const far = Math.max(1, ...people.map((q) => q.d), ...zones.map((z) => Math.hypot(z.x, z.y) + z.r)) * 1.25;
    const P = (x, y) => [50 + (x / far) * 46, 50 - (y / far) * 46];
    const PG = [["#38BDF8", "#6D4BFF"], ["#FF5577", "#FF9F6B"], ["#10B981", "#6EE7B7"], ["#F59E0B", "#FDE68A"]];
    const where = (q) => { const st = q.s.state; return st === "home" ? "Home" : st === "not_home" ? (q.has ? `${fmt(q.d, q.d < 10 ? 1 : 0)} km away` : "Away") : UNAVAILABLE.includes(st) ? "No location yet" : String(st).replace(/_/g, " "); };
    const homeN = people.filter((q) => q.s.state === "home").length;
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, ACTIVE, homeN > 0)}
      .map{position:relative;height:240px;border-radius:18px;overflow:hidden;background:${p.inset};
        background-image:radial-gradient(circle at 50% 50%,${ACTIVE[0]}22 0,transparent 60%),linear-gradient(${this.dark ? "rgba(255,255,255,.035)" : "rgba(40,48,96,.05)"} 1px,transparent 1px),linear-gradient(90deg,${this.dark ? "rgba(255,255,255,.035)" : "rgba(40,48,96,.05)"} 1px,transparent 1px);background-size:auto,24px 24px,24px 24px}
      .rg{position:absolute;left:50%;top:50%;border-radius:50%;border:1px dashed ${p.border};transform:translate(-50%,-50%)}
      .zn{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:4px;font-size:11px;color:${p.muted}}
      .zn i{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:${p.off};border:1.5px solid ${p.border}}
      .zn ha-icon{--mdc-icon-size:18px}
      .pp{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:3px;transition:left .12s,top .12s;cursor:pointer}
      .av{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:14px;border:2.5px solid ${this.dark ? "#0B0D17" : "#fff"};overflow:hidden;box-shadow:0 6px 14px -6px rgba(0,0,0,.5)}
      .av img{width:100%;height:100%;object-fit:cover}
      .pp span{font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px;background:${this.dark ? "rgba(11,13,23,.75)" : "rgba(255,255,255,.85)"};color:${p.text};white-space:nowrap}
      .list{display:flex;flex-direction:column;gap:6px}
      .row{display:flex;align-items:center;gap:10px;font-size:13px}
      .row .av{width:28px;height:28px;font-size:12px;border-width:0}
      .row b{flex:1;font-weight:600}
      .row > span:last-child{color:${p.muted}}
    </style>
    <div class="card">
      ${head("mdi:map-marker-radius", c.name || "Family", `${homeN ? `${homeN} at home` : "No one at home"}${people.length - homeN ? ` · ${people.length - homeN} out` : ""}`)}
      <div class="map" role="img" aria-label="Where everyone is">
        ${[0.33, 0.66].map((f) => `<span class="rg" style="width:${f * 92}%;aspect-ratio:1"></span>`).join("")}
        ${zones.map((z, i) => { const [x, y] = P(z.x, z.y); return `<div class="zn" style="left:${x}%;top:${y}%"><i><ha-icon icon="${esc(z.z.attributes.icon || (i === 0 ? "mdi:home" : "mdi:map-marker"))}"></ha-icon></i><span class="t">${esc(z.z.attributes.friendly_name || "")}</span></div>`; }).join("")}
        ${people.map((q, i) => { let [x, y] = P(q.x, q.y); const homeOnes = people.filter((o) => o.s.state === "home" || !o.has);
          if (q.s.state === "home" || !q.has) { const j = homeOnes.indexOf(q); [x, y] = P(0, 0); x += (j - (homeOnes.length - 1) / 2) * 13; y += 17; }
          else if (zones.some((z) => (z.z.attributes.friendly_name || "") === q.s.state)) { x += 9; y -= 10; }
          else if (Math.hypot(...P(q.x, q.y).map((v, k) => v - P(0, 0)[k])) < 14) { const [hx, hy] = P(0, 0); const a = Math.atan2(y - hy, x - hx); x = hx + Math.cos(a) * 16; y = hy + Math.sin(a) * 16; } const pic = q.s.attributes.entity_picture; const nm = this.name(q.id).split(" ")[0]; return `<div class="pp" data-p="${esc(q.id)}" data-glide="${esc(q.id)}" style="left:${x}%;top:${y}%"><span class="av" style="background:linear-gradient(135deg,${PG[q.k % 4][0]},${PG[q.k % 4][1]})">${pic ? `<img src="${esc(pic)}" alt="">` : esc(nm.charAt(0))}</span>${homeOnes.includes(q) && homeOnes.length > 1 ? "" : `<span class="t">${esc(nm)}</span>`}</div>`; }).join("")}
      </div>
      <div class="list">${people.map((q) => `<div class="row"><span class="av" style="background:linear-gradient(135deg,${PG[q.k % 4][0]},${PG[q.k % 4][1]})">${esc(this.name(q.id).charAt(0))}</span><b class="t">${esc(this.name(q.id))}</b><span class="t">${esc(where(q))}</span></div>`).join("")}</div>
    </div>`;
    this.shadowRoot.querySelectorAll("[data-p]").forEach((el) => el.addEventListener("click", () => this.moreInfo(el.dataset.p)));
    this.shadowRoot.querySelector("[data-ic]").addEventListener("click", () => this.moreInfo(c.entities[0]));
  }
}

// ================================================================== Nine more cards (1.6.0)

// A small QR code maker (byte mode, medium error correction, versions 1 to 10): enough for a guest Wi-Fi code.
const QR = (() => {
  const EC = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26], BL = [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];
  const raw = (v) => { let r = (16 * v + 128) * v + 64; if (v >= 2) { const n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; } return r; };
  const dataCw = (v) => Math.floor(raw(v) / 8) - EC[v] * BL[v];
  const align = (v) => { if (v === 1) return []; const n = Math.floor(v / 7) + 2, step = Math.ceil((v * 4 + 4) / (n * 2 - 2)) * 2, out = [6]; for (let p = v * 4 + 10; out.length < n; p -= step) out.splice(1, 0, p); return out; };
  const EXP = new Array(512), LOG = new Array(256);
  { let x = 1; for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; } for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; }
  const mul = (a, b) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);
  const rs = (data, n) => {
    let gen = [1];
    for (let i = 0; i < n; i++) { const g = new Array(gen.length + 1).fill(0); gen.forEach((c, j) => { g[j] ^= c; g[j + 1] ^= mul(c, EXP[i]); }); gen = g; }
    const res = new Array(n).fill(0);
    for (const d of data) { const f = d ^ res.shift(); res.push(0); for (let j = 0; j < n; j++) res[j] ^= mul(gen[j + 1], f); }
    return res;
  };
  return (text) => {
    const bytes = [...new TextEncoder().encode(text)];
    let v = 1; while (v <= 10 && 4 + (v < 10 ? 8 : 16) + bytes.length * 8 > dataCw(v) * 8) v++;
    if (v > 10) return null;
    const bits = [], put = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
    put(4, 4); put(bytes.length, v < 10 ? 8 : 16); bytes.forEach((b) => put(b, 8));
    const cap = dataCw(v) * 8; put(0, Math.min(4, cap - bits.length)); while (bits.length % 8) bits.push(0);
    const data = []; for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(""), 2));
    for (let p = 0xec; data.length < dataCw(v); p ^= 0xec ^ 0x11) data.push(p);
    // split into blocks, add error correction, interleave
    const nb = BL[v], total = Math.floor(raw(v) / 8), shortLen = Math.floor(total / nb), nShort = nb - (total % nb), blocks = [];
    for (let i = 0, k = 0; i < nb; i++) { const len = shortLen - EC[v] + (i < nShort ? 0 : 1), d = data.slice(k, k + len); k += len; blocks.push([d, rs(d, EC[v])]); }
    const out = [], maxD = Math.max(...blocks.map((b) => b[0].length));
    for (let i = 0; i < maxD; i++) blocks.forEach((b) => { if (i < b[0].length) out.push(b[0][i]); });
    for (let i = 0; i < EC[v]; i++) blocks.forEach((b) => out.push(b[1][i]));
    const size = v * 4 + 17, m = Array.from({ length: size }, () => new Array(size).fill(0)), fn = Array.from({ length: size }, () => new Array(size).fill(false));
    const set = (x, y, on) => { m[y][x] = on ? 1 : 0; fn[y][x] = true; };
    for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    const finder = (cx, cy) => { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const d = Math.max(Math.abs(dx), Math.abs(dy)), x = cx + dx, y = cy + dy; if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, d !== 2 && d !== 4); } };
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    const al = align(v);
    al.forEach((ax, i) => al.forEach((ay, j) => { if ((i === 0 && j === 0) || (i === 0 && j === al.length - 1) || (i === al.length - 1 && j === 0)) return; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1); }));
    const fmtBits = (mask) => { const d = (0 << 3) | mask; let r = d; for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537); return ((d << 10) | r) ^ 0x5412; };
    const drawFormat = (mask) => {
      const b = fmtBits(mask), bit = (i) => ((b >>> i) & 1) === 1;
      for (let i = 0; i <= 5; i++) set(8, i, bit(i));
      set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
      for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
      for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
      for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
      set(8, size - 8, true);
    };
    drawFormat(0);
    if (v >= 7) { let r = v; for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1f25); const b = (v << 12) | r; for (let i = 0; i < 18; i++) { const on = ((b >>> i) & 1) === 1, a = size - 11 + (i % 3), c = Math.floor(i / 3); set(a, c, on); set(c, a, on); } }
    // data in the zig-zag
    let i = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < size; vert++) for (let j = 0; j < 2; j++) {
        const x = right - j, up = ((right + 1) & 2) === 0, y = up ? size - 1 - vert : vert;
        if (!fn[y][x] && i < out.length * 8) { m[y][x] = (out[i >>> 3] >>> (7 - (i & 7))) & 1; i++; }
      }
    }
    const masks = [(x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x) => x % 3 === 0, (x, y) => (x + y) % 3 === 0, (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
      (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0, (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0, (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0];
    const apply = (k) => { for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!fn[y][x] && masks[k](x, y)) m[y][x] ^= 1; };
    const penalty = () => {
      let p = 0;
      for (let y = 0; y < size; y++) { let run = 1; for (let x = 1; x < size; x++) { if (m[y][x] === m[y][x - 1]) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; } }
      for (let x = 0; x < size; x++) { let run = 1; for (let y = 1; y < size; y++) { if (m[y][x] === m[y - 1][x]) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; } }
      for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++) if (m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) p += 3;
      const dark = m.flat().reduce((a, b) => a + b, 0); p += Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
      return p;
    };
    let best = 0, bestP = Infinity;
    for (let k = 0; k < 8; k++) { apply(k); drawFormat(k); const pn = penalty(); if (pn < bestP) { bestP = pn; best = k; } apply(k); }
    apply(best); drawFormat(best);
    return m;
  };
})();
const qrSvg = (text, fg, bg) => {
  const m = QR(text); if (!m) return "";
  const n = m.length, q = 2; let d = "";
  m.forEach((row, y) => row.forEach((on, x) => { if (on) d += `M${x + q} ${y + q}h1v1h-1z`; }));
  return `<svg viewBox="0 0 ${n + q * 2} ${n + q * 2}" shape-rendering="crispEdges" role="img" aria-label="Wi-Fi code"><rect width="100%" height="100%" fill="${bg}"/><path d="${d}" fill="${fg}"/></svg>`;
};
const wifiEsc = (v) => String(v || "").replace(/([\\;,:"])/g, "\\$1");

// ------------------------------------------------------------------ Roost Tank
// A water tank or a gas cylinder: how full it is (the water sways), what was used today, how many days are left, and a leak warning.
class RoostTank extends RoostBase {
  static get defaults() { return { kind: "water", low: 20, color: "blue", theme: "auto" }; }

  validate(c) { if (!c.level) throw new Error("Choose the tank level"); }

  watched() { const c = this._config; return [c.level, c.used_today, c.daily_use, c.leak, c.pump].filter(Boolean); }

  static getConfigForm() {
    return { schema: [
      { name: "sample", label: "Show sample data", selector: { boolean: {} } },
      { type: "grid", name: "", schema: [{ name: "kind", label: "It is", selector: pick([["water", "Water tank"], ["gas", "Gas cylinder (LPG)"], ["diesel", "Diesel or oil tank"]]) }, { name: "name", selector: { text: {} } }] },
      { type: "grid", name: "", schema: [{ name: "level", label: "Level (% or litres)", required: true, selector: { entity: { domain: "sensor" } } }, { name: "capacity", label: "Full size (litres or kg)", selector: { number: { mode: "box" } } }] },
      { type: "grid", name: "", schema: [{ name: "used_today", label: "Used today", selector: { entity: { domain: "sensor" } } }, { name: "daily_use", label: "Usual use a day (sensor or number)", selector: { entity: { domain: "sensor" } } }] },
      { type: "grid", name: "", schema: [{ name: "leak", label: "Leak sensor", selector: { entity: { domain: "binary_sensor" } } }, { name: "pump", label: "Pump (optional)", selector: { entity: { domain: "switch" } } }] },
      { type: "grid", name: "", schema: [{ name: "low", label: "Warn below (%)", selector: slider(5, 50) }, { name: "per_day", label: "Or usual use a day (number)", selector: { number: { mode: "box" } } }] },
      ...colourFields("color"), THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig() { return { sample: true }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = c.kind === "gas" ? COLORS.coral : c.kind === "diesel" ? COLORS.amber : this.colour();
    const ls = this.sx(c.level), lv = this.n(c.level), u = ls?.attributes.unit_of_measurement || "%";
    const cap = Number(c.capacity) || null;
    const pct = lv == null ? null : u === "%" ? lv : cap ? (lv / cap) * 100 : null;
    const amount = lv == null ? null : u === "%" ? (cap ? (lv / 100) * cap : null) : lv;
    const unitWord = c.kind === "gas" ? "kg" : "L";
    const perDay = this.n(c.daily_use) ?? (Number(c.per_day) || null);
    const days = amount != null && perDay ? amount / perDay : null;
    const leak = this.on(c.leak), low = pct != null && pct <= (Number(c.low) || 20), pump = this.on(c.pump);
    const line = leak ? "Leak found" : pct == null ? "No reading" : [`${Math.round(pct)}% full`, days != null ? `about ${days < 2 ? fmt(days, 1) : Math.round(days)} days left` : "", low ? "time to refill" : ""].filter(Boolean).join(" · ");
    const icon = c.kind === "gas" ? "mdi:propane-tank" : c.kind === "diesel" ? "mdi:barrel" : "mdi:water-boiler";
    const f = Math.max(0, Math.min(1, (pct ?? 0) / 100)), liquid = leak || low ? "#F43F6B" : g[1];
    const shape = c.kind === "gas" ? `<path d="M30 26 Q30 14 50 14 Q70 14 70 26 V112 Q70 122 60 122 H40 Q30 122 30 112 Z"/>` : `<rect x="16" y="16" width="68" height="106" rx="12"/>`;
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, !low && !leak)}
      .mid{display:grid;grid-template-columns:100px minmax(0,1fr);gap:16px;align-items:center}
      .tk{width:100px;height:136px}
      .tk{cursor:pointer;touch-action:manipulation}
      .drip{animation:roost-rain 1.2s linear infinite}
      .side{display:flex;flex-direction:column;gap:10px;min-width:0}
      .alert{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:12px;background:#F43F6B;color:#fff;font-weight:700;font-size:13px}
    </style>
    <div class="card">
      ${head(icon, c.name || this.name(c.level, c.kind === "gas" ? "Gas" : "Water tank"), line)}
      <div class="mid">
        <svg class="tk" viewBox="0 0 100 136" aria-hidden="true">
          <defs><clipPath id="tkc">${shape}</clipPath><linearGradient id="tkg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${liquid}"/><stop offset="1" stop-color="${leak || low ? "#FF8F6B" : g[0]}"/></linearGradient></defs>
          ${c.kind === "gas" ? `<rect x="40" y="4" width="20" height="10" rx="3" fill="${p.muted}"/>` : `<rect x="40" y="6" width="20" height="10" rx="3" fill="${p.track}"/>`}
          <g clip-path="url(#tkc)"><rect x="0" y="0" width="100" height="136" fill="${p.inset}"/>
            <path data-wb="1" fill="${liquid}" opacity=".35"/><path data-wf="1" fill="url(#tkg)" opacity=".95"/><path data-ws="1" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1.5"/></g>
          <g fill="none" stroke="${p.border}" stroke-width="2.5">${shape}</g>
          ${[0.25, 0.5, 0.75].map((k) => `<line x1="${c.kind === "gas" ? 64 : 76}" x2="${c.kind === "gas" ? 70 : 84}" y1="${(16 + (1 - k) * 106).toFixed(0)}" y2="${(16 + (1 - k) * 106).toFixed(0)}" stroke="${p.muted}" stroke-width="1.5"/>`).join("")}
          ${leak ? '<circle class="drip" cx="50" cy="124" r="3" fill="#38BDF8"/>' : ""}
        </svg>
        <div class="side">
          ${leak ? '<div class="alert"><ha-icon icon="mdi:water-alert"></ha-icon><span class="t">Leak found: check the pipes</span></div>' : ""}
          <div class="stat">${stat("Left", amount != null ? `${fmt(amount, 0)} ${unitWord}` : pct != null ? `${Math.round(pct)}%` : "")}${stat("Used today", this.val(c.used_today))}${stat("Days left", days != null ? (days < 2 ? fmt(days, 1) : String(Math.round(days))) : "")}</div>
          ${c.pump ? `<button class="big ${pump ? "" : "off"}" data-pump="1"><ha-icon icon="mdi:pump"></ha-icon>${pump ? "Pump is on" : "Turn the pump on"}</button>` : ""}
        </div>
      </div>
    </div>`;
    const r = this.shadowRoot;
    r.querySelector("[data-ic]").addEventListener("click", () => this.moreInfo(c.level));
    r.querySelector("[data-pump]")?.addEventListener("click", () => { this.vibrate(); this.call("switch", "toggle", { entity_id: c.pump }); });
    RoostWater.bind(this, "tank", r.querySelector(".tk"), c.kind === "gas" ? { x0: 30, x1: 70, top: 14, bottom: 122, level: f, stir: 0 } : { x0: 16, x1: 84, top: 16, bottom: 122, level: f, stir: pump ? 1 : leak ? 0.6 : 0, drip: pump ? 0.5 : null });
  }
}

// ------------------------------------------------------------------ Roost Pool
// The pool from above with moving light on the water, how warm it is, chlorine and pH on a scale with the good zone, and the pump, heater and light.
class RoostPool extends RoostBase {
  static get defaults() { return { color: "blue", look: "classic", tiles: "blue", theme: "auto" }; }

  validate(c) { if (!c.temperature && !c.pump) throw new Error("Choose the pool temperature or pump"); }

  watched() { const c = this._config; return [c.temperature, c.pump, c.heater, c.light, c.chlorine, c.ph].filter(Boolean); }

  static getConfigForm() {
    return { schema: [
      { name: "sample", label: "Show sample data", selector: { boolean: {} } },
      { type: "grid", name: "", schema: [{ name: "temperature", label: "Water temperature", selector: { entity: { domain: "sensor" } } }, { name: "name", selector: { text: {} } }] },
      { type: "grid", name: "", schema: [{ name: "chlorine", label: "Chlorine (ppm)", selector: { entity: { domain: "sensor" } } }, { name: "ph", label: "pH", selector: { entity: { domain: "sensor" } } }] },
      { type: "grid", name: "", schema: [{ name: "pump", selector: { entity: { domain: ["switch", "fan"] } } }, { name: "heater", selector: { entity: { domain: ["switch", "climate", "water_heater"] } } }] },
      { name: "light", label: "Pool light", selector: { entity: { domain: ["light", "switch"] } } },
      { type: "grid", name: "", schema: [
        { name: "look", label: "Look", selector: pick([["classic", "Classic (water and two scales)"], ["top", "From above: tiles, steps and moving light"], ["side", "Side view: shallow to deep end"], ["gauges", "Water quality gauges"]]) },
        { name: "tiles", label: "Pool tiles", selector: pick([["blue", "Blue mosaic"], ["turquoise", "Turquoise"], ["slate", "Dark slate"], ["white", "White plaster"]]) }] },
      ...colourFields("color"), THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig() { return { sample: true }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour();
    const t = this.n(c.temperature), cl = this.n(c.chlorine), ph = this.n(c.ph);
    const pump = this.on(c.pump), heat = c.heater ? (this.sx(c.heater)?.state !== "off" && !UNAVAILABLE.includes(this.sx(c.heater)?.state || "off")) : false, light = this.on(c.light);
    const okPh = ph == null || (ph >= 7.2 && ph <= 7.6), okCl = cl == null || (cl >= 1 && cl <= 3);
    const line = [t != null ? `${this.val(c.temperature)} water` : "", !okPh || !okCl ? "Check the water" : ph != null || cl != null ? "Water is balanced" : "", pump ? "pump on" : ""].filter(Boolean).join(" · ");
    const scale = (label, v, lo, hi, a, b, unit) => { if (v == null) return ""; const pos = (x) => Math.max(0, Math.min(100, ((x - lo) / (hi - lo)) * 100)); const ok = v >= a && v <= b;
      return `<div class="sc"><div class="sh"><span>${esc(label)}</span><b class="num" style="color:${ok ? "#34D399" : "#FF9F6B"}">${esc(fmt(v, label === "pH" ? 1 : decOf(String(v))))}${unit}</b></div>
        <div class="trk"><i class="ok" style="left:${pos(a)}%;width:${pos(b) - pos(a)}%"></i><span class="mk" style="left:${pos(v)}%"></span></div><div class="sl"><span>${lo}</span><span>${a}–${b} is good</span><span>${hi}</span></div></div>`; };
    const chips = `<div class="chips">${c.pump ? `<button class="chip ${pump ? "on" : ""}" data-t="${esc(c.pump)}" aria-pressed="${pump}"><ha-icon icon="mdi:pump"></ha-icon><span class="cw">Pump</span></button>` : ""}
        ${c.heater ? `<button class="chip ${heat ? "on" : ""}" data-t="${esc(c.heater)}" aria-pressed="${heat}"><ha-icon icon="mdi:fire"></ha-icon><span class="cw">Heater</span></button>` : ""}
        ${c.light ? `<button class="chip ${light ? "on" : ""}" data-t="${esc(c.light)}" aria-pressed="${light}"><ha-icon icon="mdi:lightbulb"></ha-icon><span class="cw">Light</span></button>` : ""}</div>`;
    if (c.look && c.look !== "classic") return this.renderLook({ c, p, g, t, cl, ph, pump, heat, light, okPh, okCl, line, chips });
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, pump || heat)}
      .pool{position:relative;height:120px;border-radius:40px 18px 40px 18px;overflow:hidden;border:6px solid ${this.dark ? "#2A3066" : "#C9CEE8"};
        background:linear-gradient(160deg,#38BDF8,#2F6BFF 70%,#1E3A8A)}
      .caus{position:absolute;inset:-40%;background:repeating-radial-gradient(circle at 30% 40%,rgba(255,255,255,.18) 0 6px,transparent 6px 22px),repeating-radial-gradient(circle at 70% 60%,rgba(255,255,255,.12) 0 4px,transparent 4px 18px);animation:roost-caus 9s linear infinite}
      @keyframes roost-caus{to{transform:translate(12%,8%) rotate(8deg)}}
      .glow{position:absolute;inset:0;background:radial-gradient(circle at 50% 100%,rgba(255,240,200,.55),transparent 60%);opacity:${light ? 1 : 0}}
      .cur{position:absolute;top:50%;width:26px;height:2px;border-radius:2px;background:rgba(255,255,255,.8);opacity:0}
      ${pump ? ".cur{animation:roost-cur 2s linear infinite}@keyframes roost-cur{0%{transform:translateX(0);opacity:0}20%{opacity:.9}100%{transform:translateX(120px);opacity:0}}" : ""}
      .tt{position:absolute;right:14px;top:10px;color:#fff;font-size:32px;font-weight:700;font-family:${FONT_NUM};text-shadow:0 2px 8px rgba(0,0,0,.3)}
      .sc{display:flex;flex-direction:column;gap:6px}
      .sh{display:flex;justify-content:space-between;font-size:13px}.sh span{color:${p.muted}}
      .trk{position:relative;height:8px;border-radius:4px;background:${p.track}}
      .trk .ok{position:absolute;top:0;bottom:0;border-radius:4px;background:#34D39966}
      .trk .mk{position:absolute;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:#fff;border:3px solid ${g[1]};box-shadow:0 2px 6px rgba(0,0,0,.3)}
      .sl{display:flex;justify-content:space-between;font-size:11px;color:${p.muted}}
    </style>
    <div class="card">
      ${head("mdi:pool", c.name || "Pool", line)}
      <div class="pool" role="img" aria-label="${esc(line)}"><div class="caus"></div><div class="glow"></div>
        ${[20, 40, 60].map((y, k) => `<span class="cur" style="top:${y + 10}%;left:${8 + k * 10}%;animation-delay:${k * 0.6}s"></span>`).join("")}
        ${t != null ? `<span class="tt" data-tw="pt">${esc(this.val(c.temperature))}</span>` : ""}</div>
      ${scale("pH", ph, 6.8, 8, 7.2, 7.6, "")}${scale("Chlorine", cl, 0, 5, 1, 3, " ppm")}
      <div class="chips">${c.pump ? `<button class="chip ${pump ? "on" : ""}" data-t="${esc(c.pump)}" aria-pressed="${pump}"><ha-icon icon="mdi:pump"></ha-icon><span class="cw">Pump</span></button>` : ""}
        ${c.heater ? `<button class="chip ${heat ? "on" : ""}" data-t="${esc(c.heater)}" aria-pressed="${heat}"><ha-icon icon="mdi:fire"></ha-icon><span class="cw">Heater</span></button>` : ""}
        ${c.light ? `<button class="chip ${light ? "on" : ""}" data-t="${esc(c.light)}" aria-pressed="${light}"><ha-icon icon="mdi:lightbulb"></ha-icon><span class="cw">Light</span></button>` : ""}</div>
    </div>`;
    const r = this.shadowRoot;
    r.querySelector("[data-ic]").addEventListener("click", () => this.moreInfo(c.temperature || c.pump));
    r.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { this.vibrate(); const id = b.dataset.t; const d = id.split("."); this.call(["climate", "water_heater"].includes(d[0]) ? "homeassistant" : d[0], "toggle", { entity_id: id }); }));
  }

  renderLook({ c, p, g, t, cl, ph, pump, heat, light, okPh, okCl, line, chips }) {
    const T = { blue: ["#2E7FD1", "#0E3E86"], turquoise: ["#22B8C4", "#0B6A80"], slate: ["#2F5F7A", "#0F2636"], white: ["#5EC8F2", "#1E86C4"] }[c.tiles] || ["#2E7FD1", "#0E3E86"];
    const ok = okPh && okCl, tt = t != null ? this.val(c.temperature) : "";
    const warmWord = t == null ? "" : t >= 26 ? "Warm enough to swim" : t >= 22 ? "Fresh, a little cool" : "Cold for swimming";
    // without pH or chlorine, only the water temperature can say anything
    const tested = ph != null || cl != null, cold = t != null && t < 24;
    const word = tested ? (!ok ? "Check the water" : cold ? "Water is cold" : "Ready to swim") : t == null ? "" : t >= 26 ? "Warm water" : t >= 22 ? "Fresh water" : "Cold water";
    const good = tested ? ok && !cold : t != null && t >= 24;
    const chipBg = good ? (this.dark ? "#12352C" : "#D1FAE5") : tested && !ok ? (this.dark ? "#3A2A0A" : "#FEF3C7") : this.dark ? "#1B2045" : "#EEF1FB";
    const chipFg = good ? (this.dark ? "#6EE7B7" : "#065F46") : tested && !ok ? (this.dark ? "#FCD34D" : "#92400E") : this.dark ? "#A9B0D6" : "#4B5280";
    const caus = `background:radial-gradient(ellipse 30px 14px at 30% 40%,rgba(255,255,255,.35),rgba(255,255,255,0) 70%),radial-gradient(ellipse 22px 10px at 70% 60%,rgba(255,255,255,.30),rgba(255,255,255,0) 70%);background-size:90px 60px,70px 50px;animation:roost-cau 6s linear infinite alternate`;
    const tip = ph != null && ph > 7.6 ? "pH is high: add a little pH minus and run the pump for an hour." : ph != null && ph < 7.2 ? "pH is low: add a little pH plus and run the pump for an hour." : cl != null && cl < 1 ? "Chlorine is low: add chlorine and run the pump." : cl != null && cl > 3 ? "Chlorine is high: wait before swimming." : "All good.";
    const mini = [ph != null ? ["pH", fmt(ph, 1), !okPh] : null, cl != null ? ["Chlorine", `${fmt(cl, decOf(String(cl)))}`, !okCl] : null, c.pump ? ["Pump", pump ? "On" : "Off", false] : null].filter(Boolean);
    let body = "";
    if (c.look === "top") {
      body = `<div class="pv" role="img" aria-label="${esc(line)}"><i class="tl"></i><i class="wt"></i><i class="cs" style="${caus}"></i><i class="stp"></i><i class="lad"></i>
        ${light ? '<i class="lg"></i>' : ""}${tt ? `<b class="tt2 num" data-tw="pt">${esc(tt)}</b>` : ""}</div>
        ${mini.length ? `<div class="mini">${mini.map(([n, v, bad]) => `<div class="mi ${bad ? "bad" : ""}"><b class="num">${esc(v)}</b><span>${n}</span></div>`).join("")}</div>` : ""}`;
    } else if (c.look === "side") {
      const pill = (x, label, okk) => `<g transform="translate(${x} 10)"><rect width="134" height="34" rx="17" fill="${this.dark ? "#232A5C" : "#EEF1FB"}"/><circle cx="18" cy="17" r="7" fill="${okk ? "#34D399" : "#F59E0B"}"/><text x="32" y="22" fill="${p.text}" font-size="13" font-weight="600">${esc(label)}</text></g>`;
      body = `<svg class="sd" viewBox="0 0 340 220" role="img" aria-label="${esc(line)}"><defs><linearGradient id="pdeep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T[0]}"/><stop offset="1" stop-color="${T[1]}"/></linearGradient></defs>
        <rect x="0" y="54" width="340" height="16" fill="#D9D2C3"/><path d="M20 70 L320 70 L320 200 L210 200 L150 120 L20 120 Z" fill="#CFC7B6"/>
        <path d="M28 76 L312 76 L312 192 L214 192 L154 114 L28 114 Z" fill="url(#pdeep)"/>
        <path class="wave" d="M28 76 Q60 72 92 76 T156 76 T220 76 T284 76 T348 76" stroke="rgba(255,255,255,.8)" stroke-width="2.5" fill="none"/>
        <path d="M28 82 L312 82" stroke="rgba(255,255,255,.18)" stroke-width="5"/>
        <path d="M296 40 L296 110 M310 40 L310 110 M296 60 L310 60 M296 80 L310 80 M296 100 L310 100" stroke="#E6E9EF" stroke-width="3" stroke-linecap="round"/>
        ${pump ? '<circle class="bub" cx="260" cy="170" r="3" fill="rgba(255,255,255,.6)"/><circle class="bub b2" cx="268" cy="176" r="2" fill="rgba(255,255,255,.5)"/><circle class="bub b3" cx="254" cy="180" r="2.5" fill="rgba(255,255,255,.5)"/>' : ""}
        ${light ? '<ellipse cx="120" cy="104" rx="70" ry="22" fill="rgba(255,240,200,.25)"/>' : ""}
        <text x="36" y="142" fill="${p.muted}" font-size="11">Shallow</text><text x="230" y="214" fill="${p.muted}" font-size="11">Deep end</text>
        ${ph != null ? pill(16, `pH ${fmt(ph, 1)} · ${okPh ? "good" : ph > 7.6 ? "high" : "low"}`, okPh) : ""}${cl != null ? pill(160, `Chlorine ${fmt(cl, decOf(String(cl)))}`, okCl) : ""}</svg>`;
    } else {
      const needle = (v, lo, hi) => { const a = Math.PI * (1 - Math.max(0, Math.min(1, (v - lo) / (hi - lo)))); return [(70 + 44 * Math.cos(a)).toFixed(1), (72 - 44 * Math.sin(a)).toFixed(1)]; };
      const arc = (a0, a1) => { const P = (k) => { const a = Math.PI * (1 - k); return `${(70 + 56 * Math.cos(a)).toFixed(1)} ${(72 - 56 * Math.sin(a)).toFixed(1)}`; }; return `M${P(a0)} A56 56 0 0 1 ${P(a1)}`; };
      const gauge = (label, v, lo, hi, a, b, txt, okk) => { if (v == null) return ""; const [nx, ny] = needle(v, lo, hi);
        return `<div class="gg"><svg viewBox="0 0 140 80" role="img" aria-label="${esc(`${label} ${txt}`)}"><path d="M14 72 A56 56 0 0 1 126 72" stroke="${p.track}" stroke-width="12" fill="none" stroke-linecap="round"/>
          <path d="${arc((a - lo) / (hi - lo), (b - lo) / (hi - lo))}" stroke="#34D399" stroke-width="12" fill="none"/>
          <line x1="70" y1="72" x2="${nx}" y2="${ny}" stroke="${okk ? p.text : "#F59E0B"}" stroke-width="3" stroke-linecap="round"/><circle cx="70" cy="72" r="6" fill="${p.text}"/></svg>
          <b class="num">${esc(txt)}</b><span>${label} · good ${a}–${b}</span></div>`; };
      body = `<div class="bn" role="img" aria-label="${esc(line)}"><i class="cs" style="${caus}"></i><div class="bt"><span>${esc(c.name || "Pool water")}</span>${tt ? `<b class="num" data-tw="pt">${esc(tt)}</b>` : ""}<span>${esc(warmWord)}</span></div></div>
        <div class="gs">${gauge("pH", ph, 6.6, 8.2, 7.2, 7.6, ph != null ? fmt(ph, 1) : "", okPh)}${gauge("Chlorine", cl, 0, 5, 1, 3, cl != null ? `${fmt(cl, decOf(String(cl)))} ppm` : "", okCl)}</div>
        ${ph != null || cl != null ? `<div class="tip ${ok ? "" : "bad"}">${esc(tip)}</div>` : ""}`;
    }
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, pump || heat)}
      @keyframes roost-cau{from{background-position:0 0,0 0}to{background-position:60px 40px,-40px 60px}}
      .hd{display:flex;align-items:center;gap:8px}
      .chip2{margin-left:auto;min-height:28px;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:600;display:flex;align-items:center;background:${chipBg};color:${chipFg};flex:none}
      .pv{position:relative;height:200px;border-radius:18px;background:repeating-linear-gradient(90deg,#D9D2C3 0 22px,#CFC7B6 22px 23px),#D9D2C3;overflow:hidden}
      .pv > i{position:absolute;inset:14px;border-radius:10px}
      .pv .tl{background:repeating-linear-gradient(90deg,rgba(255,255,255,.35) 0 6px,rgba(0,0,0,.08) 6px 7px),linear-gradient(135deg,${T[0]},${T[1]});box-shadow:inset 0 0 0 4px #F1ECE2}
      .pv .wt{inset:22px;border-radius:8px;background:linear-gradient(90deg,rgba(255,255,255,.12),rgba(0,0,0,.25)),linear-gradient(135deg,${T[0]},${T[1]});opacity:.92}
      .pv .cs{inset:22px;border-radius:8px;mix-blend-mode:screen}
      .pv .stp{inset:22px auto auto 22px;width:60px;height:60px;border-radius:6px 0 40px 0;background:linear-gradient(135deg,rgba(255,255,255,.35),rgba(255,255,255,.1));box-shadow:inset 0 0 0 2px rgba(255,255,255,.35)}
      .pv .lad{inset:6px 34px auto auto;width:22px;height:26px;border:3px solid #E6E9EF;border-bottom:0;border-radius:12px 12px 0 0}
      .pv .lg{inset:22px;background:radial-gradient(circle at 50% 90%,rgba(255,240,200,.5),rgba(255,240,200,0) 60%)}
      .pv .tt2{position:absolute;right:28px;bottom:26px;font-size:40px;font-weight:700;color:#fff;text-shadow:0 2px 10px rgba(0,30,60,.6)}
      .mini{display:grid;grid-template-columns:repeat(${Math.max(1, mini.length)},minmax(0,1fr));gap:8px}
      .mi{padding:10px;border-radius:12px;background:${p.inset};display:flex;flex-direction:column;gap:2px}.mi b{font-size:17px}.mi span{font-size:12px;color:${p.muted}}
      .mi.bad{background:${this.dark ? "#3A2A0A" : "#FEF3C7"}}
      .sd{width:100%;height:auto;display:block;font-family:inherit}
      .sd .wave{animation:roost-wave 3s linear infinite}@keyframes roost-wave{to{transform:translateX(-64px)}}
      .sd .bub{animation:roost-bub 2.4s ease-in infinite}.sd .b2{animation-delay:.8s}.sd .b3{animation-delay:1.6s}
      @keyframes roost-bub{from{transform:translateY(0);opacity:.8}to{transform:translateY(-80px);opacity:0}}
      .bn{position:relative;overflow:hidden;height:130px;border-radius:18px;padding:18px;box-sizing:border-box;display:flex;align-items:flex-end;color:#fff;background:linear-gradient(135deg,${T[0]},${T[1]})}
      .bn .cs{position:absolute;inset:0}
      .bt{position:relative;display:flex;flex-direction:column;gap:2px}.bt span{font-size:13px;font-weight:600;opacity:.9}.bt b{font-size:40px;line-height:1}
      .gs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      .gg{padding:12px;border-radius:16px;background:${p.inset};display:flex;flex-direction:column;align-items:center;gap:4px}.gg svg{width:100%;max-width:140px;height:auto}.gg b{font-size:20px}.gg span{font-size:12px;color:${p.muted};text-align:center}
      .tip{padding:12px 14px;border-radius:14px;font-size:13px;line-height:1.4;background:${this.dark ? "#12352C" : "#D1FAE5"};color:${this.dark ? "#A7F3D0" : "#065F46"}}
      .tip.bad{background:${this.dark ? "#3A2A0A" : "#FEF3C7"};color:${this.dark ? "#FDE68A" : "#92400E"}}
    </style>
    <div class="card">
      <div class="hd">${head("mdi:pool", c.name || "Pool", line)}${word ? `<span class="chip2">${word}</span>` : ""}</div>
      ${body}${chips}
    </div>`;
    const r = this.shadowRoot;
    r.querySelector("[data-ic]")?.addEventListener("click", () => this.moreInfo(c.temperature || c.pump));
    r.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { this.vibrate(); const id = b.dataset.t; const d = id.split("."); this.call(["climate", "water_heater"].includes(d[0]) ? "homeassistant" : d[0], "toggle", { entity_id: id }); }));
    return undefined;
  }
}

// ------------------------------------------------------------------ Roost Pet
// A pet feeder and water fountain: the bowl, how full the food and water are, when it last ate, and a big "feed now".
class RoostPet extends ticking(RoostBase, 60000) {
  static get defaults() { return { color: "amber", pet: "cat", look: "classic", meals_per_day: 4, theme: "auto" }; }

  validate(c) { if (!c.feeder && !c.food && !c.water) throw new Error("Choose the feeder, food level or water level"); }

  watched() { const c = this._config; return [c.feeder, c.food, c.water, c.meals, c.last_fed].filter(Boolean); }

  static getConfigForm() {
    return { schema: [
      { name: "sample", label: "Show sample data", selector: { boolean: {} } },
      { type: "grid", name: "", schema: [{ name: "name", label: "Pet's name", selector: { text: {} } }, { name: "pet", selector: pick([["cat", "Cat"], ["dog", "Dog"], ["bird", "Bird"], ["fish", "Fish"]]) }] },
      { type: "grid", name: "", schema: [{ name: "feeder", label: "Feed button (or switch)", selector: { entity: { domain: ["button", "switch", "script"] } } }, { name: "last_fed", label: "Last fed (optional)", selector: { entity: { domain: "sensor" } } }] },
      { type: "grid", name: "", schema: [{ name: "food", label: "Food left (%)", selector: { entity: { domain: "sensor" } } }, { name: "water", label: "Water left (%)", selector: { entity: { domain: "sensor" } } }] },
      { type: "grid", name: "", schema: [{ name: "meals", label: "Meals today (optional)", selector: { entity: { domain: "sensor" } } }, { name: "meals_per_day", label: "Meals a day", selector: { number: { min: 1, max: 8, mode: "box" } } }] },
      { name: "look", label: "Look", selector: pick([["classic", "Classic (two simple bowls)"], ["bowls", "Real bowls on a mat"], ["feeder", "Smart feeder and fountain, with today's meals"], ["portrait", "Pet portrait with a ring that fills"]]) },
      ...colourFields("color"), THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig() { return { sample: true }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour();
    const feed = this.sx(c.feeder), lf = this.sx(c.last_fed);
    const fedAt = lf && !UNAVAILABLE.includes(lf.state) ? lf.state : feed?.entity_id.startsWith("button.") && !UNAVAILABLE.includes(feed.state) ? feed.state : feed?.last_changed;
    const food = this.n(c.food), water = this.n(c.water), meals = this.n(c.meals);
    const name = c.name || { cat: "Cat", dog: "Dog", bird: "Bird", fish: "Fish" }[c.pet] || "Pet";
    const line = [fedAt && !isNaN(new Date(fedAt)) ? `Fed ${ago(fedAt)}` : "", meals != null ? `${Math.round(meals)} meal${meals === 1 ? "" : "s"} today` : "", food != null && food < 20 ? "food running low" : "", water != null && water < 20 ? "water running low" : ""].filter(Boolean).join(" · ") || "Ready";
    const fd = Math.max(0.05, Math.min(1, (food ?? 60) / 100)), wt = Math.max(0.05, Math.min(1, (water ?? 60) / 100));
    const icon = { cat: "mdi:cat", dog: "mdi:dog", bird: "mdi:bird", fish: "mdi:fish" }[c.pet] || "mdi:paw";
    if (c.look && c.look !== "classic") return this.renderLook({ c, p, g, feed, fedAt, food, water, meals, name, line, icon });
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, true)}
      .scene{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      .it{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 8px;border-radius:16px;background:${p.inset};font-size:12px;color:${p.muted}}
      .it svg{width:110px;height:70px}
      .it b{font-size:17px;color:${p.text};font-family:${FONT_NUM}}
      .flow2{animation:roost-dash 1s linear infinite;stroke-dasharray:3 5}@keyframes roost-dash{to{stroke-dashoffset:-8}}
      .kb{transform-box:fill-box;transform-origin:center bottom}
      .fed .kb{animation:roost-pop .5s ease-out 1}
    </style>
    <div class="card">
      ${head(icon, name, line)}
      <div class="scene">
        <div class="it"><svg viewBox="0 0 110 70" aria-hidden="true">
          ${Array.from({ length: Math.round(fd * 14) }, (_, k) => `<circle class="kb" cx="${30 + ((k * 23) % 50)}" cy="${40 - Math.floor(k / 5) * 5 - fd * 6}" r="4.5" fill="${k % 3 ? "#C9763E" : "#A65A2A"}"/>`).join("")}
          <path d="M14 40 H96 L86 64 Q84 68 78 68 H32 Q26 68 24 64 Z" fill="${g[0]}"/><path d="M14 40 H96" stroke="${g[1]}" stroke-width="4" stroke-linecap="round"/></svg>
          <b class="num">${food != null ? `${Math.round(food)}%` : "–"}</b><span>Food</span></div>
        <div class="it"><svg viewBox="0 0 110 70" aria-hidden="true">
          <path d="M28 18 Q28 6 55 6 Q82 6 82 18" fill="none" stroke="${p.muted}" stroke-width="3"/>
          <path class="flow2" d="M55 8 Q60 20 55 34" fill="none" stroke="#38BDF8" stroke-width="3" stroke-linecap="round"/>
          <path d="M18 36 H92 L84 62 Q82 66 76 66 H34 Q28 66 26 62 Z" fill="${p.track}"/>
          <defs><clipPath id="bowl"><path d="M18 36 H92 L84 62 Q82 66 76 66 H34 Q28 66 26 62 Z"/></clipPath></defs>
          <g clip-path="url(#bowl)"><path data-wb="1" fill="#38BDF8" opacity=".35"/><path data-wf="1" fill="#38BDF8" opacity=".85"/><path data-ws="1" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.2"/></g></svg>
          <b class="num">${water != null ? `${Math.round(water)}%` : "–"}</b><span>Water</span></div>
      </div>
      ${feed ? '<button class="big" data-feed="1"><ha-icon icon="mdi:food-drumstick"></ha-icon>Feed now</button>' : ""}
    </div>`;
    const r = this.shadowRoot;
    RoostWater.bind(this, "bowl", r.querySelectorAll(".it svg")[1], { x0: 16, x1: 94, top: 38, bottom: 66, level: wt, stir: 0.3, drip: 0.5, points: 22 });
    r.querySelector("[data-ic]").addEventListener("click", () => this.moreInfo(c.feeder || c.food));
    r.querySelector("[data-feed]")?.addEventListener("click", () => {
      this.vibrate(); const d = c.feeder.split(".")[0];
      if (d === "button") this.call("button", "press", { entity_id: c.feeder }); else if (d === "script") this.call("script", "turn_on", { entity_id: c.feeder }); else this.call("switch", "turn_on", { entity_id: c.feeder });
      r.querySelector(".scene")?.classList.add("fed");
    });
  }

  renderLook({ c, p, g, feed, fedAt, food, water, meals, name, line, icon }) {
    const f = Math.max(0, Math.min(100, food ?? 60)), w = Math.max(0, Math.min(100, water ?? 60));
    const hungry = food != null && food < 25, low = water != null && water < 25;
    const word = hungry ? "Hungry" : low ? "Low water" : "All good";
    const chipBg = hungry || low ? (this.dark ? "#3A2A0A" : "#FEF3C7") : this.dark ? "#12352C" : "#D1FAE5", chipFg = hungry || low ? (this.dark ? "#FCD34D" : "#92400E") : this.dark ? "#6EE7B7" : "#065F46";
    const perDay = Math.max(1, Math.min(8, Number(c.meals_per_day) || 4)), eaten = meals != null ? Math.round(meals) : null;
    const mealLine = eaten != null ? `${eaten} of ${perDay} meals today` : "";
    let body = "";
    if (c.look === "bowls") {
      const top = 122 - (2 + 30 * f / 100), pile = `M34 124 C50 ${(top + 8).toFixed(0)} 70 ${top.toFixed(0)} 95 ${top.toFixed(0)} C120 ${top.toFixed(0)} 140 ${(top + 8).toFixed(0)} 156 124 Z`;
      const wy = 118 + 4 * (1 - w / 100), wrx = 62 - 18 * (1 - w / 100), wry = 8.5 - 3 * (1 - w / 100);
      body = `<svg class="bw" viewBox="0 0 340 200" role="img" aria-label="${esc(`Food ${Math.round(f)}%, water ${Math.round(w)}%`)}"><defs>
        <linearGradient id="pbA" x1="0" x2="1"><stop offset="0" stop-color="#C9CED8"/><stop offset=".35" stop-color="#FFFFFF"/><stop offset="1" stop-color="#9AA2B1"/></linearGradient>
        <linearGradient id="pbB" x1="0" x2="1"><stop offset="0" stop-color="#3C6FB8"/><stop offset=".35" stop-color="#7FB2F0"/><stop offset="1" stop-color="#2A528C"/></linearGradient>
        <radialGradient id="pkb" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#C98A4B"/><stop offset="1" stop-color="#7A4A22"/></radialGradient>
        <linearGradient id="pwt" x1="0" x2="1"><stop offset="0" stop-color="#5BB4F0"/><stop offset=".5" stop-color="#9FD6FA"/><stop offset="1" stop-color="#3C93D6"/></linearGradient></defs>
        <rect x="10" y="150" width="320" height="46" rx="22" fill="${this.dark ? "#2C335E" : "#DDE2F3"}"/><rect x="10" y="150" width="320" height="46" rx="22" fill="none" stroke="${this.dark ? "#3B4378" : "#C6CCE6"}" stroke-width="2" stroke-dasharray="2 6"/>
        <ellipse cx="95" cy="176" rx="72" ry="12" fill="rgba(0,0,0,.3)"/><ellipse cx="245" cy="176" rx="72" ry="12" fill="rgba(0,0,0,.3)"/>
        <path class="pile" d="${pile}" fill="url(#pkb)"/>
        <g fill="#8A5528" opacity=".9"><ellipse cx="70" cy="${(top + 6).toFixed(0)}" rx="7" ry="4.5"/><ellipse cx="96" cy="${(top + 2).toFixed(0)}" rx="7" ry="4.5"/><ellipse cx="120" cy="${(top + 6).toFixed(0)}" rx="7" ry="4.5"/><ellipse cx="84" cy="${(top + 12).toFixed(0)}" rx="6" ry="4"/><ellipse cx="108" cy="${(top + 12).toFixed(0)}" rx="6" ry="4"/></g>
        <path d="M28 118 A67 11 0 0 0 162 118 C160 150 140 172 95 172 C50 172 30 150 28 118 Z" fill="url(#pbA)"/><ellipse cx="95" cy="118" rx="67" ry="11" fill="none" stroke="#E9ECF2" stroke-width="4"/>
        <path d="M44 126 C48 146 60 158 76 162" stroke="rgba(255,255,255,.8)" stroke-width="5" stroke-linecap="round" fill="none"/>
        <ellipse cx="245" cy="118" rx="64" ry="10" fill="#14306A"/><ellipse class="wl" cx="245" cy="${wy.toFixed(1)}" rx="${wrx.toFixed(1)}" ry="${wry.toFixed(1)}" fill="url(#pwt)"/>
        <path class="sh" d="M${(245 - wrx * 0.6).toFixed(0)} ${(wy - 2).toFixed(0)} Q245 ${(wy - 6).toFixed(0)} ${(245 + wrx * 0.3).toFixed(0)} ${(wy - 3).toFixed(0)}" stroke="rgba(255,255,255,.75)" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <path d="M178 118 A67 11 0 0 0 312 118 C310 150 290 172 245 172 C200 172 180 150 178 118 Z" fill="url(#pbB)"/><ellipse cx="245" cy="118" rx="67" ry="11" fill="none" stroke="#9CC5F5" stroke-width="4"/>
        <path d="M194 126 C198 146 210 158 226 162" stroke="rgba(255,255,255,.55)" stroke-width="5" stroke-linecap="round" fill="none"/>
        <text x="95" y="192" text-anchor="middle" fill="${p.text}" font-size="13" font-weight="700">${food != null ? `${Math.round(f)}% food` : "Food"}</text>
        <text x="245" y="192" text-anchor="middle" fill="${p.text}" font-size="13" font-weight="700">${water != null ? `${Math.round(w)}% water` : "Water"}</text></svg>`;
    } else if (c.look === "feeder") {
      body = `<div class="fd"><div class="hop"><div class="win"><i class="kib" data-glide="kib" style="height:${f}%"></i><i class="gl"></i></div><i class="led ${hungry ? "warn" : ""}"></i><i class="tray"></i></div>
        <div class="fnt"><div class="tk"><i class="wa" data-glide="fwa" style="height:${w}%"></i></div><i class="sp"></i></div></div>
        <div class="ml">${Array.from({ length: perDay }, (_, k) => { const st = eaten == null ? "" : k < eaten ? "done" : k === eaten ? "next" : ""; return `<div class="me ${st}"><b>${st === "done" ? "Eaten" : st === "next" ? "Next" : `Meal ${k + 1}`}</b></div>`; }).join("")}</div>`;
    } else {
      const R = 86, full = (2 * Math.PI * R * f / 100).toFixed(1);
      const cat = `<path d="M52 78 L58 38 L82 62 Z" fill="#E8A866"/><path d="M138 78 L132 38 L108 62 Z" fill="#E8A866"/><path d="M57 70 L61 48 L75 62 Z" fill="#F7C9C4"/><path d="M133 70 L129 48 L115 62 Z" fill="#F7C9C4"/>
        <ellipse cx="95" cy="104" rx="50" ry="44" fill="#F0B271"/><path d="M70 76 C78 70 88 72 95 78 C102 72 112 70 120 76" stroke="#C9803E" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M58 114 L36 110 M58 120 L36 124 M132 114 L154 110 M132 120 L154 124" stroke="#FFF4E6" stroke-width="2" stroke-linecap="round"/>`;
      const dog = `<ellipse cx="54" cy="96" rx="16" ry="32" fill="#8A5A34" transform="rotate(18 54 96)"/><ellipse cx="136" cy="96" rx="16" ry="32" fill="#8A5A34" transform="rotate(-18 136 96)"/>
        <ellipse cx="95" cy="102" rx="46" ry="46" fill="#C8955E"/><ellipse cx="95" cy="124" rx="24" ry="18" fill="#EBCBA2"/>`;
      const face = c.pet === "dog" ? dog : cat;
      const eyes = `<ellipse cx="76" cy="100" rx="8" ry="${hungry ? 3 : 9}" fill="#2B2B2B"/><ellipse cx="114" cy="100" rx="8" ry="${hungry ? 3 : 9}" fill="#2B2B2B"/>${hungry ? "" : '<circle cx="78" cy="97" r="2.5" fill="#fff"/><circle cx="116" cy="97" r="2.5" fill="#fff"/>'}
        <path d="M89 ${c.pet === "dog" ? 116 : 116} L101 116 L95 ${c.pet === "dog" ? 124 : 122} Z" fill="${c.pet === "dog" ? "#3A2A20" : "#D9737A"}"/><path d="${hungry ? "M86 134 Q95 128 104 134" : "M86 128 Q95 136 104 128"}" stroke="#6B3E1E" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
      const known = c.pet === "cat" || c.pet === "dog" || !c.pet;
      body = `<div class="pr"><svg viewBox="0 0 190 190" role="img" aria-label="${esc(`${name}, ${Math.round(f)}% food`)}">
          <circle cx="95" cy="95" r="${R}" fill="none" stroke="${p.track}" stroke-width="10"/>
          <circle class="rf" cx="95" cy="95" r="${R}" fill="none" stroke="url(#prg)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${full} 999" transform="rotate(-90 95 95)"/>
          <defs><linearGradient id="prg" x1="0" x2="1"><stop offset="0" stop-color="${g[0]}"/><stop offset="1" stop-color="${g[1]}"/></linearGradient></defs>
          <circle cx="95" cy="95" r="72" fill="${this.dark ? "#232A5C" : "#EEF1FB"}"/>${known ? `<g class="hd2">${face}${eyes}</g>` : ""}</svg>
          ${known ? "" : `<ha-icon class="pi" icon="${icon}"></ha-icon>`}</div>
        <div class="pw"><b>${esc(name)} is ${hungry ? "hungry" : f > 70 ? "full and happy" : "happy"}</b><span>${esc([food != null ? `${Math.round(f)}% food` : "", water != null ? `${Math.round(w)}% water` : "", fedAt && !isNaN(new Date(fedAt)) ? `fed ${ago(fedAt)}` : ""].filter(Boolean).join(" · "))}</span></div>`;
    }
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, !hungry && !low)}
      .hd{display:flex;align-items:center;gap:8px}
      .chip2{margin-left:auto;min-height:28px;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:600;display:flex;align-items:center;background:${chipBg};color:${chipFg};flex:none}
      .bw{width:100%;height:auto;display:block;font-family:inherit}
      .bw .sh{animation:roost-breathe 3s ease-in-out infinite}
      .fd{display:flex;gap:14px;justify-content:center;align-items:flex-end;height:196px}
      .hop{width:118px;height:186px;border-radius:22px 22px 16px 16px;background:linear-gradient(90deg,#D8DCE4,#FFFFFF 40%,#B8BECA);position:relative;box-shadow:0 10px 18px rgba(0,0,0,.35)}
      .hop .win{position:absolute;left:18px;right:18px;top:16px;height:94px;border-radius:14px;background:#1B2045;overflow:hidden;box-shadow:inset 0 2px 6px rgba(0,0,0,.5)}
      .kib{position:absolute;left:0;right:0;bottom:0;background:radial-gradient(circle at 30% 30%,#C98A4B 0 3px,rgba(0,0,0,0) 4px) 0 0/12px 10px,radial-gradient(circle at 70% 70%,#A86A33 0 3px,rgba(0,0,0,0) 4px) 0 0/12px 10px,linear-gradient(180deg,#8F5A2C,#6E4220)}
      .hop .gl{position:absolute;left:6px;top:6px;width:10px;bottom:6px;border-radius:5px;background:rgba(255,255,255,.12)}
      .led{position:absolute;left:50%;top:120px;width:10px;height:10px;margin-left:-5px;border-radius:50%;background:#34D399;box-shadow:0 0 8px #34D399}
      .led.warn{background:#F59E0B;box-shadow:0 0 8px #F59E0B;animation:roost-breathe 1.6s ease-in-out infinite}
      .tray{position:absolute;left:10px;right:10px;bottom:10px;height:32px;border-radius:12px;background:linear-gradient(180deg,#9AA2B1,#E9ECF2);box-shadow:inset 0 4px 6px rgba(0,0,0,.35)}
      .fnt{width:118px;height:118px;border-radius:50% 50% 18px 18px;background:linear-gradient(90deg,#D8DCE4,#FFFFFF 40%,#B8BECA);position:relative;box-shadow:0 10px 18px rgba(0,0,0,.35);overflow:hidden}
      .fnt .tk{position:absolute;left:14px;right:14px;top:14px;bottom:30px;border-radius:50% 50% 10px 10px;background:#12305E;overflow:hidden}
      .fnt .wa{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(180deg,#9FD6FA,#3C93D6);box-shadow:inset 0 3px 0 rgba(255,255,255,.6)}
      .fnt .sp{position:absolute;left:50%;top:4px;width:18px;height:18px;margin-left:-9px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#DFF2FF,#5BB4F0);animation:roost-breathe 2s ease-in-out infinite}
      .ml{display:flex;gap:6px}
      .me{flex:1;min-height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:${p.inset};color:${p.muted};font-size:12px}
      .me.done{background:${this.dark ? "#12352C" : "#D1FAE5"};color:${this.dark ? "#A7F3D0" : "#065F46"}}
      .me.next{background:${this.dark ? "#3A2A0A" : "#FEF3C7"};color:${this.dark ? "#FDE68A" : "#92400E"};box-shadow:inset 0 0 0 1.5px #F59E0B}
      .pr{position:relative;width:190px;margin:0 auto}.pr svg{width:100%;height:auto;display:block}
      .pr .pi{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);--mdc-icon-size:72px;color:${g[0]}}
      .hd2{transform-box:fill-box;transform-origin:50% 100%;animation:roost-sway 5s ease-in-out infinite}
      .pw{display:flex;flex-direction:column;align-items:center;gap:2px;text-align:center}.pw b{font-size:20px}.pw span{font-size:13px;color:${p.muted}}
    </style>
    <div class="card">
      <div class="hd">${head(icon, name, c.look === "feeder" ? [mealLine, fedAt && !isNaN(new Date(fedAt)) ? `fed ${ago(fedAt)}` : ""].filter(Boolean).join(" · ") || line : line)}<span class="chip2">${word}</span></div>
      ${body}
      ${feed ? '<button class="big" data-feed="1"><ha-icon icon="mdi:food-drumstick"></ha-icon>Feed now</button>' : ""}
    </div>`;
    const r = this.shadowRoot;
    r.querySelector("[data-ic]")?.addEventListener("click", () => this.moreInfo(c.feeder || c.food));
    r.querySelector("[data-feed]")?.addEventListener("click", () => {
      this.vibrate(); const d = c.feeder.split(".")[0];
      if (d === "button") this.call("button", "press", { entity_id: c.feeder }); else if (d === "script") this.call("script", "turn_on", { entity_id: c.feeder }); else this.call("switch", "turn_on", { entity_id: c.feeder });
    });
    return undefined;
  }
}

// ------------------------------------------------------------------ Roost Nursery
// The baby's room: the camera, warmth and humidity, a banner when the baby cries, the night light and the lullaby.
class RoostNursery extends RoostBase {
  static get defaults() { return { color: "pink", loud: 60, theme: "auto" }; }

  validate(c) { if (!c.camera && !c.temperature && !c.sound) throw new Error("Choose the baby camera, sound or temperature"); }

  watched() { const c = this._config; return [c.camera, c.temperature, c.humidity, c.sound, c.light, c.music].filter(Boolean); }

  static getConfigForm() {
    return { schema: [
      { name: "sample", label: "Show sample data", selector: { boolean: {} } },
      { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "camera", selector: { entity: { domain: ["camera", "image"] } } }] },
      { type: "grid", name: "", schema: [{ name: "temperature", selector: { entity: { domain: "sensor" } } }, { name: "humidity", selector: { entity: { domain: "sensor" } } }] },
      { type: "grid", name: "", schema: [{ name: "sound", label: "Sound (dB) or crying sensor", selector: { entity: { domain: ["sensor", "binary_sensor"] } } }, { name: "loud", label: "Crying above (dB)", selector: slider(35, 90) }] },
      { type: "grid", name: "", schema: [{ name: "light", label: "Night light", selector: { entity: { domain: ["light", "switch"] } } }, { name: "music", label: "Lullaby speaker", selector: { entity: { domain: "media_player" } } }] },
      ...colourFields("color"), THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig() { return { sample: true }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour();
    const snd = this.sx(c.sound), db = this.n(c.sound);
    const crying = snd ? (snd.entity_id.startsWith("binary_sensor.") ? snd.state === "on" : db != null && db >= (Number(c.loud) || 60)) : false;
    const t = this.n(c.temperature), comfy = t == null || (t >= 20 && t <= 24);
    const light = this.on(c.light), music = this.sx(c.music)?.state === "playing";
    const src = this.sx(c.camera)?.attributes.entity_picture;
    const line = crying ? "The baby is crying" : [db != null ? (db < 40 ? "Quiet" : "Some sound") : "", t != null ? `${this.val(c.temperature)}${comfy ? "" : (t < 20 ? ", a bit cold" : ", a bit warm")}` : ""].filter(Boolean).join(" · ") || "All calm";
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, crying)}
      .view{position:relative;border-radius:18px;overflow:hidden;aspect-ratio:16/10;background:linear-gradient(180deg,#1B1E52,#38287E)}
      .view img{width:100%;height:100%;object-fit:cover;display:block}
      .mob{position:absolute;left:50%;top:0;width:2px;height:30%;background:rgba(255,255,255,.4);transform-origin:top center;animation:roost-sway 5s ease-in-out infinite}
      .mob i{position:absolute;bottom:-10px;left:-40px;width:82px;height:2px;background:rgba(255,255,255,.4)}
      .mob b{position:absolute;bottom:-26px;color:#FDE68A;--mdc-icon-size:18px}
      .moon{position:absolute;left:50%;bottom:22%;transform:translateX(-50%);color:#FDE68A;--mdc-icon-size:46px;filter:drop-shadow(0 0 12px rgba(253,230,138,.6))}
      .nl{position:absolute;inset:0;background:radial-gradient(circle at 20% 90%,${g[1]}66,transparent 55%);opacity:${light ? 1 : 0}}
      .ban{position:absolute;left:10px;right:10px;bottom:10px;display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};font-weight:700;font-size:14px}
      .ban ha-icon{animation:roost-wiggle .6s ease-in-out infinite}
      .wave{display:flex;align-items:flex-end;gap:3px;height:22px}
      .wave i{width:4px;border-radius:2px;background:${crying ? "#F43F6B" : g[1]};animation:roost-eq 1s ease-in-out infinite}
    </style>
    <div class="card">
      ${head("mdi:baby-face-outline", c.name || "Baby's room", line, db != null ? `<div class="wave" aria-hidden="true">${[0.4, 0.8, 0.6, 1, 0.5].map((h, k) => `<i style="height:${Math.round(Math.min(1, db / 80) * h * 22 + 3)}px;animation-delay:${k * 0.12}s;animation-duration:${crying ? 0.5 : 1.4}s"></i>`).join("")}</div>` : "")}
      <div class="view" role="img" aria-label="${esc(line)}">${src ? `<img src="${esc(src)}" alt="Baby camera">` : `<span class="mob"><i></i><b style="left:-40px"><ha-icon icon="mdi:star"></ha-icon></b><b style="left:-8px"><ha-icon icon="mdi:moon-waning-crescent"></ha-icon></b><b style="left:26px"><ha-icon icon="mdi:star"></ha-icon></b></span><ha-icon class="moon" icon="mdi:sleep"></ha-icon>`}
        <div class="nl"></div>${crying ? '<div class="ban"><ha-icon icon="mdi:emoticon-cry-outline"></ha-icon><span class="t">The baby is crying</span></div>' : ""}</div>
      <div class="stat">${stat("Warmth", this.val(c.temperature))}${stat("Humidity", this.val(c.humidity))}${stat("Sound", db != null ? `${Math.round(db)} dB` : "")}</div>
      <div class="chips">${c.light ? `<button class="chip ${light ? "on" : ""}" data-t="${esc(c.light)}" aria-pressed="${light}"><ha-icon icon="mdi:lightbulb-night"></ha-icon><span class="cw">Night light</span></button>` : ""}
        ${c.music ? `<button class="chip ${music ? "on" : ""}" data-m="1" aria-pressed="${music}"><ha-icon icon="mdi:music-note"></ha-icon><span class="cw">Lullaby</span></button>` : ""}</div>
    </div>`;
    const r = this.shadowRoot;
    r.querySelector("[data-ic]").addEventListener("click", () => this.moreInfo(c.camera || c.sound));
    r.querySelector(".view").addEventListener("click", () => this.moreInfo(c.camera));
    r.querySelectorAll("[data-t]").forEach((b) => b.addEventListener("click", () => { this.vibrate(); this.call(b.dataset.t.split(".")[0], "toggle", { entity_id: b.dataset.t }); }));
    r.querySelector("[data-m]")?.addEventListener("click", () => { this.vibrate(); this.call("media_player", "media_play_pause", { entity_id: c.music }); });
  }
}

// ------------------------------------------------------------------ Roost Network
// The internet or a home server: download and upload speed with signal waves, devices online, or CPU, memory, disk and heat as rings; a safe restart.
class RoostNetwork extends RoostBase {
  static get defaults() { return { kind: "router", color: "blue", theme: "auto" }; }

  validate(c) { if (c.kind === "server" ? !c.cpu && !c.memory && !c.disk : !c.download && !c.clients && !c.online) throw new Error(c.kind === "server" ? "Choose the server's CPU, memory or disk" : "Choose the download speed or devices online"); }

  watched() { const c = this._config; return [c.download, c.upload, c.ping, c.clients, c.online, c.cpu, c.memory, c.disk, c.temperature, c.uptime].filter(Boolean); }

  static getConfigForm() {
    return { schema: [
      { name: "sample", label: "Show sample data", selector: { boolean: {} } },
      { type: "grid", name: "", schema: [{ name: "kind", label: "It is", selector: pick([["router", "Internet and router"], ["server", "Server or NAS"]]) }, { name: "name", selector: { text: {} } }] },
      { type: "expandable", name: "", title: "Internet", icon: "mdi:router-wireless", schema: [
        { type: "grid", name: "", schema: [{ name: "download", selector: { entity: { domain: "sensor" } } }, { name: "upload", selector: { entity: { domain: "sensor" } } }] },
        { type: "grid", name: "", schema: [{ name: "ping", selector: { entity: { domain: "sensor" } } }, { name: "clients", label: "Devices online", selector: { entity: { domain: "sensor" } } }] },
        { name: "online", label: "Internet up (binary sensor)", selector: { entity: { domain: "binary_sensor" } } },
      ] },
      { type: "expandable", name: "", title: "Server", icon: "mdi:server", schema: [
        { type: "grid", name: "", schema: [{ name: "cpu", label: "CPU (%)", selector: { entity: { domain: "sensor" } } }, { name: "memory", label: "Memory (%)", selector: { entity: { domain: "sensor" } } }] },
        { type: "grid", name: "", schema: [{ name: "disk", label: "Disk used (%)", selector: { entity: { domain: "sensor" } } }, { name: "temperature", selector: { entity: { domain: "sensor" } } }] },
        { name: "uptime", selector: { entity: { domain: "sensor" } } },
      ] },
      { name: "restart", label: "Restart button (tap twice)", selector: { entity: { domain: ["button", "switch", "script"] } } },
      ...colourFields("color"), THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig() { return { sample: true }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour();
    const sure = Date.now() - (this._sure || 0) < 3000;
    let body = "", line = "";
    if (c.kind === "server") {
      const ring = (label, id, warn) => { const v = this.n(id); if (v == null) return ""; const col = v >= warn ? "#F43F6B" : v >= warn - 15 ? "#F5B94A" : g[1], C = 2 * Math.PI * 22;
        return `<div class="rg2"><svg viewBox="0 0 56 56"><circle cx="28" cy="28" r="22" fill="none" stroke="${p.track}" stroke-width="6"/><circle cx="28" cy="28" r="22" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${(C * Math.min(1, v / 100)).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 28 28)"/></svg><b class="num">${Math.round(v)}%</b><span>${esc(label)}</span></div>`; };
      const hot = this.n(c.temperature);
      line = [this.n(c.cpu) != null ? `CPU ${Math.round(this.n(c.cpu))}%` : "", hot != null ? this.val(c.temperature) : "", this.val(c.uptime) ? `up ${this.val(c.uptime)}` : ""].filter(Boolean).join(" · ");
      body = `<div class="rings">${ring("CPU", c.cpu, 85)}${ring("Memory", c.memory, 90)}${ring("Disk", c.disk, 90)}</div>`;
    } else {
      const dl = this.n(c.download), ul = this.n(c.upload), up = c.online ? this.on(c.online) : dl == null || dl > 0;
      const fast = dl == null ? 1.6 : Math.max(0.5, 2.4 - Math.log10(Math.max(1, dl)) * 0.7);
      line = up ? [dl != null ? `${fmt(dl, 0)} down` : "", ul != null ? `${fmt(ul, 0)} up` : "", this.val(c.clients) ? `${this.val(c.clients)} devices` : ""].filter(Boolean).join(" · ") || "Online" : "Internet is down";
      body = `<div class="rt"><svg viewBox="0 0 160 90" aria-hidden="true">
          ${up ? [0, 1, 2].map((k) => `<path class="wv2" style="animation-delay:${(k * fast) / 3}s;animation-duration:${fast}s" d="M${50 - k * 0} 30 Q80 ${2 - k * 0} 110 30" fill="none" stroke="${g[1]}" stroke-width="3" stroke-linecap="round"/>`).join("") : ""}
          <rect x="34" y="50" width="92" height="28" rx="10" fill="${p.inset}" stroke="${p.border}" stroke-width="2"/>
          <line x1="50" y1="50" x2="44" y2="32" stroke="${p.muted}" stroke-width="4" stroke-linecap="round"/><line x1="110" y1="50" x2="116" y2="32" stroke="${p.muted}" stroke-width="4" stroke-linecap="round"/>
          ${[56, 70, 84, 98].map((x, k) => `<circle cx="${x}" cy="64" r="3.5" fill="${up ? (k === 3 ? g[1] : "#34D399") : "#F43F6B"}" class="${up ? "bl2" : ""}" style="animation-delay:${k * 0.3}s"/>`).join("")}</svg>
        <div class="sp">${dl != null ? `<div><small>Download</small><b class="num">${esc(fmt(dl, dl < 10 ? 1 : 0))}</b><span>${esc(this.sx(c.download).attributes.unit_of_measurement || "Mbit/s")}</span></div>` : ""}${ul != null ? `<div><small>Upload</small><b class="num">${esc(fmt(ul, ul < 10 ? 1 : 0))}</b><span>${esc(this.sx(c.upload).attributes.unit_of_measurement || "Mbit/s")}</span></div>` : ""}</div></div>
        <div class="stat">${stat("Ping", this.val(c.ping))}${stat("Devices online", this.val(c.clients))}</div>`;
    }
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, true)}
      .rt{display:grid;grid-template-columns:150px minmax(0,1fr);gap:12px;align-items:center}
      .rt svg{width:150px}
      .wv2{opacity:0;transform-box:fill-box;transform-origin:center bottom;animation:roost-wifi 1.6s ease-out infinite}
      @keyframes roost-wifi{0%{opacity:0;transform:translateY(16px) scale(.4)}40%{opacity:.9}100%{opacity:0;transform:translateY(-8px) scale(1.2)}}
      .bl2{animation:roost-breathe 1.2s ease-in-out infinite}
      .sp{display:flex;flex-direction:column;gap:10px}
      .sp small{display:block;font-size:12px;color:${p.muted}}.sp b{font-size:24px;font-family:${FONT_NUM}}.sp span{font-size:12px;color:${p.muted};margin-left:4px}
      .rings{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
      .rg2{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:12px;color:${p.muted}}
      .rg2 svg{width:76px;height:76px}
      .rg2 b{position:absolute;top:26px;font-size:15px;color:${p.text}}
    </style>
    <div class="card">
      ${head(c.kind === "server" ? "mdi:server" : "mdi:router-wireless", c.name || (c.kind === "server" ? "Server" : "Internet"), line)}
      ${body}
      ${c.restart ? `<button class="big off" data-rs="1"><ha-icon icon="mdi:restart"></ha-icon>${sure ? "Tap again to restart" : c.kind === "server" ? "Restart the server" : "Restart the router"}</button>` : ""}
    </div>`;
    const r = this.shadowRoot;
    r.querySelector("[data-ic]").addEventListener("click", () => this.moreInfo(c.download || c.cpu));
    r.querySelector("[data-rs]")?.addEventListener("click", () => {
      if (Date.now() - (this._sure || 0) >= 3000) { this._sure = Date.now(); this._sig = null; this.render(); clearTimeout(this._sureT); this._sureT = setTimeout(() => { this._sig = null; this.render(); }, 3000); return; }
      this._sure = 0; this.vibrate(); const d = c.restart.split(".")[0];
      this.call(d, d === "button" ? "press" : "turn_on", { entity_id: c.restart });
    });
  }
}

// ------------------------------------------------------------------ Roost Bins
// Which bin goes out next, drawn as coloured wheelie bins; the one for tonight bounces.
const BIN_COLOURS = { blue: "#2F6BFF", green: "#10B981", black: "#3A4170", grey: "#94A3B8", yellow: "#F5B94A", brown: "#A16207", red: "#F43F6B", purple: "#8B6CFF" };
class RoostBins extends ticking(RoostBase, 300000) {
  static get defaults() { return { bins: [], color: "green", theme: "auto" }; }

  validate(c) { if (!(c.bins || []).length) throw new Error("Add your bins"); }

  watched() { return (this._config.bins || []).map((b) => b.entity).filter(Boolean); }

  static getConfigForm() {
    return { schema: [
      { name: "name", selector: { text: {} } },
      { name: "bins", label: "Bins", selector: { object: { multiple: true, label_field: "name", fields: {
        name: { label: "Name", required: true, selector: { text: {} } },
        colour: { label: "Colour", selector: { select: { mode: "dropdown", options: Object.keys(BIN_COLOURS) } } },
        entity: { label: "Next pick-up (a date sensor, or days to go)", selector: { entity: { domain: ["sensor", "calendar"] } } },
        days: { label: "Or the day(s) it is picked up", selector: { select: { multiple: true, mode: "list", options: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] } } },
        every: { label: "Every so many weeks (with the days)", selector: { number: { min: 1, max: 4, mode: "box" } } },
        start: { label: "A first pick-up date (for every 2 weeks)", selector: { date: {} } },
      } } } },
      THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig() { return { bins: [{ name: "General", colour: "black", days: ["Sunday", "Wednesday"] }, { name: "Recycling", colour: "blue", days: ["Thursday"], every: 2, start: "2026-01-01" }] }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  next(b) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const s = this.sx(b.entity);
    if (s) {
      if (s.entity_id.startsWith("calendar.")) { const t = s.attributes.start_time; return t ? new Date(t) : null; }
      const v = num(s.state); if (v != null && s.attributes.device_class !== "timestamp") return new Date(today.getTime() + v * 86400e3);
      const d = new Date(s.state); return isNaN(d) ? null : d;
    }
    const names = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const want = (b.days || []).map((d) => names.indexOf(String(d).toLowerCase())).filter((i) => i >= 0);
    if (!want.length) return null;
    const every = Math.max(1, Number(b.every) || 1), start = b.start ? new Date(b.start) : null;
    for (let k = 0; k < 7 * every + 7; k++) {
      const d = new Date(today.getTime() + k * 86400e3);
      if (!want.includes(d.getDay())) continue;
      if (every > 1 && start) { const wk = Math.floor((d - start) / (7 * 86400e3)); if (((wk % every) + every) % every !== 0) continue; }
      return d;
    }
    return null;
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const list = (c.bins || []).map((b, i) => { const d = this.next(b); const days = d ? Math.round((new Date(d).setHours(0, 0, 0, 0) - today) / 86400e3) : null; return { ...b, i, d, days, col: BIN_COLOURS[b.colour] || BIN_COLOURS[b.color] || "#94A3B8" }; })
      .sort((a, b) => (a.days ?? 99) - (b.days ?? 99));
    const tonight = list.filter((b) => b.days === 1 || (b.days === 0 && new Date().getHours() < 9));
    const when = (b) => (b.days == null ? "No date" : b.days === 0 ? "Today" : b.days === 1 ? "Tomorrow" : b.d.toLocaleDateString([], { weekday: "long" }));
    const bin = (col, on) => `<svg viewBox="0 0 60 76" aria-hidden="true"><rect x="8" y="14" width="44" height="54" rx="5" fill="${col}"/><rect x="5" y="8" width="50" height="8" rx="3" fill="${col}" style="filter:brightness(.85)"/>
      <rect x="20" y="4" width="20" height="5" rx="2" fill="${col}" style="filter:brightness(.7)"/>${[22, 30, 38].map((x) => `<rect x="${x}" y="24" width="3" height="34" rx="1.5" fill="rgba(255,255,255,.25)"/>`).join("")}
      <circle cx="16" cy="70" r="5" fill="#1A1F3D"/><circle cx="44" cy="70" r="5" fill="#1A1F3D"/>${on ? '<path d="M30 -2 l4 6 h-8z" fill="#F5B94A"/>' : ""}</svg>`;
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, tonight.length > 0)}
      .bins{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:10px}
      .bn{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 6px;border-radius:16px;background:${p.inset};text-align:center}
      .bn svg{width:52px;height:66px}
      .bn.go{background:${g[0]}26;box-shadow:inset 0 0 0 1.5px ${g[1]}}
      .bn.go svg{animation:roost-bounce 1.6s ease-in-out infinite}
      .bn b{font-size:13px}.bn span{font-size:12px;color:${p.muted}}
      .tn{display:flex;align-items:center;gap:10px;padding:12px;border-radius:14px;background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};font-weight:700;font-size:14px}
    </style>
    <div class="card">
      ${head("mdi:delete-variant", c.name || "Bins", tonight.length ? `Put out ${tonight.map((b) => `the ${String(b.colour || "").toLowerCase()} bin`.replace("the  bin", b.name)).join(" and ")} ${tonight[0].days === 0 ? "now" : "tonight"}` : list[0]?.d ? `Next: ${list[0].name}, ${when(list[0]).toLowerCase()}` : "No pick-ups found")}
      ${tonight.length ? `<div class="tn"><ha-icon icon="mdi:weather-night"></ha-icon><span class="t">${esc(tonight.map((b) => b.name).join(" and "))} ${tonight[0].days === 0 ? "goes out this morning" : "goes out tonight"}</span></div>` : ""}
      <div class="bins">${list.map((b) => `<div class="bn ${tonight.includes(b) ? "go" : ""}">${bin(b.col, tonight.includes(b))}<b class="t">${esc(b.name)}</b><span class="t">${esc(when(b))}</span></div>`).join("")}</div>
    </div>`;
  }
}

// ------------------------------------------------------------------ Roost Batteries
// Every battery in the home in one place, lowest first, so a dead sensor is changed before it stops working.
const batteryIcon = (v, charging) => {
  if (charging) return "mdi:battery-charging";
  if (v == null) return "mdi:battery-unknown";
  const r = Math.max(0, Math.min(100, Math.round(v / 10) * 10));
  return r >= 100 ? "mdi:battery" : r <= 0 ? "mdi:battery-outline" : `mdi:battery-${r}`;
};
class RoostBatteries extends ticking(RoostBase, 600000) {
  static get defaults() { return { entities: [], exclude: [], low: 20, show: "all", max: 8, color: "green", theme: "auto" }; }

  // the batteries to show: the ones picked, or every battery Home Assistant knows about
  list() {
    const c = this._config, h = this._hass;
    if (!h) return [];
    const pickd = (c.entities || []).map((e) => (typeof e === "string" ? { entity: e } : e)).filter((e) => e.entity);
    if (pickd.length) return pickd;
    const skip = new Set(c.exclude || []);
    return Object.values(h.states).filter((s) => !skip.has(s.entity_id) && (!c.sample || s.entity_id.includes(".sample_bat_")) && (s.entity_id.startsWith("sensor.") && s.attributes.device_class === "battery" && s.attributes.unit_of_measurement === "%"
      || s.entity_id.startsWith("binary_sensor.") && s.attributes.device_class === "battery")).map((s) => ({ entity: s.entity_id }));
  }

  watched() { return this.list().map((i) => i.entity); }

  static getConfigForm() {
    return { schema: [
      { name: "name", selector: { text: {} } },
      { name: "entities", label: "Batteries (empty = every battery in the home)", selector: { object: { multiple: true, label_field: "name", fields: {
        entity: { label: "Battery", required: true, selector: { entity: { filter: [{ device_class: "battery" }] } } },
        name: { label: "Name", selector: { text: {} } },
        icon: { label: "Icon", selector: { icon: {} } },
      } } } },
      { name: "exclude", label: "Leave out (when showing every battery)", selector: { entity: { multiple: true, filter: [{ device_class: "battery" }] } } },
      { type: "grid", name: "", schema: [
        { name: "low", label: "Low below", selector: slider(5, 50, 5, "%") },
        { name: "max", label: "Rows before “Show all”", selector: { number: { min: 3, max: 40, mode: "box" } } },
      ] },
      { name: "show", label: "Show", selector: pick([["all", "Every battery, lowest first"], ["low", "Only the low ones (a calm “All good” when none)"]]) },
      ...colourFields("color", "Colour"),
      THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig() { return { show: "all" }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  // "Hallway motion Battery" -> "Hallway motion"
  label(it, s) {
    if (it.name) return it.name;
    const dev = this._hass.entities?.[s.entity_id]?.device_id, dn = dev && (this._hass.devices?.[dev]?.name_by_user || this._hass.devices?.[dev]?.name);
    const n = dn || s.attributes.friendly_name || s.entity_id;
    return String(n).replace(/\s*battery( level)?$/i, "").trim() || n;
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour(), low = Number(c.low) || 20;
    const rows = this.list().map((it) => {
      const s = this.sx(it.entity);
      if (!s) return null;
      const bin = s.entity_id.startsWith("binary_sensor."), un = UNAVAILABLE.includes(s.state);
      const v = bin ? null : num(s.state), isLow = bin ? s.state === "on" : v != null && v < low;
      const charging = s.attributes.battery_charging === true || /charging/.test(String(s.attributes.charging_state || ""));
      return { it, s, v, un, isLow, bin, charging, name: this.label(it, s), seen: s.last_updated };
    }).filter(Boolean).sort((a, b) => (b.isLow - a.isLow) || ((a.un ? -1 : a.v ?? 101) - (b.un ? -1 : b.v ?? 101)) || a.name.localeCompare(b.name));
    const lows = rows.filter((r) => r.isLow), dead = rows.filter((r) => r.un);
    const shown = c.show === "low" ? rows.filter((r) => r.isLow || r.un) : rows;
    const max = Math.max(3, Number(c.max) || 8), cut = this._all ? shown : shown.slice(0, max);
    const line = !rows.length ? "No batteries found" : lows.length ? `${lows.length} ${lows.length === 1 ? "needs" : "need"} a new battery` : dead.length ? `All charged · ${dead.length} not reporting` : `All good · ${rows.length} batteries`;
    const col = (r) => (r.un ? p.muted : r.isLow ? (r.v != null && r.v < low / 2 ? "#F43F6B" : "#F59E0B") : g[this.dark ? 1 : 0]);
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, !lows.length && rows.length > 0)}
      .ls{display:flex;flex-direction:column;gap:6px}
      .r{display:grid;grid-template-columns:36px minmax(0,1fr) auto;align-items:center;gap:12px;padding:8px 12px 8px 8px;border-radius:14px;background:${p.inset};cursor:pointer;-webkit-tap-highlight-color:transparent}
      .r.lo{box-shadow:inset 0 0 0 1.5px color-mix(in srgb, var(--c) 70%, transparent)}
      .r.lo .bi ha-icon{animation:roost-breathe 1.8s ease-in-out infinite}
      .r.chg .bi ha-icon{animation:roost-pulse 1.6s ease-in-out infinite}

      .bi{width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb, var(--c) 18%, transparent);color:var(--c);--mdc-icon-size:20px}
      .nm{min-width:0}.nm b{display:block;font-size:14px;font-weight:600;overflow-wrap:break-word}
      .nm span{display:block;font-size:12px;color:${p.muted}}
      .br{height:4px;border-radius:2px;background:${p.track};margin-top:6px;overflow:hidden}.br i{display:block;height:100%;border-radius:2px;background:var(--c)}
      .v{font-family:${FONT_NUM};font-size:15px;font-weight:700;color:var(--c);white-space:nowrap}
      .more{align-self:center;border:0;background:none;color:${ACTIVE[0]};font:inherit;font-size:13px;font-weight:600;padding:4px 8px;cursor:pointer}
      .ok{display:flex;align-items:center;gap:10px;padding:12px;border-radius:14px;background:${p.inset};font-size:13px;color:${p.muted};--mdc-icon-size:20px}
    </style>
    <div class="card">
      ${head(lows.length ? "mdi:battery-alert-variant-outline" : "mdi:battery-heart-variant", c.name || "Batteries", line)}
      ${cut.length ? `<div class="ls">${cut.map((r, k) => `<div class="r ${r.isLow ? "lo" : ""} ${r.charging ? "chg" : ""}" data-e="${esc(r.it.entity)}" role="button" tabindex="0" style="--c:${col(r)}">
        <span class="bi"><ha-icon icon="${esc(r.it.icon || (r.un ? "mdi:battery-off-outline" : r.bin ? (r.isLow ? "mdi:battery-alert" : "mdi:battery") : batteryIcon(r.v, r.charging)))}"></ha-icon></span>
        <span class="nm"><b class="t">${esc(r.name)}</b><span class="t">${esc(r.un ? `Not reporting · ${ago(r.seen)}` : r.isLow ? "Change the battery soon" : r.charging ? "Charging" : r.bin ? "Battery fine" : `Updated ${ago(r.seen)}`)}</span>
          ${r.v != null && !r.un ? `<span class="br"><i data-bar="${esc(r.it.entity)}" style="width:${Math.max(3, Math.min(100, r.v))}%"></i></span>` : ""}</span>
        <span class="v num" data-tw="${esc(r.it.entity)}">${r.un ? "–" : r.v != null ? `${Math.round(r.v)}%` : r.isLow ? "Low" : "OK"}</span></div>`).join("")}</div>`
        : `<div class="ok"><ha-icon icon="mdi:check-circle-outline" style="color:${g[this.dark ? 1 : 0]}"></ha-icon>${rows.length ? "Every battery is fine." : "Batteries show up here by themselves once a device reports one."}</div>`}
      ${shown.length > max ? `<button class="more" data-more="1">${this._all ? "Show fewer" : `Show all ${shown.length}`}</button>` : ""}
    </div>`;
    this.shadowRoot.querySelectorAll("[data-e]").forEach((el) => el.addEventListener("click", () => this.moreInfo(el.dataset.e)));
    this.shadowRoot.querySelector("[data-more]")?.addEventListener("click", () => { this._all = !this._all; this._sig = null; this.render(); });
  }
}

// ------------------------------------------------------------------ Roost Timeline
// What happened at home, newest first: "Front door opened · 5 min ago", "Saeed arrived home".
const TL_DOMAINS = ["person", "lock", "cover", "alarm_control_panel", "binary_sensor"];
const TL_CLASSES = ["door", "window", "garage_door", "opening", "motion", "occupancy", "presence", "smoke", "moisture", "gas", "safety", "tamper", "vibration", "sound"];
class RoostTimeline extends ticking(RoostBase, 60000) {
  static get defaults() { return { entities: [], hours: 24, max: 8, show_motion: false, color: "purple", theme: "auto" }; }

  ids() {
    const c = this._config, h = this._hass;
    if (!h) return [];
    if ((c.entities || []).length) return c.entities.map((e) => (typeof e === "string" ? e : e.entity)).filter(Boolean);
    return Object.values(h.states).filter((s) => {
      const d = s.entity_id.split(".")[0];
      if (!TL_DOMAINS.includes(d)) return false;
      if (d !== "binary_sensor") return true;
      const cls = s.attributes.device_class;
      if (["motion", "occupancy", "presence"].includes(cls)) return !!c.show_motion;
      return TL_CLASSES.includes(cls);
    }).map((s) => s.entity_id);
  }

  watched() { return this.ids(); }

  extraSignature() { return `${this._at || 0}|${Math.floor(Date.now() / 60000)}`; }

  static getConfigForm() {
    return { schema: [
      { name: "name", selector: { text: {} } },
      { name: "entities", label: "Devices to follow (empty = people, doors, windows, locks, curtains, alarm and leaks)", selector: { entity: { multiple: true } } },
      { type: "grid", name: "", schema: [
        { name: "hours", label: "Hours back", selector: slider(1, 72, 1, "h") },
        { name: "max", label: "Rows before “Show more”", selector: { number: { min: 3, max: 30, mode: "box" } } },
      ] },
      { name: "show_motion", label: "Include motion (busy homes get many rows)", selector: { boolean: {} } },
      ...colourFields("color", "Colour"),
      THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig() { return {}; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  // a home event in plain words, with its icon and colour
  say(e) {
    const s = this.sx(e.entity_id), d = e.entity_id.split(".")[0], cls = s?.attributes.device_class, st = e.state;
    const name = this.name(e.entity_id, e.name);
    const w = (t, icon, col = "purple") => ({ text: t, icon, col });
    if (d === "person") return st === "home" ? w(`${name} arrived home`, "mdi:home-account", "green") : st === "not_home" ? w(`${name} left home`, "mdi:walk", "slate") : w(`${name} is at ${nice(st)}`, "mdi:map-marker", "blue");
    if (d === "lock") return st === "locked" ? w(`${name} locked`, "mdi:lock", "green") : st === "unlocked" ? w(`${name} unlocked`, "mdi:lock-open-variant", "amber") : w(`${name}: ${nice(st)}`, "mdi:lock-alert", "coral");
    if (d === "cover") return w(`${name} ${{ open: "opened", closed: "closed", opening: "opening", closing: "closing" }[st] || nice(st)}`, st === "open" || st === "opening" ? "mdi:window-shutter-open" : "mdi:window-shutter", "blue");
    if (d === "alarm_control_panel") return st === "triggered" ? w(`${name}: alarm!`, "mdi:alarm-light", "coral") : st === "disarmed" ? w(`${name} turned off`, "mdi:shield-off-outline", "slate") : w(`${name} ${nice(st).toLowerCase()}`, "mdi:shield-lock", "purple");
    if (d === "binary_sensor") {
      const on = st === "on";
      if (["door", "window", "garage_door", "opening"].includes(cls)) return w(`${name} ${on ? "opened" : "closed"}`, on ? (cls === "window" ? "mdi:window-open-variant" : "mdi:door-open") : cls === "window" ? "mdi:window-closed-variant" : "mdi:door-closed", on ? "amber" : "slate");
      if (["motion", "occupancy", "presence"].includes(cls)) return on ? w(`Movement: ${name}`, "mdi:motion-sensor", "blue") : null;
      if (["smoke", "gas", "moisture", "safety"].includes(cls)) return on ? w(`${name}: ${cls === "moisture" ? "water found" : cls === "smoke" ? "smoke!" : "check it now"}`, cls === "moisture" ? "mdi:water-alert" : "mdi:smoke-detector-alert", "coral") : w(`${name} back to normal`, "mdi:check-circle-outline", "green");
      return on ? w(`${name}`, "mdi:bell-ring-outline", "amber") : null;
    }
    if (UNAVAILABLE.includes(st)) return w(`${name} went offline`, "mdi:lan-disconnect", "slate");
    return w(`${name}: ${nice(st)}`, e.icon || "mdi:information-outline", "purple");
  }

  sampleEvents() {
    const t = Date.now() / 1000, ev = (m, entity_id, state, name) => ({ when: t - m * 60, entity_id, state, name });
    return [ev(4, "lock.sample_front_door", "locked", "Front door"), ev(6, "binary_sensor.sample_front_door", "off", "Front door"), ev(7, "binary_sensor.sample_front_door", "on", "Front door"),
      ev(8, "person.sample_layla", "home", "Layla"), ev(42, "cover.sample_garage", "closed", "Garage door"), ev(95, "person.sample_saeed", "not_home", "Saeed"),
      ev(180, "binary_sensor.sample_leak", "off", "Kitchen leak sensor"), ev(190, "binary_sensor.sample_leak", "on", "Kitchen leak sensor"), ev(400, "person.sample_daniel", "School", "Daniel")];
  }

  async load() {
    const c = this._config, h = this._hass;
    if (c.sample) { if (!this._events) { this._events = this.sampleEvents(); this._sig = null; queueMicrotask(() => { if (this._hass) this.hass = this._hass; }); } return; }
    if (!h?.callWS || this._loading || Date.now() - (this._loadedAt || 0) < 55000) return;
    const ids = this.ids();
    if (!ids.length) { this._events = []; return; }
    this._loading = true;
    try {
      const start = new Date(Date.now() - (Number(c.hours) || 24) * 3600e3).toISOString();
      const r = await h.callWS({ type: "logbook/get_events", start_time: start, entity_ids: ids });
      // "locking", "opening", "arming" are on the way to the real change, which gets its own row
      this._events = (r || []).filter((e) => e.entity_id && e.state != null && !["locking", "unlocking", "opening", "closing", "arming", "pending", "disarming"].includes(e.state)).sort((a, b) => b.when - a.when);
      this._loadedAt = Date.now(); this._at = this._loadedAt;
    } catch (e) { this._events = this._events || []; this._failed = true; }
    this._loading = false;
    this._sig = null; if (this._hass) this.hass = this._hass;
  }

  set hass(hass) {
    super.hass = hass;
    if (!this._config || this._setup || !hass) return;
    // look again when a followed device changes, and once a minute anyway
    const w = this.ids().map((id) => hass.states[id]?.last_changed || "").join("|");
    if (w !== this._wsig) { this._wsig = w; this._loadedAt = 0; }
    this.load();
  }

  get hass() { return this._hass; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour();
    const all = (this._events || []).map((e) => ({ e, w: this.say(e) })).filter((x) => x.w);
    const max = Math.max(3, Number(c.max) || 8), list = this._all ? all : all.slice(0, max);
    const day = (sec) => { const d = new Date(sec * 1000), t = new Date(); t.setHours(0, 0, 0, 0); return d >= t ? "Today" : d >= t - 86400e3 ? "Yesterday" : d.toLocaleDateString([], { weekday: "long" }); };
    let last = "";
    const line = !this._events ? "Looking back" : !all.length ? `Nothing happened in the last ${Number(c.hours) || 24} h` : `${all.length} ${all.length === 1 ? "thing" : "things"} in the last ${Number(c.hours) || 24} h`;
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, false)}
      .tl{display:flex;flex-direction:column}
      .dy{font-size:12px;font-weight:600;color:${p.muted};margin:4px 0 8px;letter-spacing:.2px}
      .ev{display:grid;grid-template-columns:36px minmax(0,1fr) auto;gap:12px;align-items:center;position:relative;padding-bottom:12px;cursor:pointer;-webkit-tap-highlight-color:transparent}
      .ev::before{content:"";position:absolute;left:17px;top:38px;bottom:2px;width:2px;border-radius:1px;background:${p.track}}
      .ev:last-child::before,.ev.end::before{display:none}
      .dot{width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb, var(--c) 20%, transparent);color:var(--c);--mdc-icon-size:19px}
      .ev b{font-size:14px;font-weight:600;line-height:1.3}
      .ev time{font-size:12px;color:${p.muted};white-space:nowrap;font-family:${FONT_NUM}}
      .ev.new .dot{box-shadow:0 0 0 3px color-mix(in srgb, var(--c) 30%, transparent)}
      .ev.first .dot::after{content:"";position:absolute;inset:0;border-radius:12px;border:2px solid var(--c);animation:roost-ring 2.4s ease-out infinite}
      @keyframes roost-ring{0%{transform:scale(1);opacity:.8}70%,100%{transform:scale(1.35);opacity:0}}
      .dot{position:relative}
      .ev.in .dot{animation:roost-pulse .5s ease-out 2}
      .more{align-self:center;border:0;background:none;color:${ACTIVE[0]};font:inherit;font-size:13px;font-weight:600;padding:4px 8px;cursor:pointer}
      .ok{display:flex;align-items:center;gap:10px;padding:12px;border-radius:14px;background:${p.inset};font-size:13px;color:${p.muted};--mdc-icon-size:20px}
    </style>
    <div class="card">
      ${head("mdi:timeline-clock-outline", c.name || "Timeline", line)}
      ${list.length ? `<div class="tl">${list.map((x, i) => {
        const d = day(x.e.when), hdr = d !== last ? `<div class="dy">${esc(d)}</div>` : ""; last = d;
        const nextDay = list[i + 1] && day(list[i + 1].e.when) !== d;
        const mins = (Date.now() / 1000 - x.e.when) / 60;
        const when = mins < 60 ? ago(new Date(x.e.when * 1000).toISOString()) : new Date(x.e.when * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
        const key = `${x.e.entity_id}@${x.e.when}`, fresh = this._seen && !this._seen.has(key);
        return `${hdr}<div class="ev ${mins < 15 ? "new" : ""} ${mins < 15 && i === 0 ? "first" : ""} ${fresh ? "in" : ""} ${nextDay ? "end" : ""}" data-e="${esc(x.e.entity_id)}" role="button" tabindex="0" style="--c:${(COLORS[x.w.col] || g)[this.dark ? 1 : 0]}">
          <span class="dot"><ha-icon icon="${esc(x.w.icon)}"></ha-icon></span><b class="t">${esc(x.w.text)}</b><time>${esc(when)}</time></div>`;
      }).join("")}</div>` : this._events ? `<div class="ok"><ha-icon icon="mdi:sofa-outline"></ha-icon>A quiet ${Number(c.hours) <= 12 ? "few hours" : "day"} at home.</div>` : ""}
      ${all.length > max ? `<button class="more" data-more="1">${this._all ? "Show fewer" : `Show ${all.length - max} more`}</button>` : ""}
    </div>`;
    if (this._events) this._seen = new Set(all.map((x) => `${x.e.entity_id}@${x.e.when}`));
    this.shadowRoot.querySelectorAll("[data-e]").forEach((el) => el.addEventListener("click", () => this.moreInfo(el.dataset.e)));
    this.shadowRoot.querySelector("[data-more]")?.addEventListener("click", () => { this._all = !this._all; this._sig = null; this.render(); });
  }
}

// ------------------------------------------------------------------ Roost Values
// Your own settings in one card: a number to slide, a choice to tap, a switch, a short text.
class RoostValues extends RoostBase {
  static get defaults() { return { entities: [], color: "purple", theme: "auto" }; }

  validate(c) { if (!(c.entities || []).length) throw new Error("Pick the values to show (helpers such as numbers, lists, switches or text)"); }

  items() { return (this._config.entities || []).map((e) => (typeof e === "string" ? { entity: e } : e)).filter((e) => e.entity); }

  watched() { return this.items().map((i) => i.entity); }

  static getConfigForm() {
    return { schema: [
      { name: "name", selector: { text: {} } },
      { name: "entities", label: "Values", selector: { object: { multiple: true, label_field: "name", fields: {
        entity: { label: "Value", required: true, selector: { entity: { domain: ["input_number", "number", "input_select", "select", "input_boolean", "input_text", "text", "input_datetime", "counter"] } } },
        name: { label: "Name", selector: { text: {} } },
        icon: { label: "Icon", selector: { icon: {} } },
      } } } },
      ...colourFields("color", "Colour"),
      THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig(hass) { return { entities: Object.keys(hass.states).filter((id) => /^(input_number|input_select|input_boolean|input_text)\./.test(id)).slice(0, 4) }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  set(it, value) {
    const id = it.entity, d = id.split(".")[0];
    this.vibrate();
    if (d === "input_number" || d === "number") return this.call(d, "set_value", { entity_id: id, value: Number(value) });
    if (d === "input_select" || d === "select") return this.call(d, "select_option", { entity_id: id, option: value });
    if (d === "input_boolean") return this.call(d, "toggle", { entity_id: id });
    if (d === "input_text" || d === "text") return this.call(d, "set_value", { entity_id: id, value: String(value) });
    if (d === "counter") return this.call(d, value, { entity_id: id });
    if (d === "input_datetime") return this.call(d, "set_datetime", String(value).includes(":") && !String(value).includes("-") ? { entity_id: id, time: value } : { entity_id: id, date: value });
    return undefined;
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour();
    const ICON = { input_number: "mdi:tune-variant", number: "mdi:tune-variant", input_select: "mdi:format-list-bulleted", select: "mdi:format-list-bulleted", input_boolean: "mdi:toggle-switch-outline", input_text: "mdi:form-textbox", text: "mdi:form-textbox", input_datetime: "mdi:clock-outline", counter: "mdi:counter" };
    const row = (it, k) => {
      const s = this.sx(it.entity), d = it.entity.split(".")[0];
      if (!s) return `<div class="v"><span class="ic2"><ha-icon icon="mdi:help-circle-outline"></ha-icon></span><div class="nm"><b>${esc(it.name || it.entity)}</b><span>Not found</span></div></div>`;
      const nm = esc(it.name || s.attributes.friendly_name || it.entity), un = UNAVAILABLE.includes(s.state);
      const ic = `<span class="ic2"><ha-icon icon="${esc(it.icon || s.attributes.icon || ICON[d] || "mdi:shape-outline")}"></ha-icon></span>`;
      const unit = s.attributes.unit_of_measurement || "";
      if (d === "input_number" || d === "number") {
        const mn = Number(s.attributes.min ?? 0), mx = Number(s.attributes.max ?? 100), st = Number(s.attributes.step ?? 1), v = num(s.state) ?? mn;
        const dec = String(st).includes(".") ? String(st).split(".")[1].length : 0;
        return `<div class="v wide">${ic}<div class="nm"><b class="t">${nm}</b></div><span class="val num" data-out="${k}" data-tw="v${k}">${esc(fmt(v, dec))}<small>${esc(unit)}</small></span>
          <input class="rng" type="range" min="${mn}" max="${mx}" step="${st}" value="${v}" data-k="${k}" aria-label="${nm}" style="--f:${(((v - mn) / (mx - mn || 1)) * 100).toFixed(1)}%" ${un ? "disabled" : ""}></div>`;
      }
      if (d === "input_select" || d === "select") {
        const ops = s.attributes.options || [];
        return `<div class="v wide">${ic}<div class="nm"><b class="t">${nm}</b></div><span class="val small">${esc(nice(s.state))}</span>
          <div class="ops">${ops.map((o) => `<button class="op ${o === s.state ? "on" : ""}" data-k="${k}" data-o="${esc(o)}" aria-pressed="${o === s.state}" data-pop="${o === s.state ? 1 : 0}" data-popkey="o${k}${esc(o)}">${esc(nice(o))}</button>`).join("")}</div></div>`;
      }
      if (d === "input_boolean") {
        const on = s.state === "on";
        return `<div class="v" data-k="${k}" data-tg="1" role="switch" aria-checked="${on}" tabindex="0">${ic}<div class="nm"><b class="t">${nm}</b><span>${on ? "On" : "Off"} · ${esc(since(s.last_changed))}</span></div><span class="sw ${on ? "on" : ""}"><i data-glide="sk${k}" style="transform:translateX(${on ? 18 : 0}px)"></i></span></div>`;
      }
      if (d === "input_text" || d === "text") {
        return `<div class="v wide">${ic}<div class="nm"><b class="t">${nm}</b></div><span></span>
          <input class="tx2" type="text" value="${esc(s.state === "unknown" ? "" : s.state)}" data-k="${k}" maxlength="${Number(s.attributes.max) || 100}" aria-label="${nm}" placeholder="Type and press Enter"></div>`;
      }
      if (d === "counter") {
        return `<div class="v">${ic}<div class="nm"><b class="t">${nm}</b></div><span class="cnt"><button data-k="${k}" data-c="decrement" aria-label="Less">−</button><b class="num" data-tw="c${k}">${esc(s.state)}</b><button data-k="${k}" data-c="increment" aria-label="More">+</button></span></div>`;
      }
      if (d === "input_datetime") {
        const hasD = s.attributes.has_date, hasT = s.attributes.has_time;
        const v = hasD && !hasT ? s.state : hasT && !hasD ? String(s.state).slice(0, 5) : "";
        return `<div class="v">${ic}<div class="nm"><b class="t">${nm}</b></div>${v ? `<input class="dt" type="${hasD ? "date" : "time"}" value="${esc(v)}" data-k="${k}" aria-label="${nm}">` : `<span class="val small">${esc(s.state)}</span>`}</div>`;
      }
      return `<div class="v">${ic}<div class="nm"><b class="t">${nm}</b></div><span class="val small">${esc(nice(s.state))}${esc(unit ? ` ${unit}` : "")}</span></div>`;
    };
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, false)}
      .ls{display:flex;flex-direction:column;gap:8px}
      .v{display:grid;grid-template-columns:36px minmax(0,1fr) auto;align-items:center;gap:8px 12px;padding:10px 12px 10px 10px;border-radius:16px;background:${p.inset}}
      .v[data-tg]{cursor:pointer;-webkit-tap-highlight-color:transparent}
      .v.wide > :nth-child(4){grid-column:1 / -1}
      .ic2{width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb, ${g[0]} 20%, transparent);color:${g[this.dark ? 1 : 0]};--mdc-icon-size:19px}
      .nm{min-width:0}.nm b{display:block;font-size:14px;font-weight:600}.nm span{display:block;font-size:12px;color:${p.muted};margin-top:2px}
      .val{font-family:${FONT_NUM};font-size:17px;font-weight:700;white-space:nowrap}.val small{font-size:12px;color:${p.muted};margin-left:2px;font-weight:600}
      .val.small{font-family:inherit;font-size:13px;font-weight:600;color:${p.muted}}
      .rng{-webkit-appearance:none;appearance:none;width:100%;height:28px;margin:0;background:transparent;cursor:pointer}
      .rng::-webkit-slider-runnable-track{height:8px;border-radius:4px;background:linear-gradient(90deg,${g[0]},${g[1]}) 0/var(--f) 100% no-repeat,${p.track}}
      .rng::-moz-range-track{height:8px;border-radius:4px;background:${p.track}}.rng::-moz-range-progress{height:8px;border-radius:4px;background:linear-gradient(90deg,${g[0]},${g[1]})}
      .rng::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;border-radius:50%;margin-top:-8px;background:#fff;border:3px solid ${g[0]};box-shadow:0 2px 6px rgba(0,0,0,.25)}
      .rng::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid ${g[0]}}
      .ops{display:flex;flex-wrap:wrap;gap:6px}
      .op{min-height:36px;padding:0 14px;border-radius:999px;border:1px solid ${p.border};background:${p.off};color:${p.text};font:inherit;font-size:13px;font-weight:600;cursor:pointer}
      .op.on{background:linear-gradient(135deg,${ACTIVE[0]},${ACTIVE[1]});color:#fff;border-color:transparent}
      .sw{width:44px;height:26px;border-radius:999px;background:${p.track};position:relative}
      .sw i{position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:${p.knob}}
      .sw.on{background:linear-gradient(135deg,${ACTIVE[0]},${ACTIVE[1]})}.sw.on i{background:#fff}
      .tx2,.dt{width:100%;box-sizing:border-box;min-height:40px;padding:0 12px;border-radius:12px;border:1px solid ${p.border};background:${p.off};color:${p.text};font:inherit;font-size:14px;color-scheme:${this.dark ? "dark" : "light"}}
      .dt{width:auto}
      .cnt{display:flex;align-items:center;gap:10px}.cnt b{font-size:17px;min-width:24px;text-align:center}
      .cnt button{width:36px;height:36px;border-radius:50%;border:1px solid ${p.border};background:${p.off};color:${p.text};font-size:20px;line-height:1;cursor:pointer}
    </style>
    <div class="card">
      ${c.name ? head("mdi:tune-variant", c.name, `${this.items().length} values`) : ""}
      <div class="ls">${this.items().map(row).join("")}</div>
    </div>`;
    const it = this.items(), R = this.shadowRoot;
    R.querySelectorAll(".rng").forEach((el) => {
      el.addEventListener("input", () => { const s = this.sx(it[+el.dataset.k].entity), mn = Number(s.attributes.min ?? 0), mx = Number(s.attributes.max ?? 100); el.style.setProperty("--f", `${((el.value - mn) / (mx - mn || 1)) * 100}%`); const o = R.querySelector(`[data-out="${el.dataset.k}"]`); if (o) o.firstChild.nodeValue = el.value; });
      el.addEventListener("change", () => this.set(it[+el.dataset.k], el.value));
    });
    R.querySelectorAll(".op").forEach((el) => el.addEventListener("click", () => this.set(it[+el.dataset.k], el.dataset.o)));
    R.querySelectorAll("[data-tg]").forEach((el) => el.addEventListener("click", () => this.set(it[+el.dataset.k])));
    R.querySelectorAll(".tx2").forEach((el) => { el.addEventListener("keydown", (e) => { if (e.key === "Enter") el.blur(); }); el.addEventListener("change", () => this.set(it[+el.dataset.k], el.value)); });
    R.querySelectorAll(".dt").forEach((el) => el.addEventListener("change", () => this.set(it[+el.dataset.k], el.value)));
    R.querySelectorAll("[data-c]").forEach((el) => el.addEventListener("click", () => this.set(it[+el.dataset.k], el.dataset.c)));
  }
}

// ------------------------------------------------------------------ Roost dashboards made from your home
// Two ready dashboards, phone and tablet, built from your own areas, devices and entities. They follow your home
// by themselves: a new light or room shows up on its own. "Take control" in Home Assistant turns one into a normal,
// editable dashboard. On first use, an admin is asked once whether to add them.
const RoostAuto = {
  // what is in the home, sorted by area, without hidden, disabled or "settings" entities
  scan(hass, config = {}) {
    const reg = hass.entities || {}, dev = hass.devices || {}, areas = hass.areas || {};
    // "hide" leaves out whole kinds ("camera") or single entities ("light.porch")
    const hide = [].concat(config.hide || []), hidden = (id) => hide.includes(id) || hide.includes(id.split(".")[0]);
    const ok = (id) => { if (hidden(id)) return false; const e = reg[id]; const s = hass.states[id]; return s && !(e && (e.hidden || e.entity_category)) && !UNAVAILABLE.includes(s.state) || (s && id.startsWith("person.")); };
    const ids = Object.keys(hass.states).filter(ok).sort();
    const areaOf = (id) => reg[id]?.area_id || dev[reg[id]?.device_id]?.area_id || null;
    const dom = (d) => ids.filter((id) => id.startsWith(`${d}.`));
    const cls = (d, c) => dom(d).filter((id) => [].concat(c).includes(hass.states[id].attributes.device_class));
    const byArea = {};
    for (const id of ids) { const a = areaOf(id); if (a && areas[a]) (byArea[a] = byArea[a] || []).push(id); }
    const order = Object.values(areas).sort((a, b) => String(a.name).localeCompare(String(b.name))).map((a) => a.area_id).filter((a) => byArea[a]);
    return { ids, dom, cls, byArea, order, areas, areaOf };
  },

  // the devices worth a tile in a room, most useful first
  roomDevices(h, list) {
    const rank = ["light", "climate", "cover", "fan", "media_player", "switch", "lock", "vacuum", "humidifier", "water_heater"];
    return list.filter((id) => rank.includes(id.split(".")[0]) && !(id.startsWith("switch.") && /child|lock|led|indicator|restart|update/i.test(id)))
      .sort((a, b) => rank.indexOf(a.split(".")[0]) - rank.indexOf(b.split(".")[0]));
  },

  areaIcon(a) {
    if (a.icon) return a.icon;
    const n = String(a.name || "").toLowerCase();
    return [[/living|lounge|majlis|family/, "mdi:sofa"], [/kitchen/, "mdi:stove"], [/bed|master|guest room|kid/, "mdi:bed-king"], [/bath|toilet|wc/, "mdi:shower"], [/office|study/, "mdi:desk"], [/garage/, "mdi:garage"],
      [/garden|yard|outside|roof|balcon/, "mdi:flower"], [/hall|entrance|corridor|stairs/, "mdi:door"], [/dining/, "mdi:silverware-fork-knife"], [/laundry/, "mdi:washing-machine"]].find(([r]) => r.test(n))?.[1] || "mdi:home-outline";
  },

  cards(hass, tablet, config = {}) {
    const S = this.scan(hass, config), h = S, st = (id) => hass.states[id];
    const T = (title) => ({ type: "custom:roost-title", title });
    const out = { top: [], rooms: [], climate: [], media: [], security: [], info: [], care: [], perRoom: [] };
    const weather = h.dom("weather")[0];
    const people = h.dom("person");
    out.top.push({ type: "custom:roost-hero", ...(weather ? { weather } : {}) });
    const chipIds = [...h.dom("lock"), ...h.dom("alarm_control_panel"), ...h.dom("light"), ...h.dom("climate"), ...h.cls("binary_sensor", ["door", "window", "garage_door"]).slice(0, 8), ...people].slice(0, 40);
    if (chipIds.length) out.top.push({ type: "custom:roost-chips", entities: chipIds });
    const scenes = [...h.dom("scene"), ...h.dom("script")].slice(0, 6);
    if (scenes.length) out.top.push({ type: "grid", columns: 2, square: false, cards: scenes.slice(0, 4).map((entity) => ({ type: "custom:roost-scene", entity })) });
    // rooms: a pill per area, with that area's devices under it
    const rooms = h.order.map((a) => ({ a, devs: this.roomDevices(hass, h.byArea[a]).slice(0, 8) })).filter((x) => x.devs.length);
    if (rooms.length) out.rooms.push({ type: "custom:roost-rooms", show_names: "active", rooms: rooms.slice(0, 10).map((x) => ({ name: h.areas[x.a].name, icon: this.areaIcon(h.areas[x.a]), entities: x.devs })) });
    else {
      const loose = this.roomDevices(hass, h.ids).slice(0, 12);
      if (loose.length) out.rooms.push({ type: "grid", columns: 2, square: false, cards: loose.map((entity) => ({ type: "custom:roost-tile", entity, size: "small" })) });
    }
    for (const x of rooms) {
      const ar = h.byArea[x.a], temp = ar.find((id) => st(id).attributes.device_class === "temperature" && id.startsWith("sensor.")), hum = ar.find((id) => st(id).attributes.device_class === "humidity" && id.startsWith("sensor."));
      const motion = ar.filter((id) => id.startsWith("binary_sensor.") && ["motion", "occupancy", "presence"].includes(st(id).attributes.device_class));
      out.perRoom.push({ area: h.areas[x.a], cards: [
        { type: "custom:roost-room", name: h.areas[x.a].name, icon: this.areaIcon(h.areas[x.a]), style: "card", light_slider: x.devs.some((id) => id.startsWith("light.")), ...(temp ? { temperature: temp } : {}), ...(hum ? { humidity: hum } : {}), entities: [...x.devs, ...motion] },
        { type: "grid", columns: 2, square: false, cards: x.devs.map((entity) => ({ type: "custom:roost-tile", entity, size: "small", quick: "button" })) },
      ] });
    }
    for (const entity of h.dom("climate").slice(0, tablet ? 3 : 2)) out.climate.push({ type: "custom:roost-thermostat", entity, ...(tablet ? { compact: true } : {}) });
    for (const entity of h.dom("cover").filter((id) => ["curtain", "blind", "shade", "shutter", undefined].includes(st(id).attributes.device_class)).slice(0, 2)) out.climate.push({ type: "custom:roost-curtain", entity });
    for (const entity of h.dom("media_player").filter((id) => !/_group|browser/i.test(id)).slice(0, 2)) out.media.push({ type: "custom:roost-media", entity });
    for (const entity of h.dom("alarm_control_panel").slice(0, 1)) out.security.push({ type: "custom:roost-alarm", entity });
    for (const entity of h.dom("lock").slice(0, 2)) out.security.push({ type: "custom:roost-lock", entity });
    for (const entity of h.dom("camera").slice(0, tablet ? 4 : 2)) out.security.push({ type: "custom:roost-camera", entity });
    if (people.length) out.info.push({ type: "custom:roost-people", entities: people.slice(0, 6) });
    if (weather) out.info.push({ type: "custom:roost-weather", entity: weather });
    const readings = [...h.cls("sensor", "temperature").slice(0, 2), ...h.cls("sensor", "humidity").slice(0, 2), ...h.cls("sensor", ["carbon_dioxide", "pm25", "aqi"]).slice(0, 2)];
    if (readings.length) out.info.push({ type: "custom:roost-sensors", columns: 2, entities: readings.slice(0, 6) });
    const todo = h.dom("todo")[0], cal = h.dom("calendar")[0];
    if (cal) out.info.push({ type: "custom:roost-agenda", entities: h.dom("calendar").slice(0, 3) });
    if (todo) out.info.push({ type: "custom:roost-todo", entity: todo });
    for (const entity of h.dom("vacuum").slice(0, 1)) out.care.push({ type: "custom:roost-vacuum", entity });
    if (h.cls("sensor", "battery").length || h.cls("binary_sensor", "battery").length) out.care.push({ type: "custom:roost-batteries", show: "all", max: 6 });
    out.care.push({ type: "custom:roost-timeline", max: 6 });
    return out;
  },

  phone(hass, config = {}) {
    const o = this.cards(hass, false, config), sec = (cards) => ({ type: "grid", cards });
    const home = [sec(o.top), sec(o.rooms), sec([...o.climate, ...o.media]), sec(o.security), sec([...o.info, ...o.care])].filter((s) => s.cards.length);
    const views = [{ title: "Home", path: "home", icon: "mdi:home-variant", type: "sections", max_columns: 1, sections: home }];
    if (o.perRoom.length) views.push({ title: "Rooms", path: "rooms", icon: "mdi:view-grid", type: "sections", max_columns: 1, sections: o.perRoom.map((r) => ({ type: "grid", cards: [{ type: "custom:roost-title", title: r.area.name }, ...r.cards] })) });
    return { title: "Roost Home", views };
  },

  tablet(hass, config = {}) {
    const o = this.cards(hass, true, config), sec = (cards) => ({ type: "grid", cards });
    const left = [{ type: "custom:roost-fullscreen", mode: "button" }, ...o.top, ...o.info];
    const sections = [sec(left), sec(o.rooms), sec([...o.climate, ...o.media]), sec([...o.security, ...o.care])].filter((s) => s.cards.length);
    return { title: "Roost Tablet", views: [{ title: "Home", path: "home", icon: "mdi:tablet-dashboard", type: "sections", max_columns: 4, dense_section_placement: true, sections },
      ...(o.perRoom.length ? [{ title: "Rooms", path: "rooms", icon: "mdi:view-grid", type: "sections", max_columns: 4, sections: o.perRoom.map((r) => ({ type: "grid", cards: [{ type: "custom:roost-title", title: r.area.name }, ...r.cards] })) }] : [])] };
  },

  // once, for an admin: "make two dashboards from your home?"
  async welcome(tries = 0) {
    const h = document.querySelector("home-assistant")?.hass;
    if (!h?.user && tries < 5) { setTimeout(() => this.welcome(tries + 1), 6000); return; }
    if (!h?.user?.is_admin || !h.callWS) return;
    try {
      const seen = await h.callWS({ type: "frontend/get_user_data", key: "roost_welcome" });
      if (seen?.value) return;
      const list = await h.callWS({ type: "lovelace/dashboards/list" });
      if (list.some((d) => ["roost-home", "roost-home-tablet"].includes(d.url_path))) { await h.callWS({ type: "frontend/set_user_data", key: "roost_welcome", value: { at: Date.now(), made: false } }); return; }
      RoostPop.setHass(h);
      const yes = await RoostPop.confirm("Roost can make two dashboards from your own rooms and devices, one for phones and one for tablets. They stay up to date by themselves, and you can delete them any time.", { title: "Roost Cards is ready", icon: "mdi:home-heart", yes: "Make them", no: "Not now" });
      await h.callWS({ type: "frontend/set_user_data", key: "roost_welcome", value: { at: Date.now(), made: !!yes } });
      if (!yes) return;
      for (const [url, title, icon, type] of [["roost-home", "Roost Home", "mdi:home-heart", "custom:roost"], ["roost-home-tablet", "Roost Tablet view", "mdi:tablet-dashboard", "custom:roost-tablet"]]) {
        await h.callWS({ type: "lovelace/dashboards/create", url_path: url, title, icon, show_in_sidebar: true, require_admin: false });
        await h.callWS({ type: "lovelace/config/save", url_path: url, config: { strategy: { type } } });
      }
      RoostPop.open({ id: "roost-welcome-done", kind: "info", title: "Your Roost dashboards are ready", icon: "mdi:check-circle", message: "Find “Roost Home” and “Roost Tablet view” in the sidebar.", close_after: 8, buttons: [{ name: "Open Roost Home", icon: "mdi:arrow-right", color: "active", tap_action: { action: "navigate", navigation_path: "/roost-home/home" }, close: true }] });
    } catch (e) { /* older Home Assistant: no harm, just no offer */ }
  },
};

class RoostStrategy extends HTMLElement {
  static async generate(config, hass) { return RoostAuto.phone(hass, config || {}); }

  static getCreateSuggestions() { return { title: "Roost Home", icon: "mdi:home-heart" }; }
}
class RoostStrategyTablet extends HTMLElement {
  static async generate(config, hass) { return RoostAuto.tablet(hass, config || {}); }

  static getCreateSuggestions() { return { title: "Roost Tablet", icon: "mdi:tablet-dashboard" }; }
}

// ------------------------------------------------------------------ Roost Medicine
// Today's doses as pills to tick off, the next dose with a countdown, and a red one if a dose was missed.
class RoostMedicine extends ticking(RoostBase, 60000) {
  static get defaults() { return { doses: [], color: "teal", theme: "auto" }; }

  validate(c) { if (!(c.doses || []).length) throw new Error("Add the doses"); }

  watched() { return (this._config.doses || []).map((d) => d.entity).filter(Boolean); }

  static getConfigForm() {
    return { schema: [
      { name: "name", label: "Whose (for example Grandma)", selector: { text: {} } },
      { name: "doses", label: "Doses", selector: { object: { multiple: true, label_field: "name", fields: {
        name: { label: "Medicine", required: true, selector: { text: {} } }, time: { label: "Time (HH:MM)", required: true, selector: { text: {} } },
        entity: { label: "Taken (an input_boolean; an automation turns it off at midnight)", selector: { entity: { domain: ["input_boolean", "counter"] } } },
        colour: { label: "Colour", selector: { select: { mode: "dropdown", options: Object.keys(COLORS) } } },
      } } } },
      ...colourFields("color"), THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig() { return { name: "", doses: [{ name: "Vitamin D", time: "08:00", colour: "amber" }, { name: "Blood pressure", time: "14:00", colour: "blue" }, { name: "Evening tablet", time: "21:00", colour: "purple" }] }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  taken(d, i) {
    if (d.entity) { const s = this.sx(d.entity); return s ? (s.entity_id.startsWith("counter.") ? Number(s.state) > 0 : s.state === "on") : false; }
    try { return localStorage.getItem(`roost-med:${new Date().toDateString()}:${i}:${d.name}`) === "1"; } catch (e) { return false; }
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour(), now = new Date(), nowM = now.getHours() * 60 + now.getMinutes();
    const mins = (t) => { const m = String(t || "").match(/^(\d{1,2}):(\d{2})/); return m ? +m[1] * 60 + +m[2] : 0; };
    const doses = (c.doses || []).map((d, i) => ({ ...d, i, at: mins(d.time), ok: this.taken(d, i) })).sort((a, b) => a.at - b.at);
    const missed = doses.filter((d) => !d.ok && nowM > d.at + 60), next = doses.find((d) => !d.ok && d.at + 60 >= nowM);
    const done = doses.filter((d) => d.ok).length;
    const line = missed.length ? `Missed: ${missed.map((d) => d.name).join(", ")}` : next ? `Next: ${next.name} ${next.at <= nowM ? "now" : `in ${minsText(next.at - nowM)}`}` : done === doses.length ? "All taken today" : "";
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, !missed.length)}
      .ds{display:flex;flex-direction:column;gap:8px}
      .d{display:grid;grid-template-columns:54px minmax(0,1fr) auto;align-items:center;gap:12px;padding:10px 12px;border-radius:16px;background:${p.inset};border:0;color:${p.text};font:inherit;text-align:left;cursor:pointer}
      .d.miss{box-shadow:inset 0 0 0 1.5px #F43F6B}
      .pill{position:relative;width:54px;height:24px;border-radius:12px;overflow:hidden;border:2px solid var(--c);transform:rotate(-20deg)}
      .pill i{position:absolute;left:0;top:0;bottom:0;width:50%;background:var(--c)}
      .pill b{position:absolute;right:0;top:0;bottom:0;width:50%;background:${this.dark ? "#EEF0FF" : "#fff"};opacity:.85}
      .d.ok .pill{opacity:.4}
      .d .nm b{display:block;font-size:14px;font-weight:600}.d .nm span{font-size:12px;color:${p.muted}}
      .ck{width:30px;height:30px;border-radius:50%;border:2px solid color-mix(in srgb, ${p.muted} 55%, transparent);display:flex;align-items:center;justify-content:center;--mdc-icon-size:18px;color:transparent}
      .d.ok .ck{background:linear-gradient(135deg,${g[0]},${g[1]});border-color:transparent;color:${g[3]}}
      .d.ok .nm b{text-decoration:line-through;opacity:.6}
      .prog{height:6px;border-radius:3px;background:${p.track};overflow:hidden}.prog i{display:block;height:100%;background:linear-gradient(90deg,${g[0]},${g[1]})}
    </style>
    <div class="card">
      ${head("mdi:pill", c.name ? `${c.name}'s medicine` : "Medicine", line)}
      <div class="prog" aria-label="${done} of ${doses.length} taken"><i data-bar="md" style="width:${doses.length ? Math.round((done / doses.length) * 100) : 0}%"></i></div>
      <div class="ds">${doses.map((d) => { const col = (COLORS[d.colour] || g)[1]; return `<button class="d ${d.ok ? "ok" : ""} ${missed.includes(d) ? "miss" : ""}" data-d="${d.i}" aria-pressed="${d.ok}" data-pop="${d.ok ? 1 : 0}" data-popkey="m${d.i}">
        <span class="pill" style="--c:${col}"><i></i><b></b></span><span class="nm"><b class="t">${esc(d.name)}</b><span class="t">${esc(d.time)}${missed.includes(d) ? " · missed" : d.ok ? " · taken" : ""}</span></span><span class="ck"><ha-icon icon="mdi:check"></ha-icon></span></button>`; }).join("")}</div>
    </div>`;
    this.shadowRoot.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", () => {
      this.vibrate(); const d = c.doses[+b.dataset.d], i = +b.dataset.d;
      if (d.entity) { const dm = d.entity.split(".")[0]; this.call(dm, dm === "counter" ? "increment" : "toggle", { entity_id: d.entity }); return; }
      try { const k = `roost-med:${new Date().toDateString()}:${i}:${d.name}`; localStorage.setItem(k, localStorage.getItem(k) === "1" ? "0" : "1"); } catch (e) { /* private mode */ }
      this._sig = null; this.render(); this.motion();
    }));
  }
}

// ------------------------------------------------------------------ Roost Modes
// House modes in one place: Home, Away, Holiday, Guests. Away checks that doors are locked and windows shut; Guests shows a Wi-Fi code to scan.
class RoostModes extends RoostBase {
  static get defaults() { return { modes: [], color: "active", theme: "auto" }; }

  validate(c) { if (!(c.modes || []).length) throw new Error("Add the house modes"); }

  watched() { const c = this._config; return (c.modes || []).flatMap((m) => [m.entity, ...(m.checks || [])]).filter(Boolean); }

  static getConfigForm() {
    return { schema: [
      { name: "name", selector: { text: {} } },
      { name: "modes", label: "Modes", selector: { object: { multiple: true, label_field: "name", fields: {
        name: { label: "Name", required: true, selector: { text: {} } }, icon: { label: "Icon", selector: { icon: {} } },
        entity: { label: "Mode switch (input_boolean) or a scene/script to run", selector: { entity: { domain: ["input_boolean", "switch", "scene", "script", "input_select"] } } },
        checks: { label: "Check these are closed, locked or off when the mode is on", selector: { entity: { multiple: true } } },
        wifi_name: { label: "Guest Wi-Fi name (shows a code to scan)", selector: { text: {} } },
        wifi_password: { label: "Guest Wi-Fi password", selector: { text: {} } },
      } } } },
      ...colourFields("color"), THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig() { return { modes: [{ name: "Home", icon: "mdi:home" }, { name: "Away", icon: "mdi:walk" }, { name: "Holiday", icon: "mdi:airplane" }, { name: "Guests", icon: "mdi:account-multiple" }] }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  isOn(m) { const s = this.sx(m.entity); if (!s) return !!this._local?.[m.name]; if (s.entity_id.startsWith("input_select.")) return s.state === m.name; return s.state === "on"; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour();
    const modes = (c.modes || []).map((m, i) => ({ ...m, i, on: this.isOn(m) }));
    const active = modes.filter((m) => m.on);
    const okState = (s) => ["off", "closed", "locked", "not_home", "idle", "standby", "docked"].includes(s.state);
    const issues = active.flatMap((m) => (m.checks || []).map((id) => this.sx(id)).filter((s) => s && !okState(s)));
    const guest = active.find((m) => m.wifi_name);
    const line = active.length ? `${active.map((m) => m.name).join(" + ")}${issues.length ? ` · ${issues.length} thing${issues.length > 1 ? "s" : ""} to check` : active.some((m) => (m.checks || []).length) ? " · all secure" : ""}` : "No mode on";
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, active.length > 0)}
      .ms{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px}
      .m{min-height:84px;padding:12px;border-radius:18px;border:1px solid ${p.border};background:${p.off};color:${p.text};font:inherit;text-align:left;cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;gap:8px}
      .m ha-icon{--mdc-icon-size:24px}
      .m b{font-size:14px;font-weight:600}
      .m.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};border-color:transparent;box-shadow:0 12px 24px -12px ${g[2]}}
      .chk{display:flex;flex-direction:column;gap:6px}
      .ci{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:12px;background:${p.inset};font-size:13px;cursor:pointer}
      .ci ha-icon{--mdc-icon-size:18px}
      .ci.bad ha-icon{color:#FF9F6B}.ci.good ha-icon{color:#34D399}
      .ci span{flex:1}.ci em{font-style:normal;color:${p.muted};font-size:12px}
      .wifi{display:grid;grid-template-columns:120px minmax(0,1fr);gap:14px;align-items:center;padding:12px;border-radius:16px;background:${p.inset}}
      .wifi .qr{width:120px;height:120px;border-radius:10px;overflow:hidden;background:#fff}
      .wifi .qr svg{width:100%;height:100%;display:block}
      .wifi b{display:block;font-size:15px}.wifi span{font-size:13px;color:${p.muted};overflow-wrap:anywhere}
    </style>
    <div class="card">
      ${head(active[0]?.icon || "mdi:home-switch-outline", c.name || "House mode", line)}
      <div class="ms">${modes.map((m) => `<button class="m ${m.on ? "on" : ""}" data-m="${m.i}" aria-pressed="${m.on}" data-pop="${m.on ? 1 : 0}" data-popkey="md${m.i}"><ha-icon icon="${esc(m.icon || "mdi:star-four-points")}"></ha-icon><b class="t">${esc(m.name)}</b></button>`).join("")}</div>
      ${active.some((m) => (m.checks || []).length) ? `<div class="chk">${active.flatMap((m) => (m.checks || []).map((id) => this.sx(id)).filter(Boolean)).map((s) => `<div class="ci ${okState(s) ? "good" : "bad"}" data-e="${esc(s.entity_id)}"><ha-icon icon="${okState(s) ? "mdi:check-circle" : "mdi:alert-circle"}"></ha-icon><span class="t">${esc(s.attributes.friendly_name || s.entity_id)}</span><em class="t">${esc(String(s.state).replace(/_/g, " "))}</em></div>`).join("")}</div>` : ""}
      ${guest ? `<div class="wifi"><div class="qr">${qrSvg(`WIFI:T:${guest.wifi_password ? "WPA" : "nopass"};S:${wifiEsc(guest.wifi_name)};${guest.wifi_password ? `P:${wifiEsc(guest.wifi_password)};` : ""};`, "#161936", "#FFFFFF")}</div>
        <div><b class="t">Guest Wi-Fi</b><span class="t">Scan with the phone camera to join “${esc(guest.wifi_name)}”.</span></div></div>` : ""}
    </div>`;
    const r = this.shadowRoot;
    r.querySelectorAll("[data-e]").forEach((el) => el.addEventListener("click", () => this.moreInfo(el.dataset.e)));
    r.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => {
      this.vibrate(); const m = c.modes[+b.dataset.m], s = this.sx(m.entity);
      if (!s) { this._local = { ...(this._local || {}), [m.name]: !this._local?.[m.name] }; this._sig = null; this.render(); this.motion(); return; }
      const d = m.entity.split(".")[0];
      if (d === "input_select") this.call("input_select", "select_option", { entity_id: m.entity, option: m.name });
      else if (d === "scene" || d === "script") this.call(d, "turn_on", { entity_id: m.entity });
      else this.call(d, "toggle", { entity_id: m.entity });
    }));
  }
}

// ------------------------------------------------------------------ Roost Sleep
// The night as an arc from bedtime to the alarm with the moon moving along it, a "good night" button, and how last night went.
class RoostSleep extends ticking(RoostBase, 60000) {
  static get defaults() { return { bedtime: "22:30", color: "purple", theme: "auto" }; }

  validate() { /* every part is optional */ }

  watched() { const c = this._config; return [c.alarm, c.duration, c.score, c.temperature, c.routine].filter(Boolean); }

  static getConfigForm() {
    return { schema: [
      { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "bedtime", label: "Bedtime (HH:MM)", selector: { text: {} } }] },
      { type: "grid", name: "", schema: [{ name: "alarm", label: "Wake-up alarm (phone's next alarm, or an input_datetime)", selector: { entity: { domain: ["sensor", "input_datetime"] } } }, { name: "routine", label: "Good-night routine", selector: { entity: { domain: ["scene", "script"] } } }] },
      { type: "grid", name: "", schema: [{ name: "duration", label: "Last night's sleep (h or min)", selector: { entity: { domain: "sensor" } } }, { name: "score", label: "Sleep score", selector: { entity: { domain: "sensor" } } }] },
      { name: "temperature", label: "Bedroom temperature", selector: { entity: { domain: "sensor" } } },
      ...colourFields("color"), THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig() { return { bedtime: "22:30" }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour(), now = new Date();
    const at = (t) => { const m = String(t || "").match(/^(\d{1,2}):(\d{2})/); if (!m) return null; const d = new Date(now); d.setHours(+m[1], +m[2], 0, 0); return d; };
    let bed = at(c.bedtime) || at("22:30");
    const al = this.sx(c.alarm);
    let wake = null;
    if (al && !UNAVAILABLE.includes(al.state)) { if (al.entity_id.startsWith("input_datetime.")) wake = al.attributes.timestamp ? new Date(al.attributes.timestamp * 1000) : at(al.state); else { const d = new Date(al.state); wake = isNaN(d) ? null : d; } }
    if (!wake) { wake = at("06:30"); }
    if (wake < bed) wake = new Date(wake.getTime() + 86400e3);
    if (wake - bed > 86400e3) wake = new Date(wake.getTime() - 86400e3);
    if (now > wake) { bed = new Date(bed.getTime() + 86400e3); wake = new Date(wake.getTime() + 86400e3); }
    const night = now >= bed && now <= wake, f = night ? (now - bed) / (wake - bed) : now < bed ? 0 : 1;
    const hours = (wake - Math.max(now, bed)) / 3600e3, toBed = (bed - now) / 60000;
    const tm = (d) => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const dur = (() => { const s = this.sx(c.duration), v = this.n(c.duration); if (v == null) return ""; const u = s.attributes.unit_of_measurement; const h = u === "min" ? v / 60 : u === "s" ? v / 3600 : v; return minsText(h * 60); })();
    const line = night ? `Sleeping · alarm ${tm(wake)}` : toBed > 0 && toBed < 120 ? `Bedtime in ${minsText(toBed)}` : `Bedtime ${tm(bed)}`;
    const a0 = Math.PI, a = a0 + f * Math.PI, mx = 110 + 90 * Math.cos(a), my = 100 + 90 * Math.sin(a);
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, night)}
      .arc{position:relative}
      .arc svg{width:100%;height:auto;display:block}
      .moon{filter:drop-shadow(0 0 10px rgba(253,230,138,.7))}
      .times{display:flex;justify-content:space-between;font-size:12px;color:${p.muted};margin-top:-6px}
      .times b{display:block;font-size:17px;color:${p.text};font-family:${FONT_NUM}}
      .times div:last-child{text-align:right}
    </style>
    <div class="card">
      ${head(night ? "mdi:sleep" : "mdi:bed-clock", c.name || "Sleep", line)}
      <div class="arc" role="img" aria-label="${esc(line)}"><svg viewBox="0 0 220 110" aria-hidden="true">
        <defs><linearGradient id="slg" x1="0" x2="1"><stop offset="0" stop-color="#38287E"/><stop offset=".5" stop-color="#1B1E52"/><stop offset="1" stop-color="#F59E6B"/></linearGradient></defs>
        ${Array.from({ length: 14 }, (_, k) => `<circle cx="${(20 + ((k * 53) % 180)).toFixed(0)}" cy="${(14 + ((k * 37) % 70)).toFixed(0)}" r="${k % 3 ? 1 : 1.6}" fill="${this.dark ? "#fff" : "#8B6CFF"}" style="animation:roost-twinkle ${2 + (k % 4)}s ease-in-out ${k * 0.3}s infinite"/>`).join("")}
        <path d="M20 100 A90 90 0 0 1 200 100" fill="none" stroke="${p.track}" stroke-width="6" stroke-linecap="round"/>
        <path d="M20 100 A90 90 0 0 1 200 100" fill="none" stroke="url(#slg)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${(Math.PI * 90 * f).toFixed(1)} 999"/>
        <g class="moon" transform="translate(${mx.toFixed(1)} ${my.toFixed(1)})"><circle r="11" fill="#FDE68A"/><circle cx="5" cy="-4" r="9" fill="${this.dark ? "#141831" : "#EEF0FA"}"/></g>
        <text x="110" y="92" text-anchor="middle" font-size="22" font-weight="700" fill="${p.text}" style="font-family:${FONT_NUM}">${esc(fmt(hours, 1))} h</text>
        <text x="110" y="106" text-anchor="middle" font-size="9" fill="${p.muted}">of sleep until the alarm</text></svg>
        <div class="times"><div>Bedtime<b>${esc(tm(bed))}</b></div><div>Alarm<b>${esc(tm(wake))}</b></div></div></div>
      <div class="stat">${stat("Last night", dur)}${stat("Sleep score", this.val(c.score))}${stat("Bedroom", this.val(c.temperature))}</div>
      ${c.routine ? '<button class="big" data-gn="1"><ha-icon icon="mdi:weather-night"></ha-icon>Good night</button>' : ""}
    </div>`;
    this.shadowRoot.querySelector("[data-ic]").addEventListener("click", () => this.moreInfo(c.alarm || c.duration));
    this.shadowRoot.querySelector("[data-gn]")?.addEventListener("click", () => { this.vibrate(); this.call(c.routine.split(".")[0], "turn_on", { entity_id: c.routine }); });
  }
}

// ------------------------------------------------------------------ Roost Grocy
// The kitchen from Grocy: what is about to go off in the fridge, the shopping list, chores, tasks and the meal plan.
// It reads the Grocy integration's sensors (they are off by default: turn them on in Settings, Devices, Grocy).
const GROCY = { stock: "sensor.grocy_stock", shopping: "sensor.grocy_shopping_list", chores: "sensor.grocy_chores", tasks: "sensor.grocy_tasks", meals: "sensor.grocy_meal_plan",
  expiring: "binary_sensor.grocy_expiring_products", expired: "binary_sensor.grocy_expired_products", missing: "binary_sensor.grocy_missing_products" };
const dayOf = (v) => { const m = String(v || "").match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
const daysTo = (v) => { const d = dayOf(v); if (!d) return null; const t = new Date(); t.setHours(0, 0, 0, 0); return Math.round((d - t) / 864e5); };
const daysWord = (n, past = "late") => (n == null ? "" : n === 0 ? "today" : n === 1 ? "tomorrow" : n === -1 ? `1 day ${past}` : n < 0 ? `${-n} days ${past}` : `in ${n} days`);

class RoostGrocy extends ticking(RoostBase, 60000) {
  static get defaults() { return { tabs: ["fridge", "shopping", "chores", "tasks", "meals"], soon: 5, max_items: 6, color: "green", theme: "auto" }; }

  ent(k) { const c = this._config; return c[k] || (this._hass?.states[GROCY[k]] ? GROCY[k] : undefined); }

  watched() { return Object.keys(GROCY).map((k) => this.ent(k)).filter(Boolean); }

  extraSignature() { return `${this._tab || ""}|${this._sure || ""}|${(this._gone || []).join(",")}`; }

  static getConfigForm() {
    const s = (d) => ({ entity: { domain: d } });
    return { schema: [
      { name: "name", label: "Title (for example Kitchen)", selector: { text: {} } },
      { name: "tabs", label: "What to show, in this order", selector: { select: { multiple: true, reorder: true, mode: "list", options: [
        { value: "fridge", label: "Fridge: what goes off soon" }, { value: "shopping", label: "Shopping list" }, { value: "chores", label: "Chores" }, { value: "tasks", label: "Tasks" }, { value: "meals", label: "Meal plan" }] } } },
      { type: "expandable", name: "", title: "Grocy sensors (found by themselves when they have the usual names)", icon: "mdi:fridge-outline", schema: [
        { type: "grid", name: "", schema: [{ name: "stock", label: "Stock", selector: s("sensor") }, { name: "shopping", label: "Shopping list", selector: s("sensor") }] },
        { type: "grid", name: "", schema: [{ name: "chores", label: "Chores", selector: s("sensor") }, { name: "tasks", label: "Tasks", selector: s("sensor") }] },
        { type: "grid", name: "", schema: [{ name: "meals", label: "Meal plan", selector: s("sensor") }, { name: "expiring", label: "Expiring products", selector: s("binary_sensor") }] },
        { type: "grid", name: "", schema: [{ name: "expired", label: "Expired products", selector: s("binary_sensor") }, { name: "missing", label: "Missing products", selector: s("binary_sensor") }] },
      ] },
      { type: "expandable", name: "", title: "Details", icon: "mdi:tune", schema: [
        { type: "grid", name: "", schema: [{ name: "soon", label: "“Goes off soon” means within (days)", selector: slider(1, 14) }, { name: "max_items", label: "Rows to show", selector: slider(3, 15) }] },
        { type: "grid", name: "", schema: [{ name: "done_by", label: "Grocy user number who does the chores", selector: { number: { mode: "box", min: 1 } } }, { name: "list_id", label: "Shopping list number", selector: { number: { mode: "box", min: 1 } } }] },
      ] },
      ...colourFields("color"), THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig() { return { name: "Kitchen" }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  list(k, attr) { const s = this.sx(this.ent(k)); const v = s?.attributes?.[attr]; return Array.isArray(v) ? v : []; }

  data() {
    const c = this._config, soon = Number(c.soon) || 5, gone = this._gone || [];
    const byName = new Map();
    [...this.list("stock", "products"), ...this.list("expiring", "expiring_products"), ...this.list("expired", "expired_products")]
      .forEach((x) => { if (x && x.name && x.best_before_date && !byName.has(x.id ?? x.name)) byName.set(x.id ?? x.name, x); });
    const fridge = [...byName.values()].map((x) => ({ ...x, left: daysTo(x.best_before_date) }))
      .filter((x) => x.left != null && x.left <= soon && x.left > -400 && Number(x.available_amount ?? 1) > 0).sort((a, b) => a.left - b.left);
    const shopping = this.list("shopping", "products").filter((x) => !gone.includes(`s${x.id}`))
      .map((x) => ({ ...x, label: x.product?.name || x.note || "Item" }));
    const chores = this.list("chores", "chores").filter((x) => !gone.includes(`c${x.id}`))
      .map((x) => ({ ...x, left: daysTo(x.next_estimated_execution_time) })).sort((a, b) => (a.left ?? 999) - (b.left ?? 999));
    const tasks = this.list("tasks", "tasks").filter((x) => !gone.includes(`t${x.id}`) && !Number(x.done))
      .map((x) => ({ ...x, left: daysTo(x.due_date) })).sort((a, b) => (a.left ?? 999) - (b.left ?? 999));
    const meals = this.list("meals", "meals").map((x) => ({ ...x, left: daysTo(x.day), label: x.recipe?.name || x.product?.name || x.note || "Meal" }))
      .filter((x) => x.left != null && x.left >= 0).sort((a, b) => a.left - b.left);
    const missing = this.list("missing", "missing_products");
    return { fridge, shopping, chores, tasks, meals, missing };
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour(), d = this.data(), max = Number(c.max_items) || 6;
    const have = { fridge: this.ent("stock") || this.ent("expiring") || this.ent("expired"), shopping: this.ent("shopping"), chores: this.ent("chores"), tasks: this.ent("tasks"), meals: this.ent("meals") };
    const tabs = (c.tabs || []).filter((t) => have[t]);
    if (!tabs.length) { this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, false)}</style><div class="card">${head("mdi:fridge-outline", c.name || "Kitchen", "Turn on the Grocy sensors in Settings, Devices, Grocy")}</div>`; return; }
    if (!tabs.includes(this._tab)) this._tab = tabs[0];
    const tab = this._tab, expired = d.fridge.filter((x) => x.left < 0).length, soonN = d.fridge.length - expired;
    const late = d.chores.filter((x) => x.left != null && x.left < 0).length + d.tasks.filter((x) => x.left != null && x.left < 0).length;
    const line = [expired ? `${expired} gone off` : "", soonN ? `${soonN} to use soon` : "", d.shopping.length ? `${d.shopping.length} to buy` : "", late ? `${late} late` : ""].filter(Boolean).join(" · ") || "All in order";
    const count = { fridge: d.fridge.length, shopping: d.shopping.length, chores: d.chores.filter((x) => x.left != null && x.left <= 0).length, tasks: d.tasks.length, meals: 0 };
    const label = { fridge: "Fridge", shopping: "Shopping", chores: "Chores", tasks: "Tasks", meals: "Meals" };
    const icon = { fridge: "mdi:fridge-outline", shopping: "mdi:cart-outline", chores: "mdi:broom", tasks: "mdi:checkbox-marked-circle-outline", meals: "mdi:silverware-fork-knife" };
    const chip = (n, past) => { const bad = n < 0, warn = n <= 1; return `<span class="when ${bad ? "bad" : warn ? "warn" : ""}">${esc(daysWord(n, past))}</span>`; };
    const sure = (k) => this._sure && this._sure.k === k && Date.now() - this._sure.t < 4000;
    const row = (k, ic, name, sub, right, kind) => `<button class="it ${kind || ""} ${sure(k) ? "sure" : ""}" data-k="${esc(k)}"><span class="bx"><ha-icon icon="${ic}"></ha-icon></span><span class="nm"><b class="t">${esc(name)}</b>${sub ? `<span class="t">${esc(sub)}</span>` : ""}</span>${right}</button>`;
    const amt = (v) => { const n = Number(v); return Number.isFinite(n) && n ? fmt(n, n % 1 ? 1 : 0) : ""; };
    let body = "";
    if (tab === "fridge") {
      body = d.fridge.slice(0, max).map((x) => row(`f${x.id}`, x.left < 0 ? "mdi:emoticon-sick-outline" : "mdi:food-apple-outline", x.name, amt(x.available_amount) ? `${amt(x.available_amount)} in stock` : "", chip(x.left, "ago"), x.left < 0 ? "off" : "")).join("")
        || `<div class="empty">Nothing goes off in the next ${Number(c.soon) || 5} days</div>`;
      if (d.missing.length) body += `<button class="add" data-miss="1"><ha-icon icon="mdi:cart-plus"></ha-icon><span class="t">${d.missing.length} running low · add to the shopping list</span></button>`;
    } else if (tab === "shopping") {
      body = d.shopping.slice(0, max).map((x) => row(`s${x.id}`, "mdi:checkbox-blank-circle-outline", x.label, x.note && x.product ? x.note : "", amt(x.amount) ? `<span class="q num">${amt(x.amount)}</span>` : "", "shop")).join("") || `<div class="empty">The shopping list is empty</div>`;
    } else if (tab === "chores" || tab === "tasks") {
      const xs = d[tab];
      body = xs.slice(0, max).map((x) => {
        const who = (tab === "chores" ? x.next_execution_assigned_user : x.assigned_to_user)?.display_name;
        return row(`${tab[0]}${x.id}`, sure(`${tab[0]}${x.id}`) ? "mdi:check" : tab === "chores" ? "mdi:broom" : "mdi:checkbox-blank-circle-outline", x.name, sure(`${tab[0]}${x.id}`) ? "Tap again to mark it done" : who || "", x.left != null ? chip(x.left) : "", "job");
      }).join("") || `<div class="empty">${tab === "chores" ? "No chores" : "No tasks"} to do</div>`;
    } else if (tab === "meals") {
      const days = [...new Set(d.meals.map((x) => x.left))].slice(0, 4);
      body = days.map((n) => `<div class="day"><span class="dl t">${n === 0 ? "Today" : n === 1 ? "Tomorrow" : esc(dayOf(d.meals.find((x) => x.left === n).day).toLocaleDateString(undefined, { weekday: "long" }))}</span>${d.meals.filter((x) => x.left === n).map((x) => `<span class="ml t"><ha-icon icon="mdi:silverware-fork-knife"></ha-icon>${esc(x.label)}${x.section?.name ? `<i>${esc(x.section.name)}</i>` : ""}</span>`).join("")}</div>`).join("") || `<div class="empty">Nothing planned</div>`;
    }
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}${headCss(p, g, !expired && !late)}${this.menuCss()}
      .tb{display:flex;gap:2px;padding:4px;border-radius:16px;background:${p.inset};overflow-x:auto;scrollbar-width:none}
      .tb button{flex:0 0 auto;display:flex;align-items:center;justify-content:center;gap:6px;min-height:36px;padding:0 8px;border:0;border-radius:12px;background:none;color:${p.muted};font:inherit;font-size:13px;font-weight:600;cursor:pointer;--mdc-icon-size:18px}
      .tb button.on{flex:1 0 auto;background:${p.panel};color:${p.text};box-shadow:0 0 0 1px ${p.border}}
      .tb .n{min-width:18px;height:18px;padding:0 4px;border-radius:9px;background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};font-size:11px;line-height:18px}
      .tb button:not(.on) .lb{display:none}
      @container (max-width: 360px){:host .tb button{flex:1 1 auto;padding:0 6px}:host .tb button:not(.on) .n{font-size:0;min-width:8px;width:8px;height:8px;padding:0;align-self:flex-start;margin-top:6px}}
      .ls{display:flex;flex-direction:column;gap:6px}
      .it{display:grid;grid-template-columns:36px minmax(0,1fr) auto;align-items:center;gap:12px;padding:8px 10px;border-radius:14px;background:${p.inset};border:0;color:${p.text};font:inherit;text-align:left;cursor:pointer;min-height:52px;transition:transform .12s}
      .it:active{transform:scale(.98)}
      .bx{width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:${g[0]}24;color:${g[this.dark ? 1 : 0]};--mdc-icon-size:20px}
      .it.off .bx{background:#F43F6B24;color:#F43F6B}
      .it.sure{box-shadow:inset 0 0 0 1.5px ${g[0]}}.it.sure .bx{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]}}
      .nm b{display:block;font-size:14px;font-weight:600}.nm span{display:block;font-size:12px;color:${p.muted}}
      .when{font-size:12px;font-weight:600;padding:4px 8px;border-radius:10px;background:${p.track};color:${p.muted};white-space:nowrap}
      .when.warn{background:#FCD34D2E;color:${this.dark ? "#FCD34D" : "#A16207"}}.when.bad{background:#F43F6B24;color:#F43F6B}
      .q{font-size:13px;font-weight:700;color:${p.muted};padding:0 4px}
      .empty{padding:18px 8px;text-align:center;font-size:13px;color:${p.muted}}
      .add{display:flex;align-items:center;gap:10px;justify-content:center;min-height:44px;border-radius:14px;border:1.5px dashed ${p.border};background:none;color:${p.text};font:inherit;font-size:13px;font-weight:600;cursor:pointer;--mdc-icon-size:18px}
      .day{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border-radius:14px;background:${p.inset}}
      .dl{font-size:12px;font-weight:700;color:${p.muted};text-transform:uppercase;letter-spacing:.5px}
      .ml{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;--mdc-icon-size:16px}.ml ha-icon{color:${g[this.dark ? 1 : 0]}}.ml i{font-style:normal;font-weight:500;font-size:12px;color:${p.muted};margin-left:auto}
    </style>
    <div class="card">
      ${head("mdi:fridge-outline", c.name || "Kitchen", line)}
      ${tabs.length > 1 ? `<div class="tb" role="tablist">${tabs.map((t) => `<button role="tab" class="${t === tab ? "on" : ""}" aria-selected="${t === tab}" data-tab="${t}" aria-label="${label[t]}"><ha-icon icon="${icon[t]}"></ha-icon><span class="lb">${label[t]}</span>${count[t] ? `<span class="n num">${count[t]}</span>` : ""}</button>`).join("")}</div>` : ""}
      <div class="ls">${body}</div>
      <div class="menu" role="menu" hidden></div>
    </div>`;
    const r = this.shadowRoot;
    r.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => { this.vibrate(); this._tab = b.dataset.tab; this._sure = null; this._sig = null; this.render(); }));
    r.querySelector("[data-miss]")?.addEventListener("click", () => { this.vibrate(); this.grocy("add_missing_products_to_shopping_list", c.list_id ? { list_id: String(c.list_id) } : {}); });
    r.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => this.tap(b.dataset.k, d)));
  }

  // Shopping: tick it off. Chores and tasks: tap twice. Fridge: a small menu to use it, open it or throw it away.
  tap(k, d) {
    const c = this._config, kind = k[0], id = k.slice(1), num0 = Number(id), pid = Number.isFinite(num0) ? num0 : id;
    this.vibrate();
    const gone = () => { (this._gone = this._gone || []).push(k); this._sure = null; this._sig = null; this.render(); };
    if (kind === "s") {
      const x = d.shopping.find((v) => String(v.id) === id); if (!x) return;
      gone(); this.grocy("remove_product_in_shopping_list", { product_id: x.product_id, amount: Number(x.amount) || 1, ...(c.list_id ? { list_id: String(c.list_id) } : {}) });
      return;
    }
    if (kind === "c" || kind === "t") {
      if (!(this._sure && this._sure.k === k && Date.now() - this._sure.t < 4000)) { this._sure = { k, t: Date.now() }; this._sig = null; this.render(); setTimeout(() => { if (this._sure?.k === k) { this._sure = null; this._sig = null; this.render(); } }, 4100); return; }
      gone();
      if (kind === "c") this.grocy("execute_chore", { chore_id: pid, track_execution_now: true, ...(c.done_by ? { done_by: Number(c.done_by) } : {}) });
      else this.grocy("complete_task", { task_id: pid });
      return;
    }
    if (kind === "f") {
      const x = d.fridge.find((v) => String(v.id) === id); if (!x) return;
      this.openMenu(x.name, [
        { label: "Used one", icon: "mdi:silverware-fork-knife", run: () => this.grocy("consume_product_from_stock", { product_id: pid, amount: 1, spoiled: false, transaction_type: "CONSUME" }) },
        { label: "Opened one", icon: "mdi:package-variant", run: () => this.grocy("open_product", { product_id: pid, amount: 1 }) },
        { label: "Went off, throw away", icon: "mdi:delete-outline", run: () => this.grocy("consume_product_from_stock", { product_id: pid, amount: Number(x.available_amount) || 1, spoiled: true, transaction_type: "CONSUME" }) },
      ]);
    }
  }

  grocy(service, data) {
    if (this._config.sample) { Sample.grocy(service, data); return; }
    this.call("grocy", service, data).then((ok) => { if (!ok) { this._gone = []; this._sig = null; this.render(); } });
  }

  set hass(h) { const old = this._hass; super.hass = h; if (old && this._gone?.length && this.watched().some((id) => old.states[id] !== this._hass.states[id])) { this._gone = []; this._sig = null; this.render(); } }
  get hass() { return this._hass; }
}

// ------------------------------------------------------------------ Roost Lock
// A lock (or garage door): slide to open, tap to lock. Says when it is jammed, and can show the door's sensor.
class RoostLock extends RoostBase {
  static get defaults() { return { color: "green", radius: 22, theme: "auto" }; }

  validate(c) { if (!c.entity) throw new Error("Choose a lock or a garage door"); }

  watched() { return [this._config.entity, this._config.door].filter(Boolean); }

  static getConfigForm() {
    return {
      schema: [
        { name: "sample", label: "Show sample data (try the card without the device)", selector: { boolean: {} } },
        { name: "entity", required: true, selector: { entity: { domain: ["lock", "cover"] } } },
        { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "door", label: "Door sensor (optional)", selector: { entity: { domain: "binary_sensor" } } }] },
        ...colourFields("color", "Colour when locked"),
        { type: "grid", name: "", schema: [{ name: "radius", selector: slider(0, 40, 2) }, THEME_FIELD] },
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) { return { entity: Object.keys(hass.states).find((id) => id.startsWith("lock.")) || "" }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, s = this.st(), cover = c.entity.startsWith("cover.");
    const st = s?.state || "missing";
    const shut = cover ? st === "closed" : st === "locked";
    const busy = ["locking", "unlocking", "opening", "closing"].includes(st);
    const jam = st === "jammed";
    const g = jam ? COLORS.coral : shut ? this.colour() : COLORS.amber;
    const ds = this.sx(c.door);
    const word = !s ? "Not found" : jam ? "Jammed" : { locked: "Locked", unlocked: "Unlocked", locking: "Locking", unlocking: "Unlocking", open: "Open", closed: "Closed", opening: "Opening", closing: "Closing" }[st] || st;
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${panelCss(p, c.radius)};padding:16px;display:flex;flex-direction:column;gap:14px}
      .top{display:flex;align-items:center;gap:14px}
      :host{container-type:inline-size}
      @container (max-width: 240px){:host .top{flex-wrap:wrap}:host .tx{flex:1 1 100%}}
      .ic{width:60px;height:60px;border-radius:20px;flex:none;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};box-shadow:0 12px 26px -12px ${g[2]}}
      .ic ha-icon{--mdc-icon-size:30px;${busy ? "animation:roost-pulse .9s ease-in-out infinite" : jam ? "animation:roost-wiggle .6s ease-in-out infinite" : ""}}
      .n{font-size:15px;font-weight:600}
      .w{font-size:20px;font-weight:700}
      .d{font-size:13px;color:${p.muted}}
      .track{position:relative;height:58px;border-radius:999px;background:${p.inset};border:1px solid ${p.border};overflow:hidden;touch-action:none;user-select:none}
      .hint{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:${p.muted};animation:roost-breathe 2.2s ease-in-out infinite}
      .hint{padding-left:50px}
      .short{display:none}
      @container (max-width: 250px){:host .long{display:none}:host .short{display:inline}}
      .knob{position:absolute;left:5px;top:5px;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};display:flex;align-items:center;justify-content:center;cursor:grab;box-shadow:0 6px 16px -6px ${g[2]}}
      .knob ha-icon{--mdc-icon-size:24px}
      .wait{position:relative;height:58px;border-radius:999px;background:${p.inset};border:1px solid ${p.border};overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:${p.muted}}
      .wait::before{content:"";position:absolute;top:0;bottom:0;width:40%;background:linear-gradient(90deg,transparent,${ACTIVE[2]},transparent);opacity:.5;animation:roost-sweep 1.2s linear infinite}
      @keyframes roost-sweep{from{left:-40%}to{left:100%}}
      .lockb{height:52px;border-radius:999px;border:0;background:linear-gradient(135deg,${COLORS.green[0]},${COLORS.green[1]});color:${COLORS.green[3]};font:inherit;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px}
    </style>
    <div class="card">
      <div class="top"><span class="ic" data-pop="${esc(st)}" data-popkey="ic"><ha-icon icon="${cover ? (shut ? "mdi:garage-variant-lock" : "mdi:garage-open-variant") : shut ? "mdi:lock" : jam ? "mdi:lock-alert" : "mdi:lock-open-variant"}"></ha-icon></span>
        <span><div class="n t">${esc(this.name(c.entity, "Lock"))}</div><div class="w t">${esc(word)}</div>${ds ? `<div class="d t">Door ${ds.state === "on" ? "open" : "closed"}</div>` : ""}</span></div>
      ${s && !busy ? (shut ? `<div class="track"><span class="hint"><span class="long">Slide to ${cover ? "open" : "unlock"} ›››</span><span class="short">›››</span></span><span class="knob"><ha-icon icon="mdi:chevron-double-right"></ha-icon></span></div>`
        : `<button class="lockb"><ha-icon icon="${cover ? "mdi:arrow-down" : "mdi:lock"}"></ha-icon>${cover ? "Close" : "Lock"}</button>`) : busy ? `<div class="wait" role="status">${word}</div>` : ""}
    </div>`;
    const r = this.shadowRoot;
    r.querySelector(".lockb")?.addEventListener("click", () => { this.vibrate(); this.call(cover ? "cover" : "lock", cover ? "close_cover" : "lock", { entity_id: c.entity }); });
    const track = r.querySelector(".track"), knob = r.querySelector(".knob");
    if (track && knob) {
      let x0 = null, max = 0;
      knob.addEventListener("pointerdown", (e) => { knob.setPointerCapture(e.pointerId); x0 = e.clientX; max = track.clientWidth - knob.clientWidth - 10; });
      knob.addEventListener("pointermove", (e) => { if (x0 == null) return; knob.style.transform = `translateX(${Math.max(0, Math.min(max, e.clientX - x0))}px)`; });
      knob.addEventListener("pointerup", (e) => {
        if (x0 == null) return;
        const d = e.clientX - x0; x0 = null;
        if (d >= max * 0.85) { this.vibrate(30); this.call(cover ? "cover" : "lock", cover ? "open_cover" : "unlock", { entity_id: c.entity }); }
        else { try { knob.animate([{ transform: knob.style.transform }, { transform: "translateX(0)" }], { duration: 250, easing: "ease-out" }); } catch (err) { /* jumps back */ } }
        knob.style.transform = "translateX(0)";
      });
    }
  }
}

// ------------------------------------------------------------------ Roost Agenda
// Today's and the next days' events from your calendars. Bin day (or any word you choose) stands out.
class RoostAgenda extends ticking(RoostBase, 600000) {
  static get defaults() { return { entities: [], days: 3, highlight: "bin, trash, rubbish, garbage, recycling", max: 8, radius: 22, theme: "auto" }; }

  validate(c) { if (!Array.isArray(c.entities) || !c.entities.length) throw new Error("Pick at least one calendar"); }

  static getConfigForm() {
    return {
      schema: [
        { name: "entities", label: "Calendars", selector: { entity: { multiple: true, domain: "calendar" } } },
        { type: "grid", name: "", schema: [{ name: "days", label: "Days ahead", selector: { number: { min: 1, max: 14, mode: "box" } } }, { name: "max", label: "Show at most", selector: { number: { min: 1, max: 30, mode: "box" } } }] },
        { name: "highlight", label: "Words that stand out (for example bin, trash)", selector: { text: {} } },
        { type: "grid", name: "", schema: [{ name: "radius", selector: slider(0, 40, 2) }, THEME_FIELD] },
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) { return { entities: Object.keys(hass.states).filter((id) => id.startsWith("calendar.")).slice(0, 2) }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  signature() { return `${this.dark}|${JSON.stringify(this._ev || null)}|${new Date().getDate()}`; }

  async load() {
    const c = this._config, h = this._hass;
    if (!h?.callApi || this._loading || (this._at && Date.now() - this._at < 590000)) return;
    this._loading = true;
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + c.days * 86400e3);
    const all = [];
    await Promise.all(c.entities.map(async (id, i) => {
      try {
        const evs = await h.callApi("GET", `calendars/${id}?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`);
        (evs || []).forEach((e) => all.push({ cal: i, title: e.summary || "", start: e.start?.dateTime || e.start?.date, allDay: !e.start?.dateTime, where: e.location || "" }));
      } catch (e) { /* calendar not reachable */ }
    }));
    all.sort((a, b) => new Date(a.start) - new Date(b.start));
    this._ev = all; this._at = Date.now(); this._loading = false;
    this._sig = null; this.hass = this._hass;
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p;
    this.load();
    const cols = ["#8B6CFF", "#38BDF8", "#2BC4A8", "#FF8F6B", "#F472B6", "#FCD34D"];
    const words = String(c.highlight || "").toLowerCase().split(",").map((w) => w.trim()).filter(Boolean);
    const ev = (this._ev || []).slice(0, c.max);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dayName = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); const n = Math.round((x - today) / 86400e3); return n === 0 ? "Today" : n === 1 ? "Tomorrow" : x.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" }); };
    let last = "", html = "";
    const nextOne = ev.find((e) => !e.allDay && new Date(e.start) > new Date() && new Date(e.start) - Date.now() < 86400e3);
    for (const e of ev) {
      const dn = dayName(e.start);
      if (dn !== last) { html += `<div class="day">${esc(dn)}</div>`; last = dn; }
      const hot = words.some((w) => e.title.toLowerCase().includes(w));
      html += `<div class="ev ${hot ? "hot" : ""}"><span class="bar" style="background:${hot ? "#FF8F6B" : cols[e.cal % cols.length]}"></span>
        <span class="tm num">${e.allDay ? "All day" : esc(new Date(e.start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }))}</span>
        <span class="tx"><b class="t">${e === nextOne ? '<i class="nx" title="Next"></i>' : ""}${hot ? '<ha-icon icon="mdi:trash-can-outline"></ha-icon> ' : ""}${esc(e.title)}</b>${e.where ? `<small class="t">${esc(e.where)}</small>` : ""}</span></div>`;
    }
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${panelCss(p, c.radius)};padding:16px;display:flex;flex-direction:column;gap:8px}
      .day{font-size:12px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:${p.muted};margin-top:6px}
      .day:first-child{margin-top:0}
      .nx{display:inline-block;width:8px;height:8px;border-radius:50%;background:#8B6CFF;margin-right:6px;vertical-align:1px;animation:roost-breathe 1.8s ease-in-out infinite}
      .ev{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:${p.inset}}
      @container (max-width: 280px){:host .ev{display:grid;grid-template-columns:4px minmax(0,1fr);column-gap:10px;row-gap:2px}:host .ev .bar{grid-row:1/3}:host .tm{min-width:0}}
      .ev.hot{background:${this.dark ? "rgba(255,143,107,.14)" : "rgba(255,143,107,.16)"}}
      .ev.hot ha-icon{--mdc-icon-size:16px;color:#FF8F6B;vertical-align:-3px;animation:roost-bounce 1.6s ease-in-out infinite}
      .bar{width:4px;align-self:stretch;border-radius:4px;flex:none}
      .tm{font-size:13px;color:${p.muted};min-width:58px}
      .tx{flex:1;min-width:0;display:flex;flex-direction:column}
      .tx b{font-size:14px;font-weight:600;color:${p.text}}
      .tx small{font-size:12px;color:${p.muted}}
      .empty{font-size:14px;color:${p.muted};text-align:center;padding:14px}
    </style><div class="card">${this._ev ? html || '<div class="empty t">Nothing planned. Enjoy!</div>' : '<div class="empty t">Loading</div>'}</div>`;
  }
}

// ------------------------------------------------------------------ Roost To-do
// A to-do or shopping list: tick things off, add new ones, clear the ticked ones.
class RoostTodo extends RoostBase {
  static get defaults() { return { show_done: false, color: "active", radius: 22, theme: "auto" }; }

  validate(c) { if (!c.entity) throw new Error("Choose a to-do or shopping list"); }

  static getConfigForm() {
    return {
      schema: [
        { name: "entity", required: true, selector: { entity: { domain: "todo" } } },
        { name: "name", selector: { text: {} } },
        { type: "grid", name: "", schema: [{ name: "show_done", label: "Show ticked items", selector: { boolean: {} } }, { name: "radius", selector: slider(0, 40, 2) }] },
        ...colourFields("color", "Tick colour"),
        THEME_FIELD,
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) { return { entity: Object.keys(hass.states).find((id) => id.startsWith("todo.")) || "" }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  signature() { return `${this.dark}|${JSON.stringify(this._items || null)}`; }

  subscribe() {
    const c = this._config, conn = this._hass?.connection;
    if (!conn?.subscribeMessage || this._subFor === c.entity) return;
    this._unsub?.then?.((u) => u()).catch(() => {});
    this._subFor = c.entity;
    this._unsub = conn.subscribeMessage((m) => { this._items = m.items || []; this._sig = null; this.hass = this._hass; }, { type: "todo/item/subscribe", entity_id: c.entity });
    this._unsub.catch?.(() => { this._items = []; this._sig = null; this.hass = this._hass; });
  }

  // A card that is moved on the page (switching views, a page or panel redrawing) is disconnected and connected again:
  // listen again then, or the list would stop updating.
  connectedCallback() { super.connectedCallback?.(); if (this._hass && this._config) { this.subscribe(); } }
  disconnectedCallback() { super.disconnectedCallback?.(); this._unsub?.then?.((u) => u()).catch(() => {}); this._unsub = null; this._subFor = null; }
  // Show a change straight away; the list from Home Assistant replaces it a moment later.
  optimistic(fn) { this._items = fn(this._items || []); this._sig = null; this.hass = this._hass; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour();
    this.subscribe();
    const items = this._items || [];
    const open = items.filter((i) => i.status !== "completed"), done = items.filter((i) => i.status === "completed");
    const row = (i) => `<div class="it ${i.status === "completed" ? "done" : ""}" data-uid="${esc(i.uid)}"><span class="ck" data-pop="${esc(i.status)}" data-popkey="${esc(i.uid)}">${i.status === "completed" ? '<ha-icon icon="mdi:check"></ha-icon>' : ""}</span><span class="t">${esc(i.summary)}</span></div>`;
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${panelCss(p, c.radius)};padding:16px;display:flex;flex-direction:column;gap:10px}
      .top{display:flex;justify-content:space-between;align-items:baseline}
      .n{font-size:15px;font-weight:600}
      .c{font-size:13px;color:${p.muted}}
      .add{display:flex;gap:8px}
      .add input{flex:1;min-width:0;height:44px;border-radius:14px;border:1px solid ${p.border};background:${p.inset};color:${p.text};font:inherit;font-size:14px;padding:0 14px;outline:none}
      @container (max-width: 260px){:host .add input{padding:0 10px;font-size:13px}:host .add button{width:40px}}
      .add button{width:44px;height:44px;border-radius:14px;border:0;background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};cursor:pointer}
      .it{display:flex;align-items:center;gap:12px;padding:10px 4px;border-bottom:1px solid ${p.border};cursor:pointer;font-size:15px;color:${p.text}}
      .it:last-child{border-bottom:0}
      .ck{width:24px;height:24px;border-radius:8px;border:2px solid ${p.knob};flex:none;display:flex;align-items:center;justify-content:center}
      .done .ck{background:linear-gradient(135deg,${g[0]},${g[1]});border-color:transparent;color:${g[3]}}
      .done .ck ha-icon{--mdc-icon-size:16px;animation:roost-pulse .4s ease-out 1}
      .done .t{color:${p.muted};text-decoration:line-through}
      .clr{align-self:flex-start;border:0;background:none;color:${g[this.dark ? 1 : 0]};font:inherit;font-size:13px;font-weight:600;cursor:pointer;padding:4px 0}
      .empty{font-size:14px;color:${p.muted};text-align:center;padding:10px}
    </style>
    <div class="card">
      <div class="top"><span class="n t">${esc(this.name(c.entity, "List"))}</span><span class="c">${open.length} to do</span></div>
      <form class="add"><input placeholder="Add an item" aria-label="Add an item"><button type="submit" aria-label="Add"><ha-icon icon="mdi:plus"></ha-icon></button></form>
      <div>${open.map(row).join("")}${c.show_done ? done.map(row).join("") : ""}${!open.length && !(c.show_done && done.length) ? `<div class="empty t">${this._items ? "All done" : "Loading"}</div>` : ""}</div>
      ${done.length ? `<button class="clr">Clear ${done.length} ticked</button>` : ""}
    </div>`;
    const r = this.shadowRoot;
    if (this._draft) { const inp = r.querySelector(".add input"); inp.value = this._draft; if (this._typing) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); } }
    r.querySelector(".add input").addEventListener("input", (e) => { this._draft = e.target.value; });
    r.querySelector(".add input").addEventListener("focus", () => { this._typing = true; });
    r.querySelector(".add input").addEventListener("blur", () => { this._typing = false; });
    r.querySelectorAll("[data-uid]").forEach((el) => el.addEventListener("click", () => {
      this.vibrate();
      const it = items.find((i) => i.uid === el.dataset.uid);
      if (!it || String(it.uid).startsWith("new-")) return;
      const status = it.status === "completed" ? "needs_action" : "completed";
      this.optimistic((list) => list.map((i) => (i.uid === it.uid ? { ...i, status } : i)));
      this.call("todo", "update_item", { entity_id: c.entity, item: it.uid, status });
    }));
    r.querySelector(".add").addEventListener("submit", (e) => {
      e.preventDefault();
      const inp = r.querySelector(".add input"), v = inp.value.trim();
      if (v) {
        this.vibrate(); this._draft = ""; inp.value = "";
        this.optimistic((list) => [...list, { uid: `new-${Date.now()}`, summary: v, status: "needs_action" }]);
        this.call("todo", "add_item", { entity_id: c.entity, item: v });
      }
    });
    r.querySelector(".clr")?.addEventListener("click", () => {
      this.optimistic((list) => list.filter((i) => i.status !== "completed"));
      this.call("todo", "remove_completed_items", { entity_id: c.entity });
    });
  }
}

// ------------------------------------------------------------------ Roost Camera
// A camera picture that refreshes (or a live stream), and a banner with a ring when someone presses the doorbell.
class RoostCamera extends RoostBase {
  static get defaults() { return { refresh: 10, live: false, ring_minutes: 2, radius: 22, aspect: "16/9", theme: "auto" }; }

  validate(c) { if (!c.entity) throw new Error("Choose a camera"); }

  watched() { return [this._config.entity, this._config.doorbell].filter(Boolean); }

  static getConfigForm() {
    return {
      schema: [
        { name: "sample", label: "Show sample data (try the card without the device)", selector: { boolean: {} } },
        { name: "entity", required: true, selector: { entity: { domain: "camera" } } },
        { name: "name", selector: { text: {} } },
        { name: "doorbell", label: "Doorbell (button press or ring sensor)", selector: { entity: { domain: ["binary_sensor", "event"] } } },
        { type: "grid", name: "", schema: [{ name: "live", label: "Live video", selector: { boolean: {} } }, { name: "refresh", label: "New picture every (seconds)", selector: { number: { min: 2, max: 300, mode: "box" } } }] },
        { type: "grid", name: "", schema: [{ name: "aspect", label: "Shape", selector: pick([["16/9", "Wide"], ["4/3", "Classic"], ["1/1", "Square"], ["3/4", "Tall (doorbell)"]]) }, { name: "radius", selector: slider(0, 40, 2) }] },
        THEME_FIELD,
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) { return { entity: Object.keys(hass.states).find((id) => id.startsWith("camera.")) || "" }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  connectedCallback() { this._t = setInterval(() => this.refreshImg(), Math.max(2, this._config?.refresh || 10) * 1000); }

  disconnectedCallback() { clearInterval(this._t); }

  url() { const s = this.st(), u = s?.attributes.entity_picture; return u ? (u.startsWith("data:") ? u : `${u}&t=${Date.now()}`) : ""; }

  refreshImg() { const img = this.shadowRoot?.querySelector("img.pic"); if (img && !document.hidden) img.src = this.url(); }

  ringing() {
    const c = this._config, d = this.sx(c.doorbell);
    if (!d) return false;
    if (d.entity_id.startsWith("event.")) return !UNAVAILABLE.includes(d.state) && Date.now() - new Date(d.state) < c.ring_minutes * 60000;
    // ringing now, or rang in the last few minutes
    return d.state === "on" || (d.state === "off" && Date.now() - new Date(d.last_changed) < c.ring_minutes * 60000);
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, s = this.st();
    const ring = this.ringing();
    const live = c.live && customElements.get("ha-camera-stream");
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${panelCss(p, c.radius)};overflow:hidden;position:relative;${ring ? "box-shadow:0 0 0 3px #FF8F6B,0 0 30px rgba(255,143,107,.5);animation:roost-breathe 1.2s ease-in-out infinite" : ""}}
      .view{position:relative;aspect-ratio:${c.aspect};background:${p.inset};cursor:pointer}
      .view img,.view ha-camera-stream{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
      .tag{position:absolute;left:10px;top:10px;padding:4px 10px;border-radius:999px;background:rgba(10,8,40,.55);color:#fff;font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px}
      .tag i{width:8px;height:8px;border-radius:50%;background:#F43F6B;animation:roost-breathe 1.4s ease-in-out infinite}
      .ring{position:absolute;left:10px;right:10px;bottom:10px;padding:10px 14px;border-radius:14px;background:linear-gradient(135deg,#F43F6B,#FF8F6B);color:#fff;font-size:14px;font-weight:700;display:flex;align-items:center;gap:10px}
      .ring ha-icon{animation:roost-wiggle .5s ease-in-out infinite}
      .off{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:${p.muted};font-size:14px}
    </style>
    <div class="card"><div class="view" role="button" tabindex="0">
      ${!s ? '<div class="off t">Camera not found</div>' : UNAVAILABLE.includes(s.state) ? '<div class="off t">Camera offline</div>' : live ? "" : `<img class="pic" alt="${esc(this.name(c.entity))}" src="${esc(this.url())}">`}
      <span class="tag"><i></i>${esc(this.name(c.entity, "Camera"))}</span>
      ${ring ? '<div class="ring"><ha-icon icon="mdi:doorbell-video"></ha-icon><span class="t">Someone is at the door</span></div>' : ""}
    </div></div>`;
    if (live && s && !UNAVAILABLE.includes(s.state)) {
      const el = document.createElement("ha-camera-stream");
      el.hass = this._hass; el.stateObj = s; el.muted = true; el.controls = false;
      this.shadowRoot.querySelector(".view").prepend(el);
    }
    this.shadowRoot.querySelector(".view").addEventListener("click", () => this.moreInfo(c.entity));
  }
}

// ------------------------------------------------------------------ Arabic and right to left
// Every Roost card follows the person's Home Assistant language (Arabic turns the cards right to left),
// or the choice made on this screen with the language button (Roost Theme), or the card's own "language".
// Words are looked up in one list per language; your own device names stay as you wrote them.
const AR_WORDS = {
  "On": "يعمل", "Off": "مطفأ", "Open": "مفتوح", "Closed": "مغلق", "Opening": "يُفتح", "Closing": "يُغلق", "Locked": "مقفل", "Unlocked": "مفتوح القفل", "Lock": "قفل", "Unlock": "فتح القفل",
  "Home": "الرئيسية", "At home": "في المنزل", "Away": "خارج المنزل", "Offline": "غير متصل", "Not found": "غير موجود", "Device not found": "الجهاز غير موجود", "Unavailable": "غير متاح", "Unknown": "غير معروف",
  "Turn on": "تشغيل", "Turn off": "إطفاء", "Start": "ابدأ", "Stop": "إيقاف", "Pause": "إيقاف مؤقت", "Play": "تشغيل", "Close": "إغلاق", "Run now": "شغّل الآن", "Press": "اضغط", "Install": "تثبيت",
  "Swipe up for more": "اسحب للأعلى للمزيد", "More in Home Assistant": "المزيد في Home Assistant", "LATELY": "مؤخراً", "DETAILS": "التفاصيل", "Show more": "عرض المزيد", "Show less": "عرض أقل",
  "Cool": "تبريد", "Heat": "تدفئة", "Dry": "تجفيف", "Fan": "مروحة", "Auto": "تلقائي", "Heat & cool": "تبريد وتدفئة", "Cooling": "يبرّد", "Heating": "يدفّئ", "Idle": "خامل", "Fan only": "مروحة فقط",
  "Set to": "مضبوط على", "Room": "الغرفة", "Low": "منخفض", "Medium": "متوسط", "High": "مرتفع", "Quiet": "هادئ", "Normal": "عادي", "Strong": "قوي", "Max": "أقصى",
  "Lights off": "إطفاء الأنوار", "Good night": "تصبح على خير", "Arm away": "حماية", "Leave home": "مغادرة", "Cool house": "تبريد المنزل", "Movie time": "وقت الفيلم",
  "All good": "كل شيء بخير", "All quiet": "هادئ", "All calm at home": "المنزل هادئ", "Nothing needs you right now": "لا شيء يحتاجك الآن", "Someone is at the door": "شخص عند الباب",
  "Someone here": "يوجد شخص", "Someone there": "يوجد شخص", "Empty": "فارغة", "Nobody": "لا أحد", "Nobody here": "لا أحد هنا", "And nobody is home": "ولا أحد في المنزل",
  "Movement": "حركة", "No movement": "لا حركة", "Wet": "مبلل", "Dry ": "جاف", "Clear": "صافٍ", "Smoke!": "دخان!", "Gas!": "غاز!", "Running": "يعمل", "Stopped": "متوقف", "Charging": "يشحن",
  "Living": "المعيشة", "Living Room": "غرفة المعيشة", "Bedroom": "غرفة النوم", "Master Bedroom": "غرفة النوم الرئيسية", "Kitchen": "المطبخ", "Entrance": "المدخل", "Office": "المكتب", "Bathroom": "الحمام", "Hall": "الصالة", "Garden": "الحديقة",
  "Rooms": "الغرف", "All rooms": "كل الغرف", "Security": "الأمان", "Auto ": "تلقائي", "Settings": "الإعدادات", "Devices": "الأجهزة", "Automations": "الأتمتة", "Automations & actions": "الأتمتة والإجراءات", "Modes": "الأوضاع",
  "Never ran": "لم يعمل بعد", "Today": "اليوم", "Yesterday": "أمس", "Tomorrow": "غداً", "Now": "الآن", "just now": "الآن", "Last month": "الشهر الماضي", "This month so far": "هذا الشهر حتى الآن",
  "Light mode": "الوضع الفاتح", "Dark mode": "الوضع الداكن", "Light": "فاتح", "Dark": "داكن", "Full screen": "ملء الشاشة", "Leave full screen": "الخروج من ملء الشاشة", "Exit full screen": "الخروج من ملء الشاشة",
  "Alarm": "الإنذار", "Disarm": "إلغاء الإنذار", "Away ": "خارج", "Night": "ليل", "Holiday": "عطلة", "The alarm is going off": "الإنذار يعمل!", "Water leak": "تسرّب مياه", "Smoke detected": "تم اكتشاف دخان", "Gas detected": "تم اكتشاف غاز",
  "Weather": "الطقس", "Sunny": "مشمس", "Clear night": "ليل صافٍ", "Cloudy": "غائم", "Partly cloudy": "غائم جزئياً", "Rainy": "ممطر", "Windy": "عاصف", "Fog": "ضباب",
  "Battery": "البطارية", "Battery low": "البطارية منخفضة", "Power": "الطاقة", "Temperature": "الحرارة", "Humidity": "الرطوبة", "Air": "الهواء", "Using now": "الاستهلاك الآن",
  "Curtain": "الستارة", "Curtains": "الستائر", "Blind": "الستارة", "Air conditioner": "المكيّف", "AC": "المكيّف", "TV": "التلفاز", "Speaker": "السماعة", "Ceiling light": "ضوء السقف", "Fan ": "المروحة", "Plug": "المقبس", "Smart plug": "مقبس ذكي",
  "Good morning": "صباح الخير", "Good afternoon": "مساء الخير", "Good evening": "مساء الخير", "Ramadan Kareem": "رمضان كريم", "Eid Mubarak": "عيد مبارك",
  "Fajr": "الفجر", "Sunrise": "الشروق", "Dhuhr": "الظهر", "Jumu'ah": "الجمعة", "Asr": "العصر", "Maghrib": "المغرب", "Isha": "العشاء", "Imsak": "الإمساك",
  "Monday": "الاثنين", "Tuesday": "الثلاثاء", "Wednesday": "الأربعاء", "Thursday": "الخميس", "Friday": "الجمعة", "Saturday": "السبت", "Sunday": "الأحد",
  "January": "يناير", "February": "فبراير", "March": "مارس", "April": "أبريل", "May": "مايو", "June": "يونيو", "July": "يوليو", "August": "أغسطس", "September": "سبتمبر", "October": "أكتوبر", "November": "نوفمبر", "December": "ديسمبر",
  "Doors are closed and the alarm is off.": "الأبواب مغلقة والإنذار مطفأ.", "Doors are closed and the alarm is on (away).": "الأبواب مغلقة والإنذار يعمل (خارج المنزل).", "Doors are closed and the alarm is on (home).": "الأبواب مغلقة والإنذار يعمل (في المنزل).",
  "All doors closed": "كل الأبواب مغلقة", "Doors closed": "الأبواب مغلقة", "Door closed": "الباب مغلق", "Door open": "الباب مفتوح", "Location off": "الموقع مطفأ", "Work": "العمل", "School": "المدرسة",
  "Feed now": "أطعمه الآن", "Back to dock": "العودة للقاعدة", "Find it": "ابحث عنه", "Start cleaning": "ابدأ التنظيف", "Docked": "في القاعدة", "Cleaning": "ينظّف", "Returning": "يعود",
  "No reading": "لا توجد قراءة", "Not working right now": "لا يعمل حالياً", "Loading": "جارٍ التحميل", "Nothing planned": "لا شيء مخطط", "The shopping list is empty": "قائمة التسوق فارغة",
  "Volume": "الصوت", "Source": "المصدر", "Speed": "السرعة", "Swing": "تأرجح", "Mute": "كتم", "Previous": "السابق", "Next": "التالي",
  "Language": "اللغة", "English": "English", "Arabic": "العربية", "Ready": "جاهز", "Done": "تم", "Upload": "رفع", "Download": "تنزيل", "Live": "مباشر", "Camera offline": "الكاميرا غير متصلة",
};
const AR_PATTERNS = [
  [/^for (\d+) min$/, "منذ $1 د"], [/^for (\d+)h(?: (\d+)m)?$/, (m, h, mi) => `منذ ${h} س${mi ? ` ${mi} د` : ""}`], [/^for (\d+) days?$/, "منذ $1 يوم"],
  [/^(\d+) min ago$/, "قبل $1 د"], [/^(\d+) h ago$/, "قبل $1 س"], [/^(\d+) days? ago$/, "قبل $1 يوم"], [/^Since (.+) ago$/, (m, x) => `منذ ${arWord(x)}`], [/^Since (.+)$/, (m, x) => `منذ ${arWord(x)}`],
  [/^(\d+) lights? on$/, "$1 أضواء تعمل"], [/^(\d+) lights? are on$/, "$1 أضواء تعمل"], [/^(\d+) on$/, "$1 يعمل"], [/^(\d+) of (\d+) on$/, "$1 من $2 يعمل"],
  [/^(\d+)% open$/, "مفتوح $1٪"], [/^(\d+)% open · drag$/, "مفتوح $1٪ · اسحب"], [/^Lights (\d+)%$/, "الأضواء $1٪"], [/^Lights off$/, "الأضواء مطفأة"], [/^Volume (\d+)%$/, "الصوت $1٪"], [/^Speed (\d+)%$/, "السرعة $1٪"],
  [/^Room (.+)$/, "الغرفة $1"], [/^AC (cool|heat|dry|fan|auto|off)(.*)$/, (m, a, r) => `المكيّف ${arWord(a.charAt(0).toUpperCase() + a.slice(1))}${r}`], [/^(Curtain|Blind) (open|closed|opening|closing)$/, (m, a, b) => `${arWord(a)} ${arWord(b.charAt(0).toUpperCase() + b.slice(1))}`],
  [/^Good (morning|afternoon|evening|night), (.+)$/, (m, a, n) => `${a === "morning" ? "صباح الخير" : a === "night" ? "تصبح على خير" : "مساء الخير"}، ${n}`],
  [/^(.+) in (\d+) h (\d+) min$/, (m, p, h, mi) => `${arWord(p)} بعد ${h} س ${mi} د`], [/^(.+) in (\d+) min$/, (m, p, mi) => `${arWord(p)} بعد ${mi} دقيقة`], [/^Iftar in (.+)$/, (m, x) => `الإفطار بعد ${x}`],
  [/^Time for (.+)$/, (m, p) => `حان وقت ${arWord(p)}`], [/^At (.+)$/, "الساعة $1"], [/^Maghrib at (.+)$/, "المغرب الساعة $1"], [/^Rang (.+)$/, (m, x) => `رنّ ${arWord(x)}`],
  [/^(.+) is open$/, "$1 مفتوح"], [/^(.+) is on$/, "$1 يعمل"], [/^(\d+) doors or windows are open$/, "$1 أبواب أو نوافذ مفتوحة"], [/^(\d+) batteries are low$/, "$1 بطاريات منخفضة"], [/^(.+): battery low$/, "$1: البطارية منخفضة"],
  [/^Last ran (.+)$/, (m, x) => `آخر تشغيل ${arWord(x)}`], [/^(\d+(?:\.\d+)?)° outside$/, "$1° في الخارج"], [/^And it is (.+) outside$/, "والحرارة $1 في الخارج"], [/^At night$/, "في الليل"],
  [/(\d+(?:[.,]\d+)?) ?(AM|PM)$/, (m, t, ap) => `${t} ${ap === "AM" ? "ص" : "م"}`],
];
function arWord(x) {
  const s = String(x).trim(); if (!s) return x;
  if (AR_WORDS[s]) return AR_WORDS[s];
  const cap = s.charAt(0).toUpperCase() + s.slice(1); if (AR_WORDS[cap]) return AR_WORDS[cap];
  const deg = s.match(/^(-?\d+(?:\.\d+)?)\s?°C?$/); if (deg) return null;
  for (const [re, to] of AR_PATTERNS) if (re.test(s)) return s.replace(re, to);
  return null;
}
const RoostLang = {
  pick(hass, cfg) {
    let v = cfg && cfg.language && cfg.language !== "auto" ? cfg.language : null;
    if (!v) { try { v = localStorage.getItem("roost-language"); } catch (e) { /* no storage */ } }
    if (!v || v === "auto") v = hass?.locale?.language || hass?.language || "en";
    return /^(ar|fa|ur|he)/.test(v) ? "ar" : "en";
  },
  eastern(cfg) { if (cfg && cfg.numerals) return cfg.numerals === "eastern"; try { return localStorage.getItem("roost-numerals") === "eastern"; } catch (e) { return false; } },
  line(t) {
    if (!/[A-Za-z]/.test(t)) return t;
    const lead = t.match(/^\s*/)[0], tail = t.match(/\s*$/)[0], core = t.trim();
    const whole = arWord(core); if (whole) return lead + whole + tail;
    if (core.includes(" · ")) { const parts = core.split(" · ").map((x) => arWord(x) || x); return lead + parts.join(" · ") + tail; }
    return t;
  },
  apply(el, root, cfg) {
    const lang = this.pick(el._hass || RoostSheet.hass?.(), cfg || el._config);
    if (lang !== "ar") { if (el.style.direction === "rtl") { el.style.direction = ""; el.removeAttribute("dir"); } return; }
    el.style.direction = "rtl"; el.setAttribute("dir", "rtl"); el.setAttribute("lang", "ar");
    const r = root || el.shadowRoot; if (!r) return;
    const east = this.eastern(cfg || el._config), digits = (s) => (east ? s.replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]).replace(/%/g, "٪") : s);
    const walk = document.createTreeWalker(r, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentNode && /^(STYLE|SCRIPT)$/.test(n.parentNode.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
    const nodes = []; while (walk.nextNode()) nodes.push(walk.currentNode);
    for (const n of nodes) { const v = digits(this.line(n.nodeValue)); if (v !== n.nodeValue) n.nodeValue = v; }
    r.querySelectorAll("[aria-label],[title],[placeholder]").forEach((x) => { for (const a of ["aria-label", "title", "placeholder"]) { const v = x.getAttribute(a); if (v) { const t = this.line(v); if (t !== v) x.setAttribute(a, t); } } });
  },
  cards: new Set(),
  set(lang) {
    try { localStorage.setItem("roost-language", lang); } catch (e) { /* no storage */ }
    for (const el of [...this.cards]) { if (!el.isConnected) { this.cards.delete(el); continue; } el._sig = null; if (el._hass) el.hass = el._hass; }
    window.dispatchEvent(new CustomEvent("roost-language-changed"));
  },
  toggle() { this.set(this.pick(document.querySelector("home-assistant")?.hass) === "ar" ? "en" : "ar"); },
};
window.RoostLang = RoostLang;

// The page keeps room for its scroll bar, so switching to a room with more cards never nudges the other cards sideways.
try { if (!document.getElementById("roost-gutter")) { const st = document.createElement("style"); st.id = "roost-gutter"; st.textContent = "html{scrollbar-gutter:stable;overflow-y:scroll}"; document.head.appendChild(st); } } catch (e) { /* no page */ }

// ------------------------------------------------------------------ Roost details sheet
// Holding a Roost card opens this sheet instead of Home Assistant's window: half height, only what matters
// (the name, the state and one main control). Swipe up (or tap "More") for history and details;
// swipe down, tap outside or press Escape to close. "More in Home Assistant" still opens the usual window.
const RoostSheet = {
  ha() { return document.querySelector("home-assistant"); },
  hass() { return this.ha()?.hass; },
  open(entityId, room) {
    const h = this.hass();
    if (!room && (!h || !h.states[entityId])) { this.ha()?.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true })); return; }
    this.close();
    const host = document.createElement("roost-sheet-host");
    host.style.cssText = "position:fixed;inset:0;z-index:998;display:block";
    const root = host.attachShadow({ mode: "open" });
    document.body.appendChild(host);
    this.el = { host, root, id: entityId, room: room || null, full: false, hist: null, last: null };
    this._key = (e) => { if (e.key === "Escape") this.close(); };
    window.addEventListener("keydown", this._key);
    this._tick = setInterval(() => {
      if (!this.el || this.el.busy) return;
      const h = this.hass(); if (!h) return;
      if (this.el.room) { const key = this.el.room.ids.map((x) => h.states[x]?.last_updated).join("|"); if (key !== this.el.roomKey) { this.el.roomKey = key; this.draw(); } return; }
      const s = h.states[this.el.id];
      if (s !== this.el.last || (this.el.id.startsWith("camera.") && Date.now() - (this.el.drawn || 0) > 2000)) this.draw();
    }, 600);
    this.draw();
  },
  close() {
    if (!this.el) return;
    clearInterval(this._tick); window.removeEventListener("keydown", this._key);
    this.el.host.remove(); this.el = null;
  },
  call(domain, service, data) { try { navigator.vibrate?.(12); } catch (e) { /* no vibration */ } [service, data] = fixCover(domain, service, data); return this.hass()?.callService(domain, service, data); },
  look(dom, s) {
    const on = s && !UNAVAILABLE.includes(s.state) && !OFF_STATES.includes(s.state);
    const g = { light: COLORS.amber, switch: COLORS.green, input_boolean: COLORS.green, fan: COLORS.teal, climate: COLORS.blue, water_heater: COLORS.coral, cover: COLORS.coral,
      lock: s?.state === "locked" ? COLORS.green : COLORS.amber, media_player: COLORS.purple, sensor: COLORS.coral, binary_sensor: on ? COLORS.amber : COLORS.green, vacuum: COLORS.teal,
      humidifier: COLORS.teal, alarm_control_panel: s?.state === "disarmed" ? COLORS.green : COLORS.blue }[dom] || COLORS.purple;
    return { g, on };
  },
  binWord(s) {
    const on = s.state === "on", c = s.attributes.device_class;
    const w = { door: ["Open", "Closed"], window: ["Open", "Closed"], garage_door: ["Open", "Closed"], opening: ["Open", "Closed"], motion: ["Movement", "No movement"], occupancy: ["Someone there", "Empty"],
      presence: ["Someone there", "Empty"], moisture: ["Wet", "Dry"], smoke: ["Smoke!", "Clear"], gas: ["Gas!", "Clear"], battery: ["Low", "Normal"], connectivity: ["Connected", "Offline"], lock: ["Unlocked", "Locked"],
      plug: ["Plugged in", "Unplugged"], problem: ["Problem", "OK"], vibration: ["Shaking", "Still"], sound: ["Sound", "Quiet"], running: ["Running", "Stopped"],
      update: ["Update ready", "Up to date"], power: ["Power on", "No power"], heat: ["Hot", "Normal"], cold: ["Cold", "Normal"], light: ["Light", "Dark"], tamper: ["Tampered", "OK"], safety: ["Unsafe", "Safe"],
      carbon_monoxide: ["CO detected!", "Clear"], battery_charging: ["Charging", "Not charging"], moving: ["Moving", "Still"] }[c] || ["On", "Off"];
    return on ? w[0] : w[1];
  },
  stateWord(s) {
    const dom = s.entity_id.split(".")[0], a = s.attributes;
    if (UNAVAILABLE.includes(s.state)) return "Offline";
    if (dom === "light") return s.state === "on" ? `On${a.brightness != null ? ` · ${Math.round(a.brightness / 2.55)}%` : ""}` : "Off";
    if (dom === "climate") return s.state === "off" ? "Off" : `${s.state.replace("_only", "").replace("heat_cool", "auto").replace(/^./, (m) => m.toUpperCase())}${a.current_temperature != null ? ` · Room ${a.current_temperature}°` : ""}`;
    if (dom === "cover") { const v = coverView(s, RoostReversed.has(s.entity_id)); return v.pos != null ? `${v.pos}% open` : v.state.replace(/^./, (m) => m.toUpperCase()); }
    if (dom === "sensor" && num(s.state) != null) return `${fmt(num(s.state), decOf(s.state))}${unitGap(a.unit_of_measurement || "")}`;
    if (dom === "binary_sensor") return this.binWord(s);
    if (dom === "person" || dom === "device_tracker") return s.state === "home" ? "At home" : s.state === "not_home" ? "Away" : s.state;
    if (dom === "alarm_control_panel") return { disarmed: "Off", armed_home: "On · home", armed_away: "On · away", armed_night: "On · night", armed_vacation: "On · holiday", arming: "Turning on", pending: "Pending", triggered: "Alarm!" }[s.state] || s.state;
    if (dom === "weather") return `${s.state.replace(/-/g, " ").replace(/^./, (m) => m.toUpperCase())}${a.temperature != null ? ` · ${a.temperature}°` : ""}`;
    if (dom === "water_heater") return `${s.state.replace(/_/g, " ").replace(/^./, (m) => m.toUpperCase())}${a.current_temperature != null ? ` · ${a.current_temperature}°` : ""}`;
    if (dom === "vacuum") return `${s.state.replace(/_/g, " ").replace(/^./, (m) => m.toUpperCase())}${a.battery_level != null ? ` · battery ${a.battery_level}%` : ""}`;
    return s.state.replace(/_/g, " ").replace(/^./, (m) => m.toUpperCase());
  },
  // the one main control, by kind of device
  main(s, g, p) {
    const dom = s.entity_id.split(".")[0], a = s.attributes, id = s.entity_id;
    const bar = (pct, fill, text, key) => `<div class="bar" data-bar="${key}"><i style="width:${pct}%;background:${fill}"></i><b>${esc(text)}</b></div>`;
    const round = (icon, label, primary, act, size = 56) => `<button class="rb${primary ? " pr" : ""}" style="width:${size}px;height:${size}px" data-act="${act}" aria-label="${esc(label)}"><ha-icon icon="${icon}"></ha-icon></button>`;
    const wide = (text, icon, primary, act) => `<button class="wb${primary ? " pr" : ""}" data-act="${act}">${icon ? `<ha-icon icon="${icon}"></ha-icon>` : ""}${esc(text)}</button>`;
    if (UNAVAILABLE.includes(s.state)) return `<div class="note">This device is offline right now.</div>`;
    if (dom === "light") {
      const pct = s.state === "on" ? Math.round((a.brightness ?? 255) / 2.55) : 0;
      const ct = (a.supported_color_modes || []).some((m) => ["color_temp", "rgb", "rgbw", "rgbww", "hs", "xy"].includes(m));
      const shades = ct ? [["#FFB25C", 2700], ["#FFE4B8", 4000], ["#D6E6FF", 6000]].map(([c, k]) => `<button class="sw" style="background:${c}" data-act="ct:${k}" aria-label="${k < 3000 ? "Warm" : k < 5000 ? "Neutral" : "Cool"} white"></button>`).join("") : "";
      return `${a.supported_color_modes?.some((m) => m !== "onoff") ? bar(pct, "linear-gradient(90deg,#E07B00,#FDE68A)", s.state === "on" ? `${pct}%` : "Off", "light") : ""}<div class="row">${shades}${round(s.state === "on" ? "mdi:power" : "mdi:lightbulb-on-outline", s.state === "on" ? "Turn off" : "Turn on", true, "toggle")}</div>`;
    }
    if (dom === "climate") {
      const t = a.temperature, step = a.target_temp_step || (a.temperature_unit === "°F" ? 1 : 0.5);
      const all = (a.hvac_modes || []).filter((m) => m !== "heat_cool" || !(a.hvac_modes || []).includes("auto"));
      const pref = ["cool", "heat", "dry", "fan_only", "auto", "heat_cool"];
      const modes = [...all.filter((m) => m !== "off").sort((x, y) => pref.indexOf(x) - pref.indexOf(y)).slice(0, all.includes("off") ? 3 : 4), ...(all.includes("off") ? ["off"] : [])];
      return `${t != null ? `<div class="dial">${round("mdi:minus", "Lower", false, `t:${-step}`, 64)}<div class="big num">${fmt(t, Number.isInteger(t) ? 0 : 1)}°</div>${round("mdi:plus", "Raise", false, `t:${step}`, 64)}</div>` : ""}
        <div class="seg" style="grid-template-columns:repeat(${modes.length},minmax(0,1fr))">${modes.map((m) => `<button class="${s.state === m ? "on" : ""}" data-act="mode:${m}">${esc({ fan_only: "Fan", heat_cool: "Auto" }[m] || m.charAt(0).toUpperCase() + m.slice(1))}</button>`).join("")}</div>`;
    }
    if (dom === "cover") {
      const pos = coverView(s, RoostReversed.has(s.entity_id)).pos;
      const garage = ["garage", "gate", "door"].includes(a.device_class);
      return `${pos != null ? bar(pos, `linear-gradient(90deg,${g[0]},${g[1]})`, `${pos}% open`, "cover") : ""}<div class="g2"${pos == null ? ' style="grid-template-columns:repeat(3,minmax(0,1fr))"' : ""}>${wide("Close", garage ? "mdi:arrow-down" : "mdi:arrow-collapse-horizontal", false, "close")}${pos == null ? wide("Stop", "mdi:stop", false, "stop") : ""}${wide("Open", garage ? "mdi:arrow-up" : "mdi:arrow-expand-horizontal", true, "open")}</div>`;
    }
    if (dom === "lock") return `${wide(s.state === "locked" ? "Unlock" : "Lock", s.state === "locked" ? "mdi:lock-open-variant" : "mdi:lock", true, s.state === "locked" ? "unlock" : "lock")}`;
    if (dom === "media_player") {
      const off = OFF_STATES.includes(s.state) && s.state !== "paused" && s.state !== "idle";
      if (off) return `<div class="row c">${round("mdi:power", "Turn on", true, "toggle", 72)}</div>`;
      const vol = a.volume_level != null ? Math.round(a.volume_level * 100) : null;
      return `${a.media_title ? `<div class="mt">${esc(a.media_title)}${a.media_artist ? `<span> · ${esc(a.media_artist)}</span>` : ""}</div>` : ""}
        <div class="row c">${round("mdi:skip-previous", "Previous", false, "prev")}${round(s.state === "playing" ? "mdi:pause" : "mdi:play", s.state === "playing" ? "Pause" : "Play", true, "play", 72)}${round("mdi:skip-next", "Next", false, "next")}</div>
        ${vol != null ? bar(vol, `linear-gradient(90deg,${g[0]},${g[1]})`, `Volume ${vol}%`, "vol") : ""}`;
    }
    if (dom === "sensor" && num(s.state) != null) {
      const h = this.el.hist;
      return `<div class="sens"><div class="big num">${fmt(num(s.state), decOf(s.state))}<small>${esc(a.unit_of_measurement || "")}</small></div>${h && h.length > 2 ? this.spark(h, g[1]) : ""}</div>
        ${h && h.length > 2 ? `<div class="note">Lowest ${fmt(Math.min(...h), decOf(s.state))} · Highest ${fmt(Math.max(...h), decOf(s.state))} today</div>` : ""}`;
    }
    if (dom === "camera") {
      const pic = a.entity_picture;
      return pic ? `<div class="cam"><img src="${esc(pic)}${pic.includes("?") ? "&" : "?"}t=${Math.floor(Date.now() / 2000)}" alt="${esc(a.friendly_name || id)}"></div>` : `<div class="note">No picture right now.</div>`;
    }
    if (dom === "alarm_control_panel") {
      const modes = [["arm_home", "Home", "armed_home"], ["arm_away", "Away", "armed_away"], ["disarm", "Off", "disarmed"]];
      return `<div class="seg" style="grid-template-columns:repeat(3,minmax(0,1fr))">${modes.map(([m, w, st]) => `<button class="${s.state === st ? "on" : ""}" data-act="alarm:${m}">${w}</button>`).join("")}</div>${a.code_format ? `<div class="note">Asks for its code when you choose.</div>` : ""}`;
    }
    if (dom === "vacuum") {
      const busy = ["cleaning", "returning"].includes(s.state);
      return `<div class="row c">${round(busy ? "mdi:pause" : "mdi:play", busy ? "Pause" : "Start cleaning", true, busy ? "vac:pause" : "vac:start", 72)}${round("mdi:home-import-outline", "Back to dock", false, "vac:return_to_base")}${round("mdi:map-marker-question-outline", "Find it", false, "vac:locate")}</div>`;
    }
    if (dom === "water_heater") {
      const t = a.temperature, ops = (a.operation_list || []).slice(0, 4);
      return `${t != null ? `<div class="dial">${round("mdi:minus", "Lower", false, "wt:-1", 64)}<div class="big num">${fmt(t, 0)}°</div>${round("mdi:plus", "Raise", false, "wt:1", 64)}</div>` : ""}
        ${ops.length ? `<div class="seg" style="grid-template-columns:repeat(${ops.length},minmax(0,1fr))">${ops.map((m) => `<button class="${a.operation_mode === m || s.state === m ? "on" : ""}" data-act="op:${esc(m)}">${esc(m.replace(/_/g, " ").replace(/^./, (x) => x.toUpperCase()))}</button>`).join("")}</div>` : ""}`;
    }
    if (dom === "binary_sensor") return `<div class="big">${esc(this.binWord(s))}</div><div class="note">Since ${esc(ago(s.last_changed))}</div>`;
    if (dom === "person" || dom === "device_tracker") {
      const pic = a.entity_picture, home = s.state === "home";
      return `<div class="pp"><span class="av" style="${home ? `background:linear-gradient(135deg,${g[0]},${g[1]})` : ""}">${pic ? `<img src="${esc(pic)}" alt="">` : esc((a.friendly_name || id).charAt(0).toUpperCase())}</span>
        <span><div class="big" style="font-size:32px">${esc(this.stateWord(s))}</div><div class="note">Since ${esc(ago(s.last_changed))}${a.battery_level != null ? ` · battery ${a.battery_level}%` : ""}</div></span></div>`;
    }
    if (dom === "weather") {
      return `<div class="sens"><div class="big num">${a.temperature != null ? `${fmt(a.temperature, 0)}°` : ""}</div><div class="note">${esc(s.state.replace(/-/g, " ").replace(/^./, (m) => m.toUpperCase()))}</div></div>
        <div class="note">${[a.humidity != null ? `Humidity ${a.humidity}%` : "", a.wind_speed != null ? `Wind ${a.wind_speed} ${a.wind_speed_unit || "km/h"}` : ""].filter(Boolean).join(" · ")}</div>`;
    }
    if (["select", "input_select"].includes(dom)) {
      const opts = a.options || [], nice = (o) => String(o).replace(/_/g, " ").replace(/^./, (m) => m.toUpperCase());
      return opts.length <= 4 && opts.every((o) => String(o).length <= 10) ? `<div class="seg" style="grid-template-columns:repeat(${Math.max(1, opts.length)},minmax(0,1fr))">${opts.map((o) => `<button class="${s.state === o ? "on" : ""}" data-act="sel:${esc(o)}">${esc(nice(o))}</button>`).join("")}</div>`
        : `<div class="chips">${opts.map((o) => `<button class="${s.state === o ? "on" : ""}" data-act="sel:${esc(o)}">${esc(nice(o))}</button>`).join("")}</div>`;
    }
    if (["number", "input_number"].includes(dom) && num(s.state) != null) {
      const mn = Number(a.min ?? 0), mx = Number(a.max ?? 100), v = num(s.state);
      return bar(Math.round(((v - mn) / ((mx - mn) || 1)) * 100), `linear-gradient(90deg,${g[0]},${g[1]})`, `${fmt(v, decOf(s.state))}${unitGap(a.unit_of_measurement || "")}`, "num");
    }
    if (dom === "update") return s.state === "on" ? wide(`Install ${a.latest_version || "update"}`, "mdi:download", true, "install") : `<div class="note">Up to date${a.installed_version ? ` · ${esc(a.installed_version)}` : ""}</div>`;
    if (["scene", "script"].includes(dom)) return wide("Start", "mdi:play", true, "run");
    if (dom === "automation") return `<div class="g2">${wide("Run now", "mdi:play", true, "trigger")}${wide(s.state === "on" ? "Turn off" : "Turn on", "mdi:power", false, "toggle")}</div>`;
    if (["button", "input_button"].includes(dom)) return wide("Press", "mdi:gesture-tap", true, "press");
    if (["switch", "input_boolean", "fan", "humidifier", "siren"].includes(dom)) {
      const pct = dom === "fan" && a.percentage != null ? a.percentage : null;
      return `<div class="row c">${round("mdi:power", s.state === "on" ? "Turn off" : "Turn on", s.state === "on", "toggle", 88)}</div>${pct != null ? bar(pct, `linear-gradient(90deg,${g[0]},${g[1]})`, s.state === "on" ? `Speed ${pct}%` : "Off", "fan") : ""}`;
    }
    return `<div class="big">${esc(this.stateWord(s))}</div><div class="note">Since ${esc(since(s.last_changed).replace(/^for /, ""))} ago</div>`;
  },
  spark(pts, colour) {
    const w = 300, h = 60, mn = Math.min(...pts), mx = Math.max(...pts);
    const d = pts.map((p, i) => `${i ? "L" : "M"}${(i * w / (pts.length - 1)).toFixed(1)} ${(h - 6 - (p - mn) / ((mx - mn) || 1) * (h - 14)).toFixed(1)}`).join(" ");
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${d} L${w} ${h} L0 ${h} Z" fill="${colour}" opacity=".18"></path><path d="${d}" fill="none" stroke="${colour}" stroke-width="2.5" vector-effect="non-scaling-stroke"></path></svg>`;
  },
  async history(id) {
    try {
      const start = new Date(Date.now() - 24 * 3600e3).toISOString();
      const r = await this.hass().callApi("GET", `history/period/${start}?filter_entity_id=${encodeURIComponent(id)}&minimal_response&no_attributes`);
      const rows = (r && r[0]) || [];
      this.el.changes = rows.slice(-6).reverse().map((x) => ({ state: x.state, at: x.last_changed }));
      const nums = rows.map((x) => num(x.state)).filter((v) => v != null);
      this.el.hist = nums.length > 60 ? nums.filter((_, i) => i % Math.ceil(nums.length / 60) === 0).concat(nums[nums.length - 1]) : nums;
    } catch (e) { this.el.hist = []; this.el.changes = []; }
    if (this.el) this.draw();
  },
  // Holding a room tile: the room's devices as small tiles (tap switches), one bar for all its lights.
  openRoom(room) {
    this.open(null, room);
  },
  drawRoom() {
    const el = this.el, h = this.hass(), rm = el.room, dark = !!h.themes?.darkMode, p = PALETTE[dark ? "dark" : "light"], g = rm.colour || COLORS.purple;
    const sts = rm.ids.map((x) => h.states[x]).filter(Boolean);
    const isOn = (x) => !UNAVAILABLE.includes(x.state) && !OFF_STATES.includes(x.state);
    const devs = sts.filter((x) => /^(light|switch|fan|climate|cover|media_player|humidifier|input_boolean|lock|vacuum)\./.test(x.entity_id));
    const lights = devs.filter((x) => x.entity_id.startsWith("light."));
    rm.lights = lights.map((x) => x.entity_id);
    const lon = lights.filter((x) => x.state === "on"), pct = lon.length ? Math.round(lon.reduce((t, x) => t + (x.attributes.brightness ?? 255), 0) / lon.length / 2.55) : 0;
    const t = num(h.states[rm.temperature]?.state), hu = num(h.states[rm.humidity]?.state);
    const word = [`${devs.filter(isOn).length} on`, t != null ? `${fmt(t, 1)}°` : "", hu != null ? `${Math.round(hu)}%` : ""].filter(Boolean).join(" · ");
    const shown = el.full ? devs : devs.slice(0, 6);
    const tile = (x) => { const d = x.entity_id.split(".")[0], on = isOn(x), lg = this.look(d, x).g;
      return `<button class="${on ? "on" : ""}" style="${on ? `background:linear-gradient(135deg,${lg[0]},${lg[1]})` : ""}" data-act="${["climate", "media_player", "vacuum", "lock"].includes(d) ? "open:" : "dev:"}${esc(x.entity_id)}"><ha-icon icon="${esc(x.attributes.icon || this.iconFor(d))}"></ha-icon><span>${esc(x.attributes.friendly_name || x.entity_id)}</span><small>${esc(this.stateWord(x))}</small></button>`; };
    el.root.innerHTML = `<style>${this.css(p, g, dark, el)}</style>
    <div class="dim" data-act="close"></div>
    <div class="sh" role="dialog" aria-modal="true" aria-label="${esc(rm.name)}">
      <button class="hd" data-act="grow" aria-label="${el.full ? "Show less" : "Show more"}"></button>
      <div class="hdr"><span class="ic"><ha-icon icon="${esc(rm.icon || "mdi:home-outline")}"></ha-icon></span><span class="nm"><b>${esc(rm.name)}</b><span>${esc(word)}</span></span>
        <button class="x" data-act="close" aria-label="Close"><ha-icon icon="mdi:close"></ha-icon></button></div>
      ${lights.length ? `<div class="bar" data-bar="rlights"><i style="width:${pct}%;background:linear-gradient(90deg,#E07B00,#FDE68A)"></i><b>${lon.length ? `Lights ${pct}%` : "Lights off"}</b></div>` : ""}
      ${devs.length ? `<div class="tiles">${shown.map(tile).join("")}</div>` : `<div class="note">No devices picked for this room.</div>`}
      ${el.full ? (rm.path ? `<button class="wb" data-act="go">Open the room's page</button>` : "") : devs.length > 6 || rm.path ? `<button class="more" data-act="grow">Swipe up for more</button>` : ""}
    </div>`;
    this.wire({ entity_id: "room.x", attributes: {} }, g);
    try { RoostLang.apply(el.host, el.root, {}); } catch (e) { /* words stay */ }
    el.root.querySelector('[data-act="go"]')?.addEventListener("click", () => { const path = rm.path; this.close(); history.pushState(null, "", path); window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } })); });
  },
  iconFor(d) { return { light: "mdi:lightbulb", switch: "mdi:power-socket-uk", fan: "mdi:fan", climate: "mdi:snowflake", cover: "mdi:curtains", media_player: "mdi:television", humidifier: "mdi:air-humidifier", input_boolean: "mdi:toggle-switch", lock: "mdi:lock", vacuum: "mdi:robot-vacuum" }[d] || "mdi:circle-outline"; },
  css(p, g, dark, el) {
    const sheetBg = dark ? "#141831" : "#FFFFFF";
    return `
      :host{font-family:Inter,var(--paper-font-body1_-_font-family,system-ui),sans-serif;color:${p.text}}
      .dim{position:absolute;inset:0;background:${dark ? "rgba(5,6,16,.55)" : "rgba(22,25,54,.28)"}}
      .sh{position:absolute;left:0;right:0;bottom:0;margin:0 auto;max-width:560px;box-sizing:border-box;border-radius:32px 32px 0 0;background:${sheetBg};padding:10px 20px calc(24px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:18px;max-height:${el.full ? "88vh" : "60vh"};overflow-y:auto;box-shadow:0 -24px 60px -20px ${dark ? "rgba(109,75,255,.35)" : "rgba(40,30,90,.18)"};touch-action:pan-y}
      .sh > *{flex-shrink:0}
      .hd{align-self:center;width:40px;height:5px;border-radius:3px;background:${p.track};border:0;padding:0;cursor:grab}
      .hdr{display:flex;align-items:center;gap:12px}
      .ic{width:48px;height:48px;border-radius:16px;flex:none;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${g[0]},${g[1]});color:#FFFFFF;box-shadow:0 10px 22px -10px ${g[0]};--mdc-icon-size:24px}
      .nm{flex:1;min-width:0}.nm b{display:block;font-size:17px;font-weight:600}.nm span{font-size:13px;color:${p.muted}}
      .x{width:40px;height:40px;border-radius:50%;border:0;background:${p.inset};color:${p.muted};display:flex;align-items:center;justify-content:center;cursor:pointer;--mdc-icon-size:20px;flex:none}
      button{font-family:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
      .bar{position:relative;height:64px;border-radius:20px;background:${p.inset};overflow:hidden;cursor:pointer;touch-action:none}
      .bar i{position:absolute;left:0;top:0;bottom:0}
      .bar b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:700}
      .row{display:flex;gap:10px;align-items:center}.row.c{justify-content:center;gap:22px}
      .sw{flex:1;height:56px;border-radius:18px;border:0}
      .rb{border-radius:50%;border:0;background:${p.inset};color:${p.text};display:flex;align-items:center;justify-content:center;flex:none;--mdc-icon-size:24px;transition:transform .12s}
      .rb.pr{background:linear-gradient(135deg,${g[0]},${g[1]});color:#FFFFFF;box-shadow:0 12px 26px -12px ${g[0]}}
      .rb:active,.wb:active{transform:scale(.94)}
      .wb{height:56px;border-radius:18px;border:0;background:${p.inset};color:${p.text};font-size:15px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px;--mdc-icon-size:20px;transition:transform .12s;width:100%}
      .wb.pr{background:linear-gradient(135deg,${g[0]},${g[1]});color:#FFFFFF;box-shadow:0 12px 26px -12px ${g[0]}}
      .g2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      .dial{display:flex;justify-content:space-between;align-items:center;padding:4px 8px}
      .big{font-family:'Space Grotesk',Inter,sans-serif;font-size:48px;font-weight:700;line-height:1}.big small{font-size:20px;font-weight:600;margin-left:4px;color:${p.muted}}
      .seg{display:grid;gap:4px;padding:4px;border-radius:16px;background:${p.inset}}
      .seg button{height:44px;border-radius:12px;border:0;background:transparent;color:${p.muted};font-size:14px;font-weight:600}
      .seg button.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:#FFFFFF}
      .sens{display:flex;align-items:flex-end;gap:16px}.sens svg{flex:1;height:60px;min-width:0}
      .note{font-size:14px;color:${p.muted}}
      .mt{font-size:15px;font-weight:600;text-align:center}.mt span{color:${p.muted};font-weight:500}
      .more{border:0;background:none;color:${p.muted};font-size:12px;padding:0;align-self:center}
      .sec{font-size:12px;font-weight:600;letter-spacing:.6px;color:${p.muted}}
      .tl{display:flex;flex-direction:column;gap:10px}.tl div{display:flex;gap:12px;align-items:center;font-size:14px}.tl i{width:10px;height:10px;border-radius:50%;flex:none}.tl span:last-child{margin-left:auto;font-size:12px;color:${p.muted}}
      .cam{border-radius:22px;overflow:hidden;background:${p.inset};aspect-ratio:16/9}.cam img{width:100%;height:100%;object-fit:cover;display:block}
      .pp{display:flex;align-items:center;gap:16px}.av{width:72px;height:72px;border-radius:50%;flex:none;overflow:hidden;display:flex;align-items:center;justify-content:center;background:${p.inset};color:#FFFFFF;font-size:24px;font-weight:700}.av img{width:100%;height:100%;object-fit:cover}
      .chips{display:flex;flex-wrap:wrap;gap:8px}.chips button{height:40px;padding:0 14px;border-radius:999px;border:0;background:${p.inset};color:${p.text};font-size:14px;font-weight:600}.chips button.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:#FFFFFF}
      .tiles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.tiles button{min-height:72px;border-radius:18px;border:0;padding:12px;background:${p.inset};color:${p.text};display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;gap:6px;text-align:left;--mdc-icon-size:20px}
      .tiles button span{font-size:14px;font-weight:600}.tiles button small{font-size:12px;opacity:.8}.tiles button.on{color:#FFFFFF}
      .kv{border-radius:16px;background:${p.inset};padding:4px 14px}.kv div{display:flex;justify-content:space-between;gap:12px;padding:10px 0;font-size:14px;border-top:1px solid ${p.border}}.kv div:first-child{border-top:0}.kv span:first-child{color:${p.muted}}
    `;
  },
  draw() {
    const el = this.el, h = this.hass(); if (!el || !h) return;
    el.drawn = Date.now();
    if (el.room) { this.drawRoom(); return; }
    const s = h.states[el.id]; if (!s) { this.close(); return; }
    el.last = s;
    if (el.hist === null) { el.hist = []; this.history(el.id); }
    const dark = !!h.themes?.darkMode, p = PALETTE[dark ? "dark" : "light"], dom = el.id.split(".")[0];
    const { g } = this.look(dom, s), a = s.attributes;
    const name = a.friendly_name || el.id;
    const icon = a.icon || { light: "mdi:lightbulb", switch: "mdi:power-socket-uk", climate: "mdi:snowflake", cover: "mdi:curtains", lock: "mdi:lock", media_player: "mdi:television", fan: "mdi:fan", sensor: "mdi:thermometer", binary_sensor: "mdi:door", scene: "mdi:palette", script: "mdi:script-text-play", automation: "mdi:robot",
      camera: "mdi:cctv", alarm_control_panel: "mdi:shield-home", vacuum: "mdi:robot-vacuum", water_heater: "mdi:water-boiler", person: "mdi:account", device_tracker: "mdi:cellphone-marker", weather: "mdi:weather-partly-cloudy",
      select: "mdi:format-list-bulleted", input_select: "mdi:format-list-bulleted", number: "mdi:ray-vertex", input_number: "mdi:ray-vertex", update: "mdi:package-up", humidifier: "mdi:air-humidifier", siren: "mdi:bullhorn" }[dom] || "mdi:information-outline";
    const attrs = Object.entries(a).filter(([k, v]) => !["friendly_name", "icon", "entity_picture", "supported_features", "supported_color_modes", "color_mode", "hvac_modes", "fan_modes", "preset_modes", "swing_modes", "effect_list", "source_list", "sound_mode_list", "entity_id", "attribution", "device_class", "state_class", "unit_of_measurement", "restored", "editable", "id", "min_mireds", "max_mireds", "min_color_temp_kelvin", "max_color_temp_kelvin", "xy_color", "hs_color", "rgb_color", "rgbw_color", "rgbww_color"].includes(k) && v != null && (typeof v !== "object")).slice(0, 6);
    el.root.innerHTML = `<style>${this.css(p, g, dark, el)}</style>
    <div class="dim" data-act="close"></div>
    <div class="sh" role="dialog" aria-modal="true" aria-label="${esc(name)}">
      <button class="hd" data-act="grow" aria-label="${el.full ? "Show less" : "Show more"}"></button>
      <div class="hdr"><span class="ic"><ha-icon icon="${esc(icon)}"></ha-icon></span><span class="nm"><b>${esc(name)}</b><span>${esc(this.stateWord(s))}</span></span>
        <button class="x" data-act="close" aria-label="Close"><ha-icon icon="mdi:close"></ha-icon></button></div>
      ${this.main(s, g, p)}
      ${el.full ? `
        ${el.changes && el.changes.length ? `<div class="sec">LATELY</div><div class="tl">${el.changes.map((c) => `<div><i style="background:${OFF_STATES.includes(c.state) ? p.knob : g[1]}"></i><span>${esc(String(c.state).replace(/_/g, " ").replace(/^./, (m) => m.toUpperCase()))}</span><span>${esc(ago(c.at))}</span></div>`).join("")}</div>` : ""}
        ${attrs.length ? `<div class="sec">DETAILS</div><div class="kv">${attrs.map(([k, v]) => `<div><span>${esc(k.replace(/_/g, " ").replace(/^./, (m) => m.toUpperCase()))}</span><span>${esc(String(v))}</span></div>`).join("")}</div>` : ""}
        <button class="wb" data-act="ha"><ha-icon icon="mdi:cog-outline"></ha-icon>More in Home Assistant</button>`
    : `<button class="more" data-act="grow">Swipe up for more</button>`}
    </div>`;
    this.wire(s, g);
    try { RoostLang.apply(el.host, el.root, {}); } catch (e) { /* words stay */ }
  },
  wire(s, g) {
    const el = this.el, root = el.root, id = s.entity_id, dom = id.split(".")[0], a = s.attributes;
    root.querySelectorAll("[data-act]").forEach((b) => b.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const act = b.dataset.act;
      if (act === "close") return this.close();
      if (act === "grow") { el.full = !el.full; return this.draw(); }
      if (act === "ha") { this.close(); this.ha()?.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: id }, bubbles: true, composed: true })); return undefined; }
      if (act === "toggle") return this.call("homeassistant", "toggle", { entity_id: id });
      if (act.startsWith("ct:")) return this.call("light", "turn_on", { entity_id: id, color_temp_kelvin: Number(act.slice(3)) });
      if (act.startsWith("t:")) { const t = Math.round(((a.temperature ?? 22) + Number(act.slice(2))) * 2) / 2; return this.call("climate", "set_temperature", { entity_id: id, temperature: t }); }
      if (act.startsWith("mode:")) return this.call("climate", "set_hvac_mode", { entity_id: id, hvac_mode: act.slice(5) });
      if (act === "open" || act === "close_c") return this.call("cover", "open_cover", { entity_id: id });
      if (act === "lock" || act === "unlock") return this.call("lock", act, { entity_id: id });
      if (act === "play") return this.call("media_player", "media_play_pause", { entity_id: id });
      if (act === "prev") return this.call("media_player", "media_previous_track", { entity_id: id });
      if (act === "next") return this.call("media_player", "media_next_track", { entity_id: id });
      if (act === "run") return this.call(dom, "turn_on", { entity_id: id });
      if (act === "trigger") return this.call("automation", "trigger", { entity_id: id });
      if (act === "press") return this.call(dom, "press", { entity_id: id });
      if (act === "stop") return this.call("cover", "stop_cover", { entity_id: id });
      if (act.startsWith("alarm:")) {
        const m = act.slice(6);
        if (a.code_format && (m === "disarm" || a.code_arm_required !== false)) { this.close(); this.ha()?.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: id }, bubbles: true, composed: true })); return undefined; }
        return this.call("alarm_control_panel", m === "disarm" ? "alarm_disarm" : `alarm_${m}`, { entity_id: id });
      }
      if (act.startsWith("vac:")) return this.call("vacuum", act.slice(4), { entity_id: id });
      if (act.startsWith("wt:")) return this.call("water_heater", "set_temperature", { entity_id: id, temperature: (a.temperature ?? 50) + Number(act.slice(3)) });
      if (act.startsWith("op:")) return this.call("water_heater", "set_operation_mode", { entity_id: id, operation_mode: act.slice(3) });
      if (act.startsWith("sel:")) return this.call(dom, "select_option", { entity_id: id, option: act.slice(4) });
      if (act === "install") return this.call("update", "install", { entity_id: id });
      if (act.startsWith("dev:")) { const d = act.slice(4); return this.call(d.startsWith("cover.") ? "cover" : "homeassistant", d.startsWith("cover.") ? "toggle" : "toggle", { entity_id: d }); }
      if (act.startsWith("open:")) { this.open(act.slice(5)); return undefined; }
      return undefined;
    }));
    // "Close" on a curtain uses its own name so it does not shut the sheet
    root.querySelectorAll('.g2 [data-act="close"]').forEach((b) => { b.dataset.act = "close_cover"; b.replaceWith(b.cloneNode(true)); });
    root.querySelectorAll('[data-act="close_cover"]').forEach((b) => b.addEventListener("click", (ev) => { ev.stopPropagation(); this.call("cover", "close_cover", { entity_id: id }); }));
    // drag the bars: the value follows the finger and is sent when it lets go
    root.querySelectorAll("[data-bar]").forEach((bar) => {
      const fill = bar.querySelector("i"), label = bar.querySelector("b");
      const at = (e) => Math.max(0, Math.min(100, Math.round(((e.clientX - bar.getBoundingClientRect().left) / bar.clientWidth) * 100)));
      let v = null;
      const word = (x) => (bar.dataset.bar === "num" ? `${fmt(Number(a.min ?? 0) + (Number(a.max ?? 100) - Number(a.min ?? 0)) * x / 100, 0)}${unitGap(a.unit_of_measurement || "")}` : `${x}%`);
      bar.addEventListener("pointerdown", (e) => { el.busy = true; bar.setPointerCapture(e.pointerId); v = at(e); fill.style.width = `${v}%`; label.textContent = word(v); });
      bar.addEventListener("pointermove", (e) => { if (v == null) return; v = at(e); fill.style.width = `${v}%`; label.textContent = word(v); });
      bar.addEventListener("pointerup", () => {
        if (v == null) return; const k = bar.dataset.bar; el.busy = false;
        if (k === "light") this.call("light", v ? "turn_on" : "turn_off", v ? { entity_id: id, brightness_pct: v } : { entity_id: id });
        if (k === "cover") this.call("cover", "set_cover_position", { entity_id: id, position: v });
        if (k === "vol") this.call("media_player", "volume_set", { entity_id: id, volume_level: v / 100 });
        if (k === "fan") this.call("fan", v ? "set_percentage" : "turn_off", v ? { entity_id: id, percentage: v } : { entity_id: id });
        if (k === "num") { const mn = Number(a.min ?? 0), mx = Number(a.max ?? 100), st = Number(a.step || 1); this.call(dom, "set_value", { entity_id: id, value: Math.round((mn + (mx - mn) * v / 100) / st) * st }); }
        if (k === "rlights") this.call("light", v ? "turn_on" : "turn_off", v ? { entity_id: el.room.lights, brightness_pct: v } : { entity_id: el.room.lights });
        v = null;
      });
    });
    // swipe the sheet: up for more, down to close
    const sh = root.querySelector(".sh");
    let y0 = null;
    sh.addEventListener("pointerdown", (e) => { if (e.target.closest("[data-bar],button")) return; y0 = e.clientY; });
    sh.addEventListener("pointerup", (e) => {
      if (y0 == null) return; const dy = e.clientY - y0; y0 = null;
      if (dy < -40 && !el.full) { el.full = true; this.draw(); } else if (dy > 60) { if (el.full) { el.full = false; this.draw(); } else this.close(); }
    });
  },
};
window.RoostSheet = RoostSheet;

// ------------------------------------------------------------------ Roost Popup
// One popup for everything: the doorbell with its camera, alarms, leaks, a door left open, the washing done,
// a timer, "are you sure?" questions, or any cards. It opens when a device changes, from a link (#popup-doorbell),
// from a button (fire-dom-event roost_popup), or from an automation, and closes itself when it should.
const RoostPop = {
  defs: new Map(), queue: [], cur: null, hass: null, layer: null, subscribed: false, helper: null, ready: false,

  init() {
    if (this.ready) return;
    this.ready = true;
    const onLoc = () => this.fromHash();
    window.addEventListener("hashchange", onLoc);
    window.addEventListener("location-changed", () => setTimeout(onLoc, 30));
    window.addEventListener("ll-custom", (ev) => {
      const d = ev.detail || {};
      if (d.roost_popup) this.open(typeof d.roost_popup === "string" ? d.roost_popup : d.roost_popup);
      if (d.roost_popup_close) this.close();
    });
  },

  setHass(h) {
    this.init();
    this.hass = h;
    if (this.layer) this.layer.hass = h;
    if (!this.subscribed && h?.connection?.subscribeEvents) {
      this.subscribed = true;
      // automations: event "roost_popup" with an id, or a whole popup; { close: true } closes it
      h.connection.subscribeEvents((e) => this.fromEvent(e.data || {}), "roost_popup").catch(() => { /* only people with admin rights may listen; the helper below works for everyone */ });
    }
    // a text helper, input_text.roost_popup: set it to a popup's id to open it, or to "close"
    const hs = h?.states?.["input_text.roost_popup"];
    if (hs) {
      const key = `${hs.state}|${hs.last_changed}`;
      if (this.helper !== null && key !== this.helper && Date.now() - new Date(hs.last_changed) < 60000) {
        if (hs.state === "close") this.close(); else if (hs.state && !UNAVAILABLE.includes(hs.state)) this.open(hs.state);
      }
      this.helper = key;
    }
  },

  register(card, cfg) { if (cfg.id) this.defs.set(cfg.id, { card, cfg }); this.fromHash(); },

  unregister(card, id) { if (this.defs.get(id)?.card === card) this.defs.delete(id); },

  // who may see a popup: people (person.*) matched to Home Assistant users
  allows(users) {
    if (!Array.isArray(users) || !users.length) return true;
    const me = this.hass?.user?.id, name = String(this.hass?.user?.name || "").toLowerCase();
    return users.some((u) => this.hass?.states?.[u]?.attributes?.user_id === me || String(u).toLowerCase() === name);
  },

  fromHash() {
    const m = location.hash.match(/^#popup-([\w-]+)$/);
    if (m && this.defs.has(m[1]) && this.cur?.id !== m[1]) this.open(m[1], { fromHash: true });
  },

  fromEvent(d) {
    if (d.close) { this.close(typeof d.close === "string" ? d.close : null); return; }
    if (!this.allows(d.users)) return;
    if (d.id && this.defs.has(d.id) && !d.title) this.open(d.id); else this.open({ ...d, id: d.id || `event-${Date.now()}` });
  },

  open(what, opts = {}) {
    const cfg = typeof what === "string" ? this.defs.get(what)?.cfg : what;
    if (!cfg || !this.allows(cfg.users)) return null;
    const item = { ...cfg, ...opts, at: Date.now() };
    if (this.cur && this.cur.id === item.id) { this.cur = item; this.show(); return item; }
    if (this.cur) { this.queue = this.queue.filter((q) => q.id !== item.id); if (item.urgent) { this.queue.unshift(this.cur); this.cur = item; this.show(); } else this.queue.push(item); return item; }
    this.cur = item;
    this.show();
    return item;
  },

  close(id) {
    if (!this.cur || (id && this.cur.id !== id)) { if (id) this.queue = this.queue.filter((q) => q.id !== id); return; }
    const was = this.cur;
    was.resolve?.(false);
    if (was.fromHash && location.hash === `#popup-${was.id}`) { try { history.replaceState(history.state, "", location.pathname + location.search); } catch (e) { /* old browser */ } }
    this.cur = this.queue.shift() || null;
    this.show();
  },

  // the nice "are you sure?" every Roost card uses instead of the browser's grey box
  confirm(text, o = {}) {
    if (!document.body) return Promise.resolve(window.confirm(text));
    return new Promise((resolve) => {
      this.open({ id: `confirm-${Date.now()}`, kind: "confirm", title: o.title || "Are you sure?", message: text, icon: o.icon || "mdi:help-circle-outline", color: o.color || "purple", urgent: true, close_after: 0,
        resolve, buttons: [{ name: o.no || "Cancel", icon: "mdi:close", answer: false }, { name: o.yes || "Yes", icon: "mdi:check", color: "active", answer: true }] });
    });
  },

  show() {
    if (!this.layer) { this.layer = document.createElement("roost-popup-layer"); document.body.appendChild(this.layer); }
    this.layer.hass = this.hass;
    this.layer.showItem(this.cur, this.queue.length);
  },
};

class RoostPopupLayer extends RoostBase {
  constructor() { super(); this._config = { theme: "auto" }; this.attachShadow({ mode: "open" }); this._onKey = (e) => { if (e.key === "Escape" && this._item && this._item.dismissible !== false) RoostPop.close(); }; }

  set hass(h) { this._hass = h; this._cards?.forEach((el) => { el.hass = h; }); if (this._item && !this._busy) this.refresh(); }

  get hass() { return this._hass; }

  // HA's pop-ups and page changes are heard by Home Assistant, not by the page body
  fire(type, detail) { (document.querySelector("home-assistant") || window).dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true })); }

  connectedCallback() { window.addEventListener("keydown", this._onKey); }

  disconnectedCallback() { window.removeEventListener("keydown", this._onKey); }

  showItem(item, more) {
    clearTimeout(this._timer); clearInterval(this._pic);
    this._item = item; this._more = more; this._cards = null; this._sig = null;
    this._config = { theme: item?.theme || "auto" };
    if (!item) { this.shadowRoot.innerHTML = ""; this.style.display = "none"; return; }
    this.style.cssText = "position:fixed;inset:0;z-index:999;display:block";
    if (item.sound) { try { new Audio(item.sound).play().catch(() => {}); } catch (e) { /* no sound here */ } }
    try { navigator.vibrate?.(item.kind === "alert" ? [60, 40, 60] : 20); } catch (e) { /* no vibration */ }
    const secs = Number(item.close_after) || 0;
    if (secs > 0) this._timer = setTimeout(() => { if (this._item === item) RoostPop.close(); }, secs * 1000);
    this.render();
    if (Array.isArray(item.cards) && item.cards.length) this.buildCards(item);
    if (item.camera && !item.live) this._pic = setInterval(() => { const img = this.shadowRoot.querySelector(".cam img"); const s = this._hass?.states?.[item.camera]; if (img && s?.attributes.entity_picture) img.src = `${s.attributes.entity_picture}&t=${Date.now()}`; }, 2000);
  }

  async buildCards(item) {
    const helpers = window.loadCardHelpers ? await window.loadCardHelpers() : null;
    if (this._item !== item) return;
    this._cards = item.cards.map((cfg0) => {
      let el; const cfg = withTheme(cfg0, item.theme);
      try { el = helpers ? helpers.createCardElement(cfg) : document.createElement(String(cfg.type || "").replace(/^custom:/, "")); if (!helpers) el.setConfig?.(cfg); }
      catch (e) { el = document.createElement("div"); el.textContent = `Card problem: ${e.message}`; }
      el.hass = this._hass; return el;
    });
    const box = this.shadowRoot.querySelector(".cards");
    if (box) this._cards.forEach((el) => box.appendChild(el));
  }

  // only the live parts change while it is open: the state line and the button lights
  refresh() {
    const it = this._item, r = this.shadowRoot;
    if (!it || !r) return;
    const s = it.entity ? this._hass?.states?.[it.entity] : null, sub = r.querySelector(".sub");
    if (sub && s) sub.textContent = this.subText(it);
  }

  subText(it) {
    if (it.subtitle) return it.subtitle;
    const s = it.entity ? this._hass?.states?.[it.entity] : null;
    if (!s) return "";
    const st = UNAVAILABLE.includes(s.state) ? "Offline" : this._hass.formatEntityState ? this._hass.formatEntityState(s) : s.state;
    return `${s.attributes.friendly_name || it.entity} · ${st}`;
  }

  message(it) {
    const s = it.entity ? this._hass?.states?.[it.entity] : null;
    const st = s ? String(this._hass.formatEntityState ? this._hass.formatEntityState(s) : s.state) : "";
    return String(it.message || "").replace(/\{\{\s*state\s*\}\}/g, st && st.length > 1 && st[1] === st[1].toLowerCase() ? st[0].toLowerCase() + st.slice(1) : st).replace(/\{\{\s*name\s*\}\}/g, s?.attributes.friendly_name || "");
  }

  render() {
    const it = this._item;
    if (!it) return;
    const p = this.p, dark = this.dark;
    const g = it.color === "active" ? ACTIVE : COLORS[it.color] || (it.kind === "alert" ? COLORS.coral : it.kind === "camera" ? COLORS.coral : ACTIVE);
    const icon = it.icon || { alert: "mdi:alert-circle-outline", camera: "mdi:doorbell-video", confirm: "mdi:help-circle-outline", cards: "mdi:view-grid-outline", info: "mdi:information-outline" }[it.kind] || "mdi:bell-outline";
    const cam = it.camera ? this._hass?.states?.[it.camera] : null;
    const wide = it.size === "wide" || (it.size !== "small" && (it.camera || (Array.isArray(it.cards) && it.cards.length > 1)));
    const buttons = Array.isArray(it.buttons) ? it.buttons.slice(0, 4) : [];
    const secs = Number(it.close_after) || 0;
    const motion = it.kind === "camera" || /doorbell|bell/.test(icon) ? "roost-wiggle .6s ease-in-out infinite" : it.kind === "alert" ? "roost-pulse 1.2s ease-in-out infinite" : "none";
    const bcol = (b) => (b.color === "active" ? ACTIVE : COLORS[b.color] || null);
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      @keyframes roost-left{from{transform:scaleX(1)}to{transform:scaleX(0)}}
      .bg{position:absolute;inset:0;background:rgba(5,6,15,${dark ? ".62" : ".38"});backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
      .sheet{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(calc(100% - 32px),${wide ? 620 : 440}px);max-height:calc(100% - 48px);overflow:auto;box-sizing:border-box;
        background:${dark ? "#141831" : "#FFFFFF"};border:1px solid ${p.border};border-radius:28px;padding:20px;color:${p.text};display:flex;flex-direction:column;gap:16px;
        box-shadow:0 30px 60px -20px rgba(0,0,0,.6),0 0 0 1px ${g[0]}22}
      @media (max-width: 600px){.sheet{left:0;right:0;top:auto;bottom:0;transform:none;width:100%;max-height:88%;border-radius:28px 28px 0 0;padding:18px 18px calc(18px + env(safe-area-inset-bottom))}
        .sheet::before{content:"";display:block;width:40px;height:5px;border-radius:3px;background:${p.track};margin:-6px auto 2px}}
      .hd{display:flex;align-items:center;gap:14px}
      .ic{width:48px;height:48px;border-radius:16px;flex:none;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};box-shadow:0 10px 24px -8px ${g[2]};--mdc-icon-size:24px}
      .ic ha-icon{animation:${motion}}
      .tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
      .tx b{font-family:${FONT_NUM};font-size:20px;font-weight:700;line-height:1.2}
      .sub{font-size:13px;color:${p.muted};line-height:1.3}
      .x{width:44px;height:44px;border-radius:15px;border:0;background:${p.inset};color:${p.text};display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none;--mdc-icon-size:20px;transition:transform .12s}
      .x:active,.bt:active{transform:scale(.95)}
      .x:focus:not(:focus-visible),.bt:focus:not(:focus-visible){outline:none}
      .msg{font-size:15px;line-height:1.5;color:${p.text};white-space:pre-line}
      .cam{position:relative;aspect-ratio:16/9;border-radius:18px;overflow:hidden;background:${p.inset}}
      .cam img,.cam ha-camera-stream{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
      .cam .tag{position:absolute;left:10px;top:10px;padding:4px 10px;border-radius:999px;background:rgba(10,8,40,.55);color:#fff;font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px}
      .cam .tag i{width:8px;height:8px;border-radius:50%;background:#F43F6B;animation:roost-breathe 1.4s ease-in-out infinite}
      .cam .off{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:${p.muted};font-size:14px}
      .cards{display:grid;grid-template-columns:repeat(${Math.max(1, Math.min(4, Number(it.columns) || 1))},minmax(0,1fr));gap:8px}
      .cards > *{min-width:0}
      @media (max-width: 600px){.cards{grid-template-columns:minmax(0,1fr)}}
      .bts{display:grid;grid-template-columns:repeat(${Math.max(1, buttons.length)},minmax(0,1fr));gap:8px}
      @media (max-width: 380px){.bts{grid-template-columns:repeat(${Math.min(2, Math.max(1, buttons.length))},minmax(0,1fr))}}
      .bt{min-height:50px;border-radius:16px;border:0;padding:8px 12px;display:flex;align-items:center;justify-content:center;gap:8px;font:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:transform .12s;--mdc-icon-size:20px}
      .bt.plain{background:${p.inset};color:${p.text}}
      .more{align-self:center;font-size:12px;font-weight:600;color:${p.muted}}
      .tm{height:4px;border-radius:999px;background:${p.track};overflow:hidden}
      .tm i{display:block;height:100%;background:linear-gradient(90deg,${g[0]},${g[1]});transform-origin:left;animation:roost-left ${secs}s linear forwards}
      @media (prefers-reduced-motion: reduce){.ic ha-icon{animation:none}}
    </style>
    <div class="bg" data-bg="1"></div>
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="pt">
      <div class="hd"><span class="ic"><ha-icon icon="${esc(icon)}"></ha-icon></span>
        <div class="tx"><b id="pt" class="t">${esc(it.title || "Roost")}</b>${it.subtitle || it.entity ? `<span class="sub t">${esc(this.subText(it))}</span>` : ""}</div>
        ${it.dismissible === false ? "" : '<button class="x" data-close="1" aria-label="Close"><ha-icon icon="mdi:close"></ha-icon></button>'}</div>
      ${it.camera ? `<div class="cam" role="button" tabindex="0" aria-label="Open the camera">${!cam ? '<div class="off t">Camera not found</div>' : UNAVAILABLE.includes(cam.state) ? '<div class="off t">Camera offline</div>' : it.live ? "" : `<img alt="" src="${esc(cam.attributes.entity_picture || "")}">`}<span class="tag"><i></i>${esc(cam?.attributes.friendly_name || "Camera")}</span></div>` : ""}
      ${it.image ? `<div class="cam pic"><img alt="" src="${esc(it.image)}"></div>` : ""}
      ${it.message ? `<div class="msg t">${esc(this.message(it))}</div>` : ""}
      ${Array.isArray(it.cards) && it.cards.length ? '<div class="cards"></div>' : ""}
      ${buttons.length ? `<div class="bts">${buttons.map((b, i) => { const c = bcol(b); return `<button class="bt ${c ? "" : "plain"}" data-b="${i}" style="${c ? `background:linear-gradient(135deg,${c[0]},${c[1]});color:${c[3]};box-shadow:0 10px 22px -10px ${c[2]}` : ""}">${b.icon ? `<ha-icon icon="${esc(b.icon)}"></ha-icon>` : ""}<span class="t">${esc(b.name || "OK")}</span></button>`; }).join("")}</div>` : ""}
      ${this._more ? `<span class="more t">${this._more} more waiting</span>` : ""}
      ${secs > 0 ? '<div class="tm" aria-hidden="true"><i></i></div>' : ""}
    </div>`;
    const r = this.shadowRoot;
    if (it.camera && it.live && cam && !UNAVAILABLE.includes(cam.state) && customElements.get("ha-camera-stream")) {
      const el = document.createElement("ha-camera-stream"); el.hass = this._hass; el.stateObj = cam; el.muted = true; el.controls = false;
      r.querySelector(".cam").prepend(el);
    }
    r.querySelector(".cam")?.addEventListener("click", () => this.moreInfo(it.camera));
    r.querySelectorAll("[data-close],[data-bg]").forEach((el) => el.addEventListener("click", () => { if (el.dataset.bg && it.dismissible === false) return; this.vibrate(); RoostPop.close(); }));
    r.querySelectorAll("[data-b]").forEach((el) => el.addEventListener("click", async () => {
      const b = buttons[+el.dataset.b];
      this.vibrate();
      if (it.resolve && "answer" in b) { const res = it.resolve; it.resolve = null; RoostPop.close(); res(b.answer); return; }
      this._busy = true;
      try { if (b.tap_action) await this.run(b.tap_action, b.entity || it.entity); } finally { this._busy = false; }
      if (b.close !== false) RoostPop.close(it.id);
    }));
    if (this._cards) { const box = r.querySelector(".cards"); this._cards.forEach((el) => box?.appendChild(el)); }
    // the keyboard starts on the main button, without a ring for people who tap
    r.querySelector(".bt:not(.plain), .x")?.focus?.({ preventScroll: true, focusVisible: false });
  }
}
if (!customElements.get("roost-popup-layer")) customElements.define("roost-popup-layer", RoostPopupLayer);

class RoostPopup extends RoostBase {
  static get hasCards() { return true; }
  static get defaults() { return { kind: "alert", color: "", close_after: 0, close_when_back: true, dismissible: true, live: false, columns: 1, size: "auto", open_on: [], buttons: [], cards: [], users: [], theme: "auto" }; }

  validate(c) { if (!c.id) throw new Error("Give the popup a short name (its id), for example doorbell"); if (!/^[\w-]+$/.test(c.id)) throw new Error("The popup's id may only have letters, numbers, - and _"); }

  setConfig(config) {
    if (this._config?.id && this._config.id !== config?.id) RoostPop.unregister(this, this._config.id);
    super.setConfig(config);
    if (!this._setup) RoostPop.register(this, this._config);
  }

  connectedCallback() { if (this._config?.id && !this._setup) RoostPop.register(this, this._config); }

  disconnectedCallback() { if (this._config?.id) RoostPop.unregister(this, this._config.id); }

  static getConfigForm() {
    const ACT = { ui_action: {} };
    return { schema: [
      { type: "grid", name: "", schema: [{ name: "id", label: "Short name (id), used in links: #popup-<id>", required: true, selector: { text: {} } }, { name: "kind", label: "Kind", selector: pick([["alert", "Alert (a warning)"], ["camera", "Camera (doorbell, someone outside)"], ["info", "Message"], ["cards", "Any cards (a room, a remote, a chart)"]]) }] },
      { type: "grid", name: "", schema: [{ name: "title", label: "Title", selector: { text: {} } }, { name: "icon", selector: { icon: {} } }] },
      { name: "message", label: "Message ({{state}} and {{name}} are filled in from the device below)", selector: { text: { multiline: true } } },
      { type: "grid", name: "", schema: [{ name: "entity", label: "A device to show under the title", selector: { entity: {} } }, { name: "camera", label: "Camera", selector: { entity: { domain: "camera" } } }] },
      { type: "expandable", name: "", title: "When it opens by itself", icon: "mdi:bell-ring-outline", schema: [
        { name: "open_on", label: "Opens when a device changes to a state", selector: { object: { multiple: true, label_field: "entity", fields: {
          entity: { label: "Device", required: true, selector: { entity: {} } },
          state: { label: "Changes to (for example on, open, ringing, triggered; empty = on)", selector: { text: {} } },
          above: { label: "Or goes above", selector: { number: { mode: "box", step: "any" } } },
          below: { label: "Or goes below", selector: { number: { mode: "box", step: "any" } } },
        } } } },
        { type: "grid", name: "", schema: [{ name: "close_when_back", label: "Closes when it goes back (the bell stops, the door shuts)", selector: { boolean: {} } }, { name: "close_after", label: "Closes by itself after (seconds, 0 = stays)", selector: slider(0, 300, 5) }] },
        { name: "users", label: "Only for these people (empty = everyone)", selector: { entity: { multiple: true, domain: "person" } } },
        { name: "sound", label: "A sound when it opens (for example /local/chime.mp3)", selector: { text: {} } },
      ] },
      { type: "expandable", name: "", title: "Buttons (up to 4)", icon: "mdi:gesture-tap-button", schema: [
        { name: "buttons", label: "Buttons", selector: { object: { multiple: true, label_field: "name", fields: {
          name: { label: "Name", required: true, selector: { text: {} } }, icon: { label: "Icon", selector: { icon: {} } },
          color: { label: "Colour (empty = plain)", selector: { select: { mode: "dropdown", options: COLOR_OPTIONS.filter((o) => o.value !== "custom") } } },
          tap_action: { label: "When tapped", selector: ACT }, close: { label: "Close the popup after (default yes)", selector: { boolean: {} } },
        } } } },
      ] },
      { type: "expandable", name: "", title: "Look", icon: "mdi:palette", schema: [
        { type: "grid", name: "", schema: [{ name: "color", label: "Colour", selector: { select: { mode: "dropdown", options: COLOR_OPTIONS.filter((o) => o.value !== "custom") } } }, { name: "size", label: "Size", selector: pick([["auto", "Automatic"], ["small", "Small"], ["wide", "Wide"]]) }] },
        { type: "grid", name: "", schema: [{ name: "live", label: "Live camera video (instead of a picture every 2 seconds)", selector: { boolean: {} } }, { name: "dismissible", label: "Can be closed (✕, tap outside, Esc)", selector: { boolean: {} } }] },
        { name: "columns", label: "Cards side by side", selector: slider(1, 4) },
        THEME_FIELD,
      ] },
    ], computeLabel };
  }

  static getStubConfig() { return { id: "doorbell", kind: "camera", title: "Someone is at the door", icon: "mdi:doorbell-video", close_after: 60, open_on: [], buttons: [{ name: "Dismiss", icon: "mdi:close" }] }; }

  getGridOptions() { return { columns: 12, rows: "auto" }; }

  getCardSize() { return this.editing() ? 1 : 0; }

  editing() { return !!(this.editMode || this.preview || /[?&]edit=1/.test(location.search) || this.closest?.("hui-card-preview, hui-dialog-edit-card")); }

  watched() { return (this._config.open_on || []).map((o) => o.entity).filter(Boolean); }

  // opening by itself: a device changes into the chosen state (or crosses a number)
  checkTriggers() {
    const c = this._config, h = this._hass;
    if (!h || this.editing()) return;
    this._prev = this._prev || {};
    for (const o of c.open_on || []) {
      const s = h.states[o.entity];
      if (!s) continue;
      const v = num(s.state), want = o.state != null && o.state !== "" ? String(o.state) : null;
      const hit = o.above != null && o.above !== "" ? v != null && v > Number(o.above) : o.below != null && o.below !== "" ? v != null && v < Number(o.below) : s.state === (want || "on");
      const was = this._prev[o.entity];
      this._prev[o.entity] = hit;
      const fresh = Date.now() - new Date(s.last_changed) < 60000;
      if (hit && (was === false || (was === undefined && fresh))) RoostPop.open(c.id, { watch: { ...o, state: want || s.state }, watchHit: true });
      if (!hit && was && c.close_when_back !== false && RoostPop.cur?.id === c.id) RoostPop.close(c.id);
    }
  }

  set hass(h) { super.hass = h; this.checkTriggers(); }

  get hass() { return this._hass; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, ed = this.editing();
    this.style.display = ed ? "" : "none";
    if (!ed) { this.shadowRoot.innerHTML = ""; return; }
    const g = COLORS[c.color] || ACTIVE;
    const when = (c.open_on || []).map((o) => `${this.name(o.entity, o.entity)} ${o.above != null && o.above !== "" ? `goes above ${o.above}` : o.below != null && o.below !== "" ? `goes below ${o.below}` : `turns ${o.state || "on"}`}`).join(", ");
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .ed{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:18px;border:1px dashed ${p.border};color:${p.text};font-size:13px;line-height:1.4}
      .ic{width:40px;height:40px;border-radius:14px;flex:none;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};--mdc-icon-size:20px}
      .tx{flex:1;min-width:0}.tx b{display:block;font-size:14px}.tx span{color:${p.muted}}
      button{min-height:40px;padding:0 14px;border-radius:14px;border:0;background:${p.inset};color:${p.text};font:inherit;font-weight:700;cursor:pointer;flex:none}
    </style><div class="ed"><span class="ic"><ha-icon icon="${esc(c.icon || "mdi:message-badge-outline")}"></ha-icon></span>
      <div class="tx"><b class="t">Popup · ${esc(c.title || c.id)}</b><span class="t">${esc(when ? `Opens when ${when}. ` : "")}Link: #popup-${esc(c.id)}. Shown here only while editing.</span></div>
      <button data-try="1">Show it</button></div>`;
    this.shadowRoot.querySelector("[data-try]").addEventListener("click", () => { RoostPop.setHass(this._realHass || this._hass); RoostPop.open(c.id); });
  }
}

// ------------------------------------------------------------------ Roost Sensors
// Many small readings in neat squares, each turning orange when outside the range you set.
// How a reading feels: bands from low to high, each with a word, a short word for the scale and a colour.
// Each band: [up to this value, word, short word, colour]. Custom "comfortable from / to" values replace them.
const SENSOR_BANDS = {
  temperature: { min: 14, max: 34, bands: [[18, "Cold", "Cold", "blue"], [20, "Cool", "Cool", "teal"], [26, "Comfortable", "Comfy", "green"], [29, "Warm", "Warm", "amber"], [Infinity, "Hot", "Hot", "coral"]] },
  humidity: { min: 0, max: 100, bands: [[30, "Dry", "Dry", "amber"], [60, "Comfortable", "Comfy", "green"], [70, "Humid", "Humid", "teal"], [Infinity, "Very humid", "Wet", "blue"]] },
  carbon_dioxide: { min: 400, max: 2000, bands: [[800, "Fresh", "Fresh", "green"], [1200, "Stuffy", "Stuffy", "amber"], [Infinity, "Open a window", "Bad", "coral"]] },
  pm25: { min: 0, max: 75, bands: [[12, "Clean", "Clean", "green"], [35, "Moderate", "Fair", "amber"], [Infinity, "Poor", "Poor", "coral"]] },
  battery: { min: 0, max: 100, bands: [[20, "Low", "Low", "coral"], [40, "Getting low", "Low-ish", "amber"], [Infinity, "Good", "Good", "green"]] },
};
const SENSOR_WORDS = { temperature: ["Cool", "Warm"], humidity: ["Dry", "Humid"] };

// The scale of one reading: its ends and its bands (null bands when there is no common scale and nothing was set).
function sensorScale(it, dc, unit, seen) {
  const f = dc === "temperature" && /F/.test(unit || "");
  const conv = (x) => (f && isFinite(x) ? x * 1.8 + 32 : x);
  const base = SENSOR_BANDS[dc];
  const has = (k) => it[k] != null && it[k] !== "";
  let bands = base ? base.bands.map(([u, w, sh, col]) => [conv(u), w, sh, col]) : null;
  if (has("comfort_min") || has("comfort_max")) {
    const [lw, hw] = SENSOR_WORDS[dc] || ["Low", "High"];
    const lo = has("comfort_min") ? Number(it.comfort_min) : -Infinity, hi = has("comfort_max") ? Number(it.comfort_max) : Infinity;
    bands = [...(isFinite(lo) ? [[lo, lw, lw, dc === "humidity" ? "amber" : "blue"]] : []), [hi, dc === "battery" ? "Good" : "Comfortable", "Comfy", "green"], ...(isFinite(hi) ? [[Infinity, hw, hw, "coral"]] : [])];
  }
  const [smn, smx] = seen && seen.length ? [Math.min(...seen), Math.max(...seen)] : [0, 100];
  const pad = (smx - smn) * 0.25 || Math.abs(smx) * 0.25 || 1;
  const min = has("min") ? Number(it.min) : base ? conv(base.min) : Math.floor(smn - pad);
  const max = has("max") ? Number(it.max) : base ? conv(base.max) : Math.ceil(smx + pad);
  return { min, max: max > min ? max : min + 1, bands };
}

function sensorBand(sc, v) { return sc.bands && v != null ? sc.bands.find((b) => v < b[0]) || sc.bands[sc.bands.length - 1] : null; }

class RoostSensors extends RoostBase {
  static get defaults() {
    return { entities: [], style: "line", columns: 3, radius: 18, show_icon: true, show_name: true, show_comfort: true, show_trend: false,
      show_graph: true, show_range: false, show_scale_words: true, hours: 24, color_by: "comfort", color: "purple", theme: "auto" };
  }

  validate(c) { if (!Array.isArray(c.entities) || !c.entities.length) throw new Error("Pick some readings"); }

  items() { return this._config.entities.map((e) => (typeof e === "string" ? { entity: e } : e)); }

  watched() { return this.items().map((i) => i.entity); }

  extraSignature() { return `${this._histAt || 0}`; }

  static getConfigForm() {
    return {
      schema: [
        { name: "style", label: "Style", selector: pick([["line", "A · Line of the day: comfort word, a line of the last hours, today's low and high"], ["ring", "B · Comfort ring: a dial with the comfortable part in green"], ["scale", "C · Comfort scale: one bar from cold to hot, with a dot for now"], ["rows", "E · Compact rows: short rows for wall panels"]]) },
        { type: "expandable", name: "", title: "What it shows", icon: "mdi:eye-outline", expanded: true, schema: [
          { type: "grid", name: "", schema: [{ name: "show_icon", label: "Icon", selector: { boolean: {} } }, { name: "show_name", label: "Name", selector: { boolean: {} } }] },
          { type: "grid", name: "", schema: [{ name: "show_comfort", label: "How it feels (Comfortable, Warm, Dry)", selector: { boolean: {} } }, { name: "show_trend", label: "Change in the last hour", selector: { boolean: {} } }] },
          { type: "grid", name: "", schema: [{ name: "show_graph", label: "Line of the last hours (style A)", selector: { boolean: {} } }, { name: "show_range", label: "Lowest and highest (style A)", selector: { boolean: {} } }] },
          { type: "grid", name: "", schema: [{ name: "show_scale_words", label: "Words under the scale (style C)", selector: { boolean: {} } }, { name: "hours", label: "Hours of history", selector: slider(3, 72, 3) }] },
        ] },
        { name: "entities", label: "Readings", selector: { object: { multiple: true, label_field: "name", fields: {
          entity: { label: "Reading", required: true, selector: { entity: {} } },
          name: { label: "Name", selector: { text: {} } },
          icon: { label: "Icon", selector: { icon: {} } },
          color: { label: "Colour (empty = by how it feels)", selector: { select: { mode: "dropdown", options: COLOR_OPTIONS.filter((o) => !["custom", "active"].includes(o.value)) } } },
          comfort_min: { label: "Comfortable from", selector: { number: { mode: "box", step: "any" } } },
          comfort_max: { label: "Comfortable up to", selector: { number: { mode: "box", step: "any" } } },
          min: { label: "Scale starts at (ring, scale and rows)", selector: { number: { mode: "box", step: "any" } } },
          max: { label: "Scale ends at", selector: { number: { mode: "box", step: "any" } } },
          above: { label: "Warn above", selector: { number: { mode: "box", step: "any" } } },
          below: { label: "Warn below", selector: { number: { mode: "box", step: "any" } } },
          decimals: { label: "Decimals", selector: { number: { min: 0, max: 2, mode: "box" } } },
          hide: { label: "Hide on this reading", selector: { select: { multiple: true, mode: "list", options: [{ value: "icon", label: "Icon" }, { value: "name", label: "Name" }, { value: "comfort", label: "How it feels" }, { value: "trend", label: "Change in the last hour" }, { value: "graph", label: "Line (style A)" }, { value: "range", label: "Lowest and highest (style A)" }, { value: "scale_words", label: "Words under the scale (style C)" }] } } },
        } } } },
        { type: "expandable", name: "", title: "Look", icon: "mdi:palette", schema: [
          { name: "color_by", label: "Colours", selector: pick([["comfort", "By how it feels (green when comfortable)"], ["fixed", "One colour for every reading"], ["type", "By kind (warm for temperature, blue for humidity)"]]) },
          ...colourFields("color", "The one colour"),
          { type: "grid", name: "", schema: [{ name: "columns", label: "Side by side", selector: { number: { min: 1, max: 6, mode: "box" } } }, { name: "radius", selector: slider(0, 32, 2) }] },
          THEME_FIELD,
        ] },
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) { return { entities: Object.keys(hass.states).filter((id) => id.startsWith("sensor.") && num(hass.states[id].state) != null).slice(0, 4) }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  // the last hours of every reading, fetched in one go and kept for ten minutes
  async loadHistory() {
    const c = this._config, h = this._hass;
    if (!h?.callWS || this._histLoading) return;
    if (this._histAt && Date.now() - this._histAt < 600000) return;
    this._histLoading = true;
    try {
      const start = new Date(Date.now() - Math.max(3, Number(c.hours) || 24) * 3600e3).toISOString();
      const ids = this.items().map((i) => i.entity).filter((id) => num(this.sx(id)?.state) != null);
      if (!ids.length) return;
      const r = await h.callWS({ type: "history/history_during_period", start_time: start, entity_ids: ids, minimal_response: true, no_attributes: true, significant_changes_only: false });
      const out = {};
      for (const id of ids) out[id] = (r?.[id] || []).map((x) => [(x.lu ?? x.lc) * 1000 || Date.parse(x.last_updated || x.last_changed), num(x.s ?? x.state)]).filter(([t, v]) => isFinite(t) && v != null);
      this._hist = out;
      this._histAt = Date.now();
      this._sig = null;
      if (this._hass) this.hass = this._realHass || this._hass;
    } catch (e) { this._histAt = Date.now(); } finally { this._histLoading = false; }
  }

  spark(id, v, col) {
    const pts = (this._hist?.[id] || []).slice();
    if (v != null) pts.push([Date.now(), v]);
    if (pts.length < 2) return "";
    const W = 100, H = 30, t0 = Date.now() - Math.max(3, Number(this._config.hours) || 24) * 3600e3, t1 = Date.now();
    const vs = pts.map((x) => x[1]); let lo = Math.min(...vs), hi = Math.max(...vs);
    if (hi - lo < 0.5) { const m = (hi + lo) / 2; lo = m - 0.25; hi = m + 0.25; }
    const xy = pts.map(([t, y]) => [Math.max(0, ((t - t0) / (t1 - t0)) * W), H - 3 - ((y - lo) / (hi - lo)) * (H - 6)]);
    // the reading was the same before its first change, so the line starts at the left edge
    if (xy[0][0] > 0) xy.unshift([0, xy[0][1]]);
    const line = curvePath(smoothLine(xy, W, H));
    const gid = `g${Math.abs([...id].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) | 0, 7))}`;
    return `<svg class="sp" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".32"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>
      <path d="${line} L${xy[xy.length - 1][0].toFixed(1)},${H} L0,${H} Z" fill="url(#${gid})"/><path d="${line}" fill="none" stroke="${col}" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round"/></svg>`;
  }

  // everything one reading needs, whichever style draws it
  reading(it) {
    const c = this._config, s = this.sx(it.entity), v = s ? num(s.state) : null, dc = s?.attributes.device_class;
    const unit = s?.attributes.unit_of_measurement || "";
    const icons = { temperature: "mdi:thermometer", humidity: "mdi:water-percent", power: "mdi:flash", energy: "mdi:lightning-bolt", battery: "mdi:battery", carbon_dioxide: "mdi:molecule-co2", pm25: "mdi:blur", illuminance: "mdi:brightness-5", pressure: "mdi:gauge", voltage: "mdi:sine-wave", current: "mdi:current-ac" };
    const kind = { temperature: "coral", humidity: "blue", power: "amber", energy: "green", battery: "green", carbon_dioxide: "slate", pm25: "purple", illuminance: "amber", voltage: "purple" };
    const hist = this._hist?.[it.entity] || [];
    const seen = [...hist.map((x) => x[1]), ...(v != null ? [v] : [])];
    const sc = sensorScale(it, dc, unit, seen);
    const has = (k) => it[k] != null && it[k] !== "";
    const hi = has("above") && v != null && v > Number(it.above), lo = has("below") && v != null && v < Number(it.below);
    const band = hi ? [Infinity, "High", "High", "coral"] : lo ? [-Infinity, "Low", "Low", "coral"] : sensorBand(sc, v);
    const g = it.color && COLORS[it.color] ? COLORS[it.color]
      : c.color_by === "fixed" ? this.colour()
        : c.color_by === "type" ? COLORS[kind[dc] || "purple"]
          : band ? COLORS[band[3]] : COLORS[kind[dc] || "purple"];
    const dec = has("decimals") ? Number(it.decimals) : Math.min(2, decOf(s?.state, unit));
    const hourAgo = hist.filter(([t]) => t <= Date.now() - 3600e3).pop() || hist[0];
    const d = v != null && hourAgo ? v - hourAgo[1] : null;
    const step = Math.max(0.1, 10 ** -Math.max(0, dec));
    const trend = d == null ? "" : Math.abs(d) < step ? "Steady" : `${d > 0 ? "↑" : "↓"} ${fmt(Math.abs(d), dec)}${/^(°|%)/.test(unit) ? unit.replace(/^°.*/, "°") : ` ${unit}`} in 1 h`;
    const frac = v == null ? 0 : Math.max(0, Math.min(1, (v - sc.min) / (sc.max - sc.min)));
    return { s, v, dc, unit, sc, band, warn: hi || lo, g, col: g[this.dark ? 1 : 0], dec, trend, frac, seen,
      name: it.name || s?.attributes.friendly_name || it.entity, icon: it.icon || s?.attributes.icon || icons[dc] || "mdi:information-outline" };
  }

  valueHtml(it, r, big) {
    if (!r.s) return '<span class="v t">Device not found</span>';
    if (r.v == null) return `<span class="v t">${esc(UNAVAILABLE.includes(r.s.state) ? "Offline" : r.s.state)}</span>`;
    return `<span class="v num" style="font-size:${big}px"><span data-tw="${esc(it.entity)}">${esc(fmt(r.v, r.dec))}</span><small>${esc(unitGap(r.unit))}</small></span>`;
  }

  // a scale coloured like its bands, for style C and the ring
  bandGradient(r) {
    const { sc } = r;
    if (!sc.bands) return `linear-gradient(90deg,${r.g[0]},${r.g[1]})`;
    let prev = sc.min; const stops = [];
    for (const [u, , , col] of sc.bands) {
      const a = Math.max(sc.min, prev), b = Math.min(sc.max, u);
      if (b > a) stops.push(`${COLORS[col][this.dark ? 1 : 0]} ${(((a + b) / 2 - sc.min) / (sc.max - sc.min) * 100).toFixed(0)}%`);
      prev = u;
    }
    return stops.length > 1 ? `linear-gradient(90deg,${stops.join(",")})` : `linear-gradient(90deg,${r.g[0]},${r.g[1]})`;
  }

  ring(it, r) {
    const R = 46, C = 2 * Math.PI * R, arc = C * 0.75, { sc } = r;
    const good = sc.bands ? (() => { let prev = sc.min; for (const [u, , , col] of sc.bands) { if (col === "green") return [Math.max(prev, sc.min), Math.min(u, sc.max)]; prev = u; } return null; })() : null;
    const f = (x) => Math.max(0, Math.min(1, (x - sc.min) / (sc.max - sc.min)));
    const ang = ((135 + 270 * r.frac) * Math.PI) / 180, kx = 60 + R * Math.cos(ang), ky = 60 + R * Math.sin(ang);
    const gid = `rg${Math.abs([...it.entity].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) | 0, 3))}`;
    return `<svg class="dial" viewBox="0 0 120 120" aria-hidden="true">
      <defs><linearGradient id="${gid}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${r.g[0]}"/><stop offset="1" stop-color="${r.g[1]}"/></linearGradient></defs>
      <g transform="rotate(135 60 60)"><circle cx="60" cy="60" r="${R}" fill="none" stroke="${this.p.track}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${arc.toFixed(1)} ${C.toFixed(1)}"/>
      ${good && good[1] > good[0] ? `<circle cx="60" cy="60" r="${R}" fill="none" stroke="${COLORS.green[1]}" stroke-opacity=".35" stroke-width="10" stroke-dasharray="${(arc * (f(good[1]) - f(good[0]))).toFixed(1)} ${C.toFixed(1)}" stroke-dashoffset="${(-arc * f(good[0])).toFixed(1)}"/>` : ""}
      <circle cx="60" cy="60" r="${R}" fill="none" stroke="url(#${gid})" stroke-width="4" stroke-linecap="round" stroke-dasharray="${(arc * r.frac).toFixed(1)} ${C.toFixed(1)}"/></g>
      ${r.v != null ? `<circle cx="${kx.toFixed(1)}" cy="${ky.toFixed(1)}" r="7" fill="${this.dark ? "#EEF0FF" : "#FFFFFF"}" stroke="${r.g[0]}" stroke-width="3"/>` : ""}
    </svg>`;
  }

  render() {
    if (!this._hass || !this._config) return;
    this.loadHistory();
    const C0 = this._config, p = this.p, st = C0.style || "line"; let c = C0;
    // each reading can hide parts of itself
    const K = (it) => { const h = Array.isArray(it.hide) ? it.hide : []; const k = { ...C0 }; for (const x of h) k[`show_${x}`] = false; return k; };
    const cols = Math.max(1, Number(C0.columns) || 3), minW = { line: 140, ring: 150, scale: 150, rows: 200 }[st] || 140;
    const head = (it, r, extra = "") => `${c.show_icon || c.show_name || (c.show_comfort && r.band) ? `<div class="hd">${c.show_icon ? `<span class="ic"><ha-icon icon="${esc(r.icon)}"></ha-icon></span>` : ""}${c.show_name ? `<span class="n t">${esc(r.name)}</span>` : '<span class="n"></span>'}${extra}${c.show_comfort && r.band ? `<span class="chip">${esc(r.band[1])}</span>` : ""}</div>` : ""}`;
    const trend = (r) => (c.show_trend && r.trend ? `<span class="tr t">${esc(r.trend)}</span>` : "");
    const tile = (it) => {
      c = K(it);
      const r = this.reading(it);
      const style = `--a0:${r.g[0]};--a1:${r.g[1]};--ac:${r.col}`;
      const open = `class="sq ${st} ${r.warn ? "warn" : ""}" data-e="${esc(it.entity)}" role="button" tabindex="0" aria-label="${esc(r.name)}" style="${style}"`;
      if (st === "ring") {
        return `<div ${open}>${head(it, r)}<div class="rw">${this.ring(it, r)}<div class="rc">${this.valueHtml(it, r, 24)}</div></div>${trend(r)}</div>`;
      }
      if (st === "scale") {
        const words = c.show_scale_words && r.sc.bands ? r.sc.bands.filter(([u], i, a) => (i === 0 ? true : a[i - 1][0] < r.sc.max) && (u > r.sc.min)).map((b) => b[2]) : [];
        return `<div ${open}>${head(it, r)}<div class="row">${this.valueHtml(it, r, 32)}${trend(r)}</div>
          <div class="sc"><div class="scb" style="background:${this.bandGradient(r)}">${r.v != null ? `<i data-glide="${esc(it.entity)}" style="left:${(r.frac * 100).toFixed(1)}%"></i>` : ""}</div>
          ${words.length ? `<div class="scw">${words.map((w) => `<span class="t">${esc(w)}</span>`).join("")}</div>` : `<div class="scw"><span class="num">${esc(fmt(r.sc.min, r.dec))}</span><span class="num">${esc(fmt(r.sc.max, r.dec))}</span></div>`}</div></div>`;
      }
      if (st === "rows") {
        return `<div ${open}>${c.show_icon ? `<span class="ic"><ha-icon icon="${esc(r.icon)}"></ha-icon></span>` : ""}<div class="mid"><div class="top">${c.show_name ? `<span class="n t">${esc(r.name)}</span>` : ""}${c.show_comfort && r.band ? `<span class="w t">${esc(r.band[1])}</span>` : ""}</div>
          <div class="bar"><i data-bar="${esc(it.entity)}" style="width:${(r.frac * 100).toFixed(1)}%"></i></div>${c.show_trend && r.trend ? `<span class="tr t">${esc(r.trend)}</span>` : ""}</div>${this.valueHtml(it, r, 20)}</div>`;
      }
      // style A: line of the day
      const vals = r.seen, mn = vals.length ? Math.min(...vals) : null, mx = vals.length ? Math.max(...vals) : null;
      const pos = mn != null && mx > mn ? ((r.v - mn) / (mx - mn)) * 100 : 50;
      return `<div ${open}><span class="strip"></span>${head(it, r)}<div class="row">${this.valueHtml(it, r, 24)}${trend(r)}</div>
        ${c.show_graph && r.v != null ? this.spark(it.entity, r.v, r.col) : ""}
        ${c.show_range && mn != null && mx > mn ? `<div class="rg"><span class="num">${esc(fmt(mn, r.dec))}</span><span class="rb"><i data-glide="${esc(it.entity)}r" style="left:${pos.toFixed(1)}%"></i></span><span class="num">${esc(fmt(mx, r.dec))}</span></div>` : ""}</div>`;
    };
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(max(${minW}px,calc((100% - ${(cols - 1) * 8}px) / ${cols})),1fr));gap:8px}
      .sq{${panelCss(p, c.radius)};position:relative;overflow:hidden;padding:14px 14px 12px;display:flex;flex-direction:column;gap:8px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .12s;min-width:0}
      .sq:active{transform:scale(.97)}
      .strip{position:absolute;inset:0 0 auto 0;height:3px;background:linear-gradient(90deg,var(--a0),var(--a1));opacity:.9}
      .hd{display:flex;align-items:center;flex-wrap:wrap;gap:6px 10px;min-width:0}
      .ic{width:34px;height:34px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb, var(--a0) 20%, transparent);color:var(--ac);--mdc-icon-size:19px}
      .n{flex:1 1 auto;min-width:0;font-size:13px;font-weight:600;color:${p.muted};line-height:1.25;overflow-wrap:break-word;word-break:normal}
      .chip{flex:none;margin-left:auto;font-size:11px;font-weight:700;padding:4px 8px;border-radius:999px;background:color-mix(in srgb, var(--a0) 22%, transparent);color:var(--ac);white-space:nowrap}
      .row{display:flex;align-items:flex-end;justify-content:space-between;gap:4px 8px;flex-wrap:wrap}
      .v{font-weight:700;line-height:1;letter-spacing:-.5px;font-size:15px}
      .v small{font-size:13px;font-weight:600;color:${p.muted};margin-left:1px;letter-spacing:0}
      .tr{font-size:11px;font-weight:600;color:${p.muted};white-space:nowrap}
      .sp{display:block;width:100%;height:34px}
      .rg{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:8px;font-size:11px;color:${p.muted}}
      .rb{position:relative;height:4px;border-radius:999px;background:${p.track}}
      .rb i,.scb i{position:absolute;top:50%;border-radius:50%;background:${this.dark ? "#EEF0FF" : "#FFFFFF"}}
      .rb i{width:10px;height:10px;margin:-5px 0 0 -5px;background:var(--a1);box-shadow:0 0 0 3px color-mix(in srgb, var(--a0) 30%, transparent)}
      .rw{position:relative;width:min(100%,150px);margin:0 auto}
      .dial{display:block;width:100%;height:auto}
      .rc{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
      .rc .v{text-align:center}
      .sq.ring .tr{align-self:center;margin-top:-10px}
      .sc{display:flex;flex-direction:column;gap:6px;margin-top:2px}
      .scb{position:relative;height:10px;border-radius:999px}
      .scb i{width:18px;height:18px;margin:-9px 0 0 -9px;border:3px solid ${this.dark ? "#141831" : "#FFFFFF"};box-sizing:border-box;box-shadow:0 0 10px var(--a1)}
      .scw{display:flex;justify-content:space-between;gap:4px;font-size:11px;font-weight:600;color:${p.muted}}
      @container (max-width: 230px){:host .scw span:not(:first-child):not(:last-child){display:none}}
      .sq.rows{flex-direction:row;align-items:center;gap:12px;padding:12px 14px}
      .rows .mid{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px}
      .rows .top{display:flex;justify-content:space-between;align-items:baseline;gap:4px 8px;flex-wrap:wrap}
      .rows .w{font-size:11px;font-weight:700;color:var(--ac);white-space:nowrap}
      .bar{height:4px;border-radius:999px;background:${p.track};overflow:hidden}
      .bar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,var(--a0),var(--a1))}
      .rows .v{flex:none;text-align:right}
      .warn{border-color:#FF9F6B}
      .warn .ic{animation:roost-breathe 1.6s ease-in-out infinite}
    </style>
    <div class="grid">${this.items().map(tile).join("")}</div>`;
    this.shadowRoot.querySelectorAll("[data-e]").forEach((el) => el.addEventListener("click", () => this.moreInfo(el.dataset.e)));
  }
}

// ------------------------------------------------------------------ Roost Buttons
// Several small actions in one rounded bar. A button lights up when its device is on.
class RoostButtons extends RoostBase {
  static get defaults() { return { items: [], show_names: true, color: "active", active_style: "filled", background: "glass", radius: 22, theme: "auto" }; }

  validate(c) { if (!Array.isArray(c.items) || !c.items.length) throw new Error("Add some buttons"); }

  watched() { return this._config.items.map((i) => i.entity).filter(Boolean); }

  static getConfigForm() {
    return {
      schema: [
        { name: "items", label: "Buttons", selector: { object: { multiple: true, label_field: "name", fields: {
          name: { label: "Name", selector: { text: {} } },
          icon: { label: "Icon", selector: { icon: {} } },
          entity: { label: "Device (lights the button when on; tap switches it)", selector: { entity: {} } },
          tap_action: { label: "Tap does (instead)", selector: { ui_action: {} } },
          does: { label: "Or does", selector: { select: { mode: "dropdown", options: SPECIAL_DOES } } },
          users: { label: "Only for these people (empty = everyone)", selector: { entity: { multiple: true, domain: "person" } } },
        } } } },
        { type: "grid", name: "", schema: [{ name: "show_names", label: "Names under the icons", selector: { boolean: {} } }, { name: "radius", selector: slider(0, 40, 2) }] },
        ...colourFields("color", "Colour when on"),
        { type: "grid", name: "", schema: [
          { name: "active_style", label: "When on", selector: pick([["filled", "Filled square with glow"], ["soft", "Soft tinted square"], ["pill", "Filled pill"], ["line", "Line under it"], ["dot", "Dot under it"], ["icon", "Coloured icon only"]]) },
          { name: "background", selector: pick([["glass", "Frosted glass"], ["solid", "Solid"], ["none", "None (clear)"]]) },
        ] },
        THEME_FIELD,
      ],
      computeLabel,
    };
  }

  static getStubConfig() { return { items: [{ name: "Lights", icon: "mdi:lightbulb-group" }, { name: "TV", icon: "mdi:television" }, { name: "AC", icon: "mdi:snowflake" }] }; }

  getGridOptions() { return { columns: 12, rows: "auto" }; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour();
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .bar{border-radius:${c.radius}px;color:${p.text};padding:6px;display:grid;grid-template-columns:repeat(${Math.max(1, c.items.filter((it) => forPeople(this._hass, it.users)).length)},minmax(0,1fr));gap:4px;
        ${c.background === "none" ? "background:transparent;border:0;" : c.background === "solid" ? `background:${this.dark ? "#141831" : "#FFFFFF"};border:1px solid ${p.border};`
    : `background:linear-gradient(180deg, ${g[0]}24, transparent 70%), ${p.panel};border:1px solid ${g[1]}47;backdrop-filter:blur(${Number(c.blur ?? 18)}px) saturate(150%);-webkit-backdrop-filter:blur(${Number(c.blur ?? 18)}px) saturate(150%);box-shadow:0 18px 40px -16px ${this.dark ? "rgba(0,0,0,.45)" : "rgba(40,30,90,.16)"}, 0 0 0 1px rgba(255,255,255,.04) inset;`}}
      @container (max-width: ${Math.max(1, c.items.filter((it) => forPeople(this._hass, it.users)).length) * 66}px){:host .b span{display:none}:host .b{min-height:48px}}
      .b{min-height:${c.show_names ? 62 : 48}px;border-radius:${Math.max(8, c.radius - 6)}px;border:0;background:transparent;color:${p.muted};font:inherit;font-size:11px;font-weight:600;cursor:pointer;
        display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:4px 2px;-webkit-tap-highlight-color:transparent;transition:transform .12s}
      .b:active{transform:scale(.92)}
      .b{position:relative;border-radius:${c.active_style === "pill" ? 999 : Math.max(8, c.radius - 6)}px}
      ${{
    filled: `.b.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};box-shadow:0 10px 24px -8px color-mix(in srgb, ${g[0]} 95%, transparent), inset 0 1px 0 rgba(255,255,255,.35)}`,
    pill: `.b.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};box-shadow:0 10px 22px -8px ${g[2]}}`,
    soft: `.b.on{background:${g[0]}2E;color:${g[this.dark ? 1 : 0]}}`,
    line: `.b.on{color:${g[this.dark ? 1 : 0]}}.b.on::after{content:"";position:absolute;bottom:3px;left:30%;right:30%;height:3px;border-radius:3px;background:linear-gradient(90deg,${g[0]},${g[1]})}`,
    dot: `.b.on{color:${g[this.dark ? 1 : 0]}}.b.on::after{content:"";position:absolute;bottom:3px;left:50%;width:6px;height:6px;margin-left:-3px;border-radius:50%;background:${g[1]};box-shadow:0 0 8px ${g[2]}}`,
    icon: `.b.on{color:${g[this.dark ? 1 : 0]}}.b.on ha-icon{filter:drop-shadow(0 0 6px ${g[2]})}`,
  }[c.active_style] || ""}
      .b ha-icon{--mdc-icon-size:22px}
      .b.done ha-icon{animation:roost-pulse .5s ease-out 1}
    </style>
    <div class="bar">${c.items.map((it, i) => {
      if (!forPeople(this._hass, it.users)) return "";
      const s = this.sx(it.entity), on = s && !UNAVAILABLE.includes(s.state) && !OFF_STATES.includes(s.state);
      const sp = specialIcon(it.does), spOn = it.does === "fullscreen" ? RoostFull.isOn() : false;
      return `<button class="b ${on || spOn ? "on" : ""}" data-i="${i}" data-pop="${on ? 1 : 0}" data-popkey="${i}" aria-label="${esc(specialLabel(it.does) || it.name || it.icon)}"><ha-icon icon="${esc(sp || it.icon)}"></ha-icon>${c.show_names && (it.name || it.does) ? `<span class="t">${esc(it.name || specialLabel(it.does))}</span>` : ""}</button>`;
    }).join("")}</div>`;
    this.shadowRoot.querySelectorAll(".b").forEach((b) => {
      const it = c.items[+b.dataset.i];
      this.press(b, () => {
        b.classList.remove("done"); void b.offsetWidth; b.classList.add("done");
        if (it.does) { this.vibrate(); specialRun(it.does); setTimeout(() => { this._sig = null; this.hass = this._hass; }, 120); }
        else if (it.tap_action && it.tap_action.action && it.tap_action.action !== "none") this.run(it.tap_action, it.entity);
        else if (it.entity) this.run({ action: "toggle" }, it.entity);
      }, () => it.entity && this.moreInfo(it.entity));
    });
  }
}

// ------------------------------------------------------------------ Roost Full Screen
// Hides Home Assistant's top bar and sidebar on a dashboard, so it feels like an app.
// Three ways to use it:
//   1. The Roost Full Screen card in "invisible" mode: the dashboard opens full screen by itself.
//   2. The same card in "button" mode: a chip that maximizes and minimizes.
//   3. As an action on any card's tap: { action: fire-dom-event, roost_fullscreen: toggle | on | off }.
// Everything comes back while the dashboard is being edited, and on other dashboards.
// Adding ?roost_full=off to the address turns it off on that screen.
const RoostFull = {
  wants: {},          // dashboard -> { on, header, sidebar }
  fab: null,          // the floating exit / enter button: { dash, position, allowed }
  timer: null,

  dash() { return location.pathname.split("/")[1] || ""; },
  blocked() { return /[?&]roost_full=(off|0|no|false)/i.test(location.search); },
  key(d) { return `roost-full:${d}`; },
  remembered(d) { try { return localStorage.getItem(this.key(d)); } catch (e) { return null; } },
  remember(d, on) { try { localStorage.setItem(this.key(d), on ? "1" : "0"); } catch (e) { /* private mode */ } },
  exitedThisVisit(d) { try { return sessionStorage.getItem(this.key(d)) === "0"; } catch (e) { return false; } },
  exitThisVisit(d, out) { try { if (out) sessionStorage.setItem(this.key(d), "0"); else sessionStorage.removeItem(this.key(d)); } catch (e) { /* private mode */ } },

  // A card or an action asks for full screen on the dashboard that is open now.
  set(on, opts = {}, how = "toggle") {
    const d = this.dash();
    const cur = this.wants[d] || {};
    this.wants[d] = { header: opts.hide_header !== false, sidebar: opts.hide_sidebar !== false, ...cur, on: !!on };
    if (opts.hide_header !== undefined) this.wants[d].header = opts.hide_header !== false;
    if (opts.hide_sidebar !== undefined) this.wants[d].sidebar = opts.hide_sidebar !== false;
    // Leaving full screen, by any button, keeps it off on every page of this dashboard until it is switched on again.
    if (how === "auto") { this.exitThisVisit(d, !on); if (on) this.remember(d, true); else this.remember(d, false); }
    else { this.remember(d, on); this.exitThisVisit(d, !on); }
    if (opts.browser && on && document.documentElement.requestFullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    if (opts.browser && !on && document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    this.start();
    this.apply();
    window.dispatchEvent(new CustomEvent("roost-full-changed"));
  },

  toggle(opts) { this.set(!this.isOn(), opts, "toggle"); },

  isOn() { const w = this.wants[this.dash()]; return !!(w && w.on) && !this.blocked(); },

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.apply(), 1000);   // Home Assistant redraws its frame now and then
    const again = () => setTimeout(() => this.apply(), 80);
    window.addEventListener("location-changed", again);
    window.addEventListener("popstate", again);
  },

  // Home Assistant's own pieces, inside their shadow roots.
  parts() {
    const ha = document.querySelector("home-assistant");
    const main = ha?.shadowRoot?.querySelector("home-assistant-main");
    const mainRoot = main?.shadowRoot;
    const drawer = mainRoot?.querySelector("ha-drawer");
    const panel = mainRoot?.querySelector("partial-panel-resolver ha-panel-lovelace, ha-panel-lovelace");
    const root = panel?.shadowRoot?.querySelector("hui-root");
    return { mainRoot, drawerRoot: drawer?.shadowRoot, root, rootShadow: root?.shadowRoot };
  },

  editing(root) { return !!(root?.lovelace?.editMode || /[?&]edit=1/.test(location.search)); },

  style(where, id, css) {
    if (!where) return;
    let el = where.getElementById ? where.getElementById(id) : where.querySelector(`#${id}`);
    if (!css) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement("style"); el.id = id; where.appendChild(el); }
    if (el.textContent !== css) el.textContent = css;
  },

  apply() {
    const d = this.dash();
    // a full screen switched on by a button or an action is remembered on this screen
    if (!this.wants[d] && this.remembered(d) === "1") this.wants[d] = { on: true, header: true, sidebar: true };
    const w = this.wants[d];
    const { mainRoot, drawerRoot, root, rootShadow } = this.parts();
    const on = !!(w && w.on) && !this.blocked() && !this.editing(root);
    this.style(rootShadow, "roost-full", on && w.header ? `.header{display:none!important}
      :host{--header-height:0px!important}
      #view,hui-view-container{padding-top:env(safe-area-inset-top)!important;min-height:100vh!important}` : "");
    this.style(mainRoot, "roost-full", on && w.sidebar ? ":host{--ha-sidebar-width:0px!important}ha-drawer{--mdc-drawer-width:0px!important;--ha-sidebar-width:0px!important}ha-sidebar{display:none!important}" : "");
    this.style(drawerRoot, "roost-full", on && w.sidebar ? ".mdc-drawer{display:none!important}.mdc-drawer-app-content{margin-left:0!important;margin-inline-start:0!important;padding-inline-start:0!important}" : "");
    this.drawFab(on, root);
  },

  // The small floating button that leaves (or goes back to) full screen.
  drawFab(on, root) {
    let el = document.getElementById("roost-full-fab");
    const f = this.fab;
    const show = f && f.dash === this.dash() && f.allowed && !this.editing(root) && !this.blocked() && this.wants[this.dash()];
    if (!show) { if (el) el.remove(); return; }
    if (!el) {
      el = document.createElement("button");
      el.id = "roost-full-fab";
      el.addEventListener("click", () => { try { navigator.vibrate?.(12); } catch (e) { /* no vibration */ } this.set(!this.isOn(), {}, "auto"); });
      document.body.appendChild(el);
    }
    const pos = { "bottom-right": "right:16px;bottom:calc(96px + env(safe-area-inset-bottom))", "bottom-left": "left:16px;bottom:calc(96px + env(safe-area-inset-bottom))",
      "top-right": "right:16px;top:calc(16px + env(safe-area-inset-top))", "top-left": "left:16px;top:calc(16px + env(safe-area-inset-top))" }[f.position] || "right:16px;top:calc(16px + env(safe-area-inset-top))";
    const dark = !!document.querySelector("home-assistant")?.hass?.themes?.darkMode;
    el.setAttribute("aria-label", on ? "Leave full screen" : "Full screen");
    el.style.cssText = `position:fixed;${pos};z-index:9;width:40px;height:40px;border-radius:14px;border:1px solid ${dark ? "#242A4D" : "#E2E5F2"};
      background:${dark ? "rgba(20,24,49,.78)" : "rgba(255,255,255,.85)"};color:${dark ? "#EEF0FF" : "#161936"};display:flex;align-items:center;justify-content:center;
      backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:0 8px 20px -10px rgba(0,0,0,.5);cursor:pointer;opacity:.85;padding:0`;
    const icon = on ? "mdi:fullscreen-exit" : "mdi:fullscreen";
    if (el.dataset.icon !== icon) { el.dataset.icon = icon; el.innerHTML = `<ha-icon icon="${icon}" style="--mdc-icon-size:22px"></ha-icon>`; }
  },
};

RoostFull.start();

// ------------------------------------------------------------------ Roost Page
// A phone page laid out exactly like the original dashboard: 14 px at the sides, 16 px between cards,
// at most 560 px wide, and room at the bottom for the navigation bar. Put it in a "Panel" view.
// A card can sit next to others with `type: grid` (8 px between them, as on the original).
class RoostPage extends RoostBase {
  static get hasCards() { return true; }
  static get defaults() { return { cards: [], gap: 16, side: 14, top: 16, bottom: 130, max_width: 560, background: true, theme: "auto" }; }

  static getConfigForm() {
    return {
      schema: [
        { type: "grid", name: "", schema: [{ name: "gap", label: "Space between cards", selector: slider(0, 32) }, { name: "side", label: "Space at the sides", selector: slider(0, 32) }] },
        { type: "grid", name: "", schema: [{ name: "top", label: "Space at the top", selector: slider(0, 48) }, { name: "bottom", label: "Space at the bottom (for the bar)", selector: slider(0, 200, 10) }] },
        { type: "grid", name: "", schema: [{ name: "max_width", label: "Widest it gets", selector: slider(320, 1200, 10) }, { name: "background", label: "Night-sky background", selector: { boolean: {} } }] },
        THEME_FIELD,
      ],
      computeLabel,
    };
  }

  static getStubConfig() { return { cards: [{ type: "custom:roost-hero" }] }; }

  getGridOptions() { return { columns: 12, rows: "auto" }; }

  set hass(hass) {
    this._hass = hass;
    if (this._setup) { if (!this._setupDrawn) { this._setupDrawn = true; this.renderSetup(); } return; }
    (this._cards || []).forEach((el) => { el.hass = hass; });
    const sig = `${this.dark ? 1 : 0}|${this._built ? 1 : 0}`;
    if (sig === this._sig) return;
    this._sig = sig;
    this.render();
  }

  setConfig(config) { this._built = false; this._cards = null; super.setConfig(config); }

  async build() {
    const helpers = window.loadCardHelpers ? await window.loadCardHelpers() : null;
    this._cards = (this._config.cards || []).map((cfg0) => {
      let el;
      const cfg = withTheme(cfg0, this._config.theme);
      try {
        el = helpers ? helpers.createCardElement(cfg) : document.createElement(String(cfg.type || "").replace(/^custom:/, ""));
        if (!helpers) el.setConfig?.(cfg);
      } catch (e) { el = document.createElement("div"); el.textContent = `Card problem: ${e.message}`; }
      if (this._hass) el.hass = this._hass;
      return el;
    });
    this._built = true;
    this._sig = null;
    if (this._hass) this.hass = this._hass;
  }

  render() {
    if (!this._config) return;
    if (!this._built) { if (!this._building) { this._building = true; this.build().finally(() => { this._building = false; }); } return; }
    const c = this._config, n = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);
    const bg = this.dark ? "radial-gradient(1000px 620px at 15% -10%, #2A1F6B 0%, transparent 60%), radial-gradient(800px 600px at 100% 100%, #0E2A4A 0%, transparent 60%), #0B0D17"
      : "radial-gradient(1000px 620px at 15% -10%, #E2D9FF 0%, transparent 60%), radial-gradient(800px 600px at 100% 100%, #D6EBFF 0%, transparent 60%), #EEF1FA";
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      :host{${c.background ? `background:${bg};min-height:100vh;` : ""}--grid-card-gap:8px;--vertical-stack-card-gap:8px;--horizontal-stack-card-gap:8px}
      .page{display:grid;grid-template-columns:minmax(0,1fr);gap:${n(c.gap, 16)}px;padding:${n(c.top, 16)}px ${n(c.side, 14)}px ${n(c.bottom, 130)}px;max-width:${n(c.max_width, 560)}px;margin:0 auto;align-content:start}
      .page > *{min-width:0}
    </style><div class="page"></div>`;
    const page = this.shadowRoot.querySelector(".page");
    this._cards.forEach((el) => { const w = document.createElement("div"); w.appendChild(el); page.appendChild(w); });
  }

  getCardSize() { return 10; }
}

// Any card's tap can switch full screen: { action: fire-dom-event, roost_fullscreen: toggle }.
window.addEventListener("ll-custom", (ev) => {
  const d = ev.detail || {};
  const want = d.roost_fullscreen;
  if (!want) return;
  const opts = { hide_header: d.hide_header, hide_sidebar: d.hide_sidebar, browser: d.browser_fullscreen };
  if (want === "on") RoostFull.set(true, opts, "toggle");
  else if (want === "off") RoostFull.set(false, opts, "toggle");
  else RoostFull.toggle(opts);
});

// Light and dark mode from any button, chip or bar: { action: fire-dom-event, roost_theme: toggle | light | dark }.
const RoostMode = {
  dark() { return !!document.querySelector("home-assistant")?.hass?.themes?.darkMode; },
  set(dark) { (document.querySelector("home-assistant") || window).dispatchEvent(new CustomEvent("settheme", { detail: { dark }, bubbles: true, composed: true })); },
  toggle() { this.set(!this.dark()); },
  icon() { return this.dark() ? "mdi:white-balance-sunny" : "mdi:weather-night"; },
  label() { return this.dark() ? "Light mode" : "Dark mode"; },
};
window.addEventListener("ll-custom", (ev) => {
  const want = (ev.detail || {}).roost_theme;
  if (!want) return;
  if (want === "dark") RoostMode.set(true); else if (want === "light") RoostMode.set(false); else RoostMode.toggle();
});
// The special things a button can do instead of a page or a device.
const SPECIAL_DOES = [{ value: "fullscreen", label: "Full screen on and off (its icon follows)" }, { value: "theme", label: "Light and dark mode (its icon follows)" }, { value: "language", label: "Arabic and English" }];
const specialIcon = (kind) => (kind === "fullscreen" ? (RoostFull.isOn() ? "mdi:fullscreen-exit" : "mdi:fullscreen") : kind === "theme" ? RoostMode.icon() : kind === "language" ? "mdi:translate" : null);
const specialLabel = (kind) => (kind === "fullscreen" ? (RoostFull.isOn() ? "Leave full screen" : "Full screen") : kind === "theme" ? RoostMode.label() : kind === "language" ? (window.RoostLang?.pick(document.querySelector("home-assistant")?.hass) === "ar" ? "English" : "العربية") : null);
const specialRun = (kind) => { if (kind === "fullscreen") RoostFull.toggle({}); else if (kind === "theme") RoostMode.toggle(); else if (kind === "language") window.RoostLang?.toggle(); };

class RoostFullscreen extends RoostBase {
  static get defaults() {
    return { mode: "auto", hide_header: true, hide_sidebar: true, users: [], exit_users: [], exit_button: true, exit_position: "top-right",
      browser_fullscreen: false, show_label: true, color: "active", theme: "auto" };
  }

  static getConfigForm() {
    return {
      schema: [
        { name: "mode", label: "How it works", selector: pick([["auto", "Invisible: this dashboard opens full screen by itself"], ["button", "A button that switches full screen on and off"]]) },
        { type: "grid", name: "", schema: [{ name: "hide_header", label: "Hide the top bar", selector: { boolean: {} } }, { name: "hide_sidebar", label: "Hide the sidebar", selector: { boolean: {} } }] },
        { name: "browser_fullscreen", label: "Also hide the browser's own bars (computers and Android, button mode)", selector: { boolean: {} } },
        { type: "expandable", name: "", title: "Who (invisible mode)", icon: "mdi:account-multiple", schema: [
          { name: "users", label: "Full screen for (empty = everyone)", selector: { entity: { multiple: true, domain: "person" } } },
          { name: "exit_button", label: "Show a small exit button", selector: { boolean: {} } },
          { name: "exit_users", label: "Who sees the exit button (empty = everyone)", selector: { entity: { multiple: true, domain: "person" } } },
          { name: "exit_position", label: "Where the exit button sits", selector: pick([["top-right", "Top right"], ["top-left", "Top left"], ["bottom-right", "Bottom right"], ["bottom-left", "Bottom left"]]) },
        ] },
        { type: "expandable", name: "", title: "Look (button mode)", icon: "mdi:palette", schema: [
          { name: "show_label", label: "Show the words", selector: { boolean: {} } },
          ...colourFields("color", "Colour when full screen"),
          { name: "full_width", label: "As wide as the card", selector: { boolean: {} } },
        THEME_FIELD,
        ] },
      ],
      computeLabel,
    };
  }

  static getStubConfig() { return { mode: "auto" }; }

  getGridOptions() { return this._config?.mode === "button" ? { columns: 4, rows: "auto", min_columns: 2 } : { columns: 12, rows: "auto" }; }

  // people chosen in the editor are matched to Home Assistant users
  allows(list) {
    if (!Array.isArray(list) || !list.length) return true;
    const me = this._hass?.user?.id;
    return list.some((p) => this._hass?.states?.[p]?.attributes?.user_id === me);
  }

  editing() { return !!(this.editMode || this.preview || /[?&]edit=1/.test(location.search)); }

  set editMode(v) { this._editMode = v; this._sig = null; if (this._hass) this.hass = this._hass; }

  get editMode() { return this._editMode; }

  connectedCallback() {
    this._onFull = () => { this._sig = null; if (this._hass) this.hass = this._hass; };
    window.addEventListener("roost-full-changed", this._onFull);
    this._autoDone = false;
    if (this._hass) this.autoStart();
  }

  disconnectedCallback() {
    window.removeEventListener("roost-full-changed", this._onFull);
    if (RoostFull.fab && RoostFull.fab.card === this) { RoostFull.fab = null; RoostFull.apply(); }
  }

  autoStart() {
    const c = this._config;
    if (!c || c.mode !== "auto" || this._autoDone || !this._hass) return;
    this._autoDone = true;
    const d = RoostFull.dash();
    RoostFull.fab = { card: this, dash: d, position: c.exit_position, allowed: c.exit_button && this.allows(c.exit_users) };
    if (!this.allows(c.users)) return;
    // someone left full screen on this dashboard: stay out until they switch it back on
    const on = !RoostFull.exitedThisVisit(d) && RoostFull.remembered(d) !== "0";
    if (!on) { RoostFull.wants[d] = { header: c.hide_header !== false, sidebar: c.hide_sidebar !== false, on: false }; RoostFull.start(); RoostFull.apply(); return; }
    RoostFull.set(on, { hide_header: c.hide_header, hide_sidebar: c.hide_sidebar }, "auto");
  }

  signature() { return `${this.dark}|${RoostFull.isOn()}|${this.editing()}|${this._hass?.user?.id}`; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour(), on = RoostFull.isOn();
    this.autoStart();
    if (c.mode === "auto") {
      this.style.display = this.editing() ? "" : "none";
      this.shadowRoot.innerHTML = this.editing() ? `<style>${this.baseCss()}
        .ed{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:16px;border:1px dashed ${p.border};color:${p.muted};font-size:13px;line-height:1.35}
        .ed ha-icon{--mdc-icon-size:20px;color:${g[this.dark ? 1 : 0]}}</style>
        <div class="ed"><ha-icon icon="mdi:fullscreen"></ha-icon><span class="t">Full screen is on for this dashboard${this.allows(c.users) ? "" : " (not for you)"}. It is shown here only while editing.</span></div>` : "";
      return;
    }
    this.style.display = "";
    const word = on ? "Exit full screen" : "Full screen";
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      button{display:flex;align-items:center;justify-content:center;gap:8px;margin:0 auto;${c.full_width ? "width:100%;" : ""}min-height:44px;min-width:44px;padding:0 ${c.show_label ? 16 : 0}px;border-radius:999px;cursor:pointer;
        border:1px solid ${on ? "transparent" : p.border};background:${on ? `linear-gradient(135deg,${g[0]},${g[1]})` : p.panel};color:${on ? g[3] : p.text};font:inherit;font-size:13px;font-weight:600;
        box-shadow:${on ? `0 10px 22px -10px ${g[2]}` : "none"};-webkit-tap-highlight-color:transparent;transition:transform .12s}
      button:active{transform:scale(.93)}
      ha-icon{--mdc-icon-size:22px}
    </style><button aria-label="${word}" data-pop="${on ? 1 : 0}" data-popkey="b"><ha-icon icon="${on ? "mdi:fullscreen-exit" : "mdi:fullscreen"}"></ha-icon>${c.show_label ? `<span class="t">${word}</span>` : ""}</button>`;
    this.shadowRoot.querySelector("button").addEventListener("click", () => {
      this.vibrate();
      RoostFull.set(!on, { hide_header: c.hide_header, hide_sidebar: c.hide_sidebar, browser: c.browser_fullscreen }, "toggle");
    });
  }

  getCardSize() { return this._config?.mode === "auto" && !this.editing() ? 0 : 1; }
}

// ------------------------------------------------------------------ Roost Panel
// A rounded panel with a title that holds other cards, like the "Rooms" box on the original home page.
class RoostPanel extends RoostPage {
  static get defaults() { return { cards: [], entities: [], title: "", gap: 12, collapsible: false, open: false, theme: "auto" }; }

  static getConfigForm() {
    return { schema: [
      { name: "title", selector: { text: {} } },
      { name: "subtitle", label: "Small line under the title", selector: { text: {} } },
      { type: "grid", name: "", schema: [{ name: "icon", selector: { icon: {} } }, { name: "picture", label: "Or a picture (for example /local/strip.png)", selector: { text: {} } }] },
      { name: "entities", label: "Devices listed as rows with their state", selector: { entity: { multiple: true } } },
      { type: "grid", name: "", schema: [{ name: "collapsible", label: "Folds open and closed", selector: { boolean: {} } }, { name: "open", label: "Starts open", selector: { boolean: {} } }] },
      { type: "grid", name: "", schema: [{ name: "gap", label: "Space between cards", selector: slider(0, 32) }, { name: "columns", label: "Cards side by side", selector: slider(1, 6) }] },
      THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig() { return { title: "Rooms", cards: [] }; }

  watched() { return (this._config.entities || []).map((e) => (typeof e === "string" ? e : e?.entity)).filter(Boolean); }

  set hass(hass) {
    this._hass = hass;
    if (this._setup) { if (!this._setupDrawn) { this._setupDrawn = true; this.renderSetup(); } return; }
    (this._cards || []).forEach((el) => { el.hass = hass; });
    const rows = this.watched().map((id) => this.sx(id)?.state).join("|");
    const sig = `${this.dark ? 1 : 0}|${this._built ? 1 : 0}|${rows}|${this._isOpen ? 1 : 0}`;
    if (sig === this._sig) return;
    this._sig = sig;
    this.render();
  }

  // One row per device: icon in a box, name, and its state in colour (like the original "Security" box).
  row(e) {
    const id = typeof e === "string" ? e : e?.entity, s = this.sx(id), p = this.p;
    const d = id.split(".")[0], cls = s?.attributes.device_class;
    const name = (typeof e === "object" && e.name) || s?.attributes.friendly_name || id;
    let icon = (typeof e === "object" && e.icon) || null, col = p.muted, word = !s ? "Not found" : UNAVAILABLE.includes(s.state) ? "Offline" : s.state, wc = p.muted;
    if (s && !UNAVAILABLE.includes(s.state)) {
      if (d === "alarm_control_panel") { const arm = s.state !== "disarmed"; icon = icon || (arm ? "mdi:shield-lock" : "mdi:shield-off-outline"); col = arm ? "#F43F6B" : "#38BDF8"; word = arm ? s.state.replace("armed_", "Armed ").replace("_", " ") : "Off"; wc = arm ? "#F43F6B" : p.muted; }
      else if (d === "binary_sensor" && ["door", "window", "garage_door", "opening"].includes(cls)) { const o = s.state === "on"; icon = icon || (o ? "mdi:door-open" : "mdi:door-closed"); col = wc = o ? "#FF9F6B" : "#34D399"; word = o ? "Open" : "Closed"; }
      else if (d === "binary_sensor" && ["occupancy", "presence", "motion"].includes(cls)) { const o = s.state === "on"; icon = icon || (o ? "mdi:motion-sensor" : "mdi:motion-sensor-off"); col = wc = o ? "#B794FF" : p.muted; word = o ? "Yes" : "No"; }
      else if (d === "sensor") { icon = icon || (cls === "illuminance" ? "mdi:brightness-6" : null); col = cls === "illuminance" ? "#FCD34D" : p.muted; const v = num(s.state); word = v == null ? s.state : `${fmt(v, decOf(s.state, s.attributes.unit_of_measurement))}${unitGap(s.attributes.unit_of_measurement || "")}`; }
      else if (d === "lock") { const u = s.state !== "locked"; icon = icon || (u ? "mdi:lock-open-variant" : "mdi:lock"); col = wc = u ? "#FF9F6B" : "#34D399"; word = { locked: "Locked", unlocked: "Unlocked", locking: "Locking", unlocking: "Unlocking", jammed: "Stuck", open: "Open", opening: "Opening" }[s.state] || s.state; }
      else if (d === "cover") { const o = s.state !== "closed"; col = wc = o ? "#FF9F6B" : p.muted; word = { open: "Open", closed: "Closed", opening: "Opening", closing: "Closing" }[s.state] || s.state; }
      else if (d === "climate") { const o = s.state !== "off"; col = wc = o ? "#38BDF8" : p.muted; word = o ? ({ heating: "Heating", cooling: "Cooling", drying: "Drying", idle: "Resting" }[s.attributes.hvac_action] || "On") : "Off"; }
      else if (d === "media_player") { const o = !["off", "standby", "idle"].includes(s.state); col = wc = o ? "#B794FF" : p.muted; word = { playing: "Playing", paused: "Paused", on: "On", idle: "Idle", off: "Off", standby: "Off" }[s.state] || s.state; }
      else if (d === "person") { const h = s.state === "home"; col = wc = h ? "#34D399" : p.muted; word = h ? "Home" : s.state === "not_home" ? "Away" : s.state; }
      else { const o = !OFF_STATES.includes(s.state); col = wc = o ? "#B794FF" : p.muted; word = o ? "On" : "Off"; }
    }
    return `<div class="rw" data-e="${esc(id)}"><span class="ri" style="color:${col}">${icon ? `<ha-icon icon="${esc(icon)}"></ha-icon>` : `<span class="si" data-icon="${esc(id)}"></span>`}</span><span class="rn t">${esc(name)}</span><span class="rv" style="color:${wc}">${esc(word)}</span></div>`;
  }

  render() {
    if (!this._config) return;
    if (!this._built) { if (!this._building) { this._building = true; this._isOpen = !!this._config.open; this.build().finally(() => { this._building = false; }); } return; }
    const c = this._config, p = this.p, fold = !!c.collapsible, open = !fold || this._isOpen;
    const head = c.picture || c.icon || c.subtitle || fold;
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      :host{--grid-card-gap:8px}
      .pn{${fold ? `background:none;border:0;padding:0;color:${p.text}` : `${panelCss(p, 24)};padding:16px`};display:grid;grid-template-columns:minmax(0,1fr);gap:${Number.isFinite(Number(c.gap)) ? Number(c.gap) : 12}px}
      .pn > *{min-width:0}
      .tt{font-size:17px;font-weight:700;letter-spacing:-.2px;color:${p.text};padding:2px}
      .hd{display:flex;align-items:center;gap:14px;padding:${fold ? "6px 6px 10px" : "0 2px"};${fold ? "cursor:pointer;-webkit-tap-highlight-color:transparent;" : ""}}
      .hd img{height:58px;width:auto;filter:drop-shadow(0 8px 16px rgba(0,0,0,.35))}
      .hd .hi{width:44px;height:44px;border-radius:15px;display:flex;align-items:center;justify-content:center;background:${p.inset};color:${p.text};flex:none}
      .hd .tx{flex:1;min-width:0}
      .hd .st{font-size:12px;margin-top:2px;color:${p.muted}}
      .hd .ar{flex:none;color:#8B6CFF;--mdc-icon-size:24px;transition:transform .12s;${open && fold ? "transform:rotate(180deg)" : ""}}
      .body{display:grid;grid-template-columns:repeat(${Math.max(1, Math.min(6, Number(c.columns) || 1))},minmax(0,1fr));gap:10px}
      @container (max-width: 420px){:host .body{grid-template-columns:repeat(${Math.min(2, Math.max(1, Number(c.columns) || 1))},minmax(0,1fr))}}
      .body > *{min-width:0}
      .body[hidden]{display:none}
      .rw{display:flex;align-items:center;gap:12px;padding:12px 4px;border-bottom:1px solid ${p.border};cursor:pointer}
      .ri{width:38px;height:38px;border-radius:12px;background:${p.inset};display:flex;align-items:center;justify-content:center;flex:none;--mdc-icon-size:20px}
      .rn{flex:1;min-width:0;font-size:14px;font-weight:600}
      .rv{font-size:13px;font-weight:600;flex:none}
    </style><div class="pn">${head ? `<div class="hd">${c.picture ? `<img src="${esc(c.picture)}" alt="">` : c.icon ? `<span class="hi"><ha-icon icon="${esc(c.icon)}"></ha-icon></span>` : ""}<div class="tx">${c.title ? `<div class="tt t" style="padding:0">${esc(c.title)}</div>` : ""}${c.subtitle ? `<div class="st t">${esc(c.subtitle)}</div>` : ""}</div>${fold ? '<ha-icon class="ar" icon="mdi:chevron-down"></ha-icon>' : ""}</div>` : c.title ? `<div class="tt t">${esc(c.title)}</div>` : ""}
      ${(c.entities || []).length ? `<div>${c.entities.map((e) => this.row(e)).join("")}</div>` : ""}
      ${this._cards.length ? `<div class="body" ${open ? "" : "hidden"}></div>` : ""}</div>`;
    const body = this.shadowRoot.querySelector(".body");
    if (body) this._cards.forEach((el, i) => { const w = document.createElement("div"); const cf = (c.cards || [])[i] || {}; if (cf.wide) w.style.gridColumn = "1/-1"; w.appendChild(el); body.appendChild(w); });
    this.shadowRoot.querySelectorAll("[data-icon]").forEach((el) => this.icon(el, null, el.dataset.icon));
    this.shadowRoot.querySelectorAll(".rw").forEach((el) => el.addEventListener("click", () => this.moreInfo(el.dataset.e)));
    const hd = this.shadowRoot.querySelector(".hd");
    if (fold && hd) hd.addEventListener("click", () => {
      this._isOpen = !this._isOpen; this.vibrate(); this._sig = null; this.hass = this._hass;
      const b = this.shadowRoot.querySelector(".body");
      if (b && this._isOpen) { try { if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) b.animate([{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "none" }], { duration: 260, easing: "ease-out" }); } catch (e) { /* opens at once */ } }
    });
  }

  getCardSize() { return 4; }
}

// ------------------------------------------------------------------ register
// ------------------------------------------------------------------ Roost Now
// The home screen thinks about "now": only what matters at this moment, most urgent first.
// An alarm, a leak, someone at the door, the next prayer or iftar, a door open in the heat,
// lights left on when nobody is home, low batteries. When nothing needs you, one calm line.
class RoostNow extends ticking(RoostBase, 30000) {
  static get defaults() { return { max: 3, hot: 38, battery_low: 15, prayer: true, method: "makkah", prayer_minutes: 30, iftar_hours: 3, doors: [], lights: [], people: [], hide_calm: false, theme: "auto" }; }

  static getConfigForm() {
    return {
      schema: [
        { name: "max", label: "Most things shown at once", selector: slider(1, 5) },
        { type: "expandable", name: "", title: "What it watches (empty = found by itself)", icon: "mdi:eye-outline", schema: [
          { name: "doorbell", label: "Doorbell (button or sensor)", selector: { entity: {} } },
          { name: "camera", label: "Door camera (its picture when someone rings)", selector: { entity: { domain: "camera" } } },
          { name: "doors", label: "Doors and windows", selector: { entity: { multiple: true, domain: ["binary_sensor", "cover"] } } },
          { name: "lights", label: "Lights to check when nobody is home", selector: { entity: { multiple: true, domain: ["light", "switch"] } } },
          { name: "people", label: "People", selector: { entity: { multiple: true, domain: "person" } } },
          { name: "weather", selector: { entity: { domain: "weather" } } },
        ] },
        { type: "expandable", name: "", title: "When to speak up", icon: "mdi:tune", schema: [
          { type: "grid", name: "", schema: [{ name: "hot", label: "Hot outside from (°)", selector: { number: { mode: "box" } } }, { name: "battery_low", label: "Battery low below (%)", selector: { number: { mode: "box" } } }] },
          { name: "prayer", label: "The next prayer and the iftar countdown", selector: { boolean: {} } },
          { type: "grid", name: "", schema: [{ name: "prayer_minutes", label: "Prayer: show from (minutes before)", selector: { number: { mode: "box" } } }, { name: "iftar_hours", label: "Iftar: show from (hours before)", selector: { number: { mode: "box" } } }] },
          { name: "method", label: "Prayer times", selector: pick([["makkah", "Umm al-Qura (Makkah)"], ["mwl", "Muslim World League"], ["egypt", "Egypt"], ["karachi", "Karachi"], ["isna", "North America"], ["dubai", "Dubai"], ["jafari", "Shia Ithna Ashari"]]) },
          { name: "hide_calm", label: "Hide the card when all is calm", selector: { boolean: {} } },
        ] },
        THEME_FIELD,
      ],
      computeLabel,
    };
  }

  static getStubConfig() { return {}; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  all(dom) { return Object.keys(this._hass?.states || {}).filter((id) => id.startsWith(`${dom}.`)); }

  watched() {
    const c = this._config, h = this._hass; if (!h) return [];
    return [c.doorbell, c.camera, c.weather, ...this.doorIds(), ...this.lightIds(), ...this.peopleIds(), ...this.all("alarm_control_panel"), ...this.dangerIds(), ...this.batteryIds()].filter(Boolean);
  }

  extraSignature() { return Math.floor(Date.now() / 60000); }

  doorIds() { const c = this._config; return c.doors?.length ? c.doors : Object.keys(this._hass.states).filter((id) => { const s = this._hass.states[id]; return (id.startsWith("binary_sensor.") && ["door", "window", "garage_door", "opening"].includes(s.attributes.device_class)) || (id.startsWith("cover.") && ["garage", "gate"].includes(s.attributes.device_class)); }); }
  lightIds() { const c = this._config; return c.lights?.length ? c.lights : this.all("light").filter((id) => !Array.isArray(this._hass.states[id].attributes.entity_id)); }
  peopleIds() { const c = this._config; return c.people?.length ? c.people : this.all("person"); }
  dangerIds() { return Object.keys(this._hass.states).filter((id) => id.startsWith("binary_sensor.") && ["moisture", "smoke", "gas", "carbon_monoxide", "safety"].includes(this._hass.states[id].attributes.device_class)); }
  batteryIds() { return Object.keys(this._hass.states).filter((id) => id.startsWith("sensor.") && this._hass.states[id].attributes.device_class === "battery" && this._hass.states[id].attributes.unit_of_measurement === "%"); }

  // the next prayer (or iftar in Ramadan), from the same calculation as Roost Prayer
  prayerMoment() {
    const c = this._config, h = this._hass; if (!c.prayer || typeof PrayerCalc === "undefined") return null;
    const now = new Date(), lat = Number(h.config?.latitude ?? 26.2), lng = Number(h.config?.longitude ?? 50.6);
    const tz = -now.getTimezoneOffset() / 60, t = PrayerCalc.times(now, lat, lng, tz, c.method, 1, Number(h.config?.elevation ?? 0));
    const at = (v) => { const d = new Date(now); d.setHours(0, 0, 0, 0); d.setMinutes(Math.round(v * 60)); return d; };
    let ramadan = false;
    try { ramadan = +new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { month: "numeric" }).formatToParts(now).find((p) => p.type === "month").value === 9; } catch (e) { /* no Hijri calendar */ }
    const names = { fajr: "Fajr", dhuhr: now.getDay() === 5 ? "Jumu'ah" : "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha" };
    const left = (d) => { const m = Math.max(0, Math.round((d - now) / 60000)); return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`; };
    if (ramadan && isFinite(t.maghrib)) {
      const m = at(t.maghrib), ms = m - now;
      if (ms > 0 && ms <= Number(c.iftar_hours) * 3600e3) return { key: "iftar", rank: 40, icon: "mdi:weather-sunset-down", g: COLORS.amber, title: `Iftar in ${left(m)}`, sub: `Maghrib at ${m.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` };
    }
    if (now.getHours() >= 18 && isFinite(t.isha) && now > at(t.isha) && isFinite(t.fajr)) {
      const f = at(t.fajr); f.setDate(f.getDate() + 1);
      if (f - now <= Number(c.prayer_minutes) * 60000) return { key: "p-fajr", rank: 45, icon: "mdi:mosque", g: COLORS.purple, title: `Fajr in ${left(f)}`, sub: `At ${f.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` };
    }
    for (const k of ["fajr", "dhuhr", "asr", "maghrib", "isha"]) {
      if (!isFinite(t[k])) continue;
      const d = at(t[k]), ms = d - now;
      if (ms > 0 && ms <= Number(c.prayer_minutes) * 60000) return { key: `p-${k}`, rank: 45, icon: "mdi:mosque", g: COLORS.purple, title: `${names[k]} in ${left(d)}`, sub: `At ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` };
      if (ms <= 0 && ms > -10 * 60000) return { key: `p-${k}`, rank: 45, icon: "mdi:mosque", g: COLORS.purple, title: `Time for ${names[k]}`, sub: `It was at ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` };
    }
    return null;
  }

  moments() {
    const c = this._config, h = this._hass, S = h.states, out = [], name = (id) => S[id]?.attributes.friendly_name || id;
    const now = Date.now(), isOn = (s) => s && !UNAVAILABLE.includes(s.state) && !OFF_STATES.includes(s.state);
    for (const id of this.all("alarm_control_panel")) if (S[id].state === "triggered") out.push({ key: id, rank: 100, icon: "mdi:bell-ring", g: COLORS.coral, title: "The alarm is going off", sub: name(id), entity: id, act: ["Open", () => this.moreInfo(id)] });
    for (const id of this.dangerIds()) if (S[id].state === "on") { const dc = S[id].attributes.device_class; out.push({ key: id, rank: 95, icon: dc === "moisture" ? "mdi:water-alert" : "mdi:smoke-detector-alert", g: COLORS.coral, title: dc === "moisture" ? "Water leak" : dc === "gas" ? "Gas detected" : "Smoke detected", sub: name(id), entity: id }); }
    const bell = S[c.doorbell];
    if (bell && !UNAVAILABLE.includes(bell.state) && (bell.state === "on" || (now - new Date(bell.last_changed).getTime() < 120000 && /^(event|button|input_button)\./.test(c.doorbell)))) {
      out.push({ key: "bell", rank: 90, icon: "mdi:doorbell-video", g: COLORS.amber, title: "Someone is at the door", sub: `Rang ${ago(bell.last_changed)}`, entity: c.camera || c.doorbell, pic: S[c.camera]?.attributes.entity_picture });
    }
    const pr = this.prayerMoment(); if (pr) out.push(pr);
    const people = this.peopleIds(), home = people.filter((id) => S[id]?.state === "home"), away = people.length && !home.length;
    const night = new Date().getHours() >= 22 || new Date().getHours() < 6;
    const wx = S[c.weather] || S[this.all("weather")[0]], hotNow = wx && Number(wx.attributes.temperature) >= Number(c.hot);
    const open = this.doorIds().filter((id) => { const s = S[id]; if (!s) return false; return id.startsWith("cover.") ? ["open", "opening"].includes(s.state) : s.state === "on"; });
    if (open.length && (away || night || hotNow)) {
      const why = away ? "and nobody is home" : night ? "at night" : `and it is ${Math.round(wx.attributes.temperature)}° outside`;
      out.push({ key: "doors", rank: away ? 80 : 60, icon: "mdi:door-open", g: COLORS.amber, title: open.length > 1 ? `${open.length} doors or windows are open` : `${name(open[0])} is open`, sub: why.charAt(0).toUpperCase() + why.slice(1), entity: open[0] });
    }
    const lit = this.lightIds().filter((id) => S[id]?.state === "on");
    if (away && lit.length) out.push({ key: "lights", rank: 70, icon: "mdi:lightbulb-alert", g: COLORS.amber, title: lit.length > 1 ? `${lit.length} lights are on` : `${name(lit[0])} is on`, sub: "And nobody is home", act: ["Turn off", () => this.call("light", "turn_off", { entity_id: lit.filter((x) => x.startsWith("light.")) })] });
    const low = this.batteryIds().filter((id) => { const v = num(S[id].state); return v != null && v <= Number(c.battery_low); });
    if (low.length) out.push({ key: "bat", rank: 20, icon: "mdi:battery-alert-variant-outline", g: COLORS.coral, title: low.length > 1 ? `${low.length} batteries are low` : `${name(low[0]).replace(/ battery$/i, "")}: battery low`, sub: low.slice(0, 2).map((id) => `${name(id).replace(/ battery$/i, "")} ${Math.round(num(S[id].state))}%`).join(" · "), entity: low[0] });
    return out.sort((a, b) => b.rank - a.rank).slice(0, Number(c.max) || 3);
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, list = this.moments();
    if (!list.length && c.hide_calm && !this.editMode) { this.shadowRoot.innerHTML = ""; this.style.display = "none"; return; }
    this.style.display = "";
    const calm = !list.length, top = list[0];
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${panelCss(p, 22)};padding:12px;display:flex;flex-direction:column;gap:8px}
      .m{display:flex;align-items:center;gap:12px;padding:8px;border-radius:16px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .12s,background .12s}
      .m:active{transform:scale(.98)}
      .m.top{background:${p.inset}}
      .ic{width:44px;height:44px;border-radius:14px;flex:none;display:flex;align-items:center;justify-content:center;color:#FFFFFF;--mdc-icon-size:22px;position:relative}
      .ic.ring::after{content:"";position:absolute;inset:0;border-radius:inherit;animation:roost-ping 2s ease-out infinite;background:inherit}
      .tx{flex:1;min-width:0}.tt{font-size:15px;font-weight:600;line-height:1.25}.sb{font-size:12px;color:${p.muted};margin-top:2px}
      .act{flex:none;height:36px;padding:0 14px;border-radius:999px;border:0;font:inherit;font-size:13px;font-weight:600;cursor:pointer;color:#FFFFFF}
      .pic{width:64px;height:44px;border-radius:12px;object-fit:cover;flex:none}
      .calm{display:flex;align-items:center;gap:12px;padding:6px 8px}.calm .ic{background:linear-gradient(135deg,${COLORS.green[0]},${COLORS.green[1]})}
    </style>
    <div class="card" role="list" aria-label="Right now">
      ${calm ? `<div class="calm"><span class="ic"><ha-icon icon="mdi:home-heart"></ha-icon></span><span class="tx"><div class="tt">All calm at home</div><div class="sb">Nothing needs you right now</div></span></div>`
    : list.map((m, i) => `<div class="m ${i === 0 ? "top" : ""}" role="listitem" data-i="${i}">
        <span class="ic ${m.rank >= 90 ? "ring" : ""}" style="background:linear-gradient(135deg,${m.g[0]},${m.g[1]});box-shadow:0 10px 22px -12px ${m.g[0]}"><ha-icon icon="${m.icon}"></ha-icon></span>
        <span class="tx"><div class="tt">${esc(m.title)}</div>${m.sub ? `<div class="sb">${esc(m.sub)}</div>` : ""}</span>
        ${m.pic ? `<img class="pic" src="${esc(m.pic)}" alt="">` : ""}
        ${m.act ? `<button class="act" data-a="${i}" style="background:linear-gradient(135deg,${m.g[0]},${m.g[1]})">${esc(m.act[0])}</button>` : ""}
      </div>`).join("")}
    </div>`;
    void top;
    this.shadowRoot.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); this.vibrate(); list[+b.dataset.a].act[1](); }));
    this.shadowRoot.querySelectorAll(".m").forEach((el) => el.addEventListener("click", () => { const m = list[+el.dataset.i]; if (m.entity) this.moreInfo(m.entity); }));
  }
}

// Roost 3D Home: the home from Roost Atelier (a separate integration) inside a Roost card: a head with what is
// going on, the live 3D view, and the realistic photos the Atelier made of the whole floor and every room.
class RoostHome3d extends RoostBase {
  static get defaults() { return { plan: "", floor: 0, view: "3d", height: 320, live: true, photos: true, theme: "auto" }; }

  static getConfigForm() {
    return {
      schema: [
        { name: "name", label: "Name (empty = the home's own name)", selector: { text: {} } },
        { name: "plan", label: "Home id (empty = the first home)", selector: { text: {} } },
        { type: "grid", name: "", schema: [
          { name: "floor", label: "Level (0 = ground)", selector: { number: { min: 0, max: 9, mode: "box" } } },
          { name: "view", label: "Start in", selector: pick([["3d", "3D"], ["top", "From above"], ["walk", "Walk-through"]]) },
        ] },
        { name: "height", label: "Height of the 3D view", selector: slider(200, 800, 20, "px") },
        { type: "grid", name: "", schema: [
          { name: "live", label: "Live 3D view", selector: { boolean: {} } },
          { name: "photos", label: "Realistic photos", selector: { boolean: {} } },
        ] },
        THEME_FIELD,
      ],
      computeLabel,
    };
  }

  static getStubConfig() { return {}; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  setConfig(config) { this._built = false; this._plan = null; this._shots = null; super.setConfig(config); }

  set hass(h) {
    if (h && RoostPop.hass !== h) RoostPop.setHass(h);
    const first = !this._hass; this._hass = h;
    if (!h || !this._config) return;
    const dark = this.dark;
    if (!this._built || dark !== this._wasDark) { this._wasDark = dark; this._built = true; this.render(); if (first || !this._plan) this.load(); return; }
    if (this._inner) this._inner.hass = h;
    this.summary();
  }

  get hass() { return this._hass; }

  ws(msg) { return this._hass.connection.sendMessagePromise(msg); }

  // the home, its photos, and whether Roost Atelier is installed at all
  async load() {
    const c = this._config;
    try {
      const plans = await this.ws({ type: "roost_atelier/plans" });
      const id = c.plan || plans[0]?.id;
      if (!id) { this._state = "empty"; return this.render(); }
      this._plan = await this.ws({ type: "roost_atelier/plan", plan_id: id });
      this._state = "ok";
    } catch (e) { this._state = "missing"; return this.render(); }
    this.render();
    if (c.photos) this.loadShots();
  }

  async loadShots() {
    const plan = this._plan; if (!plan) return;
    const fi = Number(this._config.floor) || 0, pre = `${plan.id}_${fi}_`;
    try {
      const list = (await this.ws({ type: "roost_atelier/photos", plan_id: plan.id })).filter((x) => x.key.startsWith(pre));
      const rooms = this.level()?.rooms || [], name = (rid) => (rid === "all" ? "Whole floor" : rooms.find((r) => r.id === rid)?.name || "Room");
      const out = [];
      for (const x of list) {
        const rid = x.key.slice(pre.length); if (rid !== "all" && !rooms.some((r) => r.id === rid)) continue;
        this._urls ||= new Map(); const k = `${x.key}@${x.updated}`;
        if (!this._urls.has(k)) { const r = await this._hass.fetchWithAuth(`/api/roost_atelier/photo/${x.key}`); if (!r.ok) continue; this._urls.set(k, URL.createObjectURL(await r.blob())); }
        out.push({ rid, name: name(rid), url: this._urls.get(k) });
      }
      out.sort((a, b) => (a.rid === "all" ? -1 : b.rid === "all" ? 1 : a.name.localeCompare(b.name)));
      this._shots = out; this.drawShots();
    } catch (e) { /* no photos yet */ }
  }

  level() { const f = this._plan?.floors || []; return f[Number(this._config.floor) || 0] || f[0]; }

  // one calm line: lights on, doors open, who is home (only the devices placed in this home)
  summaryText() {
    const S = this._hass.states, devs = this.level()?.devices || [], ent = (k) => devs.filter((d) => (d.kind || "") === k || (d.entity || "").startsWith(`${k}.`)).map((d) => S[d.entity]).filter(Boolean);
    const lights = devs.filter((d) => /^(light|switch)\./.test(d.entity || "") && (d.kind === "light" || d.entity.startsWith("light."))).map((d) => S[d.entity]).filter(Boolean);
    const on = lights.filter((s) => s.state === "on").length;
    const doors = ent("door").filter((s) => ["on", "open", "opening", "unlocked"].includes(s.state)).length;
    const people = ent("person").filter((s) => s.state === "home").length;
    const parts = [];
    parts.push(on ? `${on} ${on === 1 ? "light" : "lights"} on` : "All lights off");
    if (doors) parts.push(`${doors} ${doors === 1 ? "door" : "doors"} open`);
    if (people) parts.push(`${people} at home`);
    return parts.join(" · ");
  }

  summary() { const el = this.shadowRoot?.querySelector(".sb"); if (el && this._plan) { const t = this.summaryText(); if (el.textContent !== t) el.textContent = t; } }

  open() { history.pushState(null, "", "/roost-atelier"); window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } })); }

  render() {
    if (!this._hass || !this._config || !this.shadowRoot) return;
    const c = this._config, p = this.p, st = this._state, admin = !!this._hass.user?.is_admin;
    const title = c.name || (this._plan ? `${this._plan.name}${(this._plan.floors?.length || 0) > 1 ? ` · ${this.level()?.name || ""}` : ""}` : "Home in 3D");
    const sub = st === "missing" ? "Roost Atelier isn't installed yet" : st === "empty" ? "No home drawn yet" : this._plan ? this.summaryText() : "Loading";
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${panelCss(p, 22)};padding:16px;display:flex;flex-direction:column;gap:12px}
      .hd{display:flex;align-items:center;gap:12px}
      .ic{width:42px;height:42px;border-radius:14px;flex:none;display:flex;align-items:center;justify-content:center;color:#FFFFFF;--mdc-icon-size:20px;background:linear-gradient(135deg,${ACTIVE[0]},${ACTIVE[1]});box-shadow:0 10px 22px -12px ${ACTIVE[2]}}
      .tx{flex:1;min-width:0}.tt{font-size:15px;font-weight:600;line-height:1.2}.sb{font-size:12px;color:${p.muted};margin-top:4px}
      .go{width:36px;height:36px;border-radius:999px;border:0;flex:none;display:flex;align-items:center;justify-content:center;background:${p.inset};color:${p.text};cursor:pointer;--mdc-icon-size:20px;transition:transform .12s}
      .go:active{transform:scale(.94)}
      .live{border-radius:16px;overflow:hidden;background:${p.inset};--ha-card-border-radius:16px;--ha-card-box-shadow:none;--ha-card-border-width:0}
      .note{display:flex;flex-direction:column;gap:8px;padding:16px;border-radius:16px;background:${p.inset};font-size:13px;line-height:1.4;color:${p.muted}}
      .note b{font-size:15px;color:${p.text}}.note a{color:${ACTIVE[1]};font-weight:600}
      .shots{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin:0 -4px;padding:0 4px}.shots::-webkit-scrollbar{display:none}
      .shot{flex:none;width:132px;display:flex;flex-direction:column;gap:4px;border:0;padding:0;background:none;color:${p.text};font:inherit;cursor:pointer;text-align:start}
      .shot img{width:132px;height:84px;border-radius:12px;object-fit:cover;display:block;background:${p.inset}}
      .shot span{font-size:12px;color:${p.muted};line-height:1.25}
      .wait{font-size:12px;color:${p.muted}}
    </style>
    <div class="card">
      <div class="hd"><span class="ic"><ha-icon icon="mdi:floor-plan"></ha-icon></span>
        <span class="tx"><div class="tt">${esc(title)}</div><div class="sb">${esc(sub)}</div></span>
        ${admin && st === "ok" ? '<button class="go" aria-label="Open Roost Atelier"><ha-icon icon="mdi:arrow-top-right"></ha-icon></button>' : ""}</div>
      ${st === "missing" ? `<div class="note"><b>See your home in realistic 3D</b>Install Roost Atelier from the Marketplace (as a custom repository) and draw your home. This card then shows it live, with photos of every room.<a href="https://github.com/HRadhi4/Roost-Atelier" target="_blank" rel="noopener">How to install</a></div>` : ""}
      ${st === "empty" ? `<div class="note"><b>Draw your home first</b>Open Atelier in the sidebar and pick a ready-made home or draw your own.</div>` : ""}
      ${st === "ok" && c.live ? '<div class="live"></div>' : ""}
      ${st === "ok" && c.photos ? '<div class="shots"></div>' : ""}
    </div>`;
    this.shadowRoot.querySelector(".go")?.addEventListener("click", () => { this.vibrate(); this.open(); });
    if (st === "ok" && c.live) this.mountLive();
    if (st === "ok" && c.photos) this.drawShots();
  }

  // the Atelier's own live 3D card, kept alive between updates (it is never rebuilt on a state change)
  async mountLive() {
    const box = this.shadowRoot.querySelector(".live"); if (!box) return;
    const ok = await Promise.race([customElements.whenDefined("roost-atelier-card").then(() => true), new Promise((r) => setTimeout(() => r(false), 6000))]);
    if (!ok) { box.outerHTML = '<div class="note">The 3D view is loading. If it doesn\'t appear, refresh the page.</div>'; return; }
    const c = this._config, cfg = { plan: this._plan.id, floor: Number(c.floor) || 0, view: c.view, height: Number(c.height) || 320, toolbar: true, hotspots: true };
    const key = JSON.stringify(cfg);
    if (!this._inner || this._innerKey !== key) { this._inner = document.createElement("roost-atelier-card"); this._inner.setConfig(cfg); this._innerKey = key; }
    box.appendChild(this._inner); this._inner.hass = this._hass;
  }

  drawShots() {
    const el = this.shadowRoot?.querySelector(".shots"); if (!el) return;
    const list = this._shots;
    if (!list) { el.innerHTML = '<span class="wait">Looking for photos</span>'; return; }
    if (!list.length) { el.innerHTML = '<span class="wait">Photos appear here by themselves once Roost Atelier has made them</span>'; return; }
    el.innerHTML = list.map((x, i) => `<button class="shot" data-i="${i}"><img alt="" src="${esc(x.url)}"><span>${esc(x.name)}</span></button>`).join("");
    el.querySelectorAll(".shot").forEach((b) => b.addEventListener("click", () => {
      const x = list[+b.dataset.i]; this.vibrate();
      RoostPop.open({ id: "roost-3d-photo", kind: "info", title: x.name, icon: "mdi:camera-iris", image: x.url, close_after: 0, buttons: [] });
    }));
  }
}

const CARDS = [
  ["roost-tile", RoostTile, "Roost Tile", "A big tile with a switch, colour, icon and how long it has been on."],
  ["roost-chips", RoostChips, "Roost Chips", "Status chips in one row: doors, alarm, lights (with count), AC and people bubbles."],
  ["roost-thermostat", RoostThermostat, "Roost Thermostat", "Air conditioner with a dial you drag, power, − and +, and mode buttons."],
  ["roost-scene", RoostScene, "Roost Scene", "A coloured button that runs a scene, script or action."],
  ["roost-hero", RoostHero, "Roost Hero", "A greeting with the time, date and weather."],
  ["roost-nav", RoostNav, "Roost Nav", "Icon navigation: a bar on phones and a side rail on tablets."],
  ["roost-row", RoostRow, "Roost Row", "A long row with a ring (an AC's temperature or any number), a name, a state line and an arrow."],
  ["roost-rooms", RoostRooms, "Roost Rooms Selector", "A room switcher: tap a room pill to show that room's cards. Switching is instant."],
  ["roost-curtain", RoostCurtain, "Roost Curtain", "A window with curtains that really slide open and closed, with a sky behind them."],
  ["roost-gauge", RoostGauge, "Roost Gauge", "A big ring for one reading, such as a temperature or a plug's power. It turns orange when too high."],
  ["roost-automations", RoostAutomations, "Roost Automations", "A list of automations with a switch and when each last ran."],
  ["roost-clock", RoostClockFace, "Roost Clock", "A clock with many faces: digital, analog, flip, ring, words, neon and LCD, any time zone and world clocks."],
  ["roost-prayer", RoostPrayer, "Roost Prayer Times", "Today's prayer times with the next one, a countdown and the Hijri date, calculated with any method, from your sensors or online."],
  ["roost-title", RoostTitle, "Roost Title", "A section heading with an optional line under it and a “See all” link."],
  ["roost-theme", RoostTheme, "Roost Light/Dark", "A sun / moon button that switches this screen between light and dark."],
  ["roost-media", RoostMedia, "Roost Media", "TV and sound: power, what is playing, volume, mute and inputs."],
  ["roost-room", RoostRoom, "Roost Room", "One room at a glance: temperature bar, humidity and what is on. Tap to open the room."],
  ["roost-alarm", RoostAlarm, "Roost Alarm", "The alarm with arm and disarm buttons, a keypad when needed, and the doors."],
  ["roost-light", RoostLight, "Roost Light", "A light with brightness you drag, warm/cool buttons and colour dots."],
  ["roost-graph", RoostGraph, "Roost Graph", "A smooth line of a reading over the last hours, with lowest and highest."],
  ["roost-people", RoostPeople, "Roost People", "Who is home, with a picture and how long they have been home or away."],
  ["roost-alerts", RoostAlerts, "Roost Alerts", "Shows only when something needs you: low battery, offline device, door left open."],
  ["roost-remote", RoostRemote, "Roost Remote", "A remote-control pad for an Athom Hub remote, a remote or a TV: power, arrows, OK, volume and channels."],
  ["roost-presence", RoostPresence, "Roost Presence Map", "The room from above as a presence radar sees it: people as moving dots, and its zones."],
  ["roost-weather", RoostWeather, "Roost Weather", "The weather now with an animated sky, and the next days or hours."],
  ["roost-energy", RoostEnergy, "Roost Energy", "Power used now, today against yesterday, and the hungriest devices."],
  ["roost-timer", RoostTimer, "Roost Timer", "A countdown ring for a timer, with start, pause, cancel and quick times."],
  ["roost-fan", RoostFan, "Roost Fan", "A fan that spins as fast as it is set, with speed buttons, swing and modes."],
  ["roost-air", RoostAir, "Roost Air", "An air purifier or a room's air: a ring coloured by how clean the air is, air drawn in while it runs, mode, speed and filter."],
  ["roost-water-heater", RoostWaterHeater, "Roost Water Heater", "A water tank that shows how hot it is, bubbles while it heats, the set temperature and “heat for 30 min”."],
  ["roost-doorbell", RoostDoorbell, "Roost Doorbell", "The door camera, a banner when someone rings, the last rings and the door lock."],
  ["roost-laundry", RoostLaundry, "Roost Laundry", "A washer, dryer or dishwasher: the drum turns, the steps of the cycle, time left and “ready to unload”."],
  ["roost-garage", RoostGarage, "Roost Garage", "A garage door that rolls up (or a gate that slides or swings), how long it is open, and a warning when it stays open."],
  ["roost-flow", RoostFlow, "Roost Energy Flow", "Sun, house, battery and grid with power flowing between them."],
  ["roost-irrigation", RoostIrrigation, "Roost Irrigation", "Garden zones: tap to water, see what is watering and skip when rain is coming."],
  ["roost-ev", RoostEV, "Roost Car", "An electric car charging: battery, range, charging power, limit and when it will be full."],
  ["roost-plant", RoostPlant, "Roost Plant", "A potted plant that droops when thirsty and says what it needs: water, light, warmth or food."],
  ["roost-printer", RoostPrinter, "Roost Printer", "Ink or toner levels as little bottles, or a 3D print growing layer by layer."],
  ["roost-moments", RoostMoments, "Roost Moments", "Your day in moments (morning, evening, bedtime) with the scene that fits right now."],
  ["roost-family", RoostFamilyMap, "Roost Family Map", "Where everyone is, drawn simply around home: places as circles, people as faces, how far away."],
  ["roost-tank", RoostTank, "Roost Tank", "A water tank or gas cylinder: how full it is, used today, days left, and a leak warning."],
  ["roost-pool", RoostPool, "Roost Pool", "The pool from above: water temperature, chlorine and pH with the good zone, pump, heater and light."],
  ["roost-pet", RoostPet, "Roost Pet", "A pet feeder and water fountain: food and water left, when it last ate, and “feed now”."],
  ["roost-nursery", RoostNursery, "Roost Nursery", "The baby's room: camera, warmth, a banner when the baby cries, night light and lullaby."],
  ["roost-network", RoostNetwork, "Roost Network", "The internet (speed, devices online) or a server (CPU, memory, disk, heat), with a safe restart."],
  ["roost-batteries", RoostBatteries, "Roost Batteries", "Every battery in the home, lowest first, with a calm “All good” when none are low."],
  ["roost-timeline", RoostTimeline, "Roost Timeline", "What happened at home, newest first: doors, locks, people coming and going, alarms and leaks."],
  ["roost-values", RoostValues, "Roost Values", "Your own settings in one card: numbers to slide, choices to tap, switches and short texts."],
  ["roost-bins", RoostBins, "Roost Bins", "Which bin goes out next, drawn as coloured bins; tonight's one bounces."],
  ["roost-popup", RoostPopup, "Roost Popup", "A popup for the doorbell and its camera, alarms, leaks, a door left open, the washing done, or any cards. Opens by itself, from a link or from an automation."],
  ["roost-grocy", RoostGrocy, "Roost Grocy", "The kitchen from Grocy: food that goes off soon, the shopping list, chores, tasks and the meal plan."],
  ["roost-medicine", RoostMedicine, "Roost Medicine", "Today's doses to tick off, the next dose, and a warning for a missed one."],
  ["roost-modes", RoostModes, "Roost Modes", "House modes (home, away, holiday, guests): checks doors and windows, and shows a guest Wi-Fi code to scan."],
  ["roost-sleep", RoostSleep, "Roost Sleep", "The night from bedtime to the alarm, a good-night button, and how last night went."],
  ["roost-vacuum", RoostVacuum, "Roost Vacuum", "A robot vacuum on its little floor: cleans in lanes, mops, spirals, goes home and charges. Rooms, suction, mop settings, care of its brushes and its map."],
  ["roost-lock", RoostLock, "Roost Lock", "A lock or garage door: slide to open, tap to lock."],
  ["roost-agenda", RoostAgenda, "Roost Agenda", "Today's and the next days' calendar events. Bin day stands out."],
  ["roost-todo", RoostTodo, "Roost To-do", "A to-do or shopping list: tick off, add and clear."],
  ["roost-camera", RoostCamera, "Roost Camera", "A camera picture or live video, with a banner when someone rings the doorbell."],
  ["roost-sensors", RoostSensors, "Roost Sensors", "Many small readings in neat squares, orange when out of range."],
  ["roost-buttons", RoostButtons, "Roost Buttons", "Several small actions in one rounded bar."],
  ["roost-page", RoostPage, "Roost Page", "A phone page laid out like the original dashboard: even spacing, the night-sky background and room for the bottom bar."],
  ["roost-panel", RoostPanel, "Roost Panel", "A rounded panel with a title that holds other cards, such as a list of rooms."],
  ["roost-now", RoostNow, "Roost Now", "What matters right now, most urgent first: the alarm, a leak, the doorbell, the next prayer or iftar, a door open in the heat, lights left on. One calm line when all is well."],
  ["roost-3d-home", RoostHome3d, "Roost 3D Home", "Your home from Roost Atelier: what is going on, the live 3D view and realistic photos of every room."],
  ["roost-fullscreen", RoostFullscreen, "Roost Full Screen", "Full screen without Home Assistant's top bar and sidebar: by itself, or as a button that maximizes and minimizes."],
];
window.customCards = window.customCards || [];
// "Only these people see this card": every Roost card can be hidden from everyone but the people chosen (show_to).
// While the dashboard is being edited it stays visible, so it can still be found and changed.
const forPeople = (hass, list) => {
  if (!Array.isArray(list) || !list.length) return true;
  const me = hass?.user?.id;
  return list.some((p) => p === me || hass?.states?.[p]?.attributes?.user_id === me);
};
window.RoostForPeople = forPeople;
for (const [tag, cls] of CARDS) {
  cls.tag = tag;
  let proto = cls.prototype, desc;
  while (proto && !(desc = Object.getOwnPropertyDescriptor(proto, "hass"))) proto = Object.getPrototypeOf(proto);
  if (desc && desc.set && !Object.prototype.hasOwnProperty.call(cls.prototype, "__roostWho")) {
    const set = desc.set, get = desc.get || function getHass() { return this._hass; };
    Object.defineProperty(cls.prototype, "hass", { configurable: true, get, set(h) {
      const editing = this.editMode || this.preview || /[?&]edit=1/.test(location.search) || this.closest?.("hui-card-preview, hui-dialog-edit-card");
      if (!editing && !forPeople(h, this._config?.show_to)) {
        this._hass = h;
        if (!this._roostHid) { this._roostHid = true; this.style.display = "none"; this.makeRoom?.(0); }
        return;
      }
      if (this._roostHid) { this._roostHid = false; this.style.display = ""; this._sig = null; }
      set.call(this, h);
    } });
    cls.prototype.__roostWho = true;
  }
  // words in the person's language, right to left for Arabic
  let rp = cls.prototype, rdesc;
  while (rp && !(rdesc = Object.getOwnPropertyDescriptor(rp, "render"))) rp = Object.getPrototypeOf(rp);
  if (rdesc && typeof rdesc.value === "function" && !Object.prototype.hasOwnProperty.call(cls.prototype, "__roostLang")) {
    const orig = rdesc.value;
    cls.prototype.render = function renderInLanguage(...args) {
      const out = orig.apply(this, args);
      RoostLang.cards.add(this);
      try { RoostLang.apply(this); } catch (e) { /* words stay as they are */ }
      return out;
    };
    cls.prototype.__roostLang = true;
  }
  cls.getConfigElement = function getConfigElement() { const el = document.createElement("roost-editor"); el.cardClass = cls; return el; };
}
for (const [tag, cls, name, description] of CARDS) {
  if (!customElements.get(tag)) customElements.define(tag, cls);
  if (!window.customCards.some((c) => c.type === tag)) window.customCards.push({ type: tag, name, description, preview: true, documentationURL: "https://github.com/HRadhi4/Roost-card" });
}
// the dashboards made from your home, in "Add dashboard" (Home Assistant 2026.5 and later) and by strategy type
if (!customElements.get("ll-strategy-dashboard-roost")) customElements.define("ll-strategy-dashboard-roost", RoostStrategy);
if (!customElements.get("ll-strategy-dashboard-roost-tablet")) customElements.define("ll-strategy-dashboard-roost-tablet", RoostStrategyTablet);
window.customStrategies = window.customStrategies || [];
if (!window.customStrategies.some((x) => x.type === "roost")) window.customStrategies.push({ type: "roost", strategyType: "dashboard", name: "Roost Home (phone)", description: "Roost cards made from your own rooms and devices, for phones.", documentationURL: "https://github.com/HRadhi4/Roost-card" });
if (!window.customStrategies.some((x) => x.type === "roost-tablet")) window.customStrategies.push({ type: "roost-tablet", strategyType: "dashboard", name: "Roost Home (tablet)", description: "Roost cards made from your own rooms and devices, for a wall tablet.", documentationURL: "https://github.com/HRadhi4/Roost-card" });
if (!window.__roostWelcome && typeof document !== "undefined" && document.querySelector) { window.__roostWelcome = true; setTimeout(() => RoostAuto.welcome(), 8000); }
console.info(`%c ROOST CARDS %c ${ROOST_VERSION} `, "color:#fff;background:#6D4BFF;font-weight:700;border-radius:4px 0 0 4px;padding:2px 4px", "color:#6D4BFF;background:#EEF0FF;border-radius:0 4px 4px 0;padding:2px 4px");
