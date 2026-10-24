# Detention Rig (Next.js)

A clickable, iPhone-style app for tracking truck detention: a live clock at the receiver, the billing math worked out for you, a ready-to-send broker email, and automation switches. It follows the Apple Human Interface Guidelines for layout, type, motion, light and dark mode, and Reduce Motion.

All company, load and broker data is fictional demo data.

## What's in it

- **Today**: a live detention card, tiles for Detention, Lumpers and Alerts, and a "Needs you" list you can act on or dismiss.
- **Detention**: a pushed screen with a ticking clock, a timeline (arrived, free time up, now), and "How it was figured" (2 free hours, then $75/hr in 15-minute steps). Swipe from the left edge to go back.
- **Write email**: a bottom sheet with the detention request already written. Copy it or mark it as sent.
- **Truck left**: stops the clock after a confirmation and locks in the amount to bill.
- **Loads** and **Automations** tabs, including the detention heads-up switch.

## Run it

```bash
yarn install
yarn dev      # http://localhost:3000
yarn build && yarn start
```

## Where things live

- `lib/detention.ts`: detention math, formatting, the email text and demo data
- `components/`: one file per screen, plus `Sheet`, `TabView`, `Toggle` and `Icon`
- `styles/globals.css`: design tokens (light and dark) and all component styles

The same app is also built in SvelteKit in [frenkie151/codesandbox-template-svelte-kit](https://github.com/frenkie151/codesandbox-template-svelte-kit), sharing `detention.ts` and the stylesheet.
