<h1 align="center">Roost Cards</h1>

<p align="center"><b>A finished, app-like Home Assistant dashboard for your phone and wall tablet, without building it card by card.</b><br>
Ready in one tap from your own rooms and devices · real controls you drag and slide · no code</p>

<p align="center">
<a href="https://hacs.xyz"><img src="https://img.shields.io/badge/HACS-Custom-41BDF5.svg" alt="HACS"></a>
<a href="https://github.com/HRadhi4/Roost-card/releases/latest"><img src="https://img.shields.io/github/v/release/HRadhi4/Roost-card?color=6D4BFF" alt="Release"></a>
<a href="https://github.com/HRadhi4/Roost-card/actions/workflows/validate.yml"><img src="https://github.com/HRadhi4/Roost-card/actions/workflows/validate.yml/badge.svg" alt="Validate"></a>
<a href="LICENSE"><img src="https://img.shields.io/github/license/HRadhi4/Roost-card?color=2BC4A8" alt="License"></a>
<a href="https://ko-fi.com/hradhi4"><img src="https://img.shields.io/badge/Ko--fi-Buy%20me%20a%20coffee-FF5E5B?logo=kofi&logoColor=white" alt="Support on Ko-fi"></a>
</p>

<p align="center">
<a href="https://my.home-assistant.io/redirect/hacs_repository/?owner=HRadhi4&repository=Roost-card&category=plugin"><img src="https://my.home-assistant.io/badges/hacs_repository.svg" alt="Open Roost Cards in HACS"></a>
</p>

<p align="center"><img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/tour.webp" width="300" alt="A tour of every Roost card on a phone"></p>

![Roost home screen in dark and light mode](https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/images/home.png)

## Why Roost

Built-in cards and other card sets give you clean building blocks, and you assemble the dashboard yourself. Roost gives you the finished thing:

### 1 · A whole dashboard in one tap
Install, open Home Assistant, tap **Make them**: Roost builds a phone dashboard and a tablet dashboard from your own areas and devices, and keeps them up to date as you add things. Change anything later in the visual editor. [How it works](docs/tutorials/12-ready-dashboards.md)

<img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/auto-dashboard.gif" width="240" alt="Roost makes a dashboard from your own devices">

### 2 · Controls you use, not just switches
Drag the AC dial, dim with your finger, watch the curtains slide, slide to unlock, arm the alarm with a question first. Fewer taps into pop-up dialogs.

| | | |
|:-:|:-:|:-:|
| ![Drag the dial](https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/thermostat-drag.gif)<br>**Drag the dial** | ![Curtains slide](https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/curtain-slide.gif)<br>**Curtains really slide** | ![Slide to unlock](https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/lock-slide.gif)<br>**Slide to unlock** |

### 3 · Rooms in one card
Swipe between rooms and get each room's devices, temperature, “Someone here” and one slider for all its lights, instead of one long page per room.

<img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/rooms-switch.gif" width="240" alt="Switch rooms instantly">

### 4 · The home tells you, on its own
A popup opens by itself when water is found, the doorbell rings or the alarm goes off, with a camera picture and buttons like **Turn the water off**. A timeline shows what happened, and a battery card warns before a sensor dies. No extra add-ons needed for popups.

### 5 · Made for a wall tablet, too
Full screen built in (no top bar or sidebar, no kiosk add-on), the bottom bar becomes a side rail, and every card rearranges itself for narrow columns. Light and dark follow your phone.

