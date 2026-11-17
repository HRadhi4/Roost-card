# Changelog

Every version of Roost Cards, newest first.

## 1.3.7
- **Full Screen** stays off once you leave it: opening another page or reloading no longer switches it back on. Press the button again to go back to full screen.
- **Roost Nav** buttons like `#rooms` now jump to that part of the page (the Roost Title with the same name, or a new **Jump name** setting). Before, they only lit up and nothing moved.
- **Roost Title** has a new **Jump name** setting for those buttons.
- Docs: how to keep the Roost look in a normal Sections view, so every card has its own edit button.

## 1.3.6 — 2026-11-17
- **Roost Rooms** starts with four rooms (Living, Bedroom, Kitchen, Bathroom), each filled with a mix of your lights, air conditioners, curtains, TVs, fans and plugs.
- Editor: the room list and the bottom bar's button list now have proper titles.

## 1.3.5 — 2026-11-17
- **Roost Media**: when the cover picture can't load, the card shows its icon instead of a broken picture.

## 1.3.4 — 2026-11-17
- **Roost Thermostat: new "Nest" look, now the default.** The same dial as the phone dashboard: a cyan-to-purple ring that glows, little breeze bars that breathe while the AC runs, a bigger glowing power button and blue mode buttons. The old look is still there as "Classic".
- **Roost Alarm (pills)**: the title and the Disarm / Arm home / Arm away buttons now sit 8 px in from the sides, exactly like the phone dashboard (`inset` changes it).

## 1.3.3 — 2026-11-17
- **To-do card fixed**: after switching pages the list stopped updating, so ticked or added items did not show. It now keeps listening, and ticks, new items and "Clear" show straight away.
- **To-do card**: what you are typing is no longer lost when the list updates.
- **Softer shadow in light mode** under the frosted bottom bar and Roost Buttons.

## 1.3.2 — 2026-11-17
- **Frosted glass on every card**: each card now has a "See-through" setting (solid, frosted glass or fully clear) with sliders for how see-through it is and how strong the blur is. The nav bar gets the same sliders for its glass.
- **Roost Buttons are coloured like the nav bar**: the same six looks when a button is on (filled, soft, pill, line, dot or icon only) and the same bar backgrounds (frosted glass, solid or none).

## 1.3.1 — 2026-11-17
- **Roost Prayer Times** keeps your own calendar: any time (Imsak, Fajr, Dhuhr and the rest) can come from your own sensor, such as the Al-Hadi calendar, and only the times you have no sensor for are calculated. You can name your calendar at the bottom of the card.

## 1.3.0 — 2026-11-17
**New: Roost Prayer Times**
- Today's prayer times, the next one with a countdown ring, a line of the day, and the Hijri date.
- Times **calculated on the spot** with any common method (Umm al-Qura, Muslim World League, Egypt, ISNA, Karachi, Gulf, Kuwait, Qatar, Dubai, Shia Ithna-Ashari, Tehran and more), Standard or Hanafi Asr, and your own minute adjustments. Or **online** (aladhan.com), or **your own sensors**.
- List, tiles or one-line looks; English or Arabic names; Western or Eastern-Arabic numbers; 12 or 24 hours; Jumu'ah on Fridays; Imsak, midnight and the last third of the night if you want them.

**Roost Clock is now a real clock** with eight faces: digital, analog, minimal, flip, ring, words, neon and LCD. Any time zone with a label, world clocks underneath, Hijri date, Western, Eastern-Arabic or Roman numbers, hand styles, sweeping seconds and four sizes. (Clocks that already showed prayer times keep working as before.)

**Fixes**
- **Roost Energy**: numbers shrink to fit narrow cards, and "Loading" no longer spills out of its box; a sensor without history says so.
- **Roost Page and Roost Panel** can now be edited in the visual editor: their own settings, plus a tab for each card on them.

## 1.2.9 — 2026-11-17
**Try a card without the device**
- **Sample data**: Roost Fan, Lock, Camera, Timer and Remote can show pretend devices (`sample: true`, or "Show sample data" in the editor). They react to taps like the real thing, the sample doorbell rings now and then, and nothing is sent to Home Assistant.

**More movement**
- The coloured pill of the **bottom bar** and of the **room pills** now slides to the button you tap, even between pages.
- **Remote** keys glow when pressed; a new **alert** gives a small nudge; ticking a **to-do** item bounces its box; the **next event** of the day has a soft pulsing dot; a **title badge** bounces when it changes; a folding **panel** opens smoothly.

## 1.2.8 — 2026-11-17
- **Watts, lux and ppm** show whole numbers everywhere ("43 W", not "43.0 W").
- **Roost Energy** compares today with yesterday up to the same time of day, so the morning no longer shows a big drop. Small totals show two decimals ("0.04 kWh"). Devices can have short names.
- **Roost Clock**: the date is written like the hero ("Tuesday 17 November"), and the labels of times that are close together no longer touch.
- **Roost Light/Dark** and the **Full screen** button can stretch to the width of their card.

