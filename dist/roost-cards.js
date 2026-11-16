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

const ROOST_VERSION = "1.2.8";

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
  green: ["#10B981", "#6EE7B7", "rgba(52,211,153,.45)", "#03241B"],
  amber: ["#F59E0B", "#FDE68A", "rgba(245,158,11,.5)", "#2A1800"],
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
const COLOR_OPTIONS = [{ value: "active", label: "Selected purple" }, ...Object.keys(COLORS).map((k) => ({ value: k, label: k[0].toUpperCase() + k.slice(1) })), { value: "custom", label: "My own colours" }];
const SIZES = { small: 128, medium: 152, large: 176 };
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

// ------------------------------------------------------------------ shared base
class RoostBase extends HTMLElement {
  static get defaults() { return {}; }

  setConfig(config) {
    if (!config) throw new Error("Missing configuration");
    this._config = { ...this.constructor.defaults, ...config };
    this.validate?.(this._config);
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this._sig = null;
    if (this._hass) this.render();
  }

  set hass(hass) {
    this._hass = hass;
    const sig = this.signature();
    if (sig === this._sig) return;
    this._sig = sig;
    this.render();
    this.motion();
  }

  get hass() { return this._hass; }

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

  get p() { return this.dark ? PALETTE.dark : PALETTE.light; }

  /** The card's colour: a preset name, or the two custom colours. */
  colour(key = "color") {
    const c = this._config;
    if (c[key] === "active" || c[key] == null && key === "color" && this.constructor.activeByDefault) return ACTIVE;
    if (c[key] === "custom") {
      const a = rgb(c[`${key}_start`]) || COLORS.purple[0];
      const b = rgb(c[`${key}_end`]) || a;
      return [a, b, "rgba(0,0,0,.35)", rgb(c[`${key}_text`]) || "#FFFFFF"];
    }
    return COLORS[c[key]] || COLORS.purple;
  }

  gradient(key = "color") { const g = this.colour(key); return `linear-gradient(135deg,${g[0]} 0%,${g[1]} 100%)`; }

  st(id = this._config.entity) { return id ? this._hass?.states[id] : undefined; }

  name(id, fallback) {
    const s = this.st(id);
    return this._config.name || s?.attributes.friendly_name || fallback || id || "";
  }

  fire(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
  }

  moreInfo(entityId) { if (entityId) this.fire("hass-more-info", { entityId }); }

  vibrate(ms = 12) { try { navigator.vibrate?.(ms); } catch (e) { /* not on this device */ } }

