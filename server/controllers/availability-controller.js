const { getAvailability } = require('../utils/getAvailability');
const Booking = require("../models/Booking");

async function checkAvailability(req, res) {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Missing required query param: date" });
  }

  try {
    // Fetch bookings from DB
    const bookings = await Booking.find({ date });

    // Inject bookings into availability calculation
    const availability = getAvailability(date, bookings);

    res.json(availability);
  } catch (err) {
    console.error("Error getting availability:", err);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
}

module.exports = { checkAvailability };
