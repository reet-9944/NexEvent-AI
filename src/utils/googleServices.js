// ─── Google Services Utilities ───────────────────────────────────────────────

/**
 * Generate a Google Calendar "Add Event" URL
 * Uses the Google Calendar API render endpoint (no API key required for URL-based integration)
 */
export function getGoogleCalendarUrl({ title, date, venue, description = "" }) {
  const base = "https://www.google.com/calendar/render?action=TEMPLATE";
  return `${base}&text=${encodeURIComponent(title)}&details=${encodeURIComponent(description || venue)}&location=${encodeURIComponent(venue)}`;
}

/**
 * Generate a Google Maps search URL for a venue
 * Uses the Google Maps search API (no API key required for URL-based search)
 */
export function getGoogleMapsUrl(venue) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`;
}

/**
 * Generate a Google Maps Embed URL for a venue
 * Uses the Maps Embed API
 */
export function getGoogleMapsEmbedUrl(venue, apiKey = "") {
  const q = encodeURIComponent(venue);
  return apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${q}`
    : `https://maps.google.com/maps?q=${q}&output=embed`;
}

/**
 * Simulate Google OAuth sign-in flow
 * In production, replace with actual Google Identity Services SDK
 * @see https://developers.google.com/identity/gsi/web
 */
export function initiateGoogleOAuth(onSuccess) {
  // Production: window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: onSuccess })
  // Demo: simulate OAuth response
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockUser = {
        name: "Google User",
        email: "user@gmail.com",
        provider: "google",
        picture: null,
      };
      onSuccess?.(mockUser);
      resolve(mockUser);
    }, 1200);
  });
}

/**
 * Format event date for Google Calendar (YYYYMMDD format)
 */
export function formatDateForCalendar(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/**
 * Get Google Places autocomplete suggestions (mock for demo)
 * Production: use Google Places API with API key
 * @see https://developers.google.com/maps/documentation/places/web-service
 */
export function getPlacesSuggestions(query) {
  const venues = [
    "PVR IMAX, Connaught Place, Delhi",
    "Jawaharlal Nehru Stadium, Delhi",
    "Wankhede Stadium, Mumbai",
    "HITEX Exhibition Centre, Hyderabad",
    "Pragati Maidan, Delhi",
    "Siri Fort Auditorium, Delhi",
    "Bharat Mandapam, Delhi",
    "The Leela Palace, Delhi",
  ];
  return venues.filter((v) => v.toLowerCase().includes(query.toLowerCase()));
}
