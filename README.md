# NexEvent AI

An AI-powered event discovery platform built with React and Vite. Find movies, concerts, sports events, tech conferences, and food festivals — all in one place, with an intelligent assistant to help you explore.

![NexEvent AI](public/favicon.svg)

---

## Features

- **AI Assistant** — Floating chat powered by Claude (claude-sonnet-4) to help discover events via natural language
- **Dynamic Theming** — 6 immersive visual themes that shift the entire UI palette based on event category
- **Event Categories** — Movies, Concerts, Sports, Tech, and Food with curated event cards
- **Smooth Animations** — Particle canvas background, scroll-reveal effects, and fluid transitions
- **Auth Flow** — Sign In / Sign Up modal with user session state
- **Crowd Intelligence** — Live crowd density gauges per venue zone
- **Subscription Plans** — Free, Pro, and Elite tiers with annual/monthly toggle
- **Responsive Navbar** — Fixed nav with smooth scroll-to-section navigation
- **Google Ecosystem** — Integrated with Maps API, Calendar API, OAuth 2.0, Vertex AI, Places API, and Gemini

---

## Themes

| Key | Name | Accent Color | Category |
|---|---|---|---|
| `home` | Cosmic | Purple | Default |
| `movies` | Cinema | Rose | Movies |
| `concerts` | Neon | Violet | Concerts |
| `sports` | Field | Green | Sports |
| `tech` | Matrix | Blue | Tech |
| `food` | Warm | Amber | Food |

---

## Tech Stack

- **React 19** — UI framework
- **Vite 8** — Build tool with HMR
- **Canvas API** — Animated particle background (no Three.js dependency)
- **CSS-in-JS** — All styles via inline styles and injected `<style>` tags
- **Google Fonts** — Clash Display, Cabinet Grotesk, Syne

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run dev server

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## Project Structure

```
nexevent/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── App.jsx        # All components and app logic
│   ├── main.jsx       # React entry point
│   └── assets/
│       └── hero.png
├── index.html
├── vite.config.js
├── eslint.config.js
└── package.json
```

---

## Key Components

| Component | Description |
|---|---|
| `ThreeBackground` | Canvas-based animated particle system with mouse interaction |
| `Navbar` | Fixed top nav with scroll-aware blur backdrop |
| `LandingPage` | Hero section with typewriter headline and stats |
| `EventsSection` | Filterable event grid with category tabs |
| `EventCard` | Individual event card with hover effects and booking CTA |
| `AISection` | Full-page AI assistant with suggestion chips |
| `AIAssistant` | Floating chat widget (persistent across all pages) |
| `CrowdIntelligence` | Real-time crowd density visualization per zone |
| `SubscriptionSection` | Pricing plans with annual/monthly toggle |
| `AboutSection` | Platform overview and feature highlights |
| `AuthModal` | Sign in / Sign up modal |

---

## Environment

No `.env` file required for the base UI. The AI Assistant makes calls to the Anthropic API — add your key if enabling live AI responses.
