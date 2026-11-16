# Roost Cards

Beautiful dashboard cards for Home Assistant, made for **phones and tablets**.
Every card has a **visual editor**: pick the device, colours, size, icon and shape. No code needed.

| Card | What it is |
|---|---|
| **Roost Tile** | A big tile with a switch. Shows the state, the power used and how long it has been on. Glows or spins when on. |
| **Roost Chips** | Status chips in one row: doors, alarm, air conditioner, TV. Lights become one bulb with a count, people become little bubbles (colour = home, grey = away). Tap the bulb or the bubbles for the list. |
| **Roost Thermostat** | An air conditioner card with a **dial you drag with your finger**, a power button, − and +, and mode buttons. |
| **Roost Scene** | A coloured card or round button that runs a scene or script. A tick shows when it is done. |
| **Roost Hero** | A greeting with a sky that follows the sun (stars at night), the time, date, weather and a "what's next" countdown. |
| **Roost Row** | A long row with a ring (an AC's temperature or any number), a name, a state line and an arrow. |
| **Roost Nav** | Icon navigation: a bar at the bottom on phones, a rail at the side on tablets. |
| **Roost Rooms** | A room switcher: tap a room pill and that room's cards appear below, instantly. |

All cards follow Home Assistant's light or dark mode (or stay always light or always dark), and their text is never cut off: it moves to the next line instead.
Every card follows the [design rules](DESIGN_RULES.md), and the most important ones are checked automatically before each release.

---

## Install

### With HACS (easiest)
1. Open **HACS** → the three dots at the top right → **Custom repositories**.
2. Paste this repository's address, choose **Dashboard**, and tap **Add**.
3. Find **Roost Cards** in HACS and tap **Download**.
4. Refresh your dashboard (on a phone, pull down; on a computer, reload the page).

### By hand
1. Download `roost-cards.js` from the latest release.
2. Put it in your Home Assistant `config/www` folder.
3. Go to **Settings → Dashboards → ⋮ → Resources → Add resource**, enter `/local/roost-cards.js`, choose **JavaScript module**, and save.
4. Refresh your dashboard.

## Use

Edit a dashboard, tap **Add card**, and search for **Roost**. Choose a card, then set it up in the editor.

Every card has these colour and look settings:
- **Colour**: Blue, Purple, Coral, Green, Amber, Teal, Pink, Slate, or **My own colours** (pick two colours for the gradient).
- **Light or dark**: follow Home Assistant, always dark, or always light.
- **Size** and **corner roundness** (on tiles, scenes and the thermostat).
- **Look when on** (tiles and scenes): colour fade, one colour, see-through glass, or a coloured outline only. **Glow**: soft, strong or none.
- **Icon box** (tiles): rounded square, circle, square, or no box. Icon size and name size are sliders.

### Roost Tile
```yaml
type: custom:roost-tile
entity: light.kitchen
name: Kitchen          # optional
icon: mdi:ceiling-light # optional
color: amber           # or "custom" with color_start / color_end
size: large            # small, medium or large
radius: 22             # corner roundness in px
animation: auto        # auto, none, glow, spin, pulse, bounce, wiggle or bars
fill: gradient         # gradient, solid, glass or outline
glow: soft             # soft, strong or none
icon_shape: rounded    # rounded, circle, square or none
icon_size: 22          # px
name_size: 15          # px
align: left            # left or center
off_tint: false        # true: a hint of the colour when off
show_state: true       # "On · 78%"
problem: ""            # e.g. "Not working · battery" greys the tile out
show_switch: true
show_since: true       # "for 5 min"
power_entity: sensor.kitchen_power   # optional
locked: false          # true: no switch, shows a lock (for things that must stay on)
confirm: false         # true: asks before switching (for things that affect many devices)
tap_action: { action: toggle }
hold_action: { action: more-info }
```

### Roost Chips
```yaml
type: custom:roost-chips
entities:
  - binary_sensor.front_door
  - alarm_control_panel.home
  - climate.living_room
  - light.kitchen        # all lights become one bulb with a count
  - light.hall
  - person.sam           # all people become bubbles
  - person.ali
size: medium             # small, medium or large
align: stretch           # stretch (one row, equal sizes; default), center or start
chip_shape: pill      # pill, rounded or square
background: solid     # solid, glass or none
```

### Roost Thermostat
```yaml
type: custom:roost-thermostat
entity: climate.living_room
sensor: sensor.living_room_temperature   # optional, shows "Room 27.5°"
color: blue
modes: [cool, dry, fan_only, heat_cool]
show_power: true
show_plus_minus: true
max_width: 260           # dial size in px
```
Drag the knob or tap anywhere on the ring. The number follows your finger, and the temperature is sent when you let go.

### Roost Scene
```yaml
type: custom:roost-scene
entity: scene.movie_night
color: purple
style: card              # card, or round (round button with the name under it)
size: large
shape: rounded        # round style: rounded, circle or square
button_size: 58       # round style, px
fill: gradient        # gradient, solid, glass or outline
show_name: true
```

### Roost Hero
```yaml
type: custom:roost-hero
weather: weather.home
title: Sam               # optional; otherwise the signed-in person's first name
show_clock: true
show_date: true
sky: auto                # auto (follows the sun), or any colour
upcoming_title: Next prayer
upcoming:                # the soonest of these times is counted down
  - { name: Fajr, entity: sensor.fajr_prayer }
  - { name: Maghrib, entity: sensor.maghrib_prayer }
show_orb: true
show_stars: true
show_sheen: true
min_height: 180
```

### Roost Row
```yaml
type: custom:roost-row
entity: climate.living_room
name: Living Room climate
color: blue              # ring colour
min: 16                  # for sensors: where the ring starts and is full
max: 30
tap_action: { action: navigate, navigation_path: "#living" }
ring_size: 64
ring_width: 6
```

### Roost Nav
```yaml
type: custom:roost-nav
layout: auto             # auto (bar on phones, rail on tablets), bar or rail
show_labels: false       # icons only, or names under the icons
fixed: true              # stick to the bottom (bar) or the side (rail)
items:
  - { icon: mdi:home, path: "#home", name: Home }
  - { icon: mdi:view-grid, path: "#rooms", name: Rooms }
  - { icon: mdi:shield-home, path: /lovelace/security, name: Security }
show_labels: true     # names under the icons
active_style: filled  # filled, soft, pill, line, dot or icon
background: glass     # glass, solid or none
bar_height: 54
icon_size: 22
```

### Roost Rooms
```yaml
type: custom:roost-rooms
columns: 2               # cards per row
show_names: active       # active (only the chosen room), all, or none (icons only)
color: active            # the selected purple; or any colour
rooms:
  - name: Living
    icon: mdi:sofa
    cards:
      - { type: custom:roost-tile, entity: light.living_room }
      - { type: custom:roost-tile, entity: switch.tv }
      - { type: custom:roost-thermostat, entity: climate.living_room, wide: true }
  - name: Bedroom
    icon: mdi:bed
    cards:
      - { type: custom:roost-tile, entity: light.bedroom }
active_style: filled  # filled, soft or line
background: solid     # solid, glass or none
```

## Keep your Home Assistant up to date automatically

Install Roost Cards through HACS (see *Install*). Then this automation installs every new version by itself, as soon as it is released:
```yaml
alias: Keep Roost Cards up to date
triggers:
  - trigger: state
    entity_id: update.roost_cards_update
    to: "on"
actions:
  - action: update.install
    target:
      entity_id: update.roost_cards_update
```
After an update, pull down on your phone (or reload the page) to see it.

## Problems?

| What you see | What to do |
|---|---|
| "Custom element doesn't exist: roost-…" | The file is not loaded yet. Check the resource (see *Install*) and refresh the page. On a phone, close the app fully and open it again. |
| A card says "Device not found" | The device was renamed or removed. Choose it again in the card editor. |
| The thermostat has no knob | That air conditioner has no temperature setting in Home Assistant. |

## For developers

The whole library is one file, `dist/roost-cards.js`, with no build step. To check it:
```
npm install
npm test
```
Releases are made automatically when the version in `package.json` goes up; the notes come from `CHANGELOG.md`.

## License

GPL-3.0. See [LICENSE](LICENSE).
