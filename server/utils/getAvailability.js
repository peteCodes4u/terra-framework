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
 *  - dateStr: 'YYYY-MM-DD'
 *  - bookedEvents: array of { normalizedUtc: '2025-10-10T16:00:00.000Z' }
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

  // Normalize date to orgTZ
  const normalizedDateStr = formatInTimeZone(
    zonedTimeToUtc(`${dateStr}T00:00:00`, orgTZ),
    orgTZ,
    "yyyy-MM-dd"
  );

  const { startOfDayUtc } = getDayBounds(normalizedDateStr, orgTZ);
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

  // 2) Same-day booking rules
  const todayStrInOrgTZ = formatInTimeZone(new Date(), orgTZ, "yyyy-MM-dd");
  const selectedDateStrInOrgTZ = formatInTimeZone(startOfDayUtc, orgTZ, "yyyy-MM-dd");

  if (!sameDayBookingPermitted && selectedDateStrInOrgTZ === todayStrInOrgTZ) {
    return {
      date: dateStr,
      availableTimes: [],
      unavailableTimes: [],
      callLengthMinutes,
      bufferMinutes,
    };
  }

  // 3) Business hours
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

  // 4) Build business window in UTC
  const startMinutes = minutesFromTime(hours.start);
  const endMinutes = minutesFromTime(hours.end);
  const businessStartUtc = addMinutes(startOfDayUtc, startMinutes);
  const businessEndUtc = addMinutes(startOfDayUtc, endMinutes);

  // 5) Generate candidate slots
  let slots = [];
  let cursor = new Date(businessStartUtc);
  while (isBefore(addMinutes(cursor, callLengthMinutes), businessEndUtc)) {
    slots.push(new Date(cursor));
    cursor = addMinutes(cursor, slotLengthMinutes);
  }

  // 6) Remove booked slots
  const unavailableTimes = [];
  bookedEvents.forEach(({ normalizedUtc }) => {
    const bookedStart = parseISO(normalizedUtc);
    const bookedEnd = addMinutes(bookedStart, callLengthMinutes + bufferMinutes);

    slots = slots.filter((slot) => {
      const slotEnd = addMinutes(slot, callLengthMinutes);
      const overlaps = isBefore(slot, bookedEnd) && isAfter(slotEnd, bookedStart);
      if (overlaps) unavailableTimes.push(slot.toISOString());
      return !overlaps;
    });
  });

  // 7) Remove past slots if selected date is today in orgTZ
  if (selectedDateStrInOrgTZ === todayStrInOrgTZ) {
    const nowInOrg = utcToZonedTime(new Date(), orgTZ);
    const nowUtc = zonedTimeToUtc(nowInOrg, orgTZ);
    const pastSlots = [];

    slots = slots.filter((slot) => {
      const isPast = isBefore(slot, nowUtc);
      if (isPast) {
        pastSlots.push(slot.toISOString());
        return false;
      }
      return true;
    });

    unavailableTimes.push(...pastSlots);
  }

  // 8) Return normalized result
  return {
    date: dateStr,
    availableTimes: slots.map((s) => s.toISOString()),
    unavailableTimes,
    callLengthMinutes,
    bufferMinutes,
  };
}

module.exports = { getAvailability, getDayBounds };
