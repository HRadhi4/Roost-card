# Full screen, like an app

**Roost Full Screen** hides Home Assistant's top bar and sidebar, so a dashboard looks and feels like an app. Use it one of three ways.

## 1 · Invisible: the dashboard opens full screen by itself

1. Edit the dashboard → **Add card** → **Roost Full Screen**.
2. Keep **How it works: Invisible**.
3. Under **Who**, choose who gets full screen (empty = everyone), and who sees a small **exit button** (for example only you), and where it sits.
4. **Save**, then **Done**. The top bar and sidebar disappear.

The card is invisible. While you edit the dashboard, it shows a small note, and the top bar comes back so you can always reach **Done**.

## 2 · A button that maximizes and minimizes

Set **How it works** to **A button**. Tapping it switches full screen on and off, and the screen remembers your choice. On computers and Android you can also hide the browser's own bars.

## 3 · From any card

Any card's tap can switch full screen, including Home Assistant's own cards. In the card's editor, set **Tap action → Perform action → fire-dom-event**, or in YAML:

```yaml
tap_action:
  action: fire-dom-event
  roost_fullscreen: toggle   # or on, or off
```

## Locked out?

Add `?roost_full=off` to the end of the dashboard's address (for example `/home-roost/home?roost_full=off`). Full screen stays off on that screen for that visit.

[← Back to the README](../../README.md)
