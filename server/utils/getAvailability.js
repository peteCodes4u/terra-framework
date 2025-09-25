const calendarData = require("../calendarData.json");
const { addMinutes, isBefore, isAfter, parseISO, format, getDay } = require("date-fns");
const { normalizeCalendarData } = require("./normalizeCalendar");

/**
 * Get available times for a specific date
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @param {Array} bookedEvents - array of booked events [{ start, end }]
 * @returns {Object} { date, availableTimes: [], unavailableTimes: [] }
 */
function getAvailability(dateStr, bookedEvents = []) {
  const events = [...normalizeCalendarData(), ...bookedEvents];
  const businessHours = calendarData.businessHours;
  const slotLength = calendarData.slotLengthMinutes || 30;
  const date = parseISO(dateStr);
  const dayIndex = getDay(date);
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayOfWeek = days[dayIndex];
  const hours = businessHours[dayOfWeek];
  if (!hours) {
    // No business hours for this day, so no available times
    return { date: dateStr, availableTimes: [], unavailableTimes: [] };
  }

  let slots = buildSlots(dateStr, hours.start, hours.end, slotLength);
  slots = slots.filter((slot) => isAfter(parseISO(slot), new Date()));

  if (calendarData.unavailableDates.includes(dateStr)) {
    return {
      date: dateStr,
      availableTimes: [],
      unavailableTimes: slots.map((s) => format(parseISO(s), "HH:mm")),
    };
  }

  // Only block slots that overlap with events
  const conflictFree = slots.filter((slot) => {
    const slotStart = parseISO(slot);
    const slotEnd = addMinutes(slotStart, slotLength);

    // If ANY event overlaps, block this slot
    return !events.some((ev) => {
      const evStart = parseISO(ev.start);
      const evEnd = parseISO(ev.end);
      return slotStart < evEnd && slotEnd > evStart;
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
