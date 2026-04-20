const express = require("express");
const { query, validationResult } = require("express-validator");
const router = express.Router();

let EVENTS_DATA = {
  movies: [
    { id: 1, title: "Dune: Messiah", date: "Apr 25, 2026", venue: "PVR IMAX, Connaught Place", price: "₹450", rating: 9.1, img: "🎬", tag: "Sci-Fi Epic", crowdDensity: 85, recommendation: "Book immediately. Peak traffic expected." },
    { id: 2, title: "Phantom Hearts", date: "Apr 28, 2026", venue: "Cinepolis, Ambience", price: "₹380", rating: 8.4, img: "🎭", tag: "Thriller", crowdDensity: 40, recommendation: "Good availability. Low crowd density." }
  ],
  concerts: [
    { id: 5, title: "Arijit Singh Live", date: "May 10, 2026", venue: "Jawaharlal Nehru Stadium", price: "₹2,500", rating: 9.8, img: "🎤", tag: "Bollywood", crowdDensity: 98, recommendation: "Venue at max capacity. Avoid parking nearby." }
  ],
  sports: [
    { id: 9, title: "IPL: CSK vs MI", date: "Apr 24, 2026", venue: "Wankhede Stadium", price: "₹800", rating: 9.5, img: "🏏", tag: "Cricket", crowdDensity: 95, recommendation: "Heavy congestion expected 2 hours prior." }
  ],
  tech: [
    { id: 13, title: "Google I/O India", date: "May 14, 2026", venue: "HITEX Exhibition Centre", price: "Free", rating: 9.7, img: "💻", tag: "Tech", crowdDensity: 70, recommendation: "Moderate crowd. Easy navigation." }
  ],
  food: [
    { id: 17, title: "Delhi Food Carnival", date: "Apr 26, 2026", venue: "Jawaharlal Nehru Park", price: "₹299", rating: 9.0, img: "🍔", tag: "Festival", crowdDensity: 65, recommendation: "Best time to visit: Early afternoon." }
  ]
};

// Security: input validation
router.get(
  "/",
  [
    query("category").optional().isString().trim().escape(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category, limit } = req.query;
    let data = EVENTS_DATA;

    if (category) {
      if (EVENTS_DATA[category]) {
        data = { [category]: EVENTS_DATA[category] };
      } else {
        return res.status(404).json({ error: "Category not found" });
      }
    }

    res.json(data);
  }
);

module.exports = router;
