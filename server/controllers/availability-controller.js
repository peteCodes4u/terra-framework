const { getAvailability } = require('../utils/getAvailability');
const Booking = require("../models/Booking");

/**
 * Controller: check availability for a given date
 * Example: GET /api/availability?date=2025-09-08
 */
async function checkAvailability(req, res) {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Missing required query param: date" });
  }

  try {
    // Fetch bookings for this date from DB
    const bookings = await Booking.find({ date });

    // Convert bookings into event objects for getAvailability
    const bookedEvents = bookings.map(b => ({
      start: b.start,
      end: b.end,
    }));

    // Merge DB bookings with business rules
    const availability = getAvailability(date, bookedEvents);

    res.json(availability);
  } catch (err) {
    console.error("Error getting availability:", err);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
}

module.exports = { checkAvailability };