## 1.2.7 — 2026-11-17
- **Bottom bar**: it no longer jumps sideways when you open a page that is shorter than the screen (on computers the scroll bar used to push it).

## 1.2.6 — 2026-11-17
- **Bottom bar fixed**: Home Assistant's pop-up messages (for example "Starting broadlink" while an integration starts) sat on top of the bar and caught the taps, so the buttons seemed dead. The messages now appear above the bar.
- Room lines show power and light level as whole numbers ("Plug 42 W").
- The card guide explains the new options (small media player, alarm pills, room lines, room readings under a title).

## 1.2.5 — 2026-11-17
**More of the original phone dashboard**
- **Roost Media** has a small look ("TV & sound"): name, state and volume buttons; it turns purple while the TV is on, and a tap switches it.
- **Roost Panel** can list devices as rows with their state in colour (alarm, doors, someone at the door, light level), fold open and closed, and show a picture or icon with a line under the title (like the power strip).
- **Roost Alarm** has a pills look: Disarm, Arm home, Arm away.
- **Roost Room** can say every device's state ("Light off · fan off", "Doors closed · no one there", "51.4% humidity").
- **Roost Title** can show the room's temperature and humidity under the name ("Room sensor offline" when it has no reading).
- **Roost Thermostat** can sit inside a panel without its own box.

