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
  const slotLength = calendarData.slotLengthMinutes || 60;
  const callLength = calendarData.callLengthMinutes || 30;
  const date = parseISO(dateStr);
  const dayIndex = getDay(date);
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayOfWeek = days[dayIndex];
  
  const hours = businessHours[dayOfWeek];
  if (!hours) {
    return { date: dateStr, availableTimes: [], unavailableTimes: [] };
  }

  let slots = buildSlots(dateStr, hours.start, hours.end, slotLength, callLength);
  slots = slots.filter((slot) => isAfter(parseISO(slot), new Date()));

  if (calendarData.unavailableDates.includes(dateStr)) {
    return {
      date: dateStr,
      availableTimes: [],
      unavailableTimes: slots.map((s) => format(parseISO(s), "HH:mm")),
    };
  }

  const bufferMinutes = calendarData.bufferMinutes || 0;

  // Only block slots that overlap with events
  const conflictFree = slots.filter((slot) => {
    const slotStart = parseISO(slot);
    const slotEnd = addMinutes(slotStart, callLength);

    // If ANY event overlaps, block this slot
    return !events.some((ev) => {
      const evStart = parseISO(ev.start);
      const evEnd = parseISO(ev.end);

      const bufferStart = addMinutes(evStart, -bufferMinutes);
      const bufferEnd = addMinutes(evEnd, bufferMinutes);

      return slotStart < bufferEnd && slotEnd > bufferStart;
    });
  });

  const unavailableTimes = slots.filter((s) => !conflictFree.includes(s));

  return {
    date: dateStr,
    availableTimes: conflictFree.map((s) => format(parseISO(s), "HH:mm")),
    unavailableTimes: unavailableTimes.map((s) => format(parseISO(s), "HH:mm")),
    callLengthMinutes: calendarData.callLengthMinutes,
    bufferMinutes: calendarData.bufferMinutes
  };
}

/**
 * Build time slots for a single day
 */
function buildSlots(dateStr, startTime, endTime, slotLength, callLength) {
  const slots = [];
  let current = new Date(`${dateStr}T${startTime}:00`);
  const end = new Date(`${dateStr}T${endTime}:00`);

  while (isBefore(current, end)) {
    slots.push(current.toISOString());
    current = addMinutes(current, slotLength);
  }

  return slots;
}

module.exports = { getAvailability };
