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
| **Roost Curtain** | A window with curtains that really slide open and closed, a sky behind them, and Open / Stop / Close buttons. |
| **Roost Gauge** | A big ring for one reading (a cabinet's temperature, a plug's power). Turns orange and glows when too high, with a second reading under it. |
| **Roost Graph** | A smooth line of a reading over the last hours, with the lowest and highest. |
| **Roost Room** | One room at a glance: temperature bar, humidity and what is on, open or running. Tap to open the room. |
| **Roost Light** | A light with brightness you drag, warm / neutral / cool buttons and colour dots. |
| **Roost Media** | TV and sound: power, what is playing (with moving sound bars), volume you drag, mute, play/pause and inputs. |
| **Roost Alarm** | The alarm in a big shield: arm and disarm with a question first, a keypad when it needs a code, and the doors. |
| **Roost People** | Who is home: a picture or initials with a green ring when home, and for how long. |
| **Roost Automations** | A list of automations with a switch, when each last ran, and an optional "run now" button. |
| **Roost Clock** | A big clock and date with a line of the day's times (such as prayer times) and a countdown to the next one. |
| **Roost Alerts** | Only shows when something needs you: a low battery, a device gone offline, a door left open, or your own rules. |
| **Roost Title** | A section heading with an optional line under it, a badge and a "See all" link. |
| **Roost Light/Dark** | A sun / moon button that switches this screen between light and dark. |
| **Roost Remote** | A remote-control pad (power, arrows, OK, volume, channels, numbers) for an Athom Hub remote, any remote, or a TV. Keys it cannot send are greyed out. |
| **Roost Presence Map** | The room from above as a presence radar sees it (for example the LD2450 in an Athom sensor): people as glowing moving dots, and its zones with how many are inside. |
| **Roost Weather** | The weather now on an animated sky (rain falls, clouds drift, storms flash, stars at night), and the next days or hours. |
| **Roost Energy** | Power used now, today against yesterday, and the hungriest devices as bars. |
| **Roost Timer** | A countdown ring for a timer (kettle, washing) with start, pause, cancel and quick times. |
| **Roost Fan** | A fan that spins as fast as it is set, with speed buttons, swing and its modes. |
| **Roost Lock** | A lock or garage door: slide to unlock, tap to lock; says when it is jammed. |
| **Roost Agenda** | Today's and the next days' calendar events. Bin day (or any word you choose) stands out. |
| **Roost To-do** | A to-do or shopping list: tick off, add and clear. |
| **Roost Camera** | A camera picture or live video, with a banner when someone rings the doorbell. |
| **Roost Sensors** | Many small readings in neat squares, orange when out of the range you set. |
| **Roost Buttons** | Several small actions in one rounded bar; a button lights up when its device is on. |
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
greeting: ""             # empty = Good morning / afternoon / evening
show_greeting: true
show_name: true
greeting_size: 27
align: left             # left or center
show_weather: true
info:                   # small readings under the weather
  - entity: sensor.inside_temperature
    name: Inside
sky: auto               # auto, day, night, sunrise, sunset, ocean, aurora, desert, a colour or custom
orb_size: 56
pill_style: glass       # glass, light or none
tap_action: { action: none }
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
rooms:
  - name: Living
    icon: mdi:sofa
    color: teal            # optional, this room's button colour
    entities:              # each device becomes a tile, coloured by type
      - light.living
      - climate.living_ac
      - cover.living_curtain
    cards:                 # optional extra cards
      - type: custom:roost-row
        entity: climate.living_ac
        wide: true
  - name: Bedroom
    icon: mdi:bed-king
    entities: [light.bedroom]
show_names: active         # active, all or none
pill_shape: pill           # pill, rounded or square
pill_height: 44
pill_icon_size: 22
pill_align: spread         # spread, start or center
show_count: false          # badge: how many things are on
active_style: filled       # filled, soft or line
background: solid          # solid, glass or none
columns: 2
gap: 12
tile_size: large
tile_fill: gradient
tile_glow: soft
tile_radius: 22
auto_colors: true
swipe: true
remember: true
start_room: ""
```

### Roost Curtain
```yaml
type: custom:roost-curtain
entity: cover.living_room
name: Curtains          # optional
color: coral            # fabric colour
style: pair             # pair, left, right or blind
height: 150
radius: 18
travel_time: 1.4        # seconds the slide takes on screen
background: sky         # sky, weather, picture or none
weather: weather.home   # for background: weather
image: /local/view.jpg  # for background: picture
image_night: ""         # optional night picture
show_weather_text: true
show_header: true
show_buttons: true
show_percent: true
reverse: false          # true: the curtain reports open/closed the wrong way round
tap_action: { action: toggle }
stop_action:            # optional: what Stop does as well as stopping the curtain
  action: perform-action
  perform_action: script.turn_on
  target: { entity_id: script.curtain_stop }
