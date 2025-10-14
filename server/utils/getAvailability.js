// utils/getAvailability.js
const { addMinutes, isBefore, isAfter, parseISO } = require("date-fns");
const { zonedTimeToUtc, utcToZonedTime, formatInTimeZone } = require("date-fns-tz");
const calendarData = require("../calendarData.json");

/** Parse "HH:mm" -> minutes since midnight */
function minutesFromTime(timeStr) {
  const [hh, mm] = (timeStr || "00:00").split(":").map((n) => parseInt(n, 10) || 0);
  return hh * 60 + mm;
}

/** Returns startOfDayUtc (orgTZ midnight in UTC) and endOfDayUtc */
function getDayBounds(dateStr, orgTZ) {
  const startOfDayUtc = zonedTimeToUtc(`${dateStr}T00:00:00`, orgTZ);
  const endOfDayUtc = addMinutes(startOfDayUtc, 24 * 60);
  return { startOfDayUtc, endOfDayUtc };
}

/**
 * getAvailability(dateStr, bookedEvents)
 *  - dateStr: 'YYYY-MM-DD' (user selection)
 *  - bookedEvents: array of { normalizedUtc: '2025-10-10T16:00:00.000Z' } (UTC ISO)
 */
function getAvailability(dateStr, bookedEvents = []) {
  const orgTZ = calendarData.timeZone || calendarData.orgTZ || "UTC";
  const {
    businessHours,
    callLengthMinutes,
    bufferMinutes,
    slotLengthMinutes,
    unavailableDates,
    sameDayBookingPermitted,
  } = calendarData;

  // Day bounds in UTC for the org date (safe anchor)
  // const { startOfDayUtc } = getDayBounds(dateStr, orgTZ);
  
  // Force dateStr to be interpreted in orgTZ (not userTZ)
  const normalizedDateStr = formatInTimeZone(
    zonedTimeToUtc(`${dateStr}T00:00:00`, orgTZ),
    orgTZ,
    "yyyy-MM-dd"
  );

  const { startOfDayUtc } = getDayBounds(normalizedDateStr, orgTZ);


  // Weekday in orgTZ (derived from the org-midnight UTC anchor)
  const weekdayName = formatInTimeZone(startOfDayUtc, orgTZ, "EEEE").toLowerCase();

  // 1) Block fully unavailable dates
  if (Array.isArray(unavailableDates) && unavailableDates.includes(dateStr)) {
    return {
      date: dateStr,
      availableTimes: [],
      unavailableTimes: [],
      callLengthMinutes,
      bufferMinutes,
    };
  }

  // 2) Same-day guard (computed in orgTZ)
  if (sameDayBookingPermitted === false) {
    const todayStrInOrgTZ = formatInTimeZone(new Date(), orgTZ, "yyyy-MM-dd");
    const normalizedDateStr = formatInTimeZone(startOfDayUtc, orgTZ, "yyyy-MM-dd");
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

  // 3) Business hours for this day (orgTZ)
  const hours = businessHours[weekdayName];
  if (!hours || !hours.start || !hours.end) {
    // closed day
    return {
      date: dateStr,
      availableTimes: [],
      unavailableTimes: [],
      callLengthMinutes,
      bufferMinutes,
    };
  }

  // 4) Build business window in UTC **by offsetting from the org-midnight UTC anchor**
  //    This avoids ambiguous string parsing that can leak host TZ.
  const startMinutes = minutesFromTime(hours.start);
  const endMinutes = minutesFromTime(hours.end);

  const businessStartUtc = addMinutes(startOfDayUtc, startMinutes);
  const businessEndUtc = addMinutes(startOfDayUtc, endMinutes);

  // 5) Generate candidate slots (cursor is UTC Date objects)
  let slots = [];
  let cursor = new Date(businessStartUtc);
  while (isBefore(addMinutes(cursor, callLengthMinutes), businessEndUtc)) {
    slots.push(new Date(cursor)); // push a copy
    cursor = addMinutes(cursor, slotLengthMinutes);
  }

  // 6) Remove booked slots (bookedEvents expected as UTC-normalized ISO)
  const unavailableTimes = [];
  bookedEvents.forEach(({ normalizedUtc }) => {
    const bookedStart = parseISO(normalizedUtc);
    const bookedEnd = addMinutes(bookedStart, callLengthMinutes + bufferMinutes);

    slots = slots.filter((slot) => {
      const slotEnd = addMinutes(slot, callLengthMinutes);
      // overlap: slot starts before booked end AND slotEnd after booked start
      const overlaps = isBefore(slot, bookedEnd) && isAfter(slotEnd, bookedStart);
      if (overlaps) unavailableTimes.push(slot.toISOString());
      return !overlaps;
    });
  });

  // 7) Remove slots that are already in the past (compare to the real current instant)
  const now = new Date();
  const pastSlots = [];
  slots = slots.filter((slot) => {
    const slotEnd = addMinutes(slot, callLengthMinutes);
    if (isBefore(slotEnd, now) || slotEnd.getTime() === now.getTime()) {
      pastSlots.push(slot.toISOString());
      return false;
    }
    return true;
  });
  unavailableTimes.push(...pastSlots);

  // 8) Return normalized result (UTC ISO strings)
  return {
    date: dateStr,
    availableTimes: slots.map((s) => s.toISOString()),
    unavailableTimes,
    callLengthMinutes,
    bufferMinutes,
  };
}

module.exports = { getAvailability, getDayBounds };
