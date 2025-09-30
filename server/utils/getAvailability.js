// server/utils/getAvailability.js
const { addMinutes, isBefore, isAfter, parseISO, format } = require("date-fns");
const { zonedTimeToUtc } = require("date-fns-tz");
const calendarData = require("../calendarData.json");

/**
 * Build UTC slots for a single day based on org-local business hours
 */
function buildSlots(dateStr, startTime, endTime, slotLength) {
  const slots = [];
  const orgTZ = calendarData.timeZone;

  const startOrgLocal = new Date(`${dateStr}T${startTime}:00`);
  const endOrgLocal = new Date(`${dateStr}T${endTime}:00`);

  let current = zonedTimeToUtc(startOrgLocal, orgTZ);
  const endUtc = zonedTimeToUtc(endOrgLocal, orgTZ);

  while (isBefore(current, endUtc)) {
    slots.push(current.toISOString());
    current = addMinutes(current, slotLength);
  }

  return slots;
}

/**
 * Get availability for a given date
 * @param {string} dateStr 'YYYY-MM-DD'
 * @param {Array} bookings existing bookings [{ normalizedUtc }]
 */
function getAvailability(dateStr, bookings = []) {
  const {
    businessHours,
    slotLengthMinutes,
    callLengthMinutes,
    bufferMinutes,
    timeZone,
    unavailableDates = [],
  } = calendarData;

  // Closed dates
  if (unavailableDates.includes(dateStr)) {
    return {
      date: dateStr,
      availableTimes: [],
      unavailableTimes: [],
      callLengthMinutes,
      bufferMinutes,
    };
  }

  // Determine day of week in org TZ
  const dayOfWeek = new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    timeZone,
  }).toLowerCase();

  const hours = businessHours[dayOfWeek];
  if (!hours) {
    return {
      date: dateStr,
      availableTimes: [],
      unavailableTimes: [],
      callLengthMinutes,
      bufferMinutes,
    };
  }

  // Build all slots in UTC
  let slots = buildSlots(dateStr, hours.start, hours.end, slotLengthMinutes);

  // Filter out past slots
  slots = slots.filter((slotIso) => isAfter(parseISO(slotIso), new Date()));

  // Apply booking conflicts
  const availableSlots = slots.filter((slotIso) => {
    const slotStart = parseISO(slotIso);
    const slotEnd = addMinutes(slotStart, callLengthMinutes);

    return !bookings.some((booking) => {
      const bookedStart = parseISO(booking.normalizedUtc);
      const bookedEnd = addMinutes(bookedStart, callLengthMinutes + bufferMinutes);
      return slotStart < bookedEnd && slotEnd > bookedStart;
    });
  });

  const unavailableSlots = slots.filter((s) => !availableSlots.includes(s));

  return {
    date: dateStr,
    availableTimes: availableSlots,
    unavailableTimes: unavailableSlots,
    callLengthMinutes,
    bufferMinutes,
  };
}

module.exports = { getAvailability };