## 1.2.4 — 2026-11-17
- Text lines are spaced like the original dashboard (the hero's "next prayer" line is no longer taller), and the round quick-action buttons sit exactly where the original's do.

## 1.2.3 — 2026-11-17
- **Bottom bar**: a button can also light up on other pages (for example **Rooms** stays lit on every room's page), and "only for these people" now takes people from your list.

## 1.2.2 — 2026-11-17
**Matches the original phone dashboard**
- Same fonts as the original (Inter and Space Grotesk, loaded automatically), same spacing, sizes and shadows.
- **Chips**: same height, colours, icons and order (door, alarm, lights, air conditioners, people); people are small overlapping circles; the count takes the icon's colour.
- **Hero**: greeting size, date written as "Tuesday 17 November", smaller moon at night.
- **Quick actions, room pills, tiles, the AC row and the bottom bar**: sizes, gaps and glows now match the original. Tiles sit 8 px apart.
- **Bottom bar**: a button can be shown only to some people (for example Settings).
- New **Roost Page**: lays a whole phone page out like the original. New **Roost Panel**: a box with a title around other cards.
- **Roost Room** has a new big coloured **tile** look (like the Rooms page) and can sit inside a panel without its own box. **Roost Title** can show a back button.

## 1.2.1 — 2026-11-16
**Design fixes**
- **Graph**: the line is now one smooth, calm curve. Tiny ups and downs no longer look like waves, but a real sudden change (like the AC switching on) stays sharp.
- **Weather**: clouds drift on the right side of the sky and no longer cover the temperature or the words.
- **Lock**: while it is locking or unlocking, a "Locking" bar stays in place of the slider, so the card no longer jumps in size.
- **Light**: when you pick a colour, the brightness bar takes that colour (no more orange-to-purple mix), and its icon stays readable.
- Numbers and units: a space before words like `1460 W` and `612 ppm`, none before `°C` and `%`; no extra `.0` added to readings.
- **People**: the "home" ring now glows evenly around the picture.

**See every card in action**
- A short animated picture for **every card** in the README and in the card guide, and new animated pictures in the tutorials (first card, light/dark, full screen).
- All screenshots redone with realistic times, prayer times, weather and temperatures.

## 1.2.0 — 2026-11-16
**New: Roost Full Screen**
- Hides Home Assistant's top bar and sidebar so a dashboard feels like an app. Three ways: **invisible** (the dashboard opens full screen by itself, for everyone or only the people you choose, with a small exit button for the people you choose), a **button** that maximizes and minimizes, or the **tap action of any card** (`fire-dom-event` with `roost_fullscreen: toggle | on | off`).
- Everything comes back while you edit the dashboard, and on other dashboards. `?roost_full=off` in the address turns it off on that screen.

**Every card checked and polished**
- Every card now rearranges itself when it sits in a narrow column (half a phone screen): words no longer break letter by letter, nothing sticks out past the card, buttons shrink, rows stack and names step aside when there is no room.
- **Meaningful movement**: numbers count to their new value instead of jumping (gauge, graph, room temperature, light, volume, weather, energy, sensors, the AC row's ring), bars and rings grow and shrink smoothly, tiles, lights, fans, locks, the alarm, people and buttons give a gentle bounce when their state changes, an automation's row glows when it runs, and people glide across the presence map. Nothing moves when the phone asks for reduced motion.
- Fixed: on very narrow screens the bottom bar's buttons could stick out of the bar.

## 1.1.2 — 2026-11-16
- **Tutorials**: eight short step-by-step guides with pictures and GIFs, from installing to a full phone home screen.
- New README with screenshots, GIFs of the cards in use, and a one-tap "Open in HACS" button.
- Forms for reporting a problem or suggesting an idea.

## 1.1.1 — 2026-11-16
- **Roost Curtain** now sits on a card background like the other cards (can be turned off with "Card background").
- Fan, light, lock and media cards stack the icon above the name in narrow columns, so names never break inside a word.
- The presence map's last metre label is no longer clipped.
- Screenshots of every card, in dark and light mode, in the README.
- The HACS store checks now run on GitHub for every change.

## 1.1.0 — 2026-11-16
**Twelve more cards**
- **Roost Remote**: a remote-control pad with power, arrows and OK, back / home / menu / input, volume and channel rockers, mute, play / pause and number keys. Works with an Athom Hub remote (its buttons are matched to the keys by name), any remote entity, or a TV. Keys it cannot send are greyed out.
- **Roost Presence Map**: the room from above, as a presence radar sees it: a glowing field of view, metre lines, people as pulsing dots, and the sensor's zones with how many people are inside each.
- **Roost Weather**: the weather now on an animated sky (rain, snow, drifting clouds, storm flashes, sun or moon and stars), humidity, wind and "feels like", and the next days or hours.
- **Roost Energy**: power used now (the chosen devices added up), today's energy against yesterday's, and the hungriest devices as bars.
- **Roost Timer**: a countdown ring that ticks every second, start / pause / cancel and quick times (1, 3, 5, 10 minutes or your own).
- **Roost Fan**: the fan icon spins faster at higher speeds; Off / Low / Medium / High (or numbered speeds), swing, and its modes.
- **Roost Lock**: slide to unlock (so it is not opened by accident), tap to lock; shakes when jammed; also for garage doors; can show the door sensor.
- **Roost Agenda**: your calendars' events for the next days, grouped by Today / Tomorrow; bin day (or any word you choose) is highlighted.
- **Roost To-do**: tick items off with a little pop, add new ones, and clear the ticked ones. Updates live.
- **Roost Camera**: a picture that refreshes or live video; when the doorbell rings the card glows and says "Someone is at the door".
- **Roost Sensors**: many readings in neat squares with fitting icons and colours; orange when outside the range you set.
- **Roost Buttons**: several small actions in one rounded bar; a button lights up when its device is on.

## 1.0.0 — 2026-11-16
**Twelve new cards**
- **Roost Gauge**: a big ring for one reading. Turns orange and glows when too high (or too low), shows a second reading, and the ring grows smoothly to new values.
- **Roost Graph**: a smooth line of a reading over the last hours (1 to 168), with the lowest and highest.
- **Roost Room**: one room at a glance: a temperature bar that turns orange when too hot, humidity, and a short line of what is on ("1 light on · AC cool 24° · Curtain open"). Tap to open the room.
- **Roost Light**: brightness you drag with your finger, warm / neutral / cool buttons and colour dots for colour bulbs. The bulb glows brighter as you turn it up.
- **Roost Media**: power, what is playing with moving sound bars, volume you drag, mute, play / pause / skip, and the inputs and apps. Can use a separate sound bar for the volume and a plug for the power.
- **Roost Alarm**: the alarm in a big shield that pulses while armed and shakes when triggered; Away, Home, Night, Holiday and Off with a question first (it warns if a door is open), a keypad when a code is needed, and the doors.
- **Roost People**: a picture or initials with a green ring and a gentle pulse when home, and for how long.
- **Roost Automations**: a list with a switch and when each last ran; an optional "run now" button; all automations or only the ones you pick.
- **Roost Clock**: a big clock and date, a line of the day's times with the next one glowing, and a countdown to it.
- **Roost Alerts**: shows only when something needs you: a low battery, a device gone offline, a door left open too long, or your own rules. Hides itself when all is fine.
- **Roost Title**: section headings with a small line, a badge and a "See all" link.
- **Roost Light/Dark**: a sun / moon button that switches this phone or tablet between light, dark and (optionally) automatic.

## 0.9.0 — 2026-11-16
**Roost Curtain: choose what is behind the window**
- **Sky that follows the sun** (as before), **your own picture** (for example a photo of your view, with an optional night photo), **live weather**, or nothing.
- **Live weather** is animated: the sun's rays turn, clouds drift, rain and snow fall, storms flash and fog rolls by, with the temperature in the corner. The sky turns grey when it is overcast.
- Everything behind the window rests while the curtain is fully closed, and moves again as soon as it opens.

## 0.8.1 — 2026-11-16
- **Reverse for curtains**: for curtains that report open and closed the wrong way round (99% open when they are really 1% open). Turn on "Reverse" on the Roost Curtain card or on a curtain tile: the picture, the words and the percentage are flipped, and Open, Close and a tap send the command the motor understands.
- When a curtain reports its position, the position now decides whether it says "Open" or "Closed", because some integrations mix the two up.

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
