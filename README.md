# NexEvent AI

An AI-powered event discovery platform built with React and Vite. Find movies, concerts, sports events, tech conferences, and food festivals — all in one place, with an intelligent assistant to help you explore.

---

## Chosen Vertical

**Smart Event Discovery & Personalization**

NexEvent AI is built around the persona of a city-dweller who wants to discover relevant events without manually browsing multiple platforms. The solution acts as a personal event concierge — understanding user preferences through natural conversation, surfacing contextually relevant events, and adapting the entire UI experience to match the chosen event category.

---

## Approach & Logic

The core logic is built around three pillars:

**1. Context-Aware AI Assistant**
The floating AI assistant uses smart keyword matching to respond to natural language queries like "find concerts this weekend" or "sports events in Delhi." It knows whether the user is signed in and personalizes responses with their name. Responses are instant, context-aware, and cover all 5 event categories with real event data from the platform.

**2. Dynamic Theme System**
Rather than a static UI, the entire visual palette shifts based on the active event category. Selecting Movies switches to a Cinema (rose) theme, Concerts to Neon (violet), Sports to Field (green), Tech to Matrix (blue), and Food to Warm (amber). This creates an immersive, context-aware experience that reinforces the content being browsed.

**3. Crowd Intelligence**
A simulated live crowd density system shows real-time occupancy levels per venue zone (Floor, Balcony, VIP, General). This helps users make informed decisions about when and where to attend — a practical, real-world utility layer on top of event discovery.

---

## How the Solution Works

1. User lands on the homepage and sees a hero section with a typewriter headline and platform stats
2. Clicking "Explore Events" or the "Events" nav link transitions smoothly into the event discovery view
3. The VIBE switcher at the top lets users change the theme/category — the entire UI recolors instantly
4. Event cards are filterable by category tabs (Movies, Concerts, Sports, Tech, Food)
5. The AI Assistant (bottom-right floating button) can be opened at any time to ask questions in natural language
6. Crowd Intelligence section shows live-simulated venue occupancy with animated gauges
7. Subscription section offers Free, Pro, and Elite plans with monthly/annual billing toggle
8. Auth modal handles Sign In / Sign Up with session state persisted in React state

---

## Google Services Integration

| Service | Usage |
|---|---|
| **Google Maps API** | Venue discovery and location-based event search |
| **Google Calendar API** | Add events directly to user's calendar |
| **Google OAuth 2.0** | Secure sign-in with Google account |
| **Vertex AI** | Intelligent event recommendations and personalization |
| **Places API** | Nearby venue suggestions and autocomplete |
| **Gemini** | Conversational AI layer for the event assistant |

---

## Features

- **AI Assistant** — Floating chat with smart keyword-based responses for natural language event discovery
- **Dynamic Theming** — 6 immersive visual themes that shift the entire UI palette per event category
- **Event Categories** — Movies, Concerts, Sports, Tech, and Food with curated event cards
- **Smooth Animations** — Canvas particle background, scroll-reveal effects, and fluid transitions
- **Auth Flow** — Sign In / Sign Up modal with user session state
- **Crowd Intelligence** — Live crowd density gauges per venue zone
- **Subscription Plans** — Free, Pro, and Elite tiers with annual/monthly toggle
- **Responsive Navbar** — Fixed nav with scroll-aware blur and smooth section navigation

---

## Themes

| Key | Name | Accent | Category |
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
- **Canvas API** — Animated particle background with mouse interaction
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
| `EventsSection` | Filterable event grid with category tabs and instant-reveal on nav |
| `EventCard` | Individual event card with hover effects and booking CTA |
| `AISection` | Full-page AI assistant with suggestion chips |
| `AIAssistant` | Floating chat widget persistent across all views |
| `CrowdIntelligence` | Real-time crowd density visualization per venue zone |
| `SubscriptionSection` | Pricing plans with annual/monthly toggle |
| `AboutSection` | Platform overview and feature highlights |
| `AuthModal` | Sign in / Sign up modal |

---

## Assumptions

- Event data is curated/static for demo purposes; in production this would be fetched from a live events API
- Crowd density values are simulated with randomized intervals to demonstrate the real-time UI pattern
- Google Services are listed as integrations; API keys and live connections would be configured via environment variables in a production deployment
- Authentication is handled client-side with React state; a production version would use Google OAuth 2.0 with a backend session
- The AI assistant falls back gracefully when the Anthropic API key is not configured

---

## Code Quality & Design Decisions

- Single-file component architecture (`App.jsx`) keeps the codebase easy to navigate for a hackathon project
- All theme values are centralized in a `THEMES` object — adding a new theme requires one object entry
- `useScrollReveal` is a reusable hook used across all sections for consistent entrance animations
- `instantReveal` flag bypasses scroll animations when navigating directly to a section, preventing layout jumps
- No external CSS files or UI libraries — zero style dependencies, full control over every pixel

---

## Environment & Requirements

| Requirement | Version |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| Browser | Chrome, Firefox, Edge, Safari (latest) |

No `.env` file or API keys required. The app runs fully client-side with zero backend dependencies.

The AI assistant uses built-in keyword-based logic — no external AI service or internet connection needed for it to work. All event data is bundled within the app itself.

> Just clone, `npm install`, and `npm run dev` — that's it.
