/*
 * Roost Cards — beautiful, fully customisable dashboard cards for Home Assistant.
 * Phones and tablets, light and dark. One file, no build step.
 *
 * Cards: roost-tile, roost-chips, roost-thermostat, roost-scene, roost-hero, roost-nav, roost-rooms, roost-row
 * Every card has a visual editor (colours, size, icon, shape and more).
 */

const ROOST_VERSION = "0.6.3";

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
const FONT_TEXT = "Inter, var(--ha-font-family-body, Roboto), system-ui, sans-serif";
const FONT_NUM = "'Space Grotesk', Inter, var(--ha-font-family-body, Roboto), system-ui, sans-serif";
const COLOR_OPTIONS = [{ value: "active", label: "Selected purple" }, ...Object.keys(COLORS).map((k) => ({ value: k, label: k[0].toUpperCase() + k.slice(1) })), { value: "custom", label: "My own colours" }];
const SIZES = { small: 128, medium: 152, large: 176 };

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
  }

  get hass() { return this._hass; }

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
      case "toggle": return this.call("homeassistant", "toggle", { entity_id: entityId });
      case "more-info": return this.moreInfo(a.entity || entityId);
      case "navigate":
        if (a.navigation_path) { history.pushState(null, "", a.navigation_path); this.fire("location-changed", { replace: false }); }
        return undefined;
      case "url": if (a.url_path) window.open(a.url_path, "_blank"); return undefined;
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
    return `:host{display:block;--roost-text:${p.text};--roost-muted:${p.muted};font-family:${FONT_TEXT}}
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
    if (d === "cover") { const pos = s.attributes.current_position; return cap(s.state) + (pos != null && pos > 0 && pos < 100 ? ` · ${pos}%` : ""); }
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
    const on = !un && !OFF_STATES.includes(s.state);
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
      .lb{font-size:12px;line-height:1.3;opacity:.85;margin-top:3px;color:${on ? "inherit" : p.muted}}
      .ago{font-size:11px;opacity:.65;margin-top:4px;color:${on ? "inherit" : p.muted}}
    </style>
    <div class="card" role="button" tabindex="0" aria-label="${esc(this.name(c.entity))}">
      <div class="ic"></div>
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
      return { icon: armed ? "mdi:shield-check" : "mdi:shield-off-outline", colour: s.state === "triggered" ? "#FF5C7A" : armed ? "#3DD68C" : "#FF5C7A", text: "" };
    }
    if (d === "lock") return { icon: s.state === "locked" ? "mdi:lock" : "mdi:lock-open-variant", colour: s.state === "locked" ? "#3DD68C" : "#FF9A3D", text: "" };
    if (d === "binary_sensor" && ["door", "window", "garage_door", "opening"].includes(cls)) {
      const open = s.state === "on";
      const icon = cls === "window" ? (open ? "mdi:window-open-variant" : "mdi:window-closed-variant") : (open ? "mdi:door-open" : "mdi:door-closed");
      return { icon, colour: open ? "#FF9A3D" : "#3DD68C", text: this._config.show_words ? (open ? "Open" : "Closed") : "", word: true };
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
    const h = { small: 40, medium: 48, large: 56 }[c.size] || 48;
    const lightsOn = lights.filter((id) => this.st(id)?.state === "on").length;
    const chips = [];
    singles.forEach((id) => {
      if (id.startsWith("media_player.") && OFF_STATES.concat(UNAVAILABLE).includes(this.st(id)?.state)) return; // a TV chip only while it is on
      chips.push({ key: id, ...this.chipFor(id), entity: id });
    });
    if (doors.length) {
      const open = doors.filter((id) => this.st(id)?.state === "on").length;
      chips.unshift({ key: "__doors", icon: open ? "mdi:door-open" : "mdi:door-closed", colour: open ? "#FF9A3D" : "#3DD68C", text: open ? String(open) : "", group: "doors", label: "Doors" });
    }
    if (climates.length) {
      const on = climates.filter((id) => this.st(id) && !OFF_STATES.concat(UNAVAILABLE).includes(this.st(id).state)).length;
      chips.push({ key: "__climates", icon: "mdi:snowflake", colour: on ? "#38BDF8" : p.muted, text: on ? String(on) : "", group: "climates", label: "Air conditioners" });
    }
    if (lights.length) chips.push({ key: "__lights", icon: lightsOn ? "mdi:lightbulb-on" : "mdi:lightbulb-outline", colour: lightsOn ? "#FCD34D" : p.muted, text: lightsOn ? String(lightsOn) : "", group: "lights" });
    if (people.length) chips.push({ key: "__people", people: true, group: "people" });
    const open = this._open;
    const initials = (id) => (this.st(id)?.attributes.friendly_name || id.split(".")[1]).split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const avatar = (id, i) => {
      const s = this.st(id), home = s?.state === "home", pic = s?.attributes.entity_picture;
      return `<span class="av" style="z-index:${10 - i};margin-left:${i ? -10 : 0}px;${home ? "" : "filter:grayscale(1);opacity:.55;"}background:${home ? "linear-gradient(135deg,#6D4BFF,#38BDF8)" : p.track}">${pic ? `<img src="${esc(pic)}" alt="">` : esc(initials(id))}</span>`;
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
      .row{${c.align === "stretch" ? "display:grid;grid-auto-flow:column;grid-auto-columns:minmax(max-content,1fr);gap:6px"
    : `display:flex;flex-wrap:wrap;gap:8px;justify-content:${c.align === "start" ? "flex-start" : "center"}`}}
      .chip{min-width:max-content;white-space:nowrap;height:${h}px;padding:0 ${c.align === "stretch" ? 6 : 14}px;border-radius:${c.chip_shape === "square" ? 10 : c.chip_shape === "rounded" ? 16 : 999}px;
        border:1px solid ${c.background === "none" ? "transparent" : p.border};background:${c.background === "none" ? "transparent" : c.background === "glass" ? "color-mix(in srgb, " + p.panel + " 60%, transparent);backdrop-filter:blur(14px)" : p.panel};
        color:${p.text};display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;font:inherit;font-size:14px;font-weight:600;-webkit-tap-highlight-color:transparent}
      .chip:active{transform:scale(.95)}
      :host{container-type:inline-size}
      @container (max-width: 340px){.row{gap:4px}.chip{padding:0 6px;gap:4px}.chip .word{display:none}.av{width:${h - 20}px;height:${h - 20}px}}
      .chip.on{outline:2px solid #8B6CFF}
      .chip ha-icon{--mdc-icon-size:${h > 48 ? 24 : 20}px}
      .av{width:${h - 16}px;height:${h - 16}px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;border:2px solid ${p.panel};overflow:hidden;position:relative}
      .av img{width:100%;height:100%;object-fit:cover}
      .list{margin-top:10px;border-radius:20px;border:1px solid ${p.border};background:${p.panel};padding:6px 14px}
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
      : `<button class="chip ${open && open === ch.group ? "on" : ""}" ${ch.group ? `data-g="${ch.group}"` : `data-e="${esc(ch.entity)}"`} aria-label="${esc(ch.entity ? this.name(ch.entity) : ch.label || "Lights")}">
          ${ch.icon ? `<ha-icon icon="${ch.icon}" style="color:${ch.colour}"></ha-icon>` : `<span class="ent" data-icon="${esc(ch.entity)}" style="color:${ch.colour};display:flex"></span>`}
          ${ch.text ? `<span class="${ch.word ? "word" : "num"}">${esc(ch.text)}</span>` : ""}</button>`).join("")}</div>
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
      .card{border-radius:${c.radius}px;padding:18px;background:${p.panel};border:1px solid ${p.border};color:${p.text}}
      .hd{display:flex;align-items:center;justify-content:space-between;gap:10px}
      .hd .n{font-size:15px;font-weight:600}
      .pill{font-size:12px;font-weight:600;padding:6px 12px;border-radius:999px;background:${on ? `${g[0]}33` : p.inset};color:${on ? g[1] : p.muted}}
      svg{width:100%;max-width:${c.max_width}px;display:block;margin:4px auto;touch-action:none;user-select:none;-webkit-user-select:none;cursor:${noTemp || un ? "default" : "pointer"}}
      svg.on{animation:roost-arc 3s ease-in-out infinite}
      .ctl{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px;margin-top:6px}
      .rb{width:52px;height:52px;border-radius:50%;border:0;background:${p.inset};color:${p.text};display:flex;align-items:center;justify-content:center;cursor:pointer}
      .rb.pw{width:64px;height:64px;background:${on ? `linear-gradient(135deg,${g[0]},${g[1]})` : p.inset};color:${on ? "#fff" : p.text};box-shadow:${on ? `0 12px 28px -10px ${g[2]}` : "none"}}
      .rb:active{transform:scale(.94)}
      .mi{justify-self:end}.pl{justify-self:start}
      .modes{display:grid;grid-template-columns:repeat(${Math.max(1, modes.length)},minmax(0,1fr));gap:8px;margin-top:14px}
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
        ${round ? `display:flex;flex-direction:column;align-items:center;gap:7px;padding:2px;color:${p.text}`
    : `min-height:${h}px;height:100%;border-radius:${c.radius}px;padding:14px;display:flex;flex-direction:column;justify-content:space-between;gap:8px;
          background:${look.bg};color:${look.fg};border:${c.fill === "outline" ? 2 : 1}px solid ${look.border};box-shadow:${look.shadow};${look.blur ? "backdrop-filter:blur(14px);" : ""}`}}
      .card:active{transform:scale(.95)}
      .ic{display:flex;align-items:center;justify-content:center;flex:none;
        ${round ? `width:${bs}px;height:${bs}px;border-radius:${shapeRadius(c.shape, bs)};background:${look.bg};color:${look.light ? look.fg : g[this.dark ? 1 : 0]};
          border:${c.fill === "outline" ? 2 : 1}px solid ${look.border};box-shadow:${look.shadow};${look.blur ? "backdrop-filter:blur(14px);" : ""}`
    : `width:34px;height:34px;border-radius:12px;background:${look.light ? "rgba(255,255,255,.22)" : `color-mix(in srgb, ${g[0]} 30%, transparent)`}`}}
      .ic ha-icon,.ic ha-state-icon{--mdc-icon-size:${round ? Math.round(bs * 0.4) : 18}px}
      .nm{font-size:${round ? 11 : 14}px;font-weight:${round ? 600 : 700};line-height:1.2;text-align:${round ? "center" : "left"}${round ? ";margin:0 -6px;letter-spacing:-.1px" : ""}}
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
  static get defaults() { return { sky: "auto", sun: "sun.sun", show_date: true, show_clock: true, show_orb: true, show_stars: true, show_sheen: true, min_height: 180, upcoming: [], upcoming_title: "Next", radius: 26, theme: "auto" }; }

  watched() { return [this._config.weather, this._config.sun, ...(this._config.upcoming || []).map((u) => u.entity)].filter(Boolean); }

  extraSignature() { return Math.floor(Date.now() / 30000); }

  connectedCallback() { this._timer = setInterval(() => { if (this._hass) this.hass = this._hass; }, 30000); }

  disconnectedCallback() { clearInterval(this._timer); }

  static getConfigForm() {
    return {
      schema: [
        { name: "title", selector: { text: {} } },
        { name: "weather", selector: { entity: { domain: "weather" } } },
        { type: "grid", name: "", schema: [{ name: "show_clock", selector: { boolean: {} } }, { name: "show_date", selector: { boolean: {} } }] },
        { type: "expandable", name: "", title: "What's next pill", icon: "mdi:clock-outline", schema: [
          { name: "upcoming_title", label: "Pill title (for example “Next prayer”)", selector: { text: {} } },
          { name: "upcoming", label: "Times to count down to (the soonest is shown)", selector: { object: { multiple: true, label_field: "name", fields: {
            name: { label: "Name", required: true, selector: { text: {} } },
            entity: { label: "Time (a date/time sensor)", required: true, selector: { entity: { domain: ["sensor", "input_datetime", "calendar"] } } },
          } } } },
        ] },
        { type: "expandable", name: "", title: "Sky and shape", icon: "mdi:palette", schema: [
          { name: "sky", label: "Background", selector: { select: { mode: "dropdown", options: [{ value: "auto", label: "Sky that follows the sun" }, ...COLOR_OPTIONS] } } },
          { name: "sky_start", label: "First colour (my own colours)", selector: { color_rgb: {} } },
          { name: "sky_end", label: "Second colour (my own colours)", selector: { color_rgb: {} } },
          { name: "sun", label: "Sun (for day and night)", selector: { entity: { domain: "sun" } } },
          { type: "grid", name: "", schema: [{ name: "radius", selector: slider(0, 40, 2) }, { name: "min_height", selector: slider(120, 280, 10) }] },
          { type: "grid", name: "", schema: [{ name: "show_orb", selector: { boolean: {} } }, { name: "show_stars", selector: { boolean: {} } }, { name: "show_sheen", selector: { boolean: {} } }] },
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
    const part = hr < 5 ? "Good night" : hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
    const who = c.title || (this._hass.user?.name || "").split(" ")[0];
    const w = this.st(c.weather);
    const temp = w?.attributes.temperature;
    const unit = (w?.attributes.temperature_unit || "°C").replace(/^°?/, "°");
    const cond = w && !UNAVAILABLE.includes(w.state) ? w.state.replace("clear-night", "clear").replace("partlycloudy", "partly cloudy").replace(/-/g, " ") : "";
    const sky = c.sky === "auto" || !c.sky
      ? (day ? "linear-gradient(115deg,#2563EB 0%,#60A5FA 50%,#FDBA74 100%)" : "linear-gradient(115deg,#1B1E52 0%,#38287E 52%,#7A3A90 100%)")
      : (() => { const g = this.colour("sky"); return `linear-gradient(115deg,${g[0]} 0%,${g[1]} 100%)`; })();
    let stars = "";
    if (!day && c.show_stars) for (let j = 0; j < 22; j++) stars += `<span class="star" style="left:${(j * 37 + 11) % 96}%;top:${(j * 53 + 7) % 88}%;width:${1 + (j % 3)}px;height:${1 + (j % 3)}px;animation-duration:${2.4 + (j % 5) * 0.7}s;animation-delay:${((j * 0.37) % 3).toFixed(2)}s"></span>`;
    const orb = day ? "background:radial-gradient(circle at 40% 40%,#FFF7D6,#FDE047 55%,#F59E0B);box-shadow:0 0 50px 16px rgba(253,224,71,.45)"
      : "background:radial-gradient(circle at 36% 34%,#FFFBEA 0%,#F6E3A6 62%,#E2C273 100%);box-shadow:0 0 40px 12px rgba(255,234,170,.28)";
    const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const date = now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });
    const top = [c.show_date ? date : "", c.show_clock ? time : ""].filter(Boolean).join(" · ");
    const nx = this.nextUp();
    let pill = "";
    if (nx) {
      const dm = Math.max(0, Math.round((nx.t - now.getTime()) / 60000));
      const left = `${Math.floor(dm / 60) ? `${Math.floor(dm / 60)}h ` : ""}${dm % 60}m`;
      const at = new Date(nx.t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      pill = `<div class="pill"><span class="dot"><span></span></span><span class="t" style="flex:1">${esc(c.upcoming_title || "Next")} <b>${esc(nx.name)}</b> at ${esc(at)}</span><b class="num">in ${esc(left)}</b></div>`;
    }
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .card{position:relative;overflow:hidden;border-radius:${c.radius}px;padding:20px;min-height:${Number(c.min_height) || 180}px;color:#fff;background:${sky}}
      .star{position:absolute;border-radius:50%;background:#fff;animation:roost-twinkle 3s ease-in-out infinite}
      .sheen{position:absolute;top:0;bottom:0;left:0;width:70px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.12),rgba(255,255,255,0));animation:roost-sheen 8s ease-in-out 1s infinite;pointer-events:none}
      .orb{position:absolute;right:24px;top:22px;width:56px;height:56px;border-radius:50%;${orb};animation:roost-float 6s ease-in-out infinite}
      .body{position:relative;display:flex;flex-direction:column;gap:8px}
      .top{font-size:13px;opacity:.85}
      .hi{font-size:27px;font-weight:700;letter-spacing:-.4px;line-height:1.15;padding-right:${c.show_orb ? 68 : 0}px;font-family:${FONT_NUM}}
      .wx{font-size:14px;line-height:1.5;opacity:.9;cursor:${w ? "pointer" : "default"}}
      .pill{display:flex;align-items:center;gap:10px;background:rgba(10,8,40,.3);border-radius:16px;padding:10px 12px;margin-top:6px;font-size:13px;line-height:1.35}
      .pill b.num{font-size:14px;flex:none}
      .dot{position:relative;width:10px;height:10px;border-radius:50%;background:#E9E2FF;flex:none}
      .dot span{position:absolute;inset:0;border-radius:50%;background:#E9E2FF;animation:roost-ping 1.8s ease-out infinite}
    </style>
    <div class="card">${stars}${c.show_sheen ? '<span class="sheen"></span>' : ""}${c.show_orb ? '<span class="orb"></span>' : ""}
      <div class="body">
        ${top ? `<span class="top t">${esc(top)}</span>` : ""}
        <span class="hi t">${esc(part)}${who ? `, ${esc(who)}` : ""}</span>
        ${w && temp != null ? `<span class="wx t">${esc(Math.round(temp) + unit)}${cond ? ` · ${esc(cond)}` : ""}</span>` : ""}
        ${pill}
      </div></div>`;
    const wx = this.shadowRoot.querySelector(".wx");
    if (wx) wx.addEventListener("click", () => this.moreInfo(c.weather));
  }
}

// ------------------------------------------------------------------ Roost Nav
// A bottom bar on phones and a side rail on tablets ("auto"), or always one of them.
class RoostNav extends RoostBase {
  static get defaults() { return { items: [], layout: "auto", show_labels: true, fixed: true, color: "active", active_style: "filled", background: "glass", bar_height: 54, icon_size: 22, radius: 26, theme: "auto" }; }

  validate(c) { if (!Array.isArray(c.items) || !c.items.length) throw new Error("Add at least one button"); }

  watched() { return []; }

  extraSignature() { return `${location.pathname}${location.hash}|${window.innerWidth >= 768}`; }

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

  active(path) {
    const here = `${location.pathname}${location.hash}`;
    if (path.startsWith("#")) return location.hash === path || (!location.hash && this._config.items[0]?.path === path);
    return here === path || location.pathname === path;
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour();
    const rail = c.layout === "rail" || (c.layout === "auto" && window.innerWidth >= 768);
    const pos = c.fixed ? (rail ? "position:fixed;left:16px;top:50%;transform:translateY(-50%);z-index:4" : "position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:4") : "";
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      :host{${c.fixed ? (rail ? "height:0;" : "height:calc(76px + env(safe-area-inset-bottom));") : ""}display:block}
      nav{${pos};display:${rail ? "flex" : "grid"};${rail ? "flex-direction:column" : `grid-template-columns:repeat(${c.items.length},minmax(0,1fr))`};gap:${rail ? 12 : 4}px;padding:${rail ? "14px 10px" : "7px"};border-radius:${Number(c.radius) + (rail ? 2 : 0)}px;
        ${c.background === "none" ? "background:transparent;border:0;" : c.background === "solid" ? `background:${this.dark ? "#141831" : "#FFFFFF"};border:1px solid ${p.border};box-shadow:0 18px 40px -16px rgba(0,0,0,.5);`
    : `background:linear-gradient(180deg, ${g[0]}24, transparent 70%), ${p.panel};border:1px solid ${g[0]}47;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 18px 40px -12px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.04) inset;`}
        ${rail ? "width:max-content" : `width:${c.fixed ? "calc(100vw - 24px)" : "100%"};max-width:536px`};${c.fixed ? "" : "margin:0 auto"}}
      a{position:relative;min-width:${rail ? 56 : 0}px;min-height:${Number(c.bar_height) || 54}px;border-radius:${c.active_style === "pill" ? 999 : Math.max(8, Number(c.radius) - 8)}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
        color:${p.muted};text-decoration:none;font-size:10.5px;font-weight:600;-webkit-tap-highlight-color:transparent;padding:4px 6px;transition:background .12s}
      ${{
    filled: `a.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};box-shadow:0 10px 22px -8px ${g[2]}}`,
    pill: `a.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};box-shadow:0 10px 22px -8px ${g[2]}}`,
    soft: `a.on{background:${g[0]}2E;color:${g[this.dark ? 1 : 0]}}`,
    line: `a.on{color:${g[this.dark ? 1 : 0]}}a.on::after{content:"";position:absolute;bottom:3px;left:30%;right:30%;height:3px;border-radius:3px;background:linear-gradient(90deg,${g[0]},${g[1]})}`,
    dot: `a.on{color:${g[this.dark ? 1 : 0]}}a.on::after{content:"";position:absolute;bottom:3px;left:50%;width:6px;height:6px;margin-left:-3px;border-radius:50%;background:${g[1]};box-shadow:0 0 8px ${g[2]}}`,
    icon: `a.on{color:${g[this.dark ? 1 : 0]}}a.on ha-icon{filter:drop-shadow(0 0 6px ${g[2]})}`,
  }[c.active_style] || ""}
      a:active{transform:scale(.94)}
      a ha-icon{--mdc-icon-size:${Number(c.icon_size) || 22}px}
      @media (max-width: 360px){nav{gap:2px;padding:6px}a{min-width:48px;padding:4px 2px}}
    </style>
    <nav aria-label="Navigation">${c.items.map((it, i) => `<a href="${esc(it.path)}" data-i="${i}" class="${this.active(it.path) ? "on" : ""}" aria-label="${esc(it.name || it.path)}">
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

  getCardSize() { return this._config?.fixed ? 0 : 1; }
}

