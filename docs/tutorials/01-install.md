# 1 · Install Roost Cards

**Time: 2 minutes.** You need [HACS](https://hacs.xyz) (the Home Assistant Community Store). If you don't have it yet, follow [HACS's own guide](https://hacs.xyz/docs/use/) first.

## With HACS (recommended)

1. Tap this button. It opens Roost Cards inside HACS on your own Home Assistant:

   [![Open Roost Cards in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=HRadhi4&repository=Roost-card&category=plugin)

   *No button?* Open **HACS**, search for **Roost Cards**.
2. Tap **Download** (bottom right), then **Download** again.
3. When HACS asks to **reload**, tap **Reload**. On a phone: close the Home Assistant app completely and open it again.

That's it. HACS also tells you when there is a new version.

> **Not found in HACS?** Until Roost Cards is in the HACS store, add it once by hand:
> HACS → the **three dots** at the top right → **Custom repositories** → paste `https://github.com/HRadhi4/Roost-card` → type **Dashboard** → **Add**. Then search again.

## Without HACS

1. Download `roost-cards.js` from the [latest release](https://github.com/HRadhi4/Roost-card/releases/latest).
2. Put it in your Home Assistant `config/www` folder (with the *File editor* or *Samba* add-on).
3. **Settings → Dashboards → three dots (top right) → Resources → Add resource**.
   URL: `/local/roost-cards.js` · Type: **JavaScript module** → **Create**.
4. Reload the page (on a phone: close and reopen the app).

## Check it worked

Edit any dashboard, tap **Add card**, and type **Roost** in the search. You should see all the Roost cards.

**Next:** [Add your first card →](02-first-card.md)