### And everywhere
- **No code:** every card has a visual editor: device, colours, look, size, what a tap does.
- **Never cut off:** text wraps instead of ending in "…", checked automatically before every release.
- **Calm motion:** things glow, spin and count, and all of it stops when *Reduce motion* is on.
- **Cards for real homes:** water tank, pool, pet feeder, prayer times, medicine, Grocy, bins and more, for when you need them. [See them all](#all-64-cards).

## Install

[![Open Roost Cards in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=HRadhi4&repository=Roost-card&category=plugin)

1. Tap the button above (or open **HACS** and search for **Roost Cards**).
2. Tap **Download**, then **Reload** when asked.
3. Edit a dashboard → **Add card** → search **Roost**.

Step by step, and without HACS: **[Install guide](docs/tutorials/01-install.md)**.

**No time to build?** The first time you open Home Assistant after installing, Roost offers to make two ready dashboards (phone and tablet) from your own rooms and devices. [How it works](docs/tutorials/12-ready-dashboards.md).

## Tutorials

### Videos

Recorded on a real Home Assistant (its built-in demo devices), so everything you see is the real editor and the real cards.

| Build a dashboard in the visual editor (7 min) | Every card in action (5 min) |
|:-:|:-:|
| [![Build a dashboard in the visual editor](https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/video/roost-build-dashboard.jpg)](https://github.com/HRadhi4/Roost-card/blob/main/docs/video/roost-build-dashboard.mp4) | [![Every Roost card in action](https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/video/roost-every-card.jpg)](https://github.com/HRadhi4/Roost-card/blob/main/docs/video/roost-every-card.mp4) |
| Make a dashboard, add each card from the card list, pick your devices, open its options, save. Then use it on a phone. | Every card on one page, each one tapped, dragged or switched so you can see what it does. |

### Written, with pictures

0. [Videos: build a dashboard, and every card in action](docs/tutorials/00-video.md)
1. [Install Roost Cards](docs/tutorials/01-install.md) · 2 min
2. [Add your first card](docs/tutorials/02-first-card.md) · 1 min
3. [Build a phone home screen](docs/tutorials/03-phone-home-screen.md) · 10 min
4. [Rooms that switch with a tap](docs/tutorials/04-rooms.md)
5. [Air conditioners, curtains and lights](docs/tutorials/05-climate-and-curtains.md)
6. [Security: alarm, lock, alerts and people](docs/tutorials/06-security.md)
7. [Use it with Athom Hub (remote and presence map)](docs/tutorials/07-with-athom-hub.md)
8. [Full screen, like an app](docs/tutorials/09-full-screen.md)
9. [Looks: frosted glass, light and dark, tablets](docs/tutorials/08-looks.md)
10. [Clock and prayer times](docs/tutorials/10-clock-and-prayer.md)
11. [Try cards before you own the device](docs/tutorials/11-try-without-devices.md)
12. [Ready dashboards made from your home](docs/tutorials/12-ready-dashboards.md) · no work
13. [Batteries, Timeline, your own values, group tiles](docs/tutorials/13-batteries-timeline-values.md)
14. [Real-looking curtains, blinds, garage, plant, pet and pool](docs/tutorials/14-real-looks.md)

## All 64 cards

Each GIF shows the card in use, then in the other colour mode, then as frosted glass.

| Card | What it is | See it |
|---|---|:-:|
| **Roost Tile** | A big tile with a switch. Shows the state, the power used and how long it has been on. Glows or spins when on. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/tile.gif" width="180" alt="Roost Tile"> |
| **Roost Chips** | Status chips in one row: doors, alarm, air conditioner, TV. Lights become one bulb with a count, people become little bubbles (colour = home, grey = away). Tap the bulb or the bubbles for the list. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/chips.gif" width="180" alt="Roost Chips"> |
| **Roost Thermostat** | An air conditioner card with a **dial you drag with your finger**, a power button, − and +, and mode buttons. The Nest look glows and shows a breeze while it runs. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/thermostat.gif" width="180" alt="Roost Thermostat"> |
| **Roost Scene** | A coloured card or round button that runs a scene or script. A tick shows when it is done. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/scene.gif" width="180" alt="Roost Scene"> |
| **Roost Hero** | A greeting with a sky that follows the sun (stars at night), the time, date, weather and a "what's next" countdown. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/hero.gif" width="180" alt="Roost Hero"> |
| **Roost Row** | A long row with a ring (an AC's temperature or any number), a name, a state line and an arrow. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/row.gif" width="180" alt="Roost Row"> |
| **Roost Nav** | Icon navigation: a bar at the bottom on phones, a rail at the side on tablets. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/nav.gif" width="180" alt="Roost Nav"> |
| **Roost Curtain** | A window with curtains that really slide open and closed, a sky behind them, and Open / Stop / Close buttons. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/curtain.gif" width="180" alt="Roost Curtain"> |
| **Roost Gauge** | A big ring for one reading (a cabinet's temperature, a plug's power). Turns orange and glows when too high, with a second reading under it. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/gauge.gif" width="180" alt="Roost Gauge"> |
| **Roost Graph** | A smooth line of a reading over the last hours, with the lowest and highest. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/graph.gif" width="180" alt="Roost Graph"> |
| **Roost Room** | One room at a glance: temperature bar, humidity and what is on, open or running. Tap to open the room. Put any cards under it, in one box or folded away. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/room.gif" width="180" alt="Roost Room"> |
| **Roost Light** | A light with brightness you drag, warm / neutral / cool buttons and colour dots. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/light.gif" width="180" alt="Roost Light"> |
| **Roost Media** | TV and sound: power, what is playing (with moving sound bars), volume you drag, mute, play/pause and inputs. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/media.gif" width="180" alt="Roost Media"> |
| **Roost Alarm** | The alarm in a big shield: arm and disarm with a question first, a keypad when it needs a code, and the doors. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/alarm.gif" width="180" alt="Roost Alarm"> |
| **Roost People** | Who is home: a picture or initials with a green ring when home, and for how long. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/people.gif" width="180" alt="Roost People"> |
| **Roost Automations** | A list of automations with a switch, when each last ran, and an optional "run now" button. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/automations.gif" width="180" alt="Roost Automations"> |
| **Roost Clock** | A clock with eight faces (digital, analog, minimal, flip, ring, words, neon, LCD), any time zone and world clocks. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/clock.gif" width="180" alt="Roost Clock"> |
| **Roost Prayer Times** | Today's prayer times, the next one with a countdown and the Hijri date: calculated with any method, from your sensors, or online. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/prayer.gif" width="180" alt="Roost Prayer Times"> |
| **Roost Alerts** | Only shows when something needs you: a low battery, a device gone offline, a door left open, or your own rules. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/alerts.gif" width="180" alt="Roost Alerts"> |
| **Roost Title** | A section heading with an optional line under it, a badge and a "See all" link. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/title.gif" width="180" alt="Roost Title"> |
| **Roost Light/Dark** | A sun / moon button that switches this screen between light and dark. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/theme.gif" width="180" alt="Roost Light/Dark"> |
| **Roost Remote** | A remote-control pad for an Athom Hub remote, any remote, or a TV: round arrow pad or a swipe touch pad, volume and channels, play and skip, coloured keys, numbers and your own app shortcuts. Show only the parts you want. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/remote.gif" width="180" alt="Roost Remote"> |
| **Roost Presence Map** | The room from above as a presence radar sees it (for example the LD2450 in an Athom sensor): people as glowing moving dots, and its zones with how many are inside. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/presence.gif" width="180" alt="Roost Presence Map"> |
| **Roost Weather** | The weather now on an animated sky (rain falls, clouds drift, storms flash, stars at night), and the next days or hours. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/weather.gif" width="180" alt="Roost Weather"> |
| **Roost Energy** | Power used now, today against yesterday, and the hungriest devices as bars. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/energy.gif" width="180" alt="Roost Energy"> |
| **Roost Timer** | A countdown ring for a timer (kettle, washing) with start, pause, cancel and quick times. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/timer.gif" width="180" alt="Roost Timer"> |
| **Roost Fan** | Turn a dial to set the speed (the fan spins faster at each step), or a big square dial like the thermostat with the room's temperature and humidity. Swing, direction and modes are small chips. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/fan.gif" width="180" alt="Roost Fan"> |
| **Roost Air** | An air purifier or a room's air: a ring coloured by how clean the air is, air drawn in while it runs, mode, speed and filter life. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/air.gif" width="180" alt="Roost Air"> |
| **Roost Water Heater** | A water tank that shows how hot it is, bubbles while it heats, the set temperature and “heat for 30 min” buttons. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/water-heater.gif" width="180" alt="Roost Water Heater"> |
| **Roost Doorbell** | The door camera, a banner when someone rings, the last rings and the door lock (tap twice to unlock). | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/doorbell.gif" width="180" alt="Roost Doorbell"> |
| **Roost Laundry** | A washer, dryer or dishwasher: the drum turns, the steps of the cycle, time left, when it finishes, and “ready to unload”. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/laundry.gif" width="180" alt="Roost Laundry"> |
| **Roost Garage** | A garage door that rolls up (or a gate that slides or swings), how long it has been open, and a warning when it stays open. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/garage.gif" width="180" alt="Roost Garage"> |
| **Roost Energy Flow** | Sun, house, battery and grid with power flowing between them, faster when more power moves. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/flow.gif" width="180" alt="Roost Energy Flow"> |
| **Roost Irrigation** | Garden zones: tap to water for a few minutes, see what is watering, and skip when rain is coming. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/irrigation.gif" width="180" alt="Roost Irrigation"> |
| **Roost Car** | An electric car charging: battery cells filling, power flowing down the cable, range, limit and when it will be full. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/ev.gif" width="180" alt="Roost Car"> |
| **Roost Plant** | A potted plant that droops when it is thirsty and says what it needs: water, light, warmth or food. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/plant.gif" width="180" alt="Roost Plant"> |
| **Roost Printer** | Ink or toner levels as little bottles, or a 3D print growing layer by layer with time left and temperatures. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/printer.gif" width="180" alt="Roost Printer"> |
| **Roost Moments** | Your day in moments (morning, day, evening, bedtime) with the scene that fits right now. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/moments.gif" width="180" alt="Roost Moments"> |
| **Roost Family Map** | Where everyone is, drawn simply around home (no map service): places as circles, people as faces, how far away. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/family.gif" width="180" alt="Roost Family Map"> |
| **Roost Popup** | One popup for everything: the doorbell with its camera, alarms, leaks, a door left open, the washing done, or any cards. It opens by itself when a device changes, from a link or button, or from an automation. Every “Are you sure?” in Roost uses it too. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/popup.gif" width="180" alt="Roost Popup"> |
| **Roost Grocy** | The kitchen from Grocy: food that goes off soon, the shopping list to tick off, chores, tasks and the meal plan. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/grocy.gif" width="180" alt="Roost Grocy"> |
| **Roost Tank** | A water tank or gas cylinder: how full it is (the water sways), used today, days left, a leak warning and the pump. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/tank.gif" width="180" alt="Roost Tank"> |
| **Roost Pool** | The pool from above with light moving on the water: warmth, chlorine and pH with the good zone, pump, heater and light. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/pool.gif" width="180" alt="Roost Pool"> |
| **Roost Pet** | A pet feeder and water fountain: food and water left, when it last ate, meals today and “feed now”. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/pet.gif" width="180" alt="Roost Pet"> |
| **Roost Nursery** | The baby's room: camera, warmth and humidity, a banner when the baby cries, night light and lullaby. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/nursery.gif" width="180" alt="Roost Nursery"> |
| **Roost Network** | The internet (download, upload, ping, devices online) or a server (CPU, memory, disk, heat), with a restart you tap twice. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/network.gif" width="180" alt="Roost Network"> |
| **Roost Batteries** | Every battery in the home, lowest first, with a calm “All good” when none are low. Finds them by itself. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/batteries.gif" width="180" alt="Roost Batteries"> |
| **Roost Timeline** | What happened at home, newest first: doors, locks, people coming and going, alarms and leaks. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/timeline.gif" width="180" alt="Roost Timeline"> |
| **Roost Values** | Your own settings in one card: numbers to slide, choices to tap, switches, short texts. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/values.gif" width="180" alt="Roost Values"> |
| **Roost Bins** | Which bin goes out next, drawn as coloured wheelie bins; tonight's one bounces. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/bins.gif" width="180" alt="Roost Bins"> |
| **Roost Medicine** | Today's doses as pills to tick off, the next dose, and a warning for a missed one. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/medicine.gif" width="180" alt="Roost Medicine"> |
| **Roost Modes** | House modes (home, away, holiday, guests): away checks doors and windows, guests get a Wi-Fi code to scan. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/modes.gif" width="180" alt="Roost Modes"> |
| **Roost Sleep** | The night from bedtime to the alarm with the moon moving along, a good-night button and how last night went. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/sleep.gif" width="180" alt="Roost Sleep"> |
| **Roost Vacuum** | A robot vacuum on its little floor: cleans in lanes (a wet trail when it mops), spirals for a spot clean, drives home and charges. Pick rooms, suction and mop settings; see when the filter or brushes need care; switch to the robot's map. Drawings of the common robots (Roborock, Dreame, Eufy, Shark, Roomba, Ecovacs) or your own picture. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/vacuum.gif" width="180" alt="Roost Vacuum"> |
| **Roost Lock** | A lock or garage door: slide to unlock, tap to lock; says when it is jammed. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/lock.gif" width="180" alt="Roost Lock"> |
| **Roost Agenda** | Today's and the next days' calendar events. Bin day (or any word you choose) stands out. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/agenda.gif" width="180" alt="Roost Agenda"> |
| **Roost To-do** | A to-do or shopping list: tick off, add and clear. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/todo.gif" width="180" alt="Roost To-do"> |
| **Roost Camera** | A camera picture or live video, with a banner when someone rings the doorbell. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/camera.gif" width="180" alt="Roost Camera"> |
| **Roost Sensors** | Many small readings in neat squares, orange when out of the range you set. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/sensors.gif" width="180" alt="Roost Sensors"> |
| **Roost Buttons** | Several small actions in one rounded bar; a button lights up when its device is on, in the same six looks as the bottom bar. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/buttons.gif" width="180" alt="Roost Buttons"> |
| **Roost Full Screen** | Hides Home Assistant's top bar and sidebar so your dashboard feels like an app: by itself (invisible), as a button that maximizes and minimizes, or as the tap action of any card. Comes back while editing. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/fullscreen.gif" width="180" alt="Roost Full Screen"> |
| **Roost Page** | A whole phone page laid out like the original: even spacing, the night-sky background and room for the bottom bar. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/page.gif" width="180" alt="Roost Page"> |
| **Roost Panel** | A rounded box with a title that holds other cards, such as a list of rooms. It can fold open and closed. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/panel.gif" width="180" alt="Roost Panel"> |
| **Roost Rooms** | A room switcher: tap a room pill and that room's cards appear below, instantly. | <img src="https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/gifs/cards/rooms.gif" width="180" alt="Roost Rooms"> |


Every setting of every card, with YAML to copy: **[docs/cards.md](docs/cards.md)**.

<details>
<summary><b>More screenshots</b></summary>

**Air conditioner, curtains and lights**
![Thermostat, curtain and light](https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/images/control.png)

**TV and sound, and the remote**
![Media and remote](https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/images/media.png)

**Readings, graph and energy**
![Gauge, graph, energy and sensors](https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/images/insight.png)

**Security**
![Alerts, alarm, lock and people](https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/images/security.png)

**Your day**
![Clock, weather, agenda, timer and fan](https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/images/day.png)

**Rooms and lists**
![Room, presence map, to-do and automations](https://raw.githubusercontent.com/HRadhi4/Roost-card/main/docs/images/rooms.png)

</details>

## Keep your Home Assistant up to date automatically

HACS shows new versions by itself. If you also want them installed by themselves, this automation installs every new version by itself, as soon as it is released:
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

## Questions and problems

| What you see | What to do |
|---|---|
| "Custom element doesn't exist: roost-…" | The file is not loaded yet. Check the resource (see *Install*) and refresh the page. On a phone, close the app fully and open it again. |
| A card says "Device not found" | The device was renamed or removed. Choose it again in the card editor. |
| The thermostat has no knob | That air conditioner has no temperature setting in Home Assistant. |
| My phone still shows the old look after an update | Close the Home Assistant app completely and open it again (on a computer, reload the page). |
| My curtain says "open" when it is closed | Turn on **Reverse** in the curtain card or tile ([how](docs/tutorials/05-climate-and-curtains.md#my-curtain-says-open-when-its-closed)). |
| I can't find the bottom bar to edit it | While editing, it sits at the end of the page with a small note. Tap it there. |
| Something else | [Open an issue](https://github.com/HRadhi4/Roost-card/issues/new/choose) with a screenshot. |

## For developers

The whole library is one file, `dist/roost-cards.js`, with no build step. To check it:
```
npm install
npm test
```
Releases are made automatically when the version in `package.json` goes up; the notes come from `CHANGELOG.md`.

## Support

If Roost Cards makes your home nicer, you can buy me a coffee on Ko-fi. It helps me keep adding features and fixing problems.

<a href="https://ko-fi.com/hradhi4"><img src="https://img.shields.io/badge/Ko--fi-Buy%20me%20a%20coffee-FF5E5B?logo=kofi&logoColor=white&style=for-the-badge" alt="Support on Ko-fi"></a>

## License

GPL-3.0. See [LICENSE](LICENSE).
