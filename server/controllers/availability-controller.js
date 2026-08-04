// controllers/availability-controller.js
const { getAvailability } = require("../utils/getAvailability");
const { getDayBounds } = require("../utils/getAvailability"); // expose helper
const Booking = require("../models/Booking");
const calendarData = require("../calendarData.json");

/**
 * Controller: check availability for a given date
 * Example: GET /api/availability?date=2025-09-08
 */
async function checkAvailability(req, res) {
  const { date } = req.query;
  const userTimeZone = req.userTimeZone || "UTC"; // Fallback to UTC if not set by middleware

  try {
    const orgTZ = calendarData.timeZone || "UTC";

    // Get day bounds for orgTZ
    const { startOfDayUtc, endOfDayUtc } = getDayBounds(date, orgTZ);

    // Fetch bookings for this orgTZ day
    const bookings = await Booking.find({
      start: { $gte: startOfDayUtc, $lt: endOfDayUtc },
    });

    // Convert bookings into event objects for getAvailability
    const bookedEvents = bookings.map((b) => ({
      normalizedUtc: new Date(b.start).toISOString(),
    }));

    // Merge DB bookings with business rules
    const availability = getAvailability(date, bookedEvents);

    // Convert business hours to userTimeZone for response
    const businessHoursInUserTZ = Object.keys(calendarData.businessHours || {}).reduce((acc, key) => {
      const hours = calendarData.businessHours[key];
      if (hours && hours.start && hours.end) {
        acc[key] = {
          start: formatInTimeZone(parseISO(hours.start), userTimeZone, 'h:mm a'),
          end: formatInTimeZone(parseISO(hours.end), userTimeZone, 'h:mm a'),
        };
      }
      return acc;
    }, {});

    res.json({ ...availability, orgTZ, userTimeZone, businessHoursInUserTZ, });
  } catch (err) {
    console.error("Error getting availability:", err);
    res.status(500).json({
      error: "Failed to fetch availability from availability-controller",
    });
  }
}

module.exports = { checkAvailability };
