// utils/getAvailability.js
const { addMinutes, isBefore, isAfter, parseISO } = require("date-fns");
const { zonedTimeToUtc, utcToZonedTime } = require("date-fns-tz");
const calendarData = require("../calendarData.json");

/**
 * Convert a YYYY-MM-DD string into start/end of that day in orgTZ
 */
function getDayBounds(dateStr, orgTZ) {
  const startOfDayUtc = zonedTimeToUtc(`${dateStr}T00:00:00`, orgTZ);
  const endOfDayUtc = addMinutes(startOfDayUtc, 24 * 60);
  return { startOfDayUtc, endOfDayUtc };
}

/**
 * Generate availability slots for a given date.
 * @param {string} dateStr - date in YYYY-MM-DD format (user selection).
 * @param {Array<{ normalizedUtc: string }>} bookedEvents - booked times in UTC.
 */
function getAvailability(dateStr, bookedEvents = []) {
  const {
    orgTimeZone,
    businessHours,
    callLengthMinutes,
    bufferMinutes,
    slotLengthMinutes,
  } = calendarData;

  const { startOfDayUtc } = getDayBounds(dateStr, orgTimeZone);

  // Day of week string in orgTZ
  const dayInOrgTZ = utcToZonedTime(startOfDayUtc, orgTimeZone);
  const weekdayName = dayInOrgTZ
    .toLocaleDateString("en-US", { weekday: "long", timeZone: orgTimeZone })
    .toLowerCase(); // e.g. "monday"

  const hours = businessHours[weekdayName];
  if (!hours || !hours.start || !hours.end) {
    return {
      date: dateStr,
      availableTimes: [],
      unavailableTimes: [],
      callLengthMinutes,
      bufferMinutes,
    };
  }

  // Build business window in UTC
  const businessStartUtc = zonedTimeToUtc(
    `${dateStr}T${hours.start}:00`,
    orgTimeZone
  );
  const businessEndUtc = zonedTimeToUtc(
    `${dateStr}T${hours.end}:00`,
    orgTimeZone
  );

  // Generate slots
  let slots = [];
  let cursor = businessStartUtc;
  while (isBefore(addMinutes(cursor, callLengthMinutes), businessEndUtc)) {
    slots.push(cursor);
    cursor = addMinutes(cursor, slotLengthMinutes);
  }

  // Remove booked/unavailable slots
  const unavailableTimes = [];
  bookedEvents.forEach(({ normalizedUtc }) => {
    const bookedStart = parseISO(normalizedUtc);
    const bookedEnd = addMinutes(bookedStart, callLengthMinutes + bufferMinutes);

    slots = slots.filter((slot) => {
      const slotEnd = addMinutes(slot, callLengthMinutes);
      const overlaps =
        isBefore(slot, bookedEnd) && isAfter(slotEnd, bookedStart);
      if (overlaps) {
        unavailableTimes.push(slot.toISOString());
      }
      return !overlaps;
    });
  });

  return {
    date: dateStr,
    availableTimes: slots.map((s) => s.toISOString()),
    unavailableTimes,
    callLengthMinutes,
    bufferMinutes,
  };
}

module.exports = { getAvailability, getDayBounds };
