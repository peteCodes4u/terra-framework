const calendarData = require("../calendarData.json");
const { addMinutes, isBefore, isAfter, parseISO, format } = require("date-fns");
const { normalizeCalendarData } = require("./normalizeCalendar");

/**
 * Get available times for a specific date
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @param {Array} bookedEvents - array of booked events [{ start, end }]
 * @returns {Object} { date, availableTimes: [], unavailableTimes: [] }
 */
function getAvailability(dateStr, bookedEvents = []) {
  // Combine DB bookings + calendar rules (mock events + unavailableDates)
  const events = [...normalizeCalendarData(), ...bookedEvents];

  const businessHours = calendarData.businessHours;
  const slotLength = calendarData.slotLengthMinutes || 30;

  const date = new Date(dateStr);
  const dayOfWeek = date
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();

  const hours = businessHours[dayOfWeek];
  if (!hours) {
    return { date: dateStr, availableTimes: [], unavailableTimes: [] };
  }

  // Generate all possible slots for this date
  let slots = buildSlots(dateStr, hours.start, hours.end, slotLength);

  // Remove slots in the past
  slots = slots.filter((slot) => isAfter(parseISO(slot), new Date()));

  // If date is completely unavailable
  if (calendarData.unavailableDates.includes(dateStr)) {
    return {
      date: dateStr,
      availableTimes: [],
      unavailableTimes: slots.map((s) => format(parseISO(s), "HH:mm")),
    };
  }

  // Remove any slots that overlap with existing events/bookings
  const conflictFree = slots.filter((slot) => {
    const slotStart = parseISO(slot);
    const slotEnd = addMinutes(slotStart, slotLength);

    // Keep slot only if it does NOT overlap with any event
    return events.every((ev) => {
      const evStart = parseISO(ev.start);
      const evEnd = parseISO(ev.end);
      return slotEnd <= evStart || slotStart >= evEnd;
    });
  });

  const unavailableTimes = slots.filter((s) => !conflictFree.includes(s));

  return {
    date: dateStr,
    availableTimes: conflictFree.map((s) => format(parseISO(s), "HH:mm")),
    unavailableTimes: unavailableTimes.map((s) => format(parseISO(s), "HH:mm")),
  };
}

/**
 * Build time slots for a single day
 */
function buildSlots(dateStr, startTime, endTime, intervalMinutes) {
  const slots = [];
  let current = new Date(`${dateStr}T${startTime}:00`);
  const end = new Date(`${dateStr}T${endTime}:00`);

  while (isBefore(current, end)) {
    slots.push(current.toISOString());
    current = addMinutes(current, intervalMinutes);
  }

  return slots;
}

module.exports = { getAvailability };