// ------------------------------------------------------------------ Roost Row
// A long row: a ring with the number (an AC's set temperature, or any sensor), a name, a short state line and an arrow.
class RoostRow extends RoostBase {
  static get defaults() { return { color: "blue", min: 16, max: 30, radius: 22, ring_size: 64, ring_width: 6, tap_action: { action: "more-info" }, theme: "auto" }; }

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
    if (Number.isFinite(n)) return { value: n, text: `${Math.round(n * 10) / 10}${a.unit_of_measurement && a.unit_of_measurement.length <= 2 ? a.unit_of_measurement : ""}`, line: a.unit_of_measurement && a.unit_of_measurement.length > 2 ? `${n} ${a.unit_of_measurement}` : "" };
    return { value: null, text: null, line: s.state.charAt(0).toUpperCase() + s.state.slice(1) };
  }

  render() {
    if (!this._hass || !this._config) return;
    const c = this._config, p = this.p, g = this.colour(), s = this.st();
    const un = !s || UNAVAILABLE.includes(s.state);
    const r = s && !un ? this.reading(s) : { value: null, text: null, line: s ? "Offline" : "Device not found" };
    const mn = r.min ?? c.min, mx = r.max ?? c.max;
    const f = r.value == null ? 0 : Math.max(0, Math.min(1, (r.value - mn) / (mx - mn || 1)));
    const rs = Math.max(40, Number(c.ring_size) || 64), rw = Math.max(2, Number(c.ring_width) || 6);
    const R = 32 - rw / 2 - 3, C = 2 * Math.PI * R, L = C * 0.75;
    const on = s && !un && !OFF_STATES.includes(s.state);
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .row{display:flex;align-items:center;gap:16px;padding:14px 18px 14px 14px;border-radius:${c.radius}px;background:${p.panel};border:1px solid ${p.border};color:${p.text};cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .12s;opacity:${un ? 0.55 : 1}}
      .row:active{transform:scale(.98)}
      .ring{position:relative;width:${rs}px;height:${rs}px;flex:none;display:flex;align-items:center;justify-content:center}
      .ring svg{position:absolute;inset:0}
      .ring .v{font-size:${Math.round(rs * 0.3)}px;font-weight:700;font-family:${FONT_NUM}}
      .ring ha-icon{--mdc-icon-size:24px;color:${on ? g[1] : p.muted}}
      .tx{flex:1;min-width:0}
      .n{font-size:17px;font-weight:600;line-height:1.25}
      .l{font-size:13.5px;color:${p.muted};margin-top:3px;line-height:1.3}
      .ch{flex:none;color:${p.muted};--mdc-icon-size:22px}
    </style>
    <div class="row" role="button" tabindex="0" aria-label="${esc(this.name(c.entity))}">
      <span class="ring"><svg viewBox="0 0 64 64"><defs><linearGradient id="rg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${g[0]}"/><stop offset="1" stop-color="${g[1]}"/></linearGradient></defs>
        <circle cx="32" cy="32" r="${R}" fill="none" stroke="${p.track}" stroke-width="${rw}" stroke-linecap="round" stroke-dasharray="${L.toFixed(1)} ${C.toFixed(1)}" transform="rotate(135 32 32)"/>
        ${f > 0 ? `<circle cx="32" cy="32" r="${R}" fill="none" stroke="${on ? "url(#rg)" : p.tick}" stroke-width="${rw}" stroke-linecap="round" stroke-dasharray="${(L * f).toFixed(1)} ${C.toFixed(1)}" transform="rotate(135 32 32)"/>` : ""}</svg>
        ${c.icon || r.text == null ? `<ha-icon icon="${esc(c.icon || "mdi:information-outline")}"></ha-icon>` : `<span class="v">${esc(r.text)}</span>`}</span>
      <span class="tx"><div class="n t">${esc(this.name(c.entity))}</div>${r.line ? `<div class="l t">${esc(r.line)}</div>` : ""}</span>
      <ha-icon class="ch" icon="mdi:chevron-right"></ha-icon>
    </div>`;
    this.press(this.shadowRoot.querySelector(".row"), () => this.run(c.tap_action, c.entity), () => this.moreInfo(c.entity));
  }
}

// ------------------------------------------------------------------ Roost Rooms
// A row of room pills; the chosen room's cards show below. Switching is instant (all rooms are built once).
class RoostRooms extends RoostBase {
  static get defaults() { return { rooms: [], columns: 2, color: "active", show_names: "active", active_style: "filled", background: "solid", theme: "auto" }; }

  validate(c) { if (!Array.isArray(c.rooms) || !c.rooms.length) throw new Error("Add at least one room"); }

  setConfig(config) {
    super.setConfig(config);
    this._built = null;
    if (this._active == null || this._active >= this._config.rooms.length) this._active = 0;
  }

  set hass(hass) {
    this._hass = hass;
    (this._cards || []).flat().forEach((el) => { el.hass = hass; });
    const sig = `${this.dark ? 1 : 0}|${this._active}`;
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
          cards: { label: "Cards in this room (YAML list)", selector: { object: {} } },
        } } } },
        { type: "grid", name: "", schema: [
          { name: "columns", label: "Cards per row", selector: { number: { min: 1, max: 6, mode: "box" } } },
          { name: "show_names", label: "Room names on the pills", selector: { select: { mode: "dropdown", options: [
            { value: "active", label: "Only on the chosen room" }, { value: "all", label: "On every room" }, { value: "none", label: "Icons only" }] } } },
        ] },
        ...colourFields("color", "Colour of the chosen room"),
        { type: "grid", name: "", schema: [
          { name: "active_style", label: "How the chosen room looks", selector: pick([["filled", "Filled with glow"], ["soft", "Soft tint"], ["line", "Line under it"]]) },
          { name: "background", label: "Bar background", selector: pick([["solid", "Solid"], ["glass", "See-through glass"], ["none", "None"]]) },
        ] },
        THEME_FIELD,
      ],
      computeLabel,
    };
  }

  static getStubConfig(hass) {
    const lights = Object.keys(hass.states).filter((id) => id.startsWith("light.")).slice(0, 4);
    return { rooms: [
      { name: "Living", icon: "mdi:sofa", cards: lights.slice(0, 2).map((entity) => ({ type: "custom:roost-tile", entity })) },
      { name: "Bedroom", icon: "mdi:bed", cards: lights.slice(2, 4).map((entity) => ({ type: "custom:roost-tile", entity })) },
    ] };
  }

  getGridOptions() { return { columns: 12, rows: "auto" }; }

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
    this._cards = this._config.rooms.map((room) => (Array.isArray(room.cards) ? room.cards : []).map(make));
    this._built = true;
    this._sig = null;
    this.render();
  }

  render() {
    if (!this._config) return;
    if (!this._built) { if (!this._building) { this._building = true; this.build().finally(() => { this._building = false; }); } return; }
    const c = this._config, p = this.p, g = this.colour();
    const showName = (i) => c.show_names === "all" || (c.show_names === "active" && i === this._active);
    this.shadowRoot.innerHTML = `<style>${this.baseCss()}
      .bar{border-radius:999px;border:1px solid ${c.background === "none" ? "transparent" : p.border};background:${c.background === "none" ? "transparent" : c.background === "glass" ? `color-mix(in srgb, ${p.panel} 60%, transparent);backdrop-filter:blur(14px)` : p.panel};padding:4px;margin-bottom:12px}
      .pills{display:flex;gap:2px;justify-content:space-between;overflow-x:auto;scrollbar-width:none}
      .pills::-webkit-scrollbar{display:none}
      .pill{flex:0 0 auto;min-height:44px;min-width:52px;border-radius:999px;border:0;background:transparent;color:${p.muted};
        display:flex;align-items:center;justify-content:center;gap:8px;padding:0 14px;font:inherit;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;-webkit-tap-highlight-color:transparent}
      ${c.active_style === "soft" ? `.pill.on{background:${g[0]}2E;color:${g[this.dark ? 1 : 0]}}`
    : c.active_style === "line" ? `.pill{position:relative}.pill.on{color:${g[this.dark ? 1 : 0]}}.pill.on::after{content:"";position:absolute;bottom:4px;left:28%;right:28%;height:3px;border-radius:3px;background:linear-gradient(90deg,${g[0]},${g[1]})}`
      : `.pill.on{background:linear-gradient(135deg,${g[0]},${g[1]});color:${g[3]};box-shadow:0 10px 24px -12px ${g[2]}}`}
      .pill:active{transform:scale(.95)}
      .pill ha-icon{--mdc-icon-size:22px}
      .room{display:grid;grid-template-columns:repeat(${Math.max(1, c.columns)},minmax(0,1fr));gap:12px}
      .room[hidden]{display:none}
      .room > *{min-width:0}
      .room > .wide{grid-column:1/-1}
    </style>
    <div class="bar"><div class="pills" role="tablist">${c.rooms.map((r, i) => `<button class="pill ${i === this._active ? "on" : ""}" role="tab" aria-selected="${i === this._active}" data-i="${i}" aria-label="${esc(r.name)}">
      ${r.icon ? `<ha-icon icon="${esc(r.icon)}"></ha-icon>` : ""}${showName(i) || !r.icon ? `<span>${esc(r.name)}</span>` : ""}</button>`).join("")}</div></div>
    ${c.rooms.map((r, i) => `<div class="room" data-room="${i}" ${i === this._active ? "" : "hidden"}></div>`).join("")}`;
    this.shadowRoot.querySelectorAll(".room").forEach((box) => {
      const i = +box.dataset.room;
      (this._cards[i] || []).forEach((el, k) => {
        const cfg = c.rooms[i].cards[k] || {};
        const wrap = document.createElement("div");
        if (cfg.wide || cfg.grid_options?.columns === "full" || cfg.grid_options?.columns === 12) wrap.className = "wide";
        wrap.appendChild(el);
        box.appendChild(wrap);
      });
    });
    this.shadowRoot.querySelectorAll(".pill").forEach((b) => b.addEventListener("click", () => {
      this._active = +b.dataset.i;
      this.vibrate();
      this.hass = this._hass || {};
    }));
  }

  getCardSize() { return 6; }
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
