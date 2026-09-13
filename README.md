# PlateWise — In-Restaurant Menu Scan

Group 6 (Thor) · B119 Creative Problem Solving & Strategy Development
Topic 3: **In-Restaurant Menu Scan** — a photo of a physical menu becomes one confident recommendation, under real time pressure.

A clickable, PWA-style prototype. No build step, no dependencies — plain HTML/CSS/JS.

## The flow (3 screens)

1. **Scan** — a live camera viewfinder (falls back to a sample menu automatically if the camera is unavailable or denied), with a running timer to keep the "under 90 seconds" pressure visible.
2. **Analyzing** — the menu is digitized line by line while status text explains what's happening against the user's stated goal.
3. **Result** — the single best dish is hand-highlighted directly on the digitized menu, backed by a confidence card with one plain-language reason, a "Tell the waiter" action, and two alternates using a simple **good / okay** signal rather than a false-precision score.

Sample menu data (Trattoria Sonnenallee) is hardcoded in `script.js` — swap `MENU` for a real parsed menu when this moves past prototype stage.

## Run it locally

No build tools needed. From this folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` — camera access requires either `localhost` or HTTPS, so a plain `file://` open won't show the live viewfinder (it'll still work via the sample-menu fallback).

## Publish on GitHub Pages

```bash
git init
git add .
git commit -m "PlateWise menu scan prototype"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Then in the repo: **Settings → Pages → Source: Deploy from branch → main / (root)**. The live URL (HTTPS) will also enable the real camera viewfinder on phones.

## Brand tokens used (shared PlateWise style guide)

| Token | Value |
|---|---|
| Primary (sage) | `#6B9E7E` |
| Accent (orange) | `#FF6B35` |
| Background | `#F8F9FA` |
| UI type | Inter |
| Menu/content type | Fraunces (serif — reads as a printed menu, distinct from the app chrome) |

## Reference — one-page PRD

- **Positioning:** For someone scanning a physical menu with a waiter approaching, PlateWise is the decision layer existing food-logging apps don't offer — a same-moment recommendation, not a retrospective diary.
- **Persona:** demoed against a "Build muscle" goal (protein-per-meal as the headline signal), per the case brief's goal → data-priority mapping.
- **Core moment:** camera → digitize → one highlighted best choice, in well under 90 seconds.
- **Must-haves:** live/fallback scan capture, a visible time-pressure cue, a single unambiguous best pick (not a list to re-evaluate), one plain-language reason, low-effort alternates.
- **Look and feel:** shared PlateWise style guide; a hand-drawn highlight to echo a friend circling the best item on your menu, rather than a sterile score.
- **Success criteria:** a reviewer can tap through scan → analyzing → result on a phone and state, without narration, which dish PlateWise picked and why.
