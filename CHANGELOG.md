# Changelog

Every version of Roost Cards, newest first.

## 0.4.0 — 2026-11-16
**Colours you can see, and a clearer settings screen**
- A switched-off tile now shows its colour too: the icon in its colour, a tinted icon box and a coloured edge. Switched on, it fills with its full colour. Before, every switched-off tile looked the same, so changing the colour seemed to do nothing.
- The settings screen shows the values a card really uses (for example "Large" and 22 px corners) instead of empty boxes.
- The two "own colour" pickers appear only after choosing "My own colours".
- Saving from the settings screen keeps your card short: only what you changed is written.

## 0.3.1 — 2026-11-16
**Cards no longer overlap**
- Every card now tells Home Assistant to give it as much height as it needs. Before, a card with large text (or on a phone with bigger system text) spilled over the card below it: chips on the greeting card, scene buttons on the people bubbles, the navigation bar on the thermostat's buttons.
- The design-rule check now blocks any card that asks for a fixed height.

## 0.3.0 — 2026-11-16
**Follows the design rules (now in `DESIGN_RULES.md`)**
- Status chips share the width equally in one row that never wraps; on very narrow phones the door chip shows only its icon. A TV chip appears only while the TV is on, and light groups no longer count as lights.
- The chosen room, page or button uses the selected purple (#6D4BFF → #8B6CFF).
- Space Grotesk for headings and numbers, Inter for text (when installed).
- Every movement is 0.12 s or quicker.
- The thermostat never shows "—": with no room sensor, that line is simply hidden.
- Tiles can be **locked** (for things that must stay on) or **ask before switching** (for things that affect many devices).
- Fits phones as narrow as 300 px without cutting or overflowing.
- The rules are checked automatically before every release.

## 0.2.0 — 2026-11-16
**New: Roost Rooms**
- A room switcher: a row of room pills, and the chosen room's cards below. Switching is instant.
- Room names show only on the chosen room (or on all, or icons only), and the pills scroll sideways when there are many rooms.
- Put any cards in a room, including other Roost cards; add `wide: true` to a card to give it the full width.

## 0.1.0 — 2026-11-16
**First version: six cards, each with its own visual editor**
- **Roost Tile**: a big tile with a switch, colour, icon, size, corner roundness, a power reading and how long it has been on. Glow or spin when on.
- **Roost Chips**: status chips in one centred row. Doors, alarm, AC, TV; lights are grouped into one bulb with a count, people into bubbles (colour = home, grey = away). Tap the bulb or the bubbles to see the list, with switches for the lights.
- **Roost Thermostat**: an air conditioner card with a dial you drag with your finger, a power button, − and +, and mode buttons.
- **Roost Scene**: a coloured card or round button that runs a scene, script or action, with a tick when done.
- **Roost Hero**: a greeting with the time, date and weather.
- **Roost Nav**: icon navigation: a bar at the bottom on phones and a rail at the side on tablets.
- Eight colour sets or your own two colours, light and dark mode (or always one), and text that is never cut off.
