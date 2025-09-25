const { getAvailability } = require('../utils/getAvailability');
const Booking = require("../models/Booking");

/**
 * Controller: check availability for a given date
 * Example: GET /api/availability?date=2025-09-08
 */
async function checkAvailability(req, res) {
  const { date } = req.query;

  try {
    // Fetch bookings for this date from DB
    const bookings = await Booking.find({ date });

    // Convert bookings into event objects for getAvailability
    const bookedEvents = bookings.map(b => ({
      start: new Date(b.start).toISOString(),
      end: new Date(b.end).toISOString(),
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
