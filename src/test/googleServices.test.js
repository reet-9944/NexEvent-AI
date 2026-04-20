import { describe, it, expect, vi } from "vitest";
import {
  getGoogleCalendarUrl,
  getGoogleMapsUrl,
  getGoogleMapsEmbedUrl,
  initiateGoogleOAuth,
  formatDateForCalendar,
  getPlacesSuggestions,
} from "../utils/googleServices";

describe("Google Services Utilities", () => {
  // ── Google Calendar ──────────────────────────────────────────────────────
  describe("getGoogleCalendarUrl", () => {
    it("generates a valid Google Calendar URL", () => {
      const url = getGoogleCalendarUrl({
        title: "Arijit Singh Live",
        date: "May 10, 2026",
        venue: "Jawaharlal Nehru Stadium",
      });
      expect(url).toContain("https://www.google.com/calendar/render");
      expect(url).toContain("action=TEMPLATE");
      expect(url).toContain(encodeURIComponent("Arijit Singh Live"));
      expect(url).toContain(encodeURIComponent("Jawaharlal Nehru Stadium"));
    });

    it("encodes special characters in title", () => {
      const url = getGoogleCalendarUrl({ title: "IPL: CSK vs MI", date: "", venue: "Wankhede" });
      expect(url).toContain(encodeURIComponent("IPL: CSK vs MI"));
    });

    it("includes description when provided", () => {
      const url = getGoogleCalendarUrl({
        title: "Test Event",
        date: "",
        venue: "Test Venue",
        description: "A great event",
      });
      expect(url).toContain(encodeURIComponent("A great event"));
    });
  });

  // ── Google Maps ──────────────────────────────────────────────────────────
  describe("getGoogleMapsUrl", () => {
    it("generates a valid Google Maps search URL", () => {
      const url = getGoogleMapsUrl("PVR IMAX, Connaught Place");
      expect(url).toContain("https://www.google.com/maps/search/");
      expect(url).toContain("api=1");
      expect(url).toContain(encodeURIComponent("PVR IMAX, Connaught Place"));
    });

    it("handles venues with commas and spaces", () => {
      const url = getGoogleMapsUrl("Siri Fort, New Delhi, India");
      expect(url).toBeTruthy();
      expect(url).toContain("google.com/maps");
    });
  });

  describe("getGoogleMapsEmbedUrl", () => {
    it("returns embed URL without API key", () => {
      const url = getGoogleMapsEmbedUrl("Wankhede Stadium");
      expect(url).toContain("maps.google.com/maps");
      expect(url).toContain("output=embed");
    });

    it("returns Maps Embed API URL with API key", () => {
      const url = getGoogleMapsEmbedUrl("Wankhede Stadium", "TEST_KEY");
      expect(url).toContain("maps/embed/v1/place");
      expect(url).toContain("key=TEST_KEY");
    });
  });

  // ── Google OAuth ─────────────────────────────────────────────────────────
  describe("initiateGoogleOAuth", () => {
    it("calls onSuccess callback with user object", async () => {
      const onSuccess = vi.fn();
      await initiateGoogleOAuth(onSuccess);
      expect(onSuccess).toHaveBeenCalledOnce();
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.any(String),
          email: expect.stringContaining("@"),
          provider: "google",
        })
      );
    });

    it("resolves with user data", async () => {
      const user = await initiateGoogleOAuth();
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("email");
      expect(user.provider).toBe("google");
    });
  });

  // ── Date Formatting ──────────────────────────────────────────────────────
  describe("formatDateForCalendar", () => {
    it("returns empty string for invalid date", () => {
      expect(formatDateForCalendar("not a date")).toBe("");
    });

    it("formats a valid date string", () => {
      const result = formatDateForCalendar("2026-05-10");
      expect(result).toMatch(/^\d{8}T\d{6}Z$/);
    });
  });

  // ── Places Suggestions ───────────────────────────────────────────────────
  describe("getPlacesSuggestions", () => {
    it("returns matching venues for a query", () => {
      const results = getPlacesSuggestions("Delhi");
      expect(results.length).toBeGreaterThan(0);
      results.forEach((r) => expect(r.toLowerCase()).toContain("delhi"));
    });

    it("returns empty array for no matches", () => {
      const results = getPlacesSuggestions("xyznonexistent");
      expect(results).toHaveLength(0);
    });

    it("is case insensitive", () => {
      const lower = getPlacesSuggestions("pvr");
      const upper = getPlacesSuggestions("PVR");
      expect(lower).toEqual(upper);
    });
  });
});
