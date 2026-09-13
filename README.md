# Dishy

A personal portfolio prototype — a full app shell around the menu-scan idea, with onboarding, a paywall, and a light social/points layer. Plain HTML/CSS/JS, no build step, no dependencies.

**This is a UI/interaction prototype.** There's no real backend: login doesn't authenticate anyone, payment doesn't charge a card, and the leaderboard is mock data. Everything is wired up so the *flow* feels real, which is what a portfolio piece needs.

## The flow

1. **Splash** — bold "Dishy" wordmark, tagline, tap (or the button) triggers a coral circular wipe transition into login.
2. **Login** — log in / sign up toggle, email+password fields, social buttons. Any path forward leads into onboarding (no real auth).
3. **Onboarding** (3 steps, with progress dots):
   - Goal (lose weight / maintain / build muscle / manage blood sugar / GLP-1 support)
   - Dietary preferences (multi-select)
   - Build (optional, skippable)
4. **Paywall** — monthly/annual toggle, three plan cards (Free / Plus / Pro), a mock card-entry form that only appears for paid plans. Clearly marked as demo-only.
5. **Main app** — a tab bar with:
   - **Scan** — the camera-to-recommendation flow, now goal-aware: the recommended dish and reasoning change depending on what you picked in onboarding. Each completed scan earns +10 points.
   - **Board** — a leaderboard of mock friends plus your live point total, with a week/all-time toggle and an "Add friend" invite-code modal.
   - **Profile** — your chosen goal/preferences/build, stats (points, streak, scans), and a link back into the paywall to change plans.

## Run it locally

```bash
python3 -m http.server 8000
```
Open `http://localhost:8000`.

## Publish on GitHub Pages

```bash
git init
git add .
git commit -m "Dishy prototype"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```
Then in the repo: **Settings → Pages → Source: Deploy from branch → main / (root)**.

## Identity

Distinct from the PlateWise/B119 style guide, since this is its own app:

| Token | Value |
|---|---|
| Coral (primary/CTA) | `#FF4B3E` |
| Pine (secondary/dark surfaces) | `#16423C` |
| Gold (points/rewards accent) | `#F5B301` |
| Cream (background) | `#FFF8EE` |
| Display type | Bricolage Grotesque |
| UI type | Manrope |

## Extending it

- `app.js` holds all state in a single `state` object with no persistence — reloading resets everything. Swapping in `localStorage` or a real backend (Supabase, Firebase) is the natural next step.
- `GOAL_REASONS` in `app.js` is where the menu-scan recommendation logic lives — it's keyed by goal, so adding a real recommendation engine means replacing that lookup with an actual API call.
- The leaderboard (`FRIENDS_WEEK` / `FRIENDS_ALLTIME`) is static mock data — a real version would need actual friend relationships and a points ledger server-side.