  async call(domain, service, data) {
    try {
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
      if (!window.confirm(text)) return undefined;
    }
    this.vibrate();
    switch (a.action) {
      case "toggle":
        if (String(entityId).startsWith("cover.") && this._config?.reverse) {
          // reversed curtain: decide from what it really is, then send the command the motor understands
          const v = coverView(this.st(entityId), true);
          return this.call("cover", v.state === "closed" || v.state === "closing" ? "close_cover" : "open_cover", { entity_id: entityId });
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
    const s = this.st(entityId);
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
    return `:host{display:block;container-type:inline-size;--roost-text:${p.text};--roost-muted:${p.muted};font-family:${FONT_TEXT};line-height:normal}
      .num,svg text{font-family:${FONT_NUM}}
      *{box-sizing:border-box}
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

class RoostEditor extends HTMLElement {
  setConfig(config) { this._config = { ...config }; this.draw(); }

  set hass(hass) { this._hass = hass; this.draw(); }

  draw() {
    const cls = this.cardClass;
    if (!cls || !this._hass || !this._config) return;
    const { schema, computeLabel: label } = cls.getConfigForm();
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
  }
}
if (!customElements.get("roost-editor")) customElements.define("roost-editor", RoostEditor);

// ------------------------------------------------------------------ Roost Tile
class RoostTile extends RoostBase {
  static get defaults() {
    return { color: "purple", size: "large", radius: 22, fill: "gradient", glow: "soft", icon_shape: "rounded", icon_size: 22, name_size: 15, off_tint: false, align: "left",
      show_switch: true, show_state: true, show_since: true, animation: "auto", locked: false, confirm: false, tap_action: { action: "toggle" }, hold_action: { action: "more-info" }, theme: "auto" };
  }

  validate(c) { if (!c.entity) throw new Error("Choose a device (entity)"); }

  watched() { return [this._config.entity, this._config.power_entity].filter(Boolean); }

  extraSignature() { return Math.floor(Date.now() / 60000); } // "for 5 min" moves on

  static getConfigForm() {
    return {
      schema: [
        { name: "entity", required: true, selector: { entity: {} } },
        { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "icon", selector: { icon: {} }, context: { icon_entity: "entity" } }] },
        { type: "expandable", name: "", title: "Colour and shape", icon: "mdi:palette", schema: [
          ...colourFields(),
          { type: "grid", name: "", schema: [
            { name: "size", selector: { select: { mode: "dropdown", options: [{ value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }] } } },
            { name: "radius", selector: { number: { min: 0, max: 40, step: 2, mode: "slider", unit_of_measurement: "px" } } },
          ] },
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
        { type: "expandable", name: "", title: "What it shows", icon: "mdi:eye-outline", schema: [
          { name: "show_switch", selector: { boolean: {} } },
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
    const pw = this._config.power_entity && parseFloat(this.st(this._config.power_entity)?.state);
    if (on && Number.isFinite(pw)) t += ` · ${Math.round(pw)} W`;
    return t;
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, s = this.st(), p = this.p, g = this.colour();
    const broken = !!c.problem;
    const un = !s || UNAVAILABLE.includes(s.state) || broken;
    const on = !un && !OFF_STATES.includes(s.entity_id.startsWith("cover.") ? coverView(s, c.reverse).state : s.state);
    const h = SIZES[c.size] || SIZES.large;
    const togglable = s && ["light", "switch", "fan", "input_boolean", "automation", "media_player", "climate", "cover", "humidifier", "siren", "lock"].includes(s.entity_id.split(".")[0]);
    const showSwitch = c.show_switch && togglable && !un && !c.locked;
    const dom = s ? s.entity_id.split(".")[0] : "";
    const kind = c.animation === "auto" ? (dom === "light" ? "glow" : dom === "fan" || /fan/.test(s?.attributes.icon || "") ? "spin" : dom === "media_player" && s?.state === "playing" ? "bars" : "none") : c.animation;
    const anim = on && ANIMATIONS[kind] ? `animation:${ANIMATIONS[kind]}` : "";
    const look = fillLook(c.fill, c.glow, g, p);
    const isz = Math.max(12, Number(c.icon_size) || 22), box = c.icon_shape === "none" ? isz : Math.round(isz * 1.9);
    const nsz = Number(c.name_size) === 15 && h < 140 ? 14 : Math.max(11, Number(c.name_size) || 15); // the default name shrinks a little on small tiles
    const center = c.align === "center";
    const bars = on && kind === "bars" ? `<span class="bars">${[0, 0.2, 0.4, 0.1].map((d) => `<i style="animation-delay:${d}s"></i>`).join("")}</span>` : "";
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{position:relative;min-height:${h}px;height:100%;border-radius:${c.radius}px;padding:16px;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;
        display:flex;flex-direction:column;justify-content:space-between;gap:8px;overflow:hidden;transition:transform .12s;${center ? "align-items:center;text-align:center;" : ""}
        background:${on ? look.bg : p.off};color:${on ? look.fg : p.text};${on && look.blur ? "backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);" : ""}
        border:${on && c.fill === "outline" ? 2 : 1}px solid ${on ? look.border : c.off_tint ? `color-mix(in srgb, ${g[0]} 35%, ${p.border})` : p.border};box-shadow:${on ? look.shadow : "none"};opacity:${un ? 0.55 : 1}}
      .card:active{transform:scale(.96)}
      .ic{width:${box}px;height:${box}px;border-radius:${shapeRadius(c.icon_shape, box)};display:flex;align-items:center;justify-content:center;flex:none;
        background:${c.icon_shape === "none" ? "transparent" : on ? (look.light ? "rgba(255,255,255,.24)" : `color-mix(in srgb, ${g[0]} 30%, transparent)`) : c.off_tint ? `color-mix(in srgb, ${g[0]} 18%, ${p.inset})` : p.inset};
        color:${on ? (look.light ? "inherit" : g[this.dark ? 1 : 0]) : un ? p.muted : c.off_tint ? g[this.dark ? 1 : 0] : p.muted}}
      .ic ha-icon,.ic ha-state-icon{--mdc-icon-size:${isz}px;${anim}}
      .bars{position:absolute;right:18px;bottom:18px;display:flex;align-items:flex-end;gap:3px;height:22px}
      .bars i{display:block;width:4px;height:22px;border-radius:2px;background:currentColor;transform-origin:bottom;animation:roost-eq .9s ease-in-out infinite}
      .sw{position:absolute;top:16px;right:14px;width:42px;height:24px;border-radius:999px;background:${on ? (look.light ? "rgba(255,255,255,.38)" : `linear-gradient(135deg,${g[0]},${g[1]})`) : p.track}}
      .sw::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:${on ? "#fff" : p.knob};transform:translateX(${on ? 18 : 0}px);transition:transform .12s}
      .lk{position:absolute;top:18px;right:16px;opacity:.8;--mdc-icon-size:18px}
      .nm{font-size:${nsz}px;font-weight:600;line-height:1.2}
      .lb{font-size:12px;line-height:1.3;opacity:.85;color:${on ? "inherit" : p.muted}}
      .ago{font-size:11px;opacity:.65;margin-top:4px;color:${on ? "inherit" : p.muted}}
    </style>
    <div class="card" role="button" tabindex="0" aria-label="${esc(this.name(c.entity))}">
      <div class="ic" data-pop="${on ? 1 : 0}" data-popkey="ic"></div>
      ${showSwitch ? '<span class="sw" aria-hidden="true"></span>' : ""}
      ${c.locked ? '<ha-icon class="lk" icon="mdi:lock" aria-label="Locked"></ha-icon>' : ""}${broken ? '<ha-icon class="lk" icon="mdi:battery-alert-variant-outline" style="color:#FF9F6B;--mdc-icon-size:20px" aria-label="Not working"></ha-icon>' : ""}${bars}
      <div><div class="nm t">${esc(this.name(c.entity))}</div>
        ${c.show_state || broken || !s ? `<div class="lb t">${esc(broken ? c.problem : s ? this.stateText(s, on, un) + (c.locked && !un ? " · protected" : "") : "Device not found")}</div>` : ""}
        ${c.show_since && s && !UNAVAILABLE.includes(s.state) ? `<div class="ago t">${esc(since(s.last_changed))}</div>` : ""}</div>
    </div>`;
    this.icon(this.shadowRoot.querySelector(".ic"), c.icon, c.entity);
    const tap = (c.locked || broken) && ["toggle", "perform-action", "call-service"].includes((c.tap_action || {}).action) ? { action: "more-info" }
      : c.confirm && (c.tap_action || {}).action === "toggle" ? { ...c.tap_action, confirmation: { text: `Switch ${this.name(c.entity)} ${on ? "off" : "on"}? Everything on it will be affected.` } } : c.tap_action;
    this.press(this.shadowRoot.querySelector(".card"), () => this.run(tap, c.entity), () => this.run(c.hold_action, c.entity));
  }
}

// ------------------------------------------------------------------ Roost Chips
// Status chips in one centred row. Lights are grouped into one bulb with a count, doors into one door,
// air conditioners into one snowflake, people into one row of bubbles (colour = home, grey = away).
// Tap a group to see its list.
class RoostChips extends RoostBase {
  static get defaults() { return { entities: [], theme: "auto", align: "stretch", size: "medium", chip_shape: "pill", background: "solid" }; }

  validate(c) { if (!Array.isArray(c.entities) || !c.entities.length) throw new Error("Choose at least one device"); }

  watched() { return this.ids(); }

  ids() { return (this._config.entities || []).map((e) => (typeof e === "string" ? e : e.entity)).filter(Boolean); }

  static getConfigForm() {
    return {
      schema: [
        { name: "entities", required: true, selector: { entity: { multiple: true } } },
        { type: "grid", name: "", schema: [
          { name: "size", selector: { select: { mode: "dropdown", options: [{ value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }] } } },
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
      if (d === "light") { if (!Array.isArray(this.st(id)?.attributes.entity_id)) lights.push(id); } // light groups are not lights
      else if (d === "person" || d === "device_tracker") people.push(id);
      else if (d === "binary_sensor" && ["door", "window", "garage_door", "opening"].includes(this.st(id)?.attributes.device_class)) doors.push(id);
      else if (d === "climate") climates.push(id);
      else singles.push(id);
    }
    // one door or one AC stays a plain chip; two or more become one grouped chip
    const lone = (arr) => (arr.length === 1 ? (singles.push(arr[0]), []) : arr);
    return { lights, people, singles, doors: lone(doors), climates: lone(climates) };
  }

  chipFor(id) {
    const s = this.st(id);
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
    const lightsOn = lights.filter((id) => this.st(id)?.state === "on").length;
    const chips = [];
    singles.forEach((id) => {
      if (id.startsWith("media_player.") && OFF_STATES.concat(UNAVAILABLE).includes(this.st(id)?.state)) return; // a TV chip only while it is on
      chips.push({ key: id, ...this.chipFor(id), entity: id });
    });
    if (doors.length) {
      const open = doors.filter((id) => this.st(id)?.state === "on").length;
      chips.unshift({ key: "__doors", icon: open ? "mdi:door-open" : "mdi:door-closed", colour: open ? "#FF9F6B" : "#34D399", text: open ? String(open) : "", group: "doors", label: "Doors" });
    }
    if (lights.length) chips.push({ key: "__lights", icon: lightsOn ? "mdi:lightbulb-on" : "mdi:lightbulb-outline", colour: lightsOn ? "#F5B94A" : p.muted, text: lightsOn ? String(lightsOn) : "", group: "lights" });
    if (climates.length) {
      const on = climates.filter((id) => this.st(id) && !OFF_STATES.concat(UNAVAILABLE).includes(this.st(id).state)).length;
      chips.push({ key: "__climates", icon: "mdi:snowflake", colour: on ? "#38BDF8" : p.muted, text: on ? String(on) : "", group: "climates", label: "Air conditioners" });
    }
    if (people.length) chips.push({ key: "__people", people: true, group: "people" });
    const open = this._open;
    const initials = (id) => (this.st(id)?.attributes.friendly_name || id.split(".")[1]).split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const AVG = ["linear-gradient(135deg,#38BDF8,#6D4BFF)", "linear-gradient(135deg,#FF5577,#FF9F6B)", "linear-gradient(135deg,#10B981,#6EE7B7)", "linear-gradient(135deg,#F59E0B,#FDE68A)", "linear-gradient(135deg,#8B6CFF,#D6C4FF)"];
    const avatar = (id, i) => {
      const s = this.st(id), home = s?.state === "home", pic = s?.attributes.entity_picture;
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
      .list{margin:12px 0 16px;border-radius:20px;border:1px solid ${p.border};background:${p.panel};padding:6px 14px}
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
      : `<button class="chip ${open && open === ch.group ? "on" : ""}" data-pop="${esc(`${ch.text || ""}${ch.colour || ""}${ch.icon || ""}`)}" data-popkey="${esc(ch.key || ch.entity || ch.group || "")}" ${ch.group ? `data-g="${ch.group}"` : `data-e="${esc(ch.entity)}"`} aria-label="${esc(ch.entity ? this.name(ch.entity) : ch.label || "Lights")}">
          ${ch.icon ? `<ha-icon icon="${ch.icon}" style="color:${ch.colour}"></ha-icon>` : `<span class="ent" data-icon="${esc(ch.entity)}" style="color:${ch.colour};display:flex"></span>`}
          ${ch.text ? `<span class="${ch.word ? "word" : "cnt"}"${ch.word ? "" : ` style="color:${ch.colour}"`}>${esc(ch.text)}</span>` : ""}</button>`).join("")}</div>
    ${list.length ? `<div class="list">${list.map((id) => {
      const s = this.st(id), isOn = s?.state === "on" || s?.state === "home";
      return `<div class="it" ${open === "climates" || open === "doors" ? `data-m="${esc(id)}" style="cursor:pointer"` : ""}><span class="n t">${esc(s?.attributes.friendly_name || id)}<br><span class="s">${esc(stateWord(id, s))}</span></span>
        ${open === "lights" ? `<button class="tog ${isOn ? "on" : ""}" data-t="${esc(id)}" aria-label="Switch ${esc(s?.attributes.friendly_name || id)}"></button>` : ""}</div>`;
    }).join("")}</div>` : ""}`;
    this.shadowRoot.querySelectorAll("[data-icon]").forEach((el) => this.icon(el, null, el.dataset.icon));
    this.shadowRoot.querySelectorAll(".chip").forEach((el) => this.press(el,
      () => { if (el.dataset.g) { this._open = this._open === el.dataset.g ? null : el.dataset.g; this.vibrate(); this.render(); } else this.moreInfo(el.dataset.e); },
      () => this.moreInfo(el.dataset.e)));
    this.shadowRoot.querySelectorAll("[data-m]").forEach((el) => el.addEventListener("click", () => this.moreInfo(el.dataset.m)));
    this.shadowRoot.querySelectorAll("[data-t]").forEach((el) => el.addEventListener("click", () => { this.vibrate(); this.call("light", "toggle", { entity_id: el.dataset.t }); }));
  }

  getCardSize() { return this._open ? 4 : 1; }
}

// ------------------------------------------------------------------ Roost Thermostat
class RoostThermostat extends RoostBase {
  static get defaults() {
    return { color: "blue", show_power: true, show_plus_minus: true, modes: ["cool", "dry", "fan_only", "heat_cool", "auto"], max_width: 260, theme: "auto", radius: 24 };
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
        { type: "expandable", name: "", title: "Colour and size", icon: "mdi:palette", schema: [
          ...colourFields("color", "Dial colour"),
          { name: "max_width", selector: { number: { min: 160, max: 360, step: 10, mode: "slider", unit_of_measurement: "px" } } },
          { name: "radius", selector: { number: { min: 0, max: 40, step: 2, mode: "slider", unit_of_measurement: "px" } } },
          { name: "plain", label: "No box around it (inside a Roost Panel)", selector: { boolean: {} } },
          THEME_FIELD,
        ] },
        { type: "expandable", name: "", title: "Buttons", icon: "mdi:gesture-tap-button", schema: [
          { name: "show_power", selector: { boolean: {} } },
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
    const c = this._config, p = this.p, g = this.colour();
    const { s, a, un, on, mn, mx, set, modes } = this.info;
    const shown = this._value ?? set ?? 24;
    const f = Math.max(0, Math.min(1, (shown - mn) / (mx - mn)));
    const R = 96, C = 2 * Math.PI * R, L = C * 0.75, th = ((135 + 270 * f) * Math.PI) / 180;
    let ticks = "";
    for (let i = 0; i < 45; i++) {
      const q = i / 44, gg = ((135 + 270 * q) * Math.PI) / 180;
      ticks += `<line class="tk" x1="${(125 + 114 * Math.cos(gg)).toFixed(1)}" y1="${(125 + 114 * Math.sin(gg)).toFixed(1)}" x2="${(125 + 122 * Math.cos(gg)).toFixed(1)}" y2="${(125 + 122 * Math.sin(gg)).toFixed(1)}" stroke="${q <= f + 0.001 ? (on ? (q < 0.5 ? g[0] : g[1]) : p.tick) : p.track}" stroke-width="2" stroke-linecap="round"/>`;
    }
    const rs = c.sensor ? this.st(c.sensor) : null;
    const roomV = rs && !isNaN(parseFloat(rs.state)) ? parseFloat(rs.state) : a.current_temperature;
    const room = roomV != null && !isNaN(roomV) ? Number(roomV).toFixed(1) : null; // never show "—"
    const noTemp = !un && set == null;
    const modeName = { cool: "Cool", heat: "Heat", dry: "Dry", fan_only: "Fan", heat_cool: "Auto", auto: "Auto" };
    const status = un ? "Offline" : on ? `${modeName[s.state] || s.state} · running` : "Off";
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${c.plain ? `padding:0;background:none;border:0;color:${p.text}` : `border-radius:${c.radius}px;padding:18px;background:${p.panel};border:1px solid ${p.border};color:${p.text}`}}
      .hd{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
      .hd .n{font-size:15px;font-weight:600}
      .pill{font-size:12px;font-weight:600;padding:6px 12px;border-radius:999px;background:${on ? `${g[0]}33` : p.inset};color:${on ? g[1] : p.muted}}
      svg{width:100%;max-width:${c.max_width}px;display:block;margin:4px auto;touch-action:none;user-select:none;-webkit-user-select:none;cursor:${noTemp || un ? "default" : "pointer"}}
      svg.on{animation:roost-arc 3s ease-in-out infinite}
      .ctl{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px;margin-top:6px}
      @container (max-width: 260px){:host .ctl{gap:8px}}
      .rb{width:min(52px,24cqw);height:min(52px,24cqw);border-radius:50%;border:0;background:${p.inset};color:${p.text};display:flex;align-items:center;justify-content:center;cursor:pointer}
      .rb.pw{width:min(64px,30cqw);height:min(64px,30cqw);background:${on ? `linear-gradient(135deg,${g[0]},${g[1]})` : p.inset};color:${on ? "#fff" : p.text};box-shadow:${on ? `0 12px 28px -10px ${g[2]}` : "none"}}
      .rb:active{transform:scale(.94)}
      .mi{justify-self:end}.pl{justify-self:start}
      .modes{display:grid;grid-template-columns:repeat(${Math.max(1, modes.length)},minmax(0,1fr));gap:8px;margin-top:14px}
      @container (max-width: 300px){:host .modes{grid-template-columns:repeat(2,minmax(0,1fr))}}
      .md{min-height:42px;border-radius:14px;border:0;background:${p.inset};color:${p.text};font:inherit;font-size:13px;font-weight:600;cursor:pointer;padding:6px 4px}
      .md.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]}}
    </style>
    <div class="card">
      <div class="hd"><span class="n t">${esc(this.name(c.entity))}</span><span class="pill">${esc(status)}</span></div>
      <svg viewBox="0 0 250 250" class="${on ? "on" : ""}">
        <defs><linearGradient id="gon" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${g[0]}"/><stop offset="1" stop-color="${g[1]}"/></linearGradient>
        <linearGradient id="goff" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${p.offArc[0]}"/><stop offset="1" stop-color="${p.offArc[1]}"/></linearGradient></defs>
        ${ticks}
        <circle cx="125" cy="125" r="${R}" fill="none" stroke="${p.track}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${L.toFixed(1)} ${C.toFixed(1)}" transform="rotate(135 125 125)"/>
        <circle id="arc" cx="125" cy="125" r="${R}" fill="none" stroke="url(#${on ? "gon" : "goff"})" stroke-width="16" stroke-linecap="round" stroke-dasharray="${(L * f).toFixed(1)} ${C.toFixed(1)}" transform="rotate(135 125 125)"/>
        ${noTemp ? "" : `<circle id="knob" cx="${(125 + R * Math.cos(th)).toFixed(1)}" cy="${(125 + R * Math.sin(th)).toFixed(1)}" r="11" fill="#fff" stroke="rgba(255,255,255,.25)" stroke-width="6"/>`}
        <circle cx="125" cy="125" r="70" fill="${p.dial}"/>
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
    const { mn, mx, on } = this.info, g = this.colour(), p = this.p, root = this.shadowRoot;
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
    root.querySelector(".pw")?.addEventListener("click", () => { this.vibrate(); this.call("climate", this.info.on ? "turn_off" : "turn_on", { entity_id: c.entity }); });
    root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => { this.vibrate(); this.call("climate", "set_hvac_mode", { entity_id: c.entity, hvac_mode: b.dataset.m }); }));
    this.press(root.querySelector(".hd"), () => this.moreInfo(c.entity), () => this.moreInfo(c.entity));
  }

  set hass(hass) {
    this._hass = hass;
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

  watched() { return [this._config.weather, this._config.sun, ...(this._config.upcoming || []).map((u) => u.entity), ...(this._config.info || []).map((u) => u.entity)].filter(Boolean); }

  extraSignature() { return Math.floor(Date.now() / 30000); }

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
      const s = this.st(u.entity);
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
    const sun = this.st(c.sun);
    const day = sun ? sun.state === "above_horizon" : hr >= 6 && hr < 18;
    const part = c.greeting ? c.greeting : hr < 5 ? "Good night" : hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
    const who = c.show_name ? c.title || (this._hass.user?.name || "").split(" ")[0] : "";
    const os = Math.max(20, Number(c.orb_size) || 56);
    const osz = os !== 56 ? os : day ? 56 : 52; // the moon is a little smaller, as on the original
    const info = (c.info || []).map((it) => {
      const st = this.st(it.entity);
      if (!st || UNAVAILABLE.includes(st.state)) return "";
      const v = isNaN(parseFloat(st.state)) ? st.state : `${Math.round(parseFloat(st.state) * 10) / 10}${st.attributes.unit_of_measurement || ""}`;
      return `<span class="inf t" data-e="${esc(it.entity)}">${it.icon ? `<ha-icon icon="${esc(it.icon)}"></ha-icon>` : ""}${it.name ? `${esc(it.name)} ` : ""}<b>${esc(v)}</b></span>`;
    }).join("");
    const w = this.st(c.weather);
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
      .inf{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;padding:4px 10px;border-radius:999px;background:rgba(10,8,40,.25);cursor:pointer}
      .inf ha-icon{--mdc-icon-size:15px}
      .top{font-size:13px;opacity:.85;${c.show_orb ? `padding:0 ${os + 12}px 0 ${c.align === "center" ? os + 12 : 0}px` : ""}}
      .hi{font-size:${Number(c.greeting_size) || 25}px;font-weight:700;letter-spacing:-.4px;line-height:1.15;padding:0 ${c.show_orb ? os + 12 : 0}px 0 ${c.show_orb && c.align === "center" ? os + 12 : 0}px;font-family:${FONT_NUM}}
      .wx{font-size:14px;line-height:1.5;opacity:.9;cursor:${w ? "pointer" : "default"}}
      .pill{display:flex;align-items:center;gap:10px;background:${c.pill_style === "none" ? "transparent" : c.pill_style === "light" ? "rgba(255,255,255,.22)" : "rgba(10,8,40,.3)"};${c.align === "center" ? "align-self:stretch;" : ""}border-radius:16px;padding:10px 12px;margin-top:6px;font-size:13px}
      .pill b.cd{font-size:14px;flex:none}
      @container (max-width: 260px){:host .pill{flex-wrap:wrap}:host .pill b.cd{flex-basis:100%;padding-left:22px}}
      .dot{position:relative;width:10px;height:10px;border-radius:50%;background:#E9E2FF;flex:none}
      .dot span{position:absolute;inset:0;border-radius:50%;background:#E9E2FF;animation:roost-ping 1.8s ease-out infinite}
    </style>
    <div class="card">${stars}${c.show_sheen ? '<span class="sheen"></span>' : ""}${c.show_orb ? '<span class="orb"></span>' : ""}
      <div class="body">
        ${top ? `<span class="top t">${esc(top)}</span>` : ""}
        ${c.show_greeting ? `<span class="hi t">${esc(part)}${who ? `, ${esc(who)}` : ""}</span>` : ""}
        ${c.show_weather && w && temp != null ? `<span class="wx t">${esc(Math.round(temp) + unit)}${cond ? ` · ${esc(cond)}` : ""}</span>` : ""}
        ${info ? `<div class="infos">${info}</div>` : ""}
        ${pill}
      </div></div>`;
    this.shadowRoot.querySelectorAll(".inf").forEach((el) => el.addEventListener("click", (e) => { e.stopPropagation(); this.moreInfo(el.dataset.e); }));
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
class RoostNav extends RoostBase {
  static get defaults() { return { items: [], layout: "auto", show_labels: true, fixed: true, color: "active", active_style: "filled", background: "glass", bar_height: 54, icon_size: 21, radius: 26, theme: "auto" }; }

  validate(c) { if (!Array.isArray(c.items) || !c.items.length) throw new Error("Add at least one button"); }

  watched() { return []; }

  extraSignature() { return `${location.pathname}${location.hash}|${window.innerWidth >= 768}|${this.editing()}`; }

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
  }

  disconnectedCallback() {
    window.removeEventListener("location-changed", this._onLoc);
    window.removeEventListener("hashchange", this._onLoc);
    window.removeEventListener("resize", this._onLoc);
  }

  static getConfigForm() {
    return {
      schema: [
        { name: "items", selector: { object: { multiple: true, label_field: "name", fields: {
          name: { label: "Name", selector: { text: {} } },
          icon: { label: "Icon", required: true, selector: { icon: {} } },
          path: { label: "Opens (for example /dashboard-home/0 or #rooms)", required: true, selector: { text: {} } },
          match: { label: "Also lights up on these pages", selector: { select: { multiple: true, custom_value: true, options: [] } } },
          users: { label: "Only for these people (empty = everyone)", selector: { entity: { multiple: true, domain: "person" } } },
        } } } },
        { type: "grid", name: "", schema: [
          { name: "layout", selector: { select: { mode: "dropdown", options: [{ value: "auto", label: "Bar on phones, rail on tablets" }, { value: "bar", label: "Always a bottom bar" }, { value: "rail", label: "Always a side rail" }] } } },
          { name: "show_labels", selector: { boolean: {} } },
        ] },
        { name: "fixed", label: "Pinned to the edge of the screen", selector: { boolean: {} } },
        { type: "expandable", name: "", title: "Look", icon: "mdi:palette", schema: [
          ...colourFields("color", "Colour of the chosen button"),
          { name: "active_style", selector: pick([["filled", "Filled square with glow"], ["soft", "Soft tinted square"], ["pill", "Filled pill"], ["line", "Line under it"], ["dot", "Dot under it"], ["icon", "Coloured icon only"]]) },
          { type: "grid", name: "", schema: [
            { name: "background", selector: pick([["glass", "See-through glass"], ["solid", "Solid"], ["none", "None"]]) },
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

  disconnectedCallback() { if (this._lifted) { this._lifted = false; RoostNav.lifts = Math.max(0, (RoostNav.lifts || 1) - 1); setTimeout(() => { if (!RoostNav.lifts) this.liftToasts(false); }, 400); } }

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
    const pos = fixed ? (rail ? "position:fixed;left:16px;top:50%;transform:translateY(-50%);z-index:4" : "position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:4") : "";
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      :host{${fixed ? (rail ? "height:0;" : "height:calc(76px + env(safe-area-inset-bottom));") : ""}display:block}
      .edit{font-size:12px;color:${p.muted};text-align:center;margin:0 0 6px}
      nav{${pos};display:${rail ? "flex" : "grid"};${rail ? "flex-direction:column" : `grid-template-columns:repeat(${shown.length},minmax(0,1fr))`};gap:${rail ? 12 : 7}px;padding:${rail ? "14px 10px" : "8px"};border-radius:${Number(c.radius) + (rail ? 2 : 0)}px;
        ${c.background === "none" ? "background:transparent;border:0;" : c.background === "solid" ? `background:${this.dark ? "#141831" : "#FFFFFF"};border:1px solid ${p.border};box-shadow:0 18px 40px -16px rgba(0,0,0,.5);`
    : `background:linear-gradient(180deg, ${g[0]}24, transparent 70%), ${p.panel};border:1px solid ${g[1]}47;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 18px 40px -12px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.04) inset;`}
        ${rail ? "width:max-content" : `width:${fixed ? "calc(100% - 24px)" : "100%"};max-width:536px`};${fixed ? "" : "margin:0 auto"}}
      a{position:relative;min-width:${rail ? 56 : 0}px;min-height:${Number(c.bar_height) || 54}px;border-radius:${c.active_style === "pill" ? 999 : Math.max(8, Number(c.radius) - 8)}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
        color:${p.muted};text-decoration:none;font-size:clamp(8.5px, 2.7vw, 10.5px);font-weight:600;-webkit-tap-highlight-color:transparent;padding:4px 6px;transition:background .12s}
      ${{
    filled: `a.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};box-shadow:0 10px 24px -8px color-mix(in srgb, ${g[0]} 95%, transparent), inset 0 1px 0 rgba(255,255,255,.35)}`,
    pill: `a.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};box-shadow:0 10px 22px -8px ${g[2]}}`,
    soft: `a.on{background:${g[0]}2E;color:${g[this.dark ? 1 : 0]}}`,
    line: `a.on{color:${g[this.dark ? 1 : 0]}}a.on::after{content:"";position:absolute;bottom:3px;left:30%;right:30%;height:3px;border-radius:3px;background:linear-gradient(90deg,${g[0]},${g[1]})}`,
    dot: `a.on{color:${g[this.dark ? 1 : 0]}}a.on::after{content:"";position:absolute;bottom:3px;left:50%;width:6px;height:6px;margin-left:-3px;border-radius:50%;background:${g[1]};box-shadow:0 0 8px ${g[2]}}`,
    icon: `a.on{color:${g[this.dark ? 1 : 0]}}a.on ha-icon{filter:drop-shadow(0 0 6px ${g[2]})}`,
  }[c.active_style] || ""}
      a:active{transform:scale(.94)}
      a ha-icon{--mdc-icon-size:${Number(c.icon_size) || 22}px}
      a{min-width:0}
      @container (max-width: ${shown.length * 64}px){:host a span{display:none}:host a{padding:4px 2px}:host nav{padding:5px;gap:2px}}
      @media (max-width: 360px){nav{gap:2px;padding:6px}a{padding:4px 2px}}
    </style>
    ${editing && c.fixed ? '<div class="edit t">Bottom bar · shown here while editing, pinned to the bottom of the screen when you are done</div>' : ""}<nav aria-label="Navigation">${shown.map(({ it, i }) => `<a href="${esc(it.path)}" data-i="${i}" class="${this.active(it.path, it) ? "on" : ""}" aria-label="${esc(it.name || it.path)}">
      <ha-icon icon="${esc(it.icon || "mdi:circle")}"></ha-icon>${c.show_labels && it.name ? `<span class="t">${esc(it.name)}</span>` : ""}</a>`).join("")}</nav>`;
    this.shadowRoot.querySelectorAll("a").forEach((a) => a.addEventListener("click", (ev) => {
      const it = c.items[+a.dataset.i];
      ev.preventDefault();
      this.vibrate();
      if (it.path.startsWith("#")) location.hash = it.path;
      else { history.pushState(null, "", it.path); this.fire("location-changed", { replace: false }); }
      this._sig = null; this.hass = this._hass;
    }));
  }

  getCardSize() { return this._config?.fixed && !this.editing() ? 0 : 1; }
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
      .row{display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:${c.radius}px;background:${p.panel};border:1px solid ${p.border};color:${p.text};cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .12s;opacity:${un ? 0.55 : 1}}
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
  static get defaults() {
    return { rooms: [], columns: 2, gap: 8, color: "active", show_names: "active", active_style: "filled", background: "solid",
      pill_shape: "pill", pill_height: 40, pill_icon_size: 20, pill_align: "spread", show_count: false,
      tile_size: "large", tile_fill: "gradient", tile_glow: "soft", tile_radius: 22, auto_colors: true,
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
    (this._cards || []).flat().forEach((el) => { el.hass = hass; });
    const counts = this._config?.show_count ? this._config.rooms.map((r) => this.onCount(r)).join(",") : "";
    const sig = `${this.dark ? 1 : 0}|${this._active}|${counts}`;
    if (sig === this._sig) return;
    this._sig = sig;
    this.render();
  }

  static getConfigForm() {
    return {
      schema: [
        { name: "rooms", selector: { object: { multiple: true, label_field: "name", fields: {
          name: { label: "Room name", required: true, selector: { text: {} } },
          icon: { label: "Icon", selector: { icon: {} } },
          color: { label: "Colour of this room's button (empty = the card's colour)", selector: { select: { mode: "dropdown", options: COLOR_OPTIONS.filter((o) => o.value !== "custom") } } },
          entities: { label: "Devices in this room (each becomes a tile)", selector: { entity: { multiple: true } } },
          cards: { label: "Extra cards (advanced, YAML list)", selector: { object: {} } },
        } } } },
        { type: "expandable", name: "", title: "Room buttons", icon: "mdi:gesture-tap-button", schema: [
          { name: "show_names", label: "Room names on the buttons", selector: pick([["active", "Only on the chosen room"], ["all", "On every room"], ["none", "Icons only"]]) },
          ...colourFields("color", "Colour of the chosen room"),
          { type: "grid", name: "", schema: [
            { name: "active_style", label: "How the chosen room looks", selector: pick([["filled", "Filled with glow"], ["soft", "Soft tint"], ["line", "Line under it"]]) },
            { name: "background", label: "Bar background", selector: pick([["solid", "Solid"], ["glass", "See-through glass"], ["none", "None"]]) },
          ] },
          { type: "grid", name: "", schema: [
            { name: "pill_shape", label: "Button shape", selector: pick([["pill", "Pill"], ["rounded", "Rounded square"], ["square", "Square"]]) },
            { name: "pill_align", label: "Line up", selector: pick([["spread", "Spread across"], ["start", "Left"], ["center", "Centre"]]) },
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
    const lights = Object.keys(hass.states).filter((id) => id.startsWith("light.")).slice(0, 4);
    return { rooms: [{ name: "Living", icon: "mdi:sofa", entities: lights.slice(0, 2) }, { name: "Bedroom", icon: "mdi:bed", entities: lights.slice(2, 4) }] };
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
    const make = (cfg) => {
      let el;
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
    this._cfgs = this._config.rooms.map((room) => [...(room.entities || []).map((id) => this.tileFor(id)), ...(Array.isArray(room.cards) ? room.cards : [])]);
    this._cards = this._cfgs.map((list) => list.map(make));
    this._built = true;
    this._sig = null;
    this.render();
  }

  go(i) {
    const n = this._config.rooms.length;
    this._active = (i + n) % n;
    if (this._config.remember) { try { localStorage.setItem(this.memKey(), this._config.rooms[this._active].name); } catch (e) { /* private mode */ } }
    this.vibrate();
    this._sig = null;
    this.hass = this._hass || {};
  }

  render() {
    if (!this._config) return;
    if (!this._built) { if (!this._building) { this._building = true; this.build().finally(() => { this._building = false; }); } return; }
    const c = this._config, p = this.p;
    const showName = (i) => c.show_names === "all" || (c.show_names === "active" && i === this._active);
    const room = c.rooms[this._active] || {};
    const g = room.color && room.color !== "custom" ? (room.color === "active" ? ACTIVE : COLORS[room.color] || this.colour()) : this.colour();
    const ph = Math.max(28, Number(c.pill_height) || 40);
    const rad = c.pill_shape === "square" ? 10 : c.pill_shape === "rounded" ? Math.round(ph * 0.34) : 999;
    const counts = c.show_count ? c.rooms.map((r) => this.onCount(r)) : [];
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .bar{border-radius:${c.pill_shape === "pill" ? 999 : rad + 4}px;border:1px solid ${c.background === "none" ? "transparent" : p.border};background:${c.background === "none" ? "transparent" : c.background === "glass" ? `color-mix(in srgb, ${p.panel} 60%, transparent);backdrop-filter:blur(14px)` : p.panel};padding:4px;margin-bottom:16px}
      .pills{display:flex;gap:2px;justify-content:${c.pill_align === "start" ? "flex-start" : c.pill_align === "center" ? "center" : "space-between"};overflow-x:auto;scrollbar-width:none}
      .pills::-webkit-scrollbar{display:none}
      .pill{position:relative;flex:0 0 auto;min-height:${ph}px;min-width:${ph + 8}px;border-radius:${rad}px;border:0;background:transparent;color:${p.muted};
        display:flex;align-items:center;justify-content:center;gap:6px;padding:0 17px;font:inherit;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;-webkit-tap-highlight-color:transparent}
      ${c.active_style === "soft" ? `.pill.on{background:${g[0]}2E;color:${g[this.dark ? 1 : 0]}}`
    : c.active_style === "line" ? `.pill.on{color:${g[this.dark ? 1 : 0]}}.pill.on::after{content:"";position:absolute;bottom:4px;left:28%;right:28%;height:3px;border-radius:3px;background:linear-gradient(90deg,${g[0]},${g[1]})}`
      : `.pill.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};box-shadow:0 8px 20px -8px color-mix(in srgb, ${g[0]} 90%, transparent)}`}
      .pill:active{transform:scale(.95)}
      .pill ha-icon{--mdc-icon-size:${Number(c.pill_icon_size) || 20}px}
      .cnt{position:absolute;top:3px;right:4px;min-width:16px;height:16px;padding:0 4px;border-radius:999px;background:#FCD34D;color:#2A1800;font-size:10px;font-weight:700;line-height:16px;text-align:center}
      .room{display:grid;grid-template-columns:repeat(${Math.max(1, c.columns)},minmax(0,1fr));gap:${Number(c.gap) || 8}px;touch-action:pan-y}
      @container (max-width: 300px){:host .room{grid-template-columns:minmax(0,1fr)}}
      .room[hidden]{display:none}
      .room > *{min-width:0}
      .room > .wide{grid-column:1/-1}
      .empty{grid-column:1/-1;padding:22px;border-radius:20px;border:1px dashed ${p.border};color:${p.muted};text-align:center;font-size:14px;line-height:1.4}
    </style>
    <div class="bar"><div class="pills" role="tablist">${c.rooms.map((r, i) => `<button class="pill ${i === this._active ? "on" : ""}" role="tab" aria-selected="${i === this._active}" data-i="${i}" aria-label="${esc(r.name)}">
      ${r.icon ? `<ha-icon icon="${esc(r.icon)}"></ha-icon>` : ""}${showName(i) || !r.icon ? `<span>${esc(r.name)}</span>` : ""}${counts[i] ? `<span class="cnt">${counts[i]}</span>` : ""}</button>`).join("")}</div></div>
    ${c.rooms.map((r, i) => `<div class="room" data-room="${i}" ${i === this._active ? "" : "hidden"}>${(this._cards[i] || []).length ? "" : '<div class="empty t">No devices in this room yet. Edit the card and pick some under “Devices in this room”.</div>'}</div>`).join("")}`;
    this.shadowRoot.querySelectorAll(".room").forEach((box) => {
      const i = +box.dataset.room;
      (this._cards[i] || []).forEach((el, k) => {
        const cfg = this._cfgs[i][k] || {};
        const wrap = document.createElement("div");
        if (cfg.wide || cfg.grid_options?.columns === "full" || cfg.grid_options?.columns === 12) wrap.className = "wide";
        wrap.appendChild(el);
        box.appendChild(wrap);
      });
      if (c.swipe) {
        let x0 = null, y0 = 0;
        box.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
        box.addEventListener("touchend", (e) => {
          if (x0 == null) return;
          const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
          x0 = null;
          if (Math.abs(dx) > 60 && Math.abs(dy) < 40) this.go(this._active + (dx < 0 ? 1 : -1));
        }, { passive: true });
      }
    });
    this.shadowRoot.querySelectorAll(".pill").forEach((b) => b.addEventListener("click", () => this.go(+b.dataset.i)));
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
    return { color: "coral", style: "pair", height: 150, radius: 18, show_sky: true, show_header: true, show_buttons: true, show_percent: true,
      travel_time: 1.4, reverse: false, frame: true, background: "sky", image: "", image_night: "", weather: "", show_weather_text: true, tap_action: { action: "toggle" }, hold_action: { action: "more-info" }, theme: "auto" };
  }

  validate(c) { if (!c.entity) throw new Error("Choose a curtain or blind (cover)"); }

  watched() { return [this._config.entity, this._config.sun || "sun.sun", this._config.weather].filter(Boolean); }

  static getConfigForm() {
    return {
      schema: [
        { name: "entity", required: true, selector: { entity: { domain: "cover" } } },
        { type: "expandable", name: "", title: "Behind the window", icon: "mdi:window-open-variant", schema: [
          { name: "background", label: "What you see when it is open", selector: pick([["sky", "Sky that follows the sun"], ["weather", "Live weather, animated"], ["picture", "My own picture"], ["none", "Nothing (plain)"]]) },
          { name: "weather", label: "Weather (for live weather)", selector: { entity: { domain: "weather" } } },
          { name: "show_weather_text", label: "Show the temperature in the window", selector: { boolean: {} } },
          { name: "image", label: "Picture (for example /local/view.jpg or a web address)", selector: { text: {} } },
          { name: "image_night", label: "Night picture (optional)", selector: { text: {} } },
        ] },
        { name: "name", selector: { text: {} } },
        { type: "expandable", name: "", title: "Look", icon: "mdi:palette", schema: [
          ...colourFields("color", "Fabric colour"),
          { name: "style", label: "Kind", selector: pick([["pair", "Two curtains that meet in the middle"], ["left", "One curtain, opens to the left"], ["right", "One curtain, opens to the right"], ["blind", "Roller blind (up and down)"]]) },
          { type: "grid", name: "", schema: [{ name: "height", label: "Window height", selector: slider(90, 280, 10) }, { name: "radius", selector: slider(0, 32, 2) }] },
          { type: "grid", name: "", schema: [{ name: "travel_time", label: "Slide time", selector: slider(0.4, 4, 0.2, "s") }, { name: "frame", label: "Card background", selector: { boolean: {} } }] },
          THEME_FIELD,
        ] },
        { type: "expandable", name: "", title: "What it shows", icon: "mdi:eye-outline", schema: [
          { type: "grid", name: "", schema: [{ name: "show_header", label: "Name and state above", selector: { boolean: {} } }, { name: "show_buttons", label: "Open, Stop and Close buttons", selector: { boolean: {} } }] },
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

  build() {
    const c = this._config, p = this.p, g = this.colour();
    const frame = this.dark ? "#1C2142" : "#DDE1F0", rod = this.dark ? "#3A3F70" : "#C3C9E6";
    const a = `color-mix(in srgb, ${g[1]} 55%, ${g[0]})`, b = `color-mix(in srgb, ${g[0]} 80%, ${g[1]})`;
    const blind = c.style === "blind";
    const fabric = (dir) => `repeating-linear-gradient(${blind ? 180 : 90}deg,${dir ? a : b} 0 9px,${dir ? b : a} 9px 18px)`;
    let stars = "";
    [[18, 22, 2], [62, 30, 3], [42, 58, 2], [30, 40, 2], [78, 62, 2], [8, 70, 2]].forEach((q, i) => {
      stars += `<span class="star" style="left:${q[0]}%;top:${q[1]}%;width:${q[2]}px;height:${q[2]}px;animation-duration:${3 + i * 0.5}s;animation-delay:${i * 0.4}s"></span>`;
    });
    const panels = c.style === "pair" ? '<span class="cl"></span><span class="cr"></span>' : c.style === "right" ? '<span class="cr"></span>' : blind ? '<span class="bl"></span>' : '<span class="cl"></span>';
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
      .temp{position:absolute;left:calc(${c.style === "pair" || c.style === "left" ? 12 : 0}% + 8px);bottom:10px;padding:3px 9px;border-radius:999px;background:rgba(10,8,40,.35);color:#fff;font-size:12px;font-weight:600}
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
      .bl{left:0;right:0;background:${fabric(1)};box-shadow:0 6px 18px rgba(0,0,0,.3)}
      .win.moving .cl,.win.moving .cr{animation:roost-ripple .9s linear infinite,roost-sway 1.2s ease-in-out infinite}
      .win.moving .bl{animation:roost-ripple-v .9s linear infinite}
      .note{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);z-index:3;display:none;align-items:center;gap:6px;padding:5px 12px;border-radius:999px;
        background:rgba(10,8,40,.55);color:#fff;font-size:12px;font-weight:600;white-space:nowrap}
      .win.moving .note{display:flex}
      .note ha-icon{--mdc-icon-size:16px;animation:roost-breathe 1s ease-in-out infinite}
      .btns{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}
      .btn{min-height:44px;border-radius:14px;border:1px solid ${p.border};background:${p.panel};color:${p.text};font:inherit;font-size:14px;font-weight:600;cursor:pointer;
        display:flex;align-items:center;justify-content:center;gap:6px;-webkit-tap-highlight-color:transparent;transition:transform .12s}
      .btn:active{transform:scale(.96)}
      .btn.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};border-color:transparent;box-shadow:0 10px 22px -10px ${g[2]}}
      .btn ha-icon{--mdc-icon-size:18px}
    </style>
    <div class="card">${c.show_header ? '<div class="head"><span class="nm t"></span><span class="stt t"></span></div>' : ""}
    <div class="win" role="button" tabindex="0">
      ${c.background === "picture" ? '<div class="pic"></div>' : c.background === "none" || c.show_sky === false ? "" : `<div class="sky"></div>${stars}${c.background === "weather" ? '<div class="wx"></div>' : ""}<span class="orb"></span>${c.background === "weather" && c.show_weather_text ? '<span class="temp t"></span>' : ""}`}${c.style === "pair" ? '<span class="mull"></span>' : ""}
      <span class="rod"></span>${panels}
      <span class="note"><ha-icon></ha-icon><span class="nt"></span></span>
    </div>
    ${c.show_buttons ? `<div class="btns">
      <button class="btn" data-a="open"><ha-icon icon="${blind ? "mdi:arrow-up" : "mdi:arrow-expand-horizontal"}"></ha-icon>Open</button>
      <button class="btn" data-a="stop"><ha-icon icon="mdi:stop"></ha-icon>Stop</button>
      <button class="btn" data-a="close"><ha-icon icon="${blind ? "mdi:arrow-down" : "mdi:arrow-collapse-horizontal"}"></ha-icon>Close</button></div>` : ""}</div>`;
    this._shown = null;
    const win = this.shadowRoot.querySelector(".win");
    this.press(win, () => this.run(c.tap_action, c.entity), () => this.run(c.hold_action, c.entity));
    this.shadowRoot.querySelectorAll(".btn").forEach((el) => el.addEventListener("click", () => {
      this.vibrate();
      const a = el.dataset.a;
      if (a === "stop" && c.stop_action && c.stop_action.action && c.stop_action.action !== "none") { this.run(c.stop_action, c.entity); this.call("cover", "stop_cover", { entity_id: c.entity }); return; }
      this._moveUntil = Date.now() + c.travel_time * 1000 + 300;
      const cmd = c.reverse && a !== "stop" ? (a === "open" ? "close" : "open") : a;
      this.call("cover", `${cmd}_cover`, { entity_id: c.entity });
    }));
  }

  update() {
    const c = this._config, s = this.st(), root = this.shadowRoot;
    const pos = this.position(s);
    const day = (this.st(c.sun || "sun.sun") || {}).state !== "below_horizon";
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
    root.querySelectorAll(".btn").forEach((b) => b.classList.toggle("on", (b.dataset.a === "open" && v.state === "open") || (b.dataset.a === "close" && v.state === "closed")));
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
    const c = this._config, w = this.st(c.weather), cond = w ? w.state : "sunny";
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

const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };
const fmt = (v, dec) => (v == null ? "" : Number(v).toFixed(dec == null ? (Math.abs(v) >= 100 ? 0 : 1) : dec));
// as many decimals as the sensor itself gives (52 stays 52, 26.4 stays 26.4), at most two
// whole numbers for watts, lux and ppm (a "0.0 W" reading reads as "0 W"); otherwise as many decimals as the sensor gives, at most 2
const decOf = (state, unit) => (/^(W|Wh|lx|ppm|rpm|mA)$/.test(String(unit || "")) ? 0 : Math.min(2, (String(state).split(".")[1] || "").length));
// "26°" and "52%" sit next to the number; "1460 W" and "612 ppm" get a space
const unitGap = (u) => (!u ? "" : /^(°|°C|°F|%)$/.test(u) ? u : ` ${u}`);
const panelCss = (p, radius = 22) => `background:${p.panel};border:1px solid ${p.border};border-radius:${radius}px;color:${p.text}`;
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
    const sub = c.second ? this.st(c.second) : null, sv = sub ? num(sub.state) : null;
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
    if (c.only_on) ids = ids.filter((id) => this.st(id)?.state === "on");
    return ids;
  }

  name(id) {
    const e = (this._config.entities || []).find((x) => typeof x === "object" && x.entity === id);
    return e?.name || this.st(id)?.attributes.friendly_name || id;
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
      .row{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:${c.radius}px;background:${p.off};border:1px solid ${p.border};color:${p.text};cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .12s}
      .row:active{transform:scale(.98)}
      .ic{width:38px;height:38px;border-radius:12px;flex:none;display:flex;align-items:center;justify-content:center;background:${p.inset};color:${p.muted}}
      .row.on .ic{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};box-shadow:0 8px 18px -8px ${g[2]}}
      @container (max-width: 300px){:host .row{padding:10px 12px;gap:10px}:host .ic{display:none}}
      @container (max-width: 240px){:host .run{display:none}}
      .ic ha-icon{--mdc-icon-size:20px}
      .tx{flex:1;min-width:0}
      .n{font-size:14px;font-weight:600;line-height:1.25}
      .l{font-size:12px;color:${p.muted};margin-top:2px}
      .run{flex:none;width:34px;height:34px;border-radius:50%;border:1px solid ${p.border};background:${p.panel};color:${p.text};display:flex;align-items:center;justify-content:center;cursor:pointer}
      .run ha-icon{--mdc-icon-size:18px}
      .run.go ha-icon{animation:roost-pulse .8s ease-in-out 2}
      .empty{padding:18px;border-radius:${c.radius}px;border:1px dashed ${p.border};color:${p.muted};text-align:center;font-size:14px}
    </style>
    ${c.title ? `<div class="ttl t">${esc(c.title)}</div>` : ""}
    <div class="list">${ids.length ? ids.map((id) => {
      const s = this.st(id), on = s?.state === "on", un = !s || UNAVAILABLE.includes(s.state);
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
class RoostClock extends ticking(RoostBase, 15000) {
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

  // today's time for a sensor (a full date, or "18:05")
  when(id) {
    const s = this.st(id);
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
    const times = (c.times || []).map((t) => ({ ...t, at: this.when(t.entity) })).filter((t) => t.at);
    const mins = (d) => d.getHours() * 60 + d.getMinutes();
    let next = times.filter((t) => t.countdown !== false && mins(t.at) > mins(now)).sort((a, b) => mins(a.at) - mins(b.at))[0];
    let nextAt = next ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), next.at.getHours(), next.at.getMinutes()) : null;
    if (!next) {
      next = times.filter((t) => t.countdown !== false).sort((a, b) => mins(a.at) - mins(b.at))[0];
      if (next) { nextAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, next.at.getHours(), next.at.getMinutes()); }
    }
    const left = nextAt ? Math.max(0, Math.round((nextAt - now) / 60000)) : 0;
    const cd = nextAt ? `${Math.floor(left / 60) ? `${Math.floor(left / 60)}h ` : ""}${left % 60}m` : "";
    const fmtT = (d) => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: !c.hour24 });
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${c.frame ? panelCss(p, c.radius) : `color:${p.text}`};padding:${c.frame ? 20 : 0}px;display:flex;flex-direction:column;gap:14px}
      .top{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap}
      .clk{display:flex;align-items:baseline;gap:6px}
      .hm{font-size:clamp(30px,17cqw,56px);font-weight:700;letter-spacing:-1.5px;line-height:1}
      .ap{font-size:18px;font-weight:600;color:${p.muted}}
      .dt{font-size:14px;color:${p.muted};margin-top:6px}
      .nx{display:flex;flex-direction:column;align-items:flex-end;text-align:right}
      .nx .w{font-size:12px;color:${p.muted}}
      .nx .n{font-size:16px;font-weight:700}
      .nx .c{font-size:13px;font-weight:600;color:${g[1]}}
      .line{position:relative;height:52px;margin:0 8px}
      .bar{position:absolute;left:0;right:0;top:10px;height:4px;border-radius:4px;background:${p.track}}
      .fill{position:absolute;left:0;top:10px;height:4px;border-radius:4px;background:linear-gradient(90deg,${g[0]},${g[1]})}
      .dot{position:absolute;top:6px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:6px}
      .dot i{display:block;width:8px;height:8px;border-radius:50%;background:${this.dark ? "#0B0D17" : "#fff"};border:2px solid ${p.tick}}
      .dot.nx2 i{width:12px;height:12px;margin-top:-2px;border:0;background:${g[1]};box-shadow:0 0 10px ${g[1]}}
      .dot.nx2 i::after{content:"";position:absolute;left:50%;top:-1px;width:12px;height:12px;margin-left:-6px;border-radius:50%;background:${g[1]};animation:roost-ping 1.8s ease-out infinite}
      .dot span{font-size:10px;color:${p.muted}}
      .now{position:absolute;top:2px;width:2px;height:20px;border-radius:2px;background:${p.text};transform:translateX(-50%)}
    </style>
    <div class="card">
      <div class="top"><div><div class="clk"><span class="hm num">${esc(hm)}</span>${ap ? `<span class="ap">${esc(ap)}</span>` : ""}</div>${c.show_date ? `<div class="dt t">${esc(date)}</div>` : ""}</div>
        ${next ? `<div class="nx"><span class="w t">${esc(c.countdown_title)}</span><span class="n t">${esc(next.name)} · ${esc(fmtT(nextAt))}</span><span class="c">in ${esc(cd)}</span></div>` : ""}</div>
      ${c.show_timeline && times.length ? `<div class="line"><span class="bar"></span><span class="fill" style="width:${(mins(now) / 1440 * 100).toFixed(2)}%"></span>
        ${times.slice().sort((a, b) => mins(a.at) - mins(b.at)).map((t, k, arr) => { const close = k > 0 && (mins(t.at) - mins(arr[k - 1].at)) / 1440 < 0.07 && !(k > 1 && (mins(arr[k - 1].at) - mins(arr[k - 2].at)) / 1440 < 0.07); return `<span class="dot ${next && t.name === next.name ? "nx2" : ""}" style="left:${(mins(t.at) / 1440 * 100).toFixed(2)}%"><i></i><span${close ? ' style="margin-top:12px"' : ""}>${esc(t.short || t.name.slice(0, 2))}</span></span>`; }).join("")}
        <span class="now" style="left:${(mins(now) / 1440 * 100).toFixed(2)}%"></span></div>` : ""}
    </div>`;
  }
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
    const t = c.temperature ? num(this.st(c.temperature)?.state) : null, h = c.humidity ? num(this.st(c.humidity)?.state) : null;
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
      .t2{font-size:12.5px;color:${p.muted};margin-top:2px}
      .bd{display:inline-block;margin-left:8px;padding:2px 8px;border-radius:999px;font-size:11.5px;font-weight:600;vertical-align:middle;background:${g[0]}2E;color:${g[this.dark ? 1 : 0]}}
      .ln{flex:none;font-size:13px;font-weight:600;color:${g[this.dark ? 1 : 0]};background:none;border:0;cursor:pointer;padding:6px 4px;font-family:inherit;display:flex;align-items:center;gap:2px}
      .ln ha-icon{--mdc-icon-size:18px;color:inherit}
      .bk{flex:none;width:44px;height:44px;border-radius:15px;border:0;background:${p.inset};color:${p.text};display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .12s}
      .bk:active{transform:scale(.94)}
      .bk ha-icon{--mdc-icon-size:22px;color:inherit}
      .h.withback{gap:14px;padding-top:2px}
    </style>
    <div class="h${c.back ? " withback" : ""}">${c.back ? '<button class="bk" aria-label="Back"><ha-icon icon="mdi:chevron-left"></ha-icon></button>' : ""}${c.icon ? `<ha-icon icon="${esc(c.icon)}"></ha-icon>` : ""}
      <div class="tx"><div class="t1 t">${esc(c.title)}${c.badge ? `<span class="bd">${esc(c.badge)}</span>` : ""}</div>${c.subtitle || this.reading() ? `<div class="t2 t">${esc(c.subtitle || this.reading())}</div>` : ""}</div>
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
    const vs = this.st(c.volume_entity || c.entity) || s;
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
      .n{font-size:16px;font-weight:600;line-height:1.25}
      .l{font-size:12.5px;color:${p.muted};margin-top:2px;display:flex;align-items:center;gap:6px}
      .eq{display:inline-flex;gap:2px;align-items:flex-end;height:12px}
      .eq i{display:block;width:3px;height:12px;border-radius:2px;background:${g[1]};transform-origin:bottom;animation:roost-eq .9s ease-in-out infinite}
      .eq i:nth-child(2){animation-delay:.2s}.eq i:nth-child(3){animation-delay:.4s}
      .pw{width:44px;height:44px;border-radius:50%;flex:none;border:1px solid ${p.border};background:${on ? `linear-gradient(135deg,${g[0]},${g[1]})` : p.off};color:${on ? g[3] : p.text};cursor:pointer;display:flex;align-items:center;justify-content:center}
      .pw ha-icon{--mdc-icon-size:22px}
      .now{font-size:13px;line-height:1.35;color:${p.text};padding:10px 12px;border-radius:14px;background:${p.inset}}
      .row{display:flex;align-items:center;gap:8px}
      .b{width:42px;height:42px;border-radius:50%;flex:none;border:1px solid ${p.border};background:${p.off};color:${p.text};cursor:pointer;display:flex;align-items:center;justify-content:center;-webkit-tap-highlight-color:transparent;transition:transform .12s}
      .b:active{transform:scale(.9)}
      .b.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};border-color:transparent}
      .b ha-icon{--mdc-icon-size:20px}
      @container (max-width: 300px){:host .row{flex-wrap:wrap;justify-content:center;gap:8px}:host .vol{flex-basis:100%;order:-1}:host .b{width:36px;height:36px}:host .ctl{gap:8px}}
      .vol{flex:1;position:relative;height:42px;border-radius:999px;background:${p.inset};overflow:hidden;cursor:pointer;touch-action:none}
      .vol .f{position:absolute;left:0;top:0;bottom:0;border-radius:999px;background:linear-gradient(90deg,${g[0]},${g[1]});opacity:${muted ? 0.4 : 1}}
      .vol .v{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:${p.text};mix-blend-mode:${this.dark ? "normal" : "multiply"}}
      .ctl{display:flex;justify-content:center;gap:14px}
      .src{display:flex;flex-wrap:wrap;gap:6px}
      .src button{padding:7px 12px;border-radius:999px;border:1px solid ${p.border};background:${p.off};color:${p.text};font:inherit;font-size:12.5px;font-weight:600;cursor:pointer}
      .src button.on{background:${g[0]}2E;color:${g[this.dark ? 1 : 0]};border-color:transparent}
    </style>
    <div class="card">
      <div class="top"><span class="ic" data-more data-pop="${on ? 1 : 0}" data-popkey="ic">${art ? `<img src="${esc(art)}" alt="">` : `<ha-icon icon="${esc(c.icon || "mdi:television")}"></ha-icon>`}</span>
        <span class="tx"><div class="n t">${esc(this.name(c.entity))}</div><div class="l t">${playing ? '<span class="eq"><i></i><i></i><i></i></span>' : ""}${esc(line)}</div></span>
        <button class="pw" data-a="power" aria-label="Power"><ha-icon icon="mdi:power"></ha-icon></button></div>
      ${on && now ? `<div class="now t">${esc(now)}</div>` : ""}
      ${on && c.show_volume && vs ? `<div class="row"><button class="b" data-a="down" aria-label="Volume down"><ha-icon icon="mdi:volume-minus"></ha-icon></button>
        ${vol != null ? `<div class="vol" role="slider" aria-valuenow="${Math.round(vol * 100)}"><span class="f" data-bar="vol" style="width:${(vol * 100).toFixed(0)}%"></span><span class="v num" ${muted ? "" : 'data-tw="vol"'}>${muted ? "Muted" : `${Math.round(vol * 100)}%`}</span></div>` : '<span style="flex:1"></span>'}
        <button class="b ${muted ? "on" : ""}" data-a="mute" aria-label="Mute"><ha-icon icon="${muted ? "mdi:volume-off" : "mdi:volume-mute"}"></ha-icon></button>
        <button class="b" data-a="up" aria-label="Volume up"><ha-icon icon="mdi:volume-plus"></ha-icon></button></div>` : ""}
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
  static get defaults() { return { color: "active", min: 18, max: 36, warn: 32, style: "row", radius: 16, entities: [], tap_action: { action: "none" }, theme: "auto" }; }

  validate(c) { if (!c.name) throw new Error("Give the room a name"); }

  ids() { return (this._config.entities || []).map((e) => (typeof e === "string" ? e : e?.entity)).filter(Boolean); }

  watched() { const c = this._config; return [c.temperature, c.humidity, ...this.ids()].filter(Boolean); }

  // Every device with its state, in plain words, the way the original Rooms page says it.
  summaryAll() {
    const c = this._config, parts = [], doors = [];
    for (const e of c.entities || []) {
      const id = typeof e === "string" ? e : e?.entity; const s = this.st(id); if (!s) continue;
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
    const t = num(this.st(c.temperature)?.state), h = num(this.st(c.humidity)?.state);
    if (c.temperature && t != null && c.warn != null && t >= c.warn) parts.unshift("Too hot");
    if (!parts.length && h != null) parts.push(`${fmt(h, decOf(this.st(c.humidity).state))}% humidity`);
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
          ...colourFields("color", "Bar colour"),
          { type: "grid", name: "", schema: [{ name: "min", label: "Bar starts at (°)", selector: { number: { mode: "box" } } }, { name: "max", label: "Bar is full at (°)", selector: { number: { mode: "box" } } }] },
          { type: "grid", name: "", schema: [{ name: "warn", label: "Too hot from (°)", selector: { number: { mode: "box" } } }, { name: "radius", selector: slider(0, 32, 2) }] },
          { name: "plain", label: "No box around it (inside a Roost Panel)", selector: { boolean: {} } },
          THEME_FIELD,
        ] },
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) { return { name: "Living room", icon: "mdi:sofa", temperature: Object.keys(hass.states).find((id) => hass.states[id].attributes.device_class === "temperature") || "" }; }

  getGridOptions() { return this._config?.style === "tile" ? { columns: 6, rows: "auto", min_columns: 3 } : { columns: 12, rows: "auto", min_columns: 6 }; }

  summary() {
    const out = [], lights = [];
    for (const id of this.ids()) {
      const s = this.st(id); if (!s) continue;
      const d = id.split(".")[0], nm = s.attributes.friendly_name || id;
      if (UNAVAILABLE.includes(s.state)) { out.push(`${nm} offline`); continue; }
      if (d === "light" || (d === "switch" && /light|lamp/i.test(nm))) { if (s.state === "on") lights.push(nm); continue; }
      if (d === "climate") out.push(s.state === "off" ? "AC off" : `AC ${s.state.replace("_only", "").replace("heat_cool", "auto")}${s.attributes.temperature != null ? ` ${s.attributes.temperature}°` : ""}`);
      else if (d === "cover") out.push(`${/blind/i.test(nm) ? "Blind" : "Curtain"} ${s.state}`);
      else if (d === "media_player") { if (!["off", "standby"].includes(s.state)) out.push(`${/tv/i.test(nm) ? "TV" : nm} on`); }
      else if (d === "binary_sensor") { if (s.state === "on") out.push(`${nm} ${["door", "window", "opening"].includes(s.attributes.device_class) ? "open" : "on"}`); }
      else if (s.state === "on") out.push(`${nm} on`);
    }
    if (lights.length) out.unshift(`${lights.length} light${lights.length > 1 ? "s" : ""} on`);
    return out.join(" · ") || "All quiet";
  }

  // The big coloured room tile of the original Rooms page: icon, temperature in the corner, name, what is going on, and since when.
  renderTile(t, ts, hot, g) {
    const c = this._config, p = this.p;
    const look = fillLook(c.fill || "gradient", c.glow || "soft", g, p);
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .r{position:relative;min-height:${Number(c.height) || 170}px;height:100%;border-radius:${Number(c.radius) === 16 ? 22 : c.radius}px;padding:16px;display:flex;flex-direction:column;justify-content:space-between;gap:8px;overflow:hidden;
        background:${look.bg};color:${look.light ? look.fg : p.text};border:1px solid ${look.border};box-shadow:${look.shadow};cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .12s}
      .r:active{transform:scale(.96)}
      .ic{width:42px;height:42px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:${look.light ? "rgba(255,255,255,.24)" : `color-mix(in srgb, ${g[0]} 30%, transparent)`};color:${look.light ? "inherit" : g[this.dark ? 1 : 0]}}
      .ic ha-icon{--mdc-icon-size:22px}
      .tp{position:absolute;top:18px;right:16px;font-size:16px;font-weight:700;${hot ? "color:#fff;text-shadow:0 0 12px rgba(255,159,107,.9)" : ""}}
      .n{font-size:15px;font-weight:600;line-height:1.2;margin-top:8px}
      .l{font-size:12px;line-height:1.3;opacity:.85}
      .ago{font-size:11px;margin-top:4px;opacity:.65}
    </style>
    <div class="r" role="button" tabindex="0" aria-label="${esc(c.name)}">
      <span class="ic"><ha-icon icon="${esc(c.icon || "mdi:home-outline")}"></ha-icon></span>
      ${t != null ? `<span class="tp num" data-tw="t">${fmt(t, 1)}°</span>` : ""}
      <div><div class="n t">${esc(c.name)}</div><div class="l t">${esc(c.subtitle || (c.summary === "all" ? this.summaryAll() : this.summary()))}</div>
        ${ts && !UNAVAILABLE.includes(ts.state) ? `<div class="ago t">${esc(since(ts.last_changed))}</div>` : ""}</div>
    </div>`;
    this.press(this.shadowRoot.querySelector(".r"), () => {
      if ((c.tap_action || {}).action && c.tap_action.action !== "none") this.run(c.tap_action);
      else if (c.temperature) this.moreInfo(c.temperature);
    }, () => c.temperature && this.moreInfo(c.temperature));
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour();
    const ts = this.st(c.temperature), t = ts ? num(ts.state) : null, hs = this.st(c.humidity), h = hs ? num(hs.state) : null;
    const hot = t != null && c.warn != null && t >= c.warn;
    const f = t == null ? 0 : Math.max(0.06, Math.min(1, (t - c.min) / ((c.max - c.min) || 1)));
    const bar = hot ? "linear-gradient(90deg,#FF9F6B,#F43F6B)" : `linear-gradient(90deg,${g[0]},${g[1]})`;
    const card = c.style === "card";
    if (c.style === "tile") { this.renderTile(t, ts, hot, g); return; }
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .r{${c.plain ? "background:none;border:0;border-radius:0" : panelCss(p, c.radius)};padding:${c.plain ? "4px 0" : `${card ? 16 : 12}px ${card ? 16 : 14}px`};display:grid;grid-template-columns:${card ? "48px" : "14px"} minmax(0,1fr) minmax(0,max-content);column-gap:${card ? 14 : 10}px;row-gap:6px;align-items:center;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .12s}
      .r:active{transform:scale(.98)}
      .dot{grid-row:1/4;width:10px;height:10px;border-radius:50%;background:${hot ? "#FF9F6B" : t != null ? g[0] : p.knob};box-shadow:0 0 0 4px ${hot ? "rgba(255,159,107,.22)" : t != null ? `${g[0]}2E` : "transparent"};${hot ? "animation:roost-breathe 1.6s ease-in-out infinite" : ""}}
      .ic{grid-row:1/4;width:48px;height:48px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:${g[0]}24;color:${g[this.dark ? 1 : 0]}}
      .ic ha-icon{--mdc-icon-size:24px}
      .n{font-size:${card ? 16 : 14}px;font-weight:600;text-align:left}
      .tp{font-size:${card ? 16 : 14}px;font-weight:600;text-align:right;color:${hot ? "#FF9F6B" : p.text}}
      @container (max-width: 260px){:host .r{grid-template-columns:minmax(0,1fr)}:host .dot,:host .ic{display:none}:host .bar,:host .l,:host .n,:host .tp{grid-column:1/-1}:host .tp{text-align:left}}
      .bar{grid-column:2/4;height:4px;border-radius:999px;background:${p.track};overflow:hidden}
      .bar i{display:block;height:100%;border-radius:999px;background:${bar}}
      .l{grid-column:2/4;font-size:12px;color:${p.muted};line-height:1.35}
    </style>
    <div class="r" role="button" tabindex="0" aria-label="${esc(c.name)}">
      ${card ? `<span class="ic"><ha-icon icon="${esc(c.icon || "mdi:home-outline")}"></ha-icon></span>` : '<span class="dot"></span>'}
      <span class="n t">${esc(c.name)}</span><span class="tp num">${t != null ? `<span data-tw="t">${fmt(t, 1)}°</span>` : c.temperature ? "No reading" : ""}${h != null ? `<span style="color:${p.muted};font-weight:500"> · ${Math.round(h)}%</span>` : ""}</span>
      ${c.temperature ? `<span class="bar"><i data-bar="t" style="width:${(f * 100).toFixed(0)}%"></i></span>` : ""}
      <span class="l t">${esc(c.subtitle || (c.summary === "all" ? this.summaryAll() : this.summary()))}</span>
    </div>`;
    this.press(this.shadowRoot.querySelector(".r"), () => {
      if ((c.tap_action || {}).action && c.tap_action.action !== "none") this.run(c.tap_action);
      else if (c.temperature) this.moreInfo(c.temperature);
    }, () => c.temperature && this.moreInfo(c.temperature));
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
        { name: "style", selector: pick([["card", "Big shield with buttons"], ["pills", "A row of pills (Disarm, Arm home, Arm away)"]]) },
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

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, s = this.st();
    const [word, icon, g] = this.look(s?.state);
    const armed = s && s.state !== "disarmed" && !UNAVAILABLE.includes(s.state);
    const busy = ["arming", "pending", "triggered"].includes(s?.state);
    const needCode = !!s?.attributes.code_format && s?.attributes.code_arm_required !== false;
    const label = { arm_away: ["Away", "mdi:shield-lock"], arm_home: ["Home", "mdi:shield-home"], arm_night: ["Night", "mdi:shield-moon"], arm_vacation: ["Holiday", "mdi:shield-airplane"] };
    const doors = (c.doors || []).map((id) => this.st(id)).filter(Boolean);
    const open = doors.filter((d) => d.state === "on");
    if (c.style === "pills" && !this._pending) {
      const PILLS = [["disarm", "Disarm", "linear-gradient(135deg,#10B981,#34D399)", "disarmed"], ["arm_home", "Arm home", "linear-gradient(135deg,#2F6BFF,#38BDF8)", "armed_home"], ["arm_away", "Arm away", "linear-gradient(135deg,#F43F6B,#FF8F6B)", "armed_away"], ["arm_night", "Arm night", "linear-gradient(135deg,#6D4BFF,#B794FF)", "armed_night"]]
        .filter(([m]) => m === "disarm" || (c.modes || []).includes(m));
      this.shadowRoot.innerHTML = `<style>${this.baseCss()}
        .tt{font-size:17px;font-weight:700;letter-spacing:-.2px;padding:10px 6px 4px;color:${p.text}}
        .ps{display:grid;grid-template-columns:repeat(${PILLS.length},minmax(0,1fr));gap:8px;margin-top:8px}
        .pl{padding:10px 0;border-radius:14px;border:0;font:inherit;font-size:13px;font-weight:600;cursor:pointer;background:${p.inset};color:${p.text};-webkit-tap-highlight-color:transparent;transition:transform .12s}
        .pl:active{transform:scale(.96)}
      </style>${c.name !== "" ? `<div class="tt t">${esc(c.name || "Alarm")}</div>` : ""}<div class="ps">${PILLS.map(([m, w, bg, st]) => `<button class="pl" data-m="${m}" style="${s?.state === st ? `background:${bg};color:#fff` : ""}">${w}</button>`).join("")}</div>`;
    } else this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${panelCss(p, c.radius)};padding:18px;display:flex;flex-direction:column;gap:16px}
      .top{display:flex;align-items:center;gap:16px}
      .sh{position:relative;width:72px;height:72px;border-radius:24px;flex:none;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};box-shadow:0 14px 30px -12px ${g[2]}}
      .sh ha-icon{--mdc-icon-size:36px;${s?.state === "triggered" ? "animation:roost-wiggle .5s ease-in-out infinite" : busy ? "animation:roost-pulse 1.2s ease-in-out infinite" : ""}}
      .sh::after{content:"";position:absolute;inset:0;border-radius:inherit;border:2px solid ${g[1]};${armed ? "animation:roost-halo 2.4s ease-out infinite" : "display:none"}}
      @keyframes roost-halo{0%{transform:scale(1);opacity:.8}100%{transform:scale(1.3);opacity:0}}
      .n{font-size:13px;color:${p.muted}}
      .w{font-size:22px;font-weight:700;line-height:1.2}
      .d{font-size:12.5px;color:${open.length ? "#FF9F6B" : p.muted};margin-top:3px}
      .btns{display:grid;grid-template-columns:repeat(${Math.max(1, (c.modes || []).length + 1)},minmax(0,1fr));gap:8px}
      .top > span:last-child{min-width:0}
      @container (max-width: 320px){:host .top{flex-direction:column;align-items:flex-start;gap:10px}:host .btns{grid-template-columns:repeat(2,minmax(0,1fr))}:host .sh{width:56px;height:56px;border-radius:18px}}
      .b{min-height:64px;border-radius:16px;border:1px solid ${p.border};background:${p.off};color:${p.text};font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;
        display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:6px 4px;-webkit-tap-highlight-color:transparent;transition:transform .12s}
      .b:active{transform:scale(.95)}
      .b ha-icon{--mdc-icon-size:22px}
      .b.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};border-color:transparent;box-shadow:0 10px 22px -10px ${g[2]}}
      .pad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
      .pad button{height:48px;border-radius:14px;border:1px solid ${p.border};background:${p.off};color:${p.text};font:inherit;font-size:18px;font-weight:600;cursor:pointer}
      .code{text-align:center;font-size:22px;letter-spacing:8px;min-height:30px;color:${p.text}}
      .doors{display:flex;flex-wrap:wrap;gap:6px}
      .dr{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;font-size:12.5px;background:${p.inset};color:${p.text};cursor:pointer}
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
    const root = this.shadowRoot;
    root.querySelectorAll("[data-e]").forEach((el) => el.addEventListener("click", () => this.moreInfo(el.dataset.e)));
    root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => {
      const m = b.dataset.m;
      const text = m === "disarm" ? "Turn the alarm off?" : `Arm the alarm (${label[m]?.[0] || m})?${open.length ? ` ${open.length} door${open.length > 1 ? "s are" : " is"} open.` : ""}`;
      if (c.confirm && !window.confirm(text)) return;
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
      .n{font-size:16px;font-weight:600;line-height:1.25}
      .l{font-size:12.5px;color:${p.muted};margin-top:2px}
      .pc{font-size:28px;font-weight:700;color:${on ? p.text : p.muted}}
      .bar{position:relative;height:52px;border-radius:18px;background:${p.inset};overflow:hidden;cursor:pointer;touch-action:none}
      .bar .f{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,${on && a.rgb_color && !warmTone(a.rgb_color) ? `color-mix(in srgb, ${tint} 70%, #fff)` : g[0]},${tint});border-radius:18px}
      .bar ha-icon{position:absolute;left:14px;top:14px;--mdc-icon-size:24px;color:${on ? (a.rgb_color && !warmTone(a.rgb_color) ? "#fff" : g[3]) : p.muted}}
      .chips{display:flex;flex-wrap:wrap;gap:8px}
      .chips button{height:36px;padding:0 12px;border-radius:999px;border:1px solid ${p.border};background:${p.off};color:${p.text};font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px}
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
    const vals = pts.map((x) => x[1]);
    const lo = vals.length ? Math.min(...vals) : null, hi = vals.length ? Math.max(...vals) : null;
    const unit = c.unit != null && c.unit !== "" ? c.unit : s?.attributes.unit_of_measurement || "";
    const u2 = unitGap(unit);
    const W = 300, H = c.height, t0 = Date.now() - c.hours * 3600e3;
    let path = "", area = "";
    if (pts.length > 1) {
      const span = (hi - lo) || 1;
      const xy = pts.map(([t, v]) => [Math.max(0, (t - t0) / (c.hours * 3600e3)) * W, H - 6 - ((v - lo) / span) * (H - 16)]);
      const sm = smoothLine(xy, W, H - 16);
      path = curvePath(sm);
      area = `${path} L${sm[sm.length - 1][0].toFixed(1)},${H} L${sm[0][0].toFixed(1)},${H} Z`;
    }
    const st = (w, v) => `<div class="s"><span>${w}</span><b class="num">${v == null ? "" : esc(fmt(v, c.decimals) + u2)}</b></div>`;
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${panelCss(p, c.radius)};padding:16px;display:flex;flex-direction:column;gap:10px;cursor:pointer}
      .top{display:flex;justify-content:space-between;align-items:baseline;gap:10px}
      .n{font-size:15px;font-weight:600}
      .v{font-size:26px;font-weight:700}
      svg{display:block;width:100%;height:${H}px}
      .ln{fill:none;stroke:url(#lg);stroke-width:3;stroke-linecap:round}
      .stats{display:flex;justify-content:space-between;gap:8px}
      .s{display:flex;flex-direction:column;font-size:11.5px;color:${p.muted}}
      .s b{font-size:14px;color:${p.text}}
      .wait{height:${H}px;display:flex;align-items:center;justify-content:center;color:${p.muted};font-size:13px}
    </style>
    <div class="card" role="button" tabindex="0">
      <div class="top"><span class="n t">${esc(this.name(c.entity))}</span><span class="v num" ${now != null ? 'data-tw="now"' : ""}>${now != null ? esc(fmt(now, c.decimals ?? decOf(s.state, unit)) + u2) : s ? esc(s.state) : "Not found"}</span></div>
      ${path ? `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs>
          <linearGradient id="lg" x1="0" x2="1"><stop offset="0" stop-color="${g[0]}"/><stop offset="1" stop-color="${g[1]}"/></linearGradient>
          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${g[1]}" stop-opacity=".35"/><stop offset="1" stop-color="${g[1]}" stop-opacity="0"/></linearGradient></defs>
          ${c.fill ? `<path d="${area}" fill="url(#ag)"/>` : ""}<path class="ln" d="${path}" vector-effect="non-scaling-stroke"/></svg>`
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
    const ppl = c.entities.map((id) => this.st(id)).filter(Boolean);
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .wrap{${panelCss(p)};padding:16px;display:${list ? "flex;flex-direction:column;gap:12px" : `grid;grid-template-columns:repeat(auto-fit,minmax(${c.size + 24}px,1fr));gap:12px`}}
      .pp{display:flex;${list ? "flex-direction:row;align-items:center;gap:12px" : "flex-direction:column;align-items:center;gap:6px;text-align:center"};cursor:pointer}
      .av{position:relative;width:${c.size}px;height:${c.size}px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${Math.round(c.size * 0.36)}px;overflow:hidden}
      .av img{width:100%;height:100%;object-fit:cover}
      .ring{position:relative;padding:3px;border-radius:50%}
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
      const where = home ? "Home" : s.state === "not_home" ? "Away" : s.state.charAt(0).toUpperCase() + s.state.slice(1);
      const hue = [...nm].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 360;
      return `<div class="pp" data-e="${esc(s.entity_id)}" role="button" tabindex="0"><span class="ring ${home ? "home" : "away"}" data-pop="${home ? 1 : 0}" data-popkey="${esc(s.entity_id)}"><span class="av" style="background:hsl(${hue} 55% 50%);color:#fff">${pic ? `<img src="${esc(pic)}" alt="">` : esc(nm.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase())}</span><span class="b"></span></span>
        <span><div class="n t">${esc(nm.split(" ")[0])}</div><div class="l t">${esc(where)}${c.show_since ? ` · ${esc(since(s.last_changed).replace(/^for /, ""))}` : ""}</div></span></div>`;
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
      .a{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:16px;background:${p.panel};border:1px solid ${p.border};color:${p.text};cursor:pointer;border-left-width:4px}
      .a ha-icon{--mdc-icon-size:22px;flex:none;animation:roost-breathe 1.8s ease-in-out infinite}
      .a span{flex:1;font-size:13.5px;font-weight:600;line-height:1.3}
      .ok{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:16px;background:${p.panel};border:1px solid ${p.border};color:${p.muted};font-size:13.5px}
      .ok ha-icon{color:#3DD68C;--mdc-icon-size:22px}
      .more{font-size:12px;color:${p.muted};text-align:center}
    </style>
    <div class="wrap">${shown.length ? shown.map((a) => `<div class="a" data-e="${esc(a.id)}" style="border-left-color:${a.tone}"><ha-icon icon="${esc(a.icon)}" style="color:${a.tone}"></ha-icon><span class="t">${esc(a.text)}</span></div>`).join("")
      : '<div class="ok"><ha-icon icon="mdi:check-circle-outline"></ha-icon><span class="t">All good</span></div>'}
      ${list.length > shown.length ? `<div class="more t">and ${list.length - shown.length} more</div>` : ""}</div>`;
    this.shadowRoot.querySelectorAll("[data-e]").forEach((el) => el.addEventListener("click", () => this.moreInfo(el.dataset.e)));
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
];
const roleOfName = (name) => {
  const words = String(name).toLowerCase().replace(/[^a-z0-9+\-]+/g, " ").split(" ").filter(Boolean);
  const digit = words.find((w) => /^[0-9]$/.test(w));
  if (digit && words.length <= 3) return `n${digit}`;
  for (const [need, role] of REMOTE_RULES) if (need.every((w) => words.includes(w))) return role;
  return null;
};

class RoostRemote extends RoostBase {
  static get defaults() { return { color: "purple", show_numbers: false, show_extra: true, radius: 26, theme: "auto" }; }

  validate(c) { if (!c.athom_remote && !c.entity && !(c.buttons || []).length) throw new Error("Choose an Athom Hub remote, a remote, or a TV"); }

  static getConfigForm() {
    return {
      schema: [
        { name: "athom_remote", label: "Athom Hub remote (its name)", selector: { text: {} } },
        { name: "entity", label: "Or a remote / TV entity", selector: { entity: { domain: ["remote", "media_player"] } } },
        { name: "buttons", label: "Or pick buttons (named Power, Up, OK, Vol up and so on)", selector: { entity: { multiple: true, domain: "button" } } },
        { name: "name", selector: { text: {} } },
        { type: "grid", name: "", schema: [{ name: "show_numbers", label: "Number keys", selector: { boolean: {} } }, { name: "show_extra", label: "Back, home, menu", selector: { boolean: {} } }] },
        { type: "expandable", name: "", title: "Look", icon: "mdi:palette", schema: [...colourFields("color"), { name: "radius", selector: slider(0, 40, 2) }, THEME_FIELD] },
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
    if (d === "media_player") return ["power", "vol_up", "vol_down", "mute", "ch_up", "ch_down", "play_pause", "source"].includes(role);
    return false;
  }

  press_(role, map) {
    const c = this._config;
    this.vibrate(10);
    if (map[role]) return this.call("button", "press", { entity_id: map[role] });
    const d = (c.entity || "").split(".")[0];
    if (d === "remote") {
      const cmd = { power: "power", vol_up: "volume_up", vol_down: "volume_down", ch_up: "channel_up", ch_down: "channel_down", play_pause: "play_pause", ok: "select" }[role] || role.replace(/^n/, "");
      return this.call("remote", "send_command", { entity_id: c.entity, command: cmd });
    }
    if (d === "media_player") {
      const s = this.st();
      const svc = { power: s && s.state !== "off" ? "turn_off" : "turn_on", vol_up: "volume_up", vol_down: "volume_down", ch_up: "media_next_track", ch_down: "media_previous_track", play_pause: "media_play_pause" }[role];
      if (role === "mute") return this.call("media_player", "volume_mute", { entity_id: c.entity, is_volume_muted: !s?.attributes.is_volume_muted });
      if (svc) return this.call("media_player", svc, { entity_id: c.entity });
    }
    return undefined;
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour(), map = this.map();
    const k = (role, icon, cls = "") => `<button class="k ${cls} ${this.has(role, map) ? "" : "no"}" data-r="${role}" aria-label="${role.replace("_", " ")}"${this.has(role, map) ? "" : " disabled"}>${icon.startsWith("mdi:") ? `<ha-icon icon="${icon}"></ha-icon>` : `<span>${icon}</span>`}</button>`;
    const title = c.name || c.athom_remote || (c.entity ? this.name(c.entity) : "Remote");
    const pw = map.power ? "power" : map.power_on ? "power_on" : "power";
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      :host{container-type:inline-size}
      .card{${panelCss(p, c.radius)};padding:18px;display:flex;flex-direction:column;gap:16px;align-items:center;--k:min(56px,15cqw)}
      .top{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px}
      .n{font-size:16px;font-weight:600}
      .k{width:var(--k);height:var(--k);border-radius:50%;border:1px solid ${p.border};background:${p.off};color:${p.text};cursor:pointer;display:flex;align-items:center;justify-content:center;font:inherit;font-size:18px;font-weight:600;
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
      .rock small{font-size:10px;color:${p.muted};letter-spacing:1px}
      .mid{display:flex;flex-direction:column;gap:10px;justify-content:center}
      .nums{display:grid;grid-template-columns:repeat(3,var(--k));gap:10px}
    </style>
    <div class="card">
      <div class="top"><span class="n t">${esc(title)}</span>${k(pw, "mdi:power", "pw")}</div>
      <div class="pad">${k("up", "mdi:chevron-up", "up")}${k("left", "mdi:chevron-left", "left")}${k("ok", "OK", "ok")}${k("right", "mdi:chevron-right", "right")}${k("down", "mdi:chevron-down", "down")}</div>
      ${c.show_extra ? `<div class="row">${k("back", "mdi:arrow-u-left-top")}${k("home", "mdi:home-outline")}${k("menu", "mdi:menu")}${k("source", "mdi:import")}</div>` : ""}
      <div class="row"><div class="rock">${k("vol_up", "mdi:plus")}<small>VOL</small>${k("vol_down", "mdi:minus")}</div>
        <div class="mid">${k("mute", "mdi:volume-off")}${k("play_pause", "mdi:play-pause")}</div>
        <div class="rock">${k("ch_up", "mdi:chevron-up")}<small>CH</small>${k("ch_down", "mdi:chevron-down")}</div></div>
      ${c.show_numbers ? `<div class="nums">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => k(`n${n}`, String(n))).join("")}<span></span>${k("n0", "0")}</div>` : ""}
    </div>`;
    this.shadowRoot.querySelectorAll(".k:not(.no)").forEach((b) => b.addEventListener("click", () => this.press_(b.dataset.r, map)));
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

  val(ids, suffix) { const id = findBySuffix(ids, suffix); return id ? num(this.st(id)?.state) : null; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour(), ids = this.ids();
    const R = c.range * 1000, s60 = Math.sin(Math.PI / 3), c60 = Math.cos(Math.PI / 3);
    const targets = [1, 2, 3].map((n) => ({ n, x: this.val(ids, `target_${n}_x`), y: this.val(ids, `target_${n}_y`) })).filter((t) => t.x != null && t.y != null && !(t.x === 0 && t.y === 0)).map((t) => ({ ...t, y: Math.abs(t.y) }));
    const occ = ids.map((id) => this.st(id)).find((s) => s && s.entity_id.startsWith("binary_sensor.") && ["occupancy", "presence"].includes(s.attributes.device_class));
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
      .n{font-size:16px;font-weight:600}
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
    const day = cond !== "clear-night" && (this.st("sun.sun")?.state ?? "above_horizon") !== "below_horizon";
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
      .tmp{font-size:52px;font-weight:700;line-height:1;margin-top:4px;letter-spacing:-1px}
      .cd{font-size:15px;font-weight:600;text-transform:capitalize;margin-top:4px}
      .dt{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
      .dt span{font-size:12px;padding:4px 10px;border-radius:999px;background:rgba(10,8,40,.25)}
      .fc{display:grid;grid-template-columns:repeat(${Math.max(1, fc.length)},minmax(0,1fr));gap:4px;padding:12px 10px}
      .d{display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;color:${p.text}}
      .d small{font-size:11.5px;color:${p.muted}}
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
        ...colourFields("color"),
        THEME_FIELD,
      ],
      computeLabel,
    };
  }

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
      const [t, y] = await Promise.all([get(midnight, now), get(new Date(midnight.getTime() - 86400e3), new Date(now.getTime() - 86400e3))]);
      this._days = { today: t?.change, yesterday: y?.change };
    } catch (e) { this._days = {}; }
    this._loading = false; this._loadedAt = Date.now(); this._loadedFor = c.energy;
    this._sig = null; this.hass = this._hass;
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour();
    this.loadDays();
    const devs = (c.devices || []).map((e) => (typeof e === "string" ? { id: e } : { id: e?.entity, nm: e?.name })).map((d) => ({ ...d, s: this.st(d.id) })).filter((d) => d.s).map((d) => ({ ...d, w: num(d.s.state) ?? 0 }));
    const total = devs.reduce((a, d) => a + d.w, 0);
    const top = [...devs].sort((a, b) => b.w - a.w).slice(0, c.count);
    const max = Math.max(1, ...top.map((d) => d.w));
    const { today, yesterday } = this._days || {};
    const diff = today != null && yesterday ? Math.round(((today - yesterday) / yesterday) * 100) : null;
    const kw = (w) => (w >= 1000 ? `${(w / 1000).toFixed(1)} kW` : `${Math.round(w)} W`);
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${panelCss(p, c.radius)};padding:16px;display:flex;flex-direction:column;gap:14px}
      .top{display:flex;gap:10px;flex-wrap:wrap}
      .box{flex:1 1 120px;min-width:0;padding:12px 14px;border-radius:16px;background:${p.inset}}
      .box small{display:block;font-size:12px;color:${p.muted}}
      .box b{display:block;font-size:24px;font-weight:700;margin-top:2px}
      .box em{font-style:normal;font-size:12px;font-weight:600}
      .bolt{animation:roost-pulse 1.6s ease-in-out infinite;--mdc-icon-size:18px;color:${g[1]};vertical-align:-3px}
      .dv{display:flex;flex-direction:column;gap:9px}
      .row{display:grid;grid-template-columns:1fr auto;gap:4px 10px;align-items:center;cursor:pointer}
      .row span{font-size:13.5px;font-weight:600;color:${p.text}}
      .row b{font-size:13px;color:${p.muted}}
      .bar{grid-column:1/3;height:6px;border-radius:999px;background:${p.track};overflow:hidden}
      .bar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,${g[0]},${g[1]})}
    </style>
    <div class="card">
      <div class="top">
        ${devs.length ? `<div class="box"><small>Using now</small><b class="num"><ha-icon class="bolt" icon="mdi:flash"></ha-icon> <span data-tw="tot">${kw(total)}</span></b></div>` : ""}
        ${c.energy ? `<div class="box"><small>Today</small><b class="num">${today != null ? `${today.toFixed(today < 1 ? 2 : 1)} kWh` : "Loading"}</b>${diff != null ? `<em style="color:${diff > 0 ? "#FF9F6B" : "#3DD68C"}">${diff > 0 ? "▲" : "▼"} ${Math.abs(diff)}% vs this time yesterday</em>` : yesterday != null ? `<em style="color:${p.muted}">Yesterday ${yesterday.toFixed(1)} kWh</em>` : ""}</div>` : ""}
      </div>
      ${top.length ? `<div class="dv">${top.map((d) => `<div class="row" data-e="${esc(d.id)}"><span class="t">${esc(d.nm || d.s.attributes.friendly_name || d.id)}</span><b class="num" data-tw="${esc(d.id)}">${kw(d.w)}</b><span class="bar"><i data-bar="${esc(d.id)}" style="width:${((d.w / max) * 100).toFixed(0)}%"></i></span></div>`).join("")}</div>` : ""}
    </div>`;
    this.shadowRoot.querySelectorAll("[data-e]").forEach((el) => el.addEventListener("click", () => this.moreInfo(el.dataset.e)));
  }
}

// ------------------------------------------------------------------ Roost Timer
// A countdown ring for a Home Assistant timer (kettle, washing), with start, pause, cancel and quick times.
class RoostTimer extends RoostBase {
  static get defaults() { return { presets: [1, 3, 5, 10], color: "coral", radius: 22, theme: "auto" }; }

  validate(c) { if (!c.entity) throw new Error("Choose a timer (Settings → Helpers → Timer)"); }

  static getConfigForm() {
    return {
      schema: [
        { name: "entity", required: true, selector: { entity: { domain: "timer" } } },
        { type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "icon", selector: { icon: {} } }] },
        { name: "presets", label: "Quick times (minutes)", selector: { select: { multiple: true, custom_value: true, mode: "dropdown", options: ["1", "2", "3", "4", "5", "10", "15", "20", "30", "45", "60"] } } },
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
    return this.secs(s.attributes.duration);
  }

  paint() {
    const v = this.shadowRoot.querySelector(".v"), arc = this.shadowRoot.querySelector(".arc"), s = this.st();
    if (!v || !s) return;
    const left = this.left(), tot = this.secs(s.attributes.duration) || 1, f = s.state === "idle" ? 1 : left / tot;
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
      .ring{position:relative;width:100%;max-width:200px}
      .ring svg{display:block;width:100%}
      .in{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
      .v{font-size:38px;font-weight:700}
      .w{font-size:12px;color:${state === "active" ? g[this.dark ? 1 : 0] : p.muted}}
      .btns{display:flex;gap:10px}
      .b{width:52px;height:52px;border-radius:50%;border:1px solid ${p.border};background:${p.off};color:${p.text};cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .12s}
      .b:active{transform:scale(.9)}
      .b.main{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};border-color:transparent;box-shadow:0 10px 22px -10px ${g[2]}}
      .b ha-icon{--mdc-icon-size:24px}
      .q{display:flex;flex-wrap:wrap;justify-content:center;gap:6px}
      .q button{height:32px;padding:0 12px;border-radius:999px;border:1px solid ${p.border};background:${p.off};color:${p.text};font:inherit;font-size:12.5px;font-weight:600;cursor:pointer}
    </style>
    <div class="card">
      <div class="n t"><ha-icon icon="${esc(c.icon || "mdi:timer-outline")}"></ha-icon>${esc(this.name(c.entity, "Timer"))}</div>
      <div class="ring">${ringSvg({ f: 1, track: p.track, from: g[0], to: g[1], id: "tg", inner: 58, innerFill: p.dial })}<div class="in"><span class="v num"></span><span class="w t">${esc(word)}</span></div></div>
      ${s ? `<div class="btns">${state === "active" ? '<button class="b main" data-a="pause" aria-label="Pause"><ha-icon icon="mdi:pause"></ha-icon></button>' : '<button class="b main" data-a="start" aria-label="Start"><ha-icon icon="mdi:play"></ha-icon></button>'}
        ${state !== "idle" ? '<button class="b" data-a="cancel" aria-label="Cancel"><ha-icon icon="mdi:stop"></ha-icon></button>' : ""}</div>
      <div class="q">${(c.presets || []).map((m) => `<button data-m="${esc(m)}">${esc(m)} min</button>`).join("")}</div>` : ""}
    </div>`;
    this.paint();
    this.shadowRoot.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", () => { this.vibrate(); this.call("timer", b.dataset.a, { entity_id: c.entity }); }));
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
  static get defaults() { return { color: "teal", radius: 22, theme: "auto" }; }

  validate(c) { if (!c.entity) throw new Error("Choose a fan"); }

  static getConfigForm() {
    return {
      schema: [
        { name: "entity", required: true, selector: { entity: { domain: "fan" } } },
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
      .n{font-size:16px;font-weight:600}
      .l{font-size:12.5px;color:${p.muted};margin-top:2px}
      .row{display:flex;gap:8px;flex-wrap:wrap}
      .b{flex:1;min-width:52px;height:44px;border-radius:14px;border:1px solid ${p.border};background:${p.off};color:${p.text};font:inherit;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px}
      .b.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};border-color:transparent}
      .b ha-icon{--mdc-icon-size:18px}
    </style>
    <div class="card">
      <div class="top"><span class="ic" role="button" tabindex="0" aria-label="On or off" data-pop="${on ? 1 : 0}" data-popkey="ic"><ha-icon icon="mdi:fan"></ha-icon></span>
        <span class="tx"><div class="n t">${esc(this.name(c.entity, "Fan"))}</div><div class="l t">${!s ? "Device not found" : UNAVAILABLE.includes(s.state) ? "Offline" : on ? `On${a.percentage != null ? ` · ${Math.round(pct)}%` : ""}${a.preset_mode ? ` · ${esc(a.preset_mode)}` : ""}` : "Off"}</div></span></div>
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

// ------------------------------------------------------------------ Roost Lock
// A lock (or garage door): slide to open, tap to lock. Says when it is jammed, and can show the door's sensor.
class RoostLock extends RoostBase {
  static get defaults() { return { color: "green", radius: 22, theme: "auto" }; }

  validate(c) { if (!c.entity) throw new Error("Choose a lock or a garage door"); }

  watched() { return [this._config.entity, this._config.door].filter(Boolean); }

  static getConfigForm() {
    return {
      schema: [
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
    const ds = this.st(c.door);
    const word = !s ? "Not found" : jam ? "Jammed" : { locked: "Locked", unlocked: "Unlocked", locking: "Locking", unlocking: "Unlocking", open: "Open", closed: "Closed", opening: "Opening", closing: "Closing" }[st] || st;
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${panelCss(p, c.radius)};padding:16px;display:flex;flex-direction:column;gap:14px}
      .top{display:flex;align-items:center;gap:14px}
      :host{container-type:inline-size}
      @container (max-width: 240px){:host .top{flex-wrap:wrap}:host .tx{flex:1 1 100%}}
      .ic{width:60px;height:60px;border-radius:20px;flex:none;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};box-shadow:0 12px 26px -12px ${g[2]}}
      .ic ha-icon{--mdc-icon-size:30px;${busy ? "animation:roost-pulse .9s ease-in-out infinite" : jam ? "animation:roost-wiggle .6s ease-in-out infinite" : ""}}
      .n{font-size:16px;font-weight:600}
      .w{font-size:20px;font-weight:700}
      .d{font-size:12.5px;color:${p.muted}}
      .track{position:relative;height:58px;border-radius:999px;background:${p.inset};border:1px solid ${p.border};overflow:hidden;touch-action:none;user-select:none}
      .hint{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:13.5px;font-weight:600;color:${p.muted};animation:roost-breathe 2.2s ease-in-out infinite}
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
    for (const e of ev) {
      const dn = dayName(e.start);
      if (dn !== last) { html += `<div class="day">${esc(dn)}</div>`; last = dn; }
      const hot = words.some((w) => e.title.toLowerCase().includes(w));
      html += `<div class="ev ${hot ? "hot" : ""}"><span class="bar" style="background:${hot ? "#FF8F6B" : cols[e.cal % cols.length]}"></span>
        <span class="tm num">${e.allDay ? "All day" : esc(new Date(e.start).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }))}</span>
        <span class="tx"><b class="t">${hot ? '<ha-icon icon="mdi:trash-can-outline"></ha-icon> ' : ""}${esc(e.title)}</b>${e.where ? `<small class="t">${esc(e.where)}</small>` : ""}</span></div>`;
    }
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${panelCss(p, c.radius)};padding:16px;display:flex;flex-direction:column;gap:8px}
      .day{font-size:12px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:${p.muted};margin-top:6px}
      .day:first-child{margin-top:0}
      .ev{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:${p.inset}}
      @container (max-width: 280px){:host .ev{display:grid;grid-template-columns:4px minmax(0,1fr);column-gap:10px;row-gap:2px}:host .ev .bar{grid-row:1/3}:host .tm{min-width:0}}
      .ev.hot{background:${this.dark ? "rgba(255,143,107,.14)" : "rgba(255,143,107,.16)"}}
      .ev.hot ha-icon{--mdc-icon-size:16px;color:#FF8F6B;vertical-align:-3px;animation:roost-bounce 1.6s ease-in-out infinite}
      .bar{width:4px;align-self:stretch;border-radius:4px;flex:none}
      .tm{font-size:12.5px;color:${p.muted};min-width:58px}
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

  disconnectedCallback() { this._unsub?.then?.((u) => u()).catch(() => {}); this._subFor = null; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour();
    this.subscribe();
    const items = this._items || [];
    const open = items.filter((i) => i.status !== "completed"), done = items.filter((i) => i.status === "completed");
    const row = (i) => `<div class="it ${i.status === "completed" ? "done" : ""}" data-uid="${esc(i.uid)}"><span class="ck">${i.status === "completed" ? '<ha-icon icon="mdi:check"></ha-icon>' : ""}</span><span class="t">${esc(i.summary)}</span></div>`;
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{${panelCss(p, c.radius)};padding:16px;display:flex;flex-direction:column;gap:10px}
      .top{display:flex;justify-content:space-between;align-items:baseline}
      .n{font-size:16px;font-weight:600}
      .c{font-size:12.5px;color:${p.muted}}
      .add{display:flex;gap:8px}
      .add input{flex:1;min-width:0;height:44px;border-radius:14px;border:1px solid ${p.border};background:${p.inset};color:${p.text};font:inherit;font-size:14px;padding:0 14px;outline:none}
      @container (max-width: 260px){:host .add input{padding:0 10px;font-size:13px}:host .add button{width:40px}}
      .add button{width:44px;height:44px;border-radius:14px;border:0;background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};cursor:pointer}
      .it{display:flex;align-items:center;gap:12px;padding:10px 4px;border-bottom:1px solid ${p.border};cursor:pointer;font-size:14.5px;color:${p.text}}
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
    r.querySelectorAll("[data-uid]").forEach((el) => el.addEventListener("click", () => {
      this.vibrate();
      const it = items.find((i) => i.uid === el.dataset.uid);
      this.call("todo", "update_item", { entity_id: c.entity, item: it.uid, status: it.status === "completed" ? "needs_action" : "completed" });
    }));
    r.querySelector(".add").addEventListener("submit", (e) => {
      e.preventDefault();
      const inp = r.querySelector(".add input"), v = inp.value.trim();
      if (v) { this.vibrate(); this.call("todo", "add_item", { entity_id: c.entity, item: v }); inp.value = ""; }
    });
    r.querySelector(".clr")?.addEventListener("click", () => this.call("todo", "remove_completed_items", { entity_id: c.entity }));
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

  url() { const s = this.st(); return s?.attributes.entity_picture ? `${s.attributes.entity_picture}&t=${Date.now()}` : ""; }

  refreshImg() { const img = this.shadowRoot?.querySelector("img.pic"); if (img && !document.hidden) img.src = this.url(); }

  ringing() {
    const c = this._config, d = this.st(c.doorbell);
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

// ------------------------------------------------------------------ Roost Sensors
// Many small readings in neat squares, each turning orange when outside the range you set.
class RoostSensors extends RoostBase {
  static get defaults() { return { entities: [], columns: 3, radius: 18, theme: "auto" }; }

  validate(c) { if (!Array.isArray(c.entities) || !c.entities.length) throw new Error("Pick some readings"); }

  items() { return this._config.entities.map((e) => (typeof e === "string" ? { entity: e } : e)); }

  watched() { return this.items().map((i) => i.entity); }

  static getConfigForm() {
    return {
      schema: [
        { name: "entities", label: "Readings", selector: { object: { multiple: true, label_field: "name", fields: {
          entity: { label: "Reading", required: true, selector: { entity: {} } },
          name: { label: "Name", selector: { text: {} } },
          icon: { label: "Icon", selector: { icon: {} } },
          above: { label: "Orange above", selector: { number: { mode: "box" } } },
          below: { label: "Orange below", selector: { number: { mode: "box" } } },
        } } } },
        { type: "grid", name: "", schema: [{ name: "columns", label: "Side by side", selector: { number: { min: 1, max: 6, mode: "box" } } }, { name: "radius", selector: slider(0, 32, 2) }] },
        THEME_FIELD,
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) { return { entities: Object.keys(hass.states).filter((id) => id.startsWith("sensor.") && num(hass.states[id].state) != null).slice(0, 6) }; }

  getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p;
    const icons = { temperature: "mdi:thermometer", humidity: "mdi:water-percent", power: "mdi:flash", energy: "mdi:lightning-bolt", battery: "mdi:battery", carbon_dioxide: "mdi:molecule-co2", pm25: "mdi:blur", illuminance: "mdi:brightness-5", pressure: "mdi:gauge", voltage: "mdi:sine-wave", current: "mdi:current-ac" };
    const tint = { temperature: COLORS.coral, humidity: COLORS.blue, power: COLORS.amber, energy: COLORS.green, battery: COLORS.green, carbon_dioxide: COLORS.slate, pm25: COLORS.purple, illuminance: COLORS.amber };
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(max(96px,calc((100% - ${(Math.max(1, c.columns) - 1) * 8}px) / ${Math.max(1, c.columns)})),1fr));gap:8px}
      .sq{${panelCss(p, c.radius)};padding:12px;display:flex;flex-direction:column;gap:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .12s}
      .sq:active{transform:scale(.96)}
      .sq ha-icon{--mdc-icon-size:20px}
      .v{font-size:22px;font-weight:700;line-height:1.1}
      .v small{font-size:13px;font-weight:600;color:${p.muted}}
      .n{font-size:12px;color:${p.muted};line-height:1.3}
      .warn{border-color:#FF9F6B}
      .warn .v{color:#FF9F6B}
      .warn ha-icon{animation:roost-breathe 1.6s ease-in-out infinite}
    </style>
    <div class="grid">${this.items().map((it) => {
      const s = this.st(it.entity), v = s ? num(s.state) : null, dc = s?.attributes.device_class;
      const warn = v != null && ((it.above != null && it.above !== "" && v > it.above) || (it.below != null && it.below !== "" && v < it.below));
      const g = warn ? COLORS.coral : tint[dc] || COLORS.purple;
      const unit = s?.attributes.unit_of_measurement || "";
      return `<div class="sq ${warn ? "warn" : ""}" data-e="${esc(it.entity)}" role="button" tabindex="0">
        <ha-icon icon="${esc(it.icon || s?.attributes.icon || icons[dc] || "mdi:information-outline")}" style="color:${g[this.dark ? 1 : 0]}"></ha-icon>
        <span class="v num">${!s ? "?" : v != null ? `<span data-tw="${esc(it.entity)}">${esc(fmt(v, it.decimals ?? decOf(s.state, unit)))}</span><small>${esc(unitGap(unit))}</small>` : esc(UNAVAILABLE.includes(s.state) ? "Offline" : s.state)}</span>
        <span class="n t">${esc(it.name || s?.attributes.friendly_name || it.entity)}</span></div>`;
    }).join("")}</div>`;
    this.shadowRoot.querySelectorAll("[data-e]").forEach((el) => el.addEventListener("click", () => this.moreInfo(el.dataset.e)));
  }
}

// ------------------------------------------------------------------ Roost Buttons
// Several small actions in one rounded bar. A button lights up when its device is on.
class RoostButtons extends RoostBase {
  static get defaults() { return { items: [], show_names: true, color: "active", radius: 22, theme: "auto" }; }

  validate(c) { if (!Array.isArray(c.items) || !c.items.length) throw new Error("Add some buttons"); }

  watched() { return this._config.items.map((i) => i.entity).filter(Boolean); }

  static getConfigForm() {
    return {
      schema: [
        { name: "items", label: "Buttons", selector: { object: { multiple: true, label_field: "name", fields: {
          name: { label: "Name", selector: { text: {} } },
          icon: { label: "Icon", required: true, selector: { icon: {} } },
          entity: { label: "Device (lights the button when on; tap switches it)", selector: { entity: {} } },
          tap_action: { label: "Tap does (instead)", selector: { ui_action: {} } },
        } } } },
        { type: "grid", name: "", schema: [{ name: "show_names", label: "Names under the icons", selector: { boolean: {} } }, { name: "radius", selector: slider(0, 40, 2) }] },
        ...colourFields("color", "Colour when on"),
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
      .bar{${panelCss(p, c.radius)};padding:6px;display:grid;grid-template-columns:repeat(${c.items.length},minmax(0,1fr));gap:4px}
      @container (max-width: ${c.items.length * 66}px){:host .b span{display:none}:host .b{min-height:48px}}
      .b{min-height:${c.show_names ? 62 : 48}px;border-radius:${Math.max(8, c.radius - 6)}px;border:0;background:transparent;color:${p.muted};font:inherit;font-size:11px;font-weight:600;cursor:pointer;
        display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:4px 2px;-webkit-tap-highlight-color:transparent;transition:transform .12s}
      .b:active{transform:scale(.92)}
      .b.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};box-shadow:0 8px 20px -10px ${g[2]}}
      .b ha-icon{--mdc-icon-size:22px}
      .b.done ha-icon{animation:roost-pulse .5s ease-out 1}
    </style>
    <div class="bar">${c.items.map((it, i) => {
      const s = this.st(it.entity), on = s && !UNAVAILABLE.includes(s.state) && !OFF_STATES.includes(s.state);
      return `<button class="b ${on ? "on" : ""}" data-i="${i}" data-pop="${on ? 1 : 0}" data-popkey="${i}" aria-label="${esc(it.name || it.icon)}"><ha-icon icon="${esc(it.icon)}"></ha-icon>${c.show_names && it.name ? `<span class="t">${esc(it.name)}</span>` : ""}</button>`;
    }).join("")}</div>`;
    this.shadowRoot.querySelectorAll(".b").forEach((b) => {
      const it = c.items[+b.dataset.i];
      this.press(b, () => {
        b.classList.remove("done"); void b.offsetWidth; b.classList.add("done");
        if (it.tap_action && it.tap_action.action && it.tap_action.action !== "none") this.run(it.tap_action, it.entity);
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
    if (how === "auto") this.exitThisVisit(d, !on);
    else this.remember(d, on);
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
    this.style(mainRoot, "roost-full", on && w.sidebar ? "ha-drawer{--mdc-drawer-width:0px!important}ha-sidebar{display:none!important}" : "");
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
    (this._cards || []).forEach((el) => { el.hass = hass; });
    const sig = `${this.dark ? 1 : 0}|${this._built ? 1 : 0}`;
    if (sig === this._sig) return;
    this._sig = sig;
    this.render();
  }

  setConfig(config) { this._built = false; this._cards = null; super.setConfig(config); }

  async build() {
    const helpers = window.loadCardHelpers ? await window.loadCardHelpers() : null;
    this._cards = (this._config.cards || []).map((cfg) => {
      let el;
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
    const on = !RoostFull.exitedThisVisit(d);
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
        border:1px solid ${on ? "transparent" : p.border};background:${on ? `linear-gradient(135deg,${g[0]},${g[1]})` : p.panel};color:${on ? g[3] : p.text};font:inherit;font-size:13.5px;font-weight:600;
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
      { name: "gap", label: "Space between cards", selector: slider(0, 32) },
      THEME_FIELD,
    ], computeLabel };
  }

  static getStubConfig() { return { title: "Rooms", cards: [] }; }

  watched() { return (this._config.entities || []).map((e) => (typeof e === "string" ? e : e?.entity)).filter(Boolean); }

  set hass(hass) {
    this._hass = hass;
    (this._cards || []).forEach((el) => { el.hass = hass; });
    const rows = this.watched().map((id) => this.st(id)?.state).join("|");
    const sig = `${this.dark ? 1 : 0}|${this._built ? 1 : 0}|${rows}|${this._isOpen ? 1 : 0}`;
    if (sig === this._sig) return;
    this._sig = sig;
    this.render();
  }

  // One row per device: icon in a box, name, and its state in colour (like the original "Security" box).
  row(e) {
    const id = typeof e === "string" ? e : e?.entity, s = this.st(id), p = this.p;
    const d = id.split(".")[0], cls = s?.attributes.device_class;
    const name = (typeof e === "object" && e.name) || s?.attributes.friendly_name || id;
    let icon = (typeof e === "object" && e.icon) || null, col = p.muted, word = !s ? "Not found" : UNAVAILABLE.includes(s.state) ? "Offline" : s.state, wc = p.muted;
    if (s && !UNAVAILABLE.includes(s.state)) {
      if (d === "alarm_control_panel") { const arm = s.state !== "disarmed"; icon = icon || (arm ? "mdi:shield-lock" : "mdi:shield-off-outline"); col = arm ? "#F43F6B" : "#38BDF8"; word = arm ? s.state.replace("armed_", "Armed ").replace("_", " ") : "Off"; wc = arm ? "#F43F6B" : p.muted; }
      else if (d === "binary_sensor" && ["door", "window", "garage_door", "opening"].includes(cls)) { const o = s.state === "on"; icon = icon || (o ? "mdi:door-open" : "mdi:door-closed"); col = wc = o ? "#FF9F6B" : "#34D399"; word = o ? "Open" : "Closed"; }
      else if (d === "binary_sensor" && ["occupancy", "presence", "motion"].includes(cls)) { const o = s.state === "on"; icon = icon || (o ? "mdi:motion-sensor" : "mdi:motion-sensor-off"); col = wc = o ? "#B794FF" : p.muted; word = o ? "Yes" : "No"; }
      else if (d === "sensor") { icon = icon || (cls === "illuminance" ? "mdi:brightness-6" : null); col = cls === "illuminance" ? "#FCD34D" : p.muted; const v = num(s.state); word = v == null ? s.state : `${fmt(v, decOf(s.state, s.attributes.unit_of_measurement))}${unitGap(s.attributes.unit_of_measurement || "")}`; }
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
      .body{display:grid;grid-template-columns:minmax(0,1fr);gap:10px}
      .body[hidden]{display:none}
      .rw{display:flex;align-items:center;gap:12px;padding:12px 4px;border-bottom:1px solid ${p.border};cursor:pointer}
      .ri{width:38px;height:38px;border-radius:12px;background:${p.inset};display:flex;align-items:center;justify-content:center;flex:none;--mdc-icon-size:20px}
      .rn{flex:1;min-width:0;font-size:14px;font-weight:600}
      .rv{font-size:13px;font-weight:600;flex:none}
    </style><div class="pn">${head ? `<div class="hd">${c.picture ? `<img src="${esc(c.picture)}" alt="">` : c.icon ? `<span class="hi"><ha-icon icon="${esc(c.icon)}"></ha-icon></span>` : ""}<div class="tx">${c.title ? `<div class="tt t" style="padding:0">${esc(c.title)}</div>` : ""}${c.subtitle ? `<div class="st t">${esc(c.subtitle)}</div>` : ""}</div>${fold ? '<ha-icon class="ar" icon="mdi:chevron-down"></ha-icon>' : ""}</div>` : c.title ? `<div class="tt t">${esc(c.title)}</div>` : ""}
      ${(c.entities || []).length ? `<div>${c.entities.map((e) => this.row(e)).join("")}</div>` : ""}
      ${this._cards.length ? `<div class="body" ${open ? "" : "hidden"}></div>` : ""}</div>`;
    const body = this.shadowRoot.querySelector(".body");
    if (body) this._cards.forEach((el) => { const w = document.createElement("div"); w.appendChild(el); body.appendChild(w); });
    this.shadowRoot.querySelectorAll("[data-icon]").forEach((el) => this.icon(el, null, el.dataset.icon));
    this.shadowRoot.querySelectorAll(".rw").forEach((el) => el.addEventListener("click", () => this.moreInfo(el.dataset.e)));
    const hd = this.shadowRoot.querySelector(".hd");
    if (fold && hd) hd.addEventListener("click", () => { this._isOpen = !this._isOpen; this.vibrate(); this._sig = null; this.hass = this._hass; });
  }

  getCardSize() { return 4; }
}

// ------------------------------------------------------------------ register
const CARDS = [
  ["roost-tile", RoostTile, "Roost Tile", "A big tile with a switch, colour, icon and how long it has been on."],
  ["roost-chips", RoostChips, "Roost Chips", "Status chips in one row: doors, alarm, lights (with count), AC and people bubbles."],
  ["roost-thermostat", RoostThermostat, "Roost Thermostat", "Air conditioner with a dial you drag, power, − and +, and mode buttons."],
  ["roost-scene", RoostScene, "Roost Scene", "A coloured button that runs a scene, script or action."],
  ["roost-hero", RoostHero, "Roost Hero", "A greeting with the time, date and weather."],
  ["roost-nav", RoostNav, "Roost Nav", "Icon navigation: a bar on phones and a side rail on tablets."],
  ["roost-row", RoostRow, "Roost Row", "A long row with a ring (an AC's temperature or any number), a name, a state line and an arrow."],
  ["roost-rooms", RoostRooms, "Roost Rooms", "A room switcher: tap a room pill to show that room's cards. Switching is instant."],
  ["roost-curtain", RoostCurtain, "Roost Curtain", "A window with curtains that really slide open and closed, with a sky behind them."],
  ["roost-gauge", RoostGauge, "Roost Gauge", "A big ring for one reading, such as a temperature or a plug's power. It turns orange when too high."],
  ["roost-automations", RoostAutomations, "Roost Automations", "A list of automations with a switch and when each last ran."],
  ["roost-clock", RoostClock, "Roost Clock", "A big clock and date with a line of the day's times (such as prayer times) and a countdown."],
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
  ["roost-lock", RoostLock, "Roost Lock", "A lock or garage door: slide to open, tap to lock."],
  ["roost-agenda", RoostAgenda, "Roost Agenda", "Today's and the next days' calendar events. Bin day stands out."],
  ["roost-todo", RoostTodo, "Roost To-do", "A to-do or shopping list: tick off, add and clear."],
  ["roost-camera", RoostCamera, "Roost Camera", "A camera picture or live video, with a banner when someone rings the doorbell."],
  ["roost-sensors", RoostSensors, "Roost Sensors", "Many small readings in neat squares, orange when out of range."],
  ["roost-buttons", RoostButtons, "Roost Buttons", "Several small actions in one rounded bar."],
  ["roost-page", RoostPage, "Roost Page", "A phone page laid out like the original dashboard: even spacing, the night-sky background and room for the bottom bar."],
  ["roost-panel", RoostPanel, "Roost Panel", "A rounded panel with a title that holds other cards, such as a list of rooms."],
  ["roost-fullscreen", RoostFullscreen, "Roost Full Screen", "Full screen without Home Assistant's top bar and sidebar: by itself, or as a button that maximizes and minimizes."],
];
window.customCards = window.customCards || [];
for (const [, cls] of CARDS) {
  cls.getConfigElement = function getConfigElement() { const el = document.createElement("roost-editor"); el.cardClass = cls; return el; };
}
for (const [tag, cls, name, description] of CARDS) {
  if (!customElements.get(tag)) customElements.define(tag, cls);
  if (!window.customCards.some((c) => c.type === tag)) window.customCards.push({ type: tag, name, description, preview: true, documentationURL: "https://github.com/HRadhi4/Roost-card" });
}
console.info(`%c ROOST CARDS %c ${ROOST_VERSION} `, "color:#fff;background:#6D4BFF;font-weight:700;border-radius:4px 0 0 4px;padding:2px 4px", "color:#6D4BFF;background:#EEF0FF;border-radius:0 4px 4px 0;padding:2px 4px");
