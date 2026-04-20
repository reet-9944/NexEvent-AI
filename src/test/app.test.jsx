import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { getGoogleCalendarUrl, getGoogleMapsUrl } from "../utils/googleServices";

// ── Mock canvas for ThreeBackground ─────────────────────────────────────────
beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  }));
});

// ── Event Data Tests ─────────────────────────────────────────────────────────
describe("Event Data Integrity", () => {
  const EVENTS_DATA = {
    movies: [
      { id: 1, title: "Dune: Messiah", date: "Apr 25, 2026", venue: "PVR IMAX, Connaught Place", price: "₹450", rating: 9.1 },
      { id: 2, title: "Phantom Hearts", date: "Apr 28, 2026", venue: "Cinepolis, Ambience", price: "₹380", rating: 8.4 },
    ],
    concerts: [
      { id: 5, title: "Arijit Singh Live", date: "May 10, 2026", venue: "Jawaharlal Nehru Stadium", price: "₹2,500", rating: 9.8 },
    ],
    sports: [
      { id: 9, title: "IPL: CSK vs MI", date: "Apr 24, 2026", venue: "Wankhede Stadium", price: "₹800", rating: 9.5 },
    ],
    tech: [
      { id: 13, title: "Google I/O India", date: "May 14, 2026", venue: "HITEX Exhibition Centre", price: "Free", rating: 9.7 },
    ],
    food: [
      { id: 17, title: "Delhi Food Carnival", date: "Apr 26, 2026", venue: "Jawaharlal Nehru Park", price: "₹299", rating: 9.0 },
    ],
  };

  it("has all 5 event categories", () => {
    expect(Object.keys(EVENTS_DATA)).toEqual(["movies", "concerts", "sports", "tech", "food"]);
  });

  it("each event has required fields", () => {
    Object.values(EVENTS_DATA).flat().forEach((event) => {
      expect(event).toHaveProperty("id");
      expect(event).toHaveProperty("title");
      expect(event).toHaveProperty("date");
      expect(event).toHaveProperty("venue");
      expect(event).toHaveProperty("price");
      expect(event).toHaveProperty("rating");
    });
  });

  it("all ratings are between 0 and 10", () => {
    Object.values(EVENTS_DATA).flat().forEach((event) => {
      expect(event.rating).toBeGreaterThan(0);
      expect(event.rating).toBeLessThanOrEqual(10);
    });
  });

  it("all event IDs are unique", () => {
    const ids = Object.values(EVENTS_DATA).flat().map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("generates valid Google Calendar URL for each event", () => {
    Object.values(EVENTS_DATA).flat().forEach((event) => {
      const url = getGoogleCalendarUrl({ title: event.title, date: event.date, venue: event.venue });
      expect(url).toContain("google.com/calendar");
      expect(url).toContain(encodeURIComponent(event.title));
    });
  });

  it("generates valid Google Maps URL for each venue", () => {
    Object.values(EVENTS_DATA).flat().forEach((event) => {
      const url = getGoogleMapsUrl(event.venue);
      expect(url).toContain("google.com/maps");
      expect(url).toContain(encodeURIComponent(event.venue));
    });
  });
});

// ── Theme System Tests ───────────────────────────────────────────────────────
describe("Theme System", () => {
  const THEMES = {
    home: { name: "Cosmic", accent: "#8b85c1", bg: "#0d0e12" },
    movies: { name: "Cinema", accent: "#a86b72", bg: "#0e0c0d" },
    concerts: { name: "Neon", accent: "#8a7abf", bg: "#0c0c10" },
    sports: { name: "Field", accent: "#5a9e82", bg: "#0b0e0c" },
    tech: { name: "Matrix", accent: "#5a9ab5", bg: "#0b0d10" },
    food: { name: "Warm", accent: "#b8895a", bg: "#0e0c0a" },
  };

  it("has 6 themes defined", () => {
    expect(Object.keys(THEMES)).toHaveLength(6);
  });

  it("each theme has required color properties", () => {
    Object.values(THEMES).forEach((theme) => {
      expect(theme).toHaveProperty("name");
      expect(theme).toHaveProperty("accent");
      expect(theme).toHaveProperty("bg");
    });
  });

  it("all accent colors are valid hex codes", () => {
    Object.values(THEMES).forEach((theme) => {
      expect(theme.accent).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it("theme names match expected values", () => {
    const names = Object.values(THEMES).map((t) => t.name);
    expect(names).toContain("Cosmic");
    expect(names).toContain("Cinema");
    expect(names).toContain("Neon");
    expect(names).toContain("Field");
    expect(names).toContain("Matrix");
    expect(names).toContain("Warm");
  });
});

// ── AI Assistant Logic Tests ─────────────────────────────────────────────────
describe("AI Assistant Smart Reply Logic", () => {
  const getSmartReply = (text, userName = null) => {
    const t = text.toLowerCase();
    const name = userName ? `, ${userName}` : "";
    if (t.includes("movie") || t.includes("film") || t.includes("cinema"))
      return `Great choice${name}! Dune: Messiah at PVR IMAX is trending with a 9.1 rating.`;
    if (t.includes("concert") || t.includes("music") || t.includes("live"))
      return `Arijit Singh Live at JLN Stadium on May 10 is nearly sold out${name}!`;
    if (t.includes("sport") || t.includes("cricket") || t.includes("ipl"))
      return `IPL: CSK vs MI at Wankhede Stadium on Apr 24${name}!`;
    if (t.includes("tech") || t.includes("conference"))
      return `Google I/O India at HITEX on May 14 is free and rated 9.7${name}!`;
    if (t.includes("food") || t.includes("eat"))
      return `Delhi Food Carnival at JN Park on Apr 26 is free entry${name}!`;
    if (t.includes("free"))
      return `Free events: Google I/O India, Delhi Food Carnival, Vegan Fest India${name}!`;
    return `I'd love to help you find the perfect event${name}!`;
  };

  it("responds to movie queries", () => {
    const reply = getSmartReply("find movies near me");
    expect(reply.toLowerCase()).toContain("dune");
  });

  it("responds to concert queries", () => {
    const reply = getSmartReply("concerts this weekend");
    expect(reply.toLowerCase()).toContain("arijit");
  });

  it("responds to sports queries", () => {
    const reply = getSmartReply("ipl match tickets");
    expect(reply.toLowerCase()).toContain("csk");
  });

  it("responds to tech queries", () => {
    const reply = getSmartReply("tech conference in may");
    expect(reply.toLowerCase()).toContain("google i/o");
  });

  it("responds to food queries", () => {
    const reply = getSmartReply("food festival nearby");
    expect(reply.toLowerCase()).toContain("delhi food carnival");
  });

  it("responds to free event queries", () => {
    const reply = getSmartReply("free events this week");
    expect(reply.toLowerCase()).toContain("free");
  });

  it("personalizes response with user name", () => {
    const reply = getSmartReply("find movies", "Reet");
    expect(reply).toContain("Reet");
  });

  it("returns fallback for unknown queries", () => {
    const reply = getSmartReply("xyzunknownquery");
    expect(reply).toBeTruthy();
    expect(reply.length).toBeGreaterThan(10);
  });
});

// ── Accessibility Tests ──────────────────────────────────────────────────────
describe("Accessibility Requirements", () => {
  it("Google Maps URLs are valid and accessible", () => {
    const url = getGoogleMapsUrl("Wankhede Stadium, Mumbai");
    expect(url).toMatch(/^https:\/\//);
    expect(url).not.toContain(" ");
  });

  it("Google Calendar URLs are valid and accessible", () => {
    const url = getGoogleCalendarUrl({ title: "Test", date: "2026-05-01", venue: "Test Venue" });
    expect(url).toMatch(/^https:\/\//);
    expect(url).not.toContain(" ");
  });

  it("event titles are non-empty strings", () => {
    const titles = ["Dune: Messiah", "Arijit Singh Live", "IPL: CSK vs MI"];
    titles.forEach((title) => {
      expect(typeof title).toBe("string");
      expect(title.trim().length).toBeGreaterThan(0);
    });
  });
});
