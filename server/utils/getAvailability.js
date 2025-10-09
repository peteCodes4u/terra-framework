// utils/getAvailability.js
const { addMinutes, isBefore, isAfter, parseISO } = require("date-fns");
const { zonedTimeToUtc, utcToZonedTime, formatInTimeZone } = require("date-fns-tz");
const calendarData = require("../calendarData.json");

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
  // Use the timezone key that exists in your calendarData
  const orgTZ = calendarData.orgTZ || calendarData.timeZone || "UTC";
  const {
    businessHours,
    callLengthMinutes,
    bufferMinutes,
    slotLengthMinutes,
    unavailableDates,
    sameDayBookingPermitted,
  } = calendarData;

  const { startOfDayUtc } = getDayBounds(dateStr, orgTZ);

  // Day of week string in orgTZ
  const dayInOrgTZ = utcToZonedTime(startOfDayUtc, orgTZ);
  const weekdayName = new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: orgTZ,
  }).toLowerCase();

  // 1. Block completely unavailable dates
  if (Array.isArray(unavailableDates) && unavailableDates.includes(dateStr)) {
    return {
      date: dateStr,
      availableTimes: [],
      unavailableTimes: [],
      callLengthMinutes,
      bufferMinutes,
    };
  }

  // 2. Same-day guard: if same-day booking is disabled, block today (compute correctly in orgTZ)
  if (sameDayBookingPermitted === false) {
    const todayStrInOrgTZ = formatInTimeZone(new Date(), orgTZ, "yyyy-MM-dd");
    // Normalize incoming dateStr into orgTZ before comparing
    const normalizedDateStr = formatInTimeZone(
      zonedTimeToUtc(`${dateStr}T00:00:00`, orgTZ),
      orgTZ,
      "yyyy-MM-dd"
    );
    if (normalizedDateStr === todayStrInOrgTZ) {
      return {
        date: dateStr,
        availableTimes: [],
        unavailableTimes: [],
        callLengthMinutes,
        bufferMinutes,
      };
    }
  }

  // 3. Weekday with no hours
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
  const businessStartUtc = zonedTimeToUtc(`${dateStr}T${hours.start}:00`, orgTZ);
  const businessEndUtc = zonedTimeToUtc(`${dateStr}T${hours.end}:00`, orgTZ);

  // Generate slots
  let slots = [];
  let cursor = businessStartUtc;
  while (isBefore(addMinutes(cursor, callLengthMinutes), businessEndUtc)) {
    slots.push(cursor);
    cursor = addMinutes(cursor, slotLengthMinutes);
  }

  // Remove booked/unavailable slots (from actual bookings)
  const unavailableTimes = [];
  bookedEvents.forEach(({ normalizedUtc }) => {
    const bookedStart = parseISO(normalizedUtc);
    const bookedEnd = addMinutes(bookedStart, callLengthMinutes + bufferMinutes);

    slots = slots.filter((slot) => {
      const slotEnd = addMinutes(slot, callLengthMinutes);
      const overlaps = isBefore(slot, bookedEnd) && isAfter(slotEnd, bookedStart);
      if (overlaps) {
        unavailableTimes.push(slot.toISOString());
      }
      return !overlaps;
    });
  });

  // --- NEW: remove slots that are already in the past (slotEnd <= now)
  const nowUtc = zonedTimeToUtc(new Date(), orgTZ);
  const pastSlots = [];
  slots = slots.filter((slot) => {
    const slotEnd = addMinutes(slot, callLengthMinutes);
    if (isBefore(slotEnd, nowUtc) || slotEnd.getTime() === nowUtc.getTime()) {
      pastSlots.push(slot.toISOString());
      return false;
    }
    return true;
  });
  // add past slots to unavailableTimes so caller can see why they were removed
  unavailableTimes.push(...pastSlots);

  return {
    date: dateStr,
    availableTimes: slots.map((s) => s.toISOString()),
    unavailableTimes,
    callLengthMinutes,
    bufferMinutes,
  };
}

module.exports = { getAvailability, getDayBounds };
