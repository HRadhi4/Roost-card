# Changelog

Every version of Roost Cards, newest first.

## 0.8.0 — 2026-11-16
**New: Roost Curtain**
- A window with a sky that follows the sun (sun by day, moon and twinkling stars at night) and curtains that **really slide** open and closed.
- While the curtain moves, the fabric ripples and sways, and a small note says "Opening" or "Closing".
- Kinds: two curtains that meet in the middle, one curtain (left or right), or a roller blind that goes up and down.
- Settings: fabric colour, window height, roundness, slide time, sky on or off, the name and state line, Open / Stop / Close buttons, the percentage, what a tap or hold does, and what the Stop button does (for curtains whose remote has its own stop command).

## 0.7.0 — 2026-11-16
**A much more flexible room card, a hero you can shape, and an easier bottom bar**
- **Roost Rooms**
  - Pick each room's devices in the editor: every device becomes a tile, coloured by type (lights amber, ACs blue, curtains coral, TVs purple, plugs green, fans teal). Extra cards can still be added.
  - Each room can have its own button colour.
  - Room buttons: shape (pill, rounded, square), height, icon size, line-up (spread, left, centre), and an optional badge with how many things are on in each room.
  - Tiles in the rooms: size, look when on, glow, roundness, tiles per row and the space between them.
  - Swipe left or right to change room, open the last room used, or choose the room to show first.
  - An empty room says how to add devices instead of showing nothing.
- **Roost Hero**: your own greeting (for example "Welcome home"), show or hide the greeting, name, weather, date and clock, greeting size, left or centred text, small readings under the weather (for example the inside temperature), ready-made skies (day, night, sunrise, sunset, ocean, aurora, desert), sun or moon size, the pill's look, and what a tap on the card does.
- **Roost Nav**: while you edit the dashboard, the bottom bar now sits in its own place with a short note, so you can find it and tap it to change it. It goes back to the bottom of the screen when you are done.

## 0.6.3 — 2026-11-16
- **Tiles now look exactly like the original phone dashboard by default**: plain grey when off (the hint of colour when off is now a setting you can turn on), a 42 px icon box with a 22 px icon, and a 15 px name with smaller state and "for 5 min" lines.

## 0.6.2 — 2026-11-16
- **Tiles say the right word**: doors and windows show "Open" or "Closed", motion and presence sensors show "Someone there" or "Nobody", alarms show "Disarmed" or "Armed (away)", locks show "Locked" or "Unlocked" (instead of "On" and "Off").

## 0.6.1 — 2026-11-16
- **Round scene buttons are smaller by default** (58 px with small names), like the original quick actions. The size can still be changed with "Button size".

## 0.6.0 — 2026-11-16
**Many more ways to style every card**
- **Tiles**: choose how a tile looks when on (colour fade, one colour, see-through glass, or a coloured outline), how strong the glow is, the icon box (rounded, circle, square or none), the icon size, the name size, left or centred text, and whether it shows a hint of colour when off. New animations: pulse, bounce and wiggle. The state line can be hidden.
- **Scene buttons**: the same looks and glow, plus the round button's shape (circle, rounded, square) and size, and the name can be hidden.
- **Bottom bar (Roost Nav)**: names under the icons are back by default. Choose how the chosen button looks (filled with glow, soft tint, pill, a line or a dot under it, or a coloured icon), the background (glass, solid or none), the bar height, the icon size and the roundness.
- **Chips**: pill, rounded or square chips, on a solid, glass or no background.
- **Rooms bar**: the chosen room can be filled, softly tinted or underlined, on a solid, glass or no bar.
- **Rows**: ring size and thickness.
- **Hero**: turn the sun or moon, the stars and the light sweep on or off, and set the height.

## 0.5.3 — 2026-11-16
- **Roost Nav**: when the bar is pinned to the bottom of a phone, it keeps space free under the last card, so nothing hides behind it.

## 0.5.2 — 2026-11-16
**Closer to the original home screen**
- **Chips**: two or more doors now share one door chip (green = all closed, orange with a number = how many are open), and two or more air conditioners share one snowflake (blue with a number = how many are on). Tap either to see the list; tap a name to open it.
- **Round scene buttons**: smaller names, so "Arm away" and "Good night" fit on one line.
- **Roost Hero**: a slightly bigger greeting.

## 0.5.1 — 2026-11-16
**Tiles for things that are broken**
- **Tiles can say they are not working**: set "Not working? Say why" (for example "Not working · battery"). The tile greys out, shows a battery warning, and a tap opens its details instead of switching it.

## 0.5.0 — 2026-11-16
**The look of the original dashboard, with its animations**
- **Roost Hero** is rebuilt: the sky follows the sun (blue to peach by day, deep purple with twinkling stars at night), a glowing sun or moon floats in the corner, a soft light sweeps across, the date and time sit on top, and the weather reads "26°C · sunny". New **"what's next" pill** with a pulsing dot counts down to the soonest of your times (for example prayer times): "Next prayer **Maghrib** at 5:05 PM · in 3h 36m".
- **New: Roost Row**, a long row with a ring (an AC's set temperature or any number), a name, a state line and an arrow.
- **Roost Rooms**: the rooms now sit inside one rounded bar, with the chosen room highlighted, as in the original.
- **Tiles**: a bigger icon box and text. Animation is automatic: lights glow, fans spin, and a playing TV shows moving sound bars.
- **Scene buttons**: the round style is bigger, with a stronger glow.
- **Chips**: icons only. A green door means closed, orange means open (words can be turned back on).
- **Nav**: a full-width floating bar with equal buttons; the chosen one is a glowing rounded square.
- Animations stop for people who turn on "reduce motion" on their phone.

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