```

### Roost Gauge
```yaml
type: custom:roost-gauge
entity: sensor.cabinet_temperature
title: Cabinet           # small word in the ring
min: 20
max: 45
warn: 32                 # orange from here (warn_below for too low)
second: sensor.cabinet_humidity
second_name: Humidity
```

### Roost Graph
```yaml
type: custom:roost-graph
entity: sensor.plug_power
hours: 24
color: blue
height: 90
```

### Roost Room
```yaml
type: custom:roost-room
name: Living room
temperature: sensor.living_temperature
humidity: sensor.living_humidity
entities: [light.living, climate.living_ac, cover.living_curtain, media_player.tv]
style: row               # row or card
tap_action: { action: navigate, navigation_path: "#living" }
```

### Roost Light
```yaml
type: custom:roost-light
entity: light.desk_lamp
show_presets: true       # warm / neutral / cool
show_colors: true
```

### Roost Media
```yaml
type: custom:roost-media
entity: media_player.living_room_tv
volume_entity: media_player.soundbar   # optional
power_entity: switch.tv_plug           # optional
max_sources: 6
```

### Roost Alarm
```yaml
type: custom:roost-alarm
entity: alarm_control_panel.alarmo
modes: [arm_away, arm_home, arm_night]
doors: [binary_sensor.front_door]
confirm: true
```

### Roost People
```yaml
type: custom:roost-people
entities: [person.saeed, person.layla]
layout: row              # row or list
```

### Roost Automations
```yaml
type: custom:roost-automations
title: Automations
entities: [automation.entrance_light, automation.tv_off]
all: false               # true: every automation
show_run: true
```

### Roost Clock
```yaml
type: custom:roost-clock
countdown_title: Next prayer
times:
  - { name: Fajr, short: F, entity: sensor.fajr }
  - { name: Dhuhr, short: D, entity: sensor.dhuhr }
  - { name: Maghrib, short: M, entity: sensor.maghrib }
hour24: false
```

### Roost Alerts
```yaml
type: custom:roost-alerts
batteries: true
battery_below: 20
offline: [sensor.living_temperature]
doors: [binary_sensor.front_door]
door_minutes: 10
rules:
  - { entity: sensor.cabinet_temperature, above: 32, message: Server cabinet too hot }
```

### Roost Title and Roost Light/Dark
```yaml
type: custom:roost-title
title: Devices
link_text: See all
tap_action: { action: navigate, navigation_path: "#devices" }
---
type: custom:roost-theme
show_label: true
```

### Roost Remote
```yaml
type: custom:roost-remote
athom_remote: Living room TV    # an Athom Hub remote's name
# or: entity: remote.living_room_tv   /   entity: media_player.tv
# or: buttons: [button.tv_power, button.tv_up, button.tv_ok]
show_numbers: false
```

### Roost Presence Map
```yaml
type: custom:roost-presence
device: 0123456789abcdef        # the presence sensor (pick it in the editor)
range: 6                        # metres
```

### Roost Weather, Energy and Timer
```yaml
type: custom:roost-weather
entity: weather.home
forecast: daily                 # daily, hourly or none
---
type: custom:roost-energy
energy: sensor.energy_today      # kWh meter that counts up
devices: [sensor.kettle_power, sensor.tv_power]
---
type: custom:roost-timer
entity: timer.kettle
presets: [1, 3, 5, 10]
```

### Roost Fan, Lock, Agenda and To-do
```yaml
type: custom:roost-fan
entity: fan.bedroom
---
type: custom:roost-lock
entity: lock.front_door
door: binary_sensor.front_door
---
type: custom:roost-agenda
entities: [calendar.family]
days: 3
highlight: bin, trash
---
type: custom:roost-todo
entity: todo.shopping_list
```

### Roost Camera, Sensors and Buttons
```yaml
type: custom:roost-camera
entity: camera.doorbell
doorbell: binary_sensor.doorbell_ring
aspect: 3/4
---
type: custom:roost-sensors
columns: 3
entities:
  - sensor.living_temperature
  - { entity: sensor.cabinet_temperature, name: Cabinet, above: 32 }
---
type: custom:roost-buttons
items:
  - { name: Lights, icon: mdi:lightbulb-group, entity: light.living }
  - { name: Movie, icon: mdi:movie, tap_action: { action: perform-action, perform_action: scene.turn_on, target: { entity_id: scene.movie } } }
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
