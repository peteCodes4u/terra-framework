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
  // compute startOfDayUtc for the requested date (orgTZ midnight -> UTC)
  const { startOfDayUtc } = getDayBounds(dateStr, orgTZ);
  const businessHours = calendarData.businessHours || {};
  const callLength = Number(calendarData.callLengthMinutes) || 30;
  const bufferMinutes = Number(calendarData.bufferMinutes) || 0;
  const slotStep = Number(calendarData.slotLengthMinutes) || callLength;
  const sameDayBookingPermitted = Boolean(calendarData.sameDayBookingPermitted);
  // NEW: dynamic create-window (minutes) that org can set
  const createWindowMinutes = Number(calendarData.createAppointmentWindowValidation) || 0;
  const unavailableDates = Array.isArray(calendarData.unavailableDates) ? calendarData.unavailableDates : [];

  // normalize input date (expect 'YYYY-MM-DD' or ISO)
  const normalizedDate = dateStr && dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;

  // quick unavailable dates check
  if (unavailableDates.includes(normalizedDate)) {
    return {
      date: normalizedDate,
      availableTimes: [],
      unavailableTimes: [],
      callLengthMinutes: callLength,
      bufferMinutes,
    };
  }

  // compute startOfDayUtc for the requested date (orgTZ midnight -> UTC)
  const { startOfDayUtc } = getDayBounds(normalizedDate, orgTZ);

  // weekday name in orgTZ
  const weekdayName = formatInTimeZone(startOfDayUtc, orgTZ, "EEEE").toLowerCase();
  const hours = businessHours[weekdayName];
  if (!hours || !hours.start || !hours.end) {
    return {
      date: normalizedDate,
      availableTimes: [],
      unavailableTimes: [],
      callLengthMinutes: callLength,
      bufferMinutes,
    };
  }

  // business window in UTC
  const startMinutes = minutesFromTime(hours.start);
  const endMinutes = minutesFromTime(hours.end);
  const businessStartUtc = addMinutes(startOfDayUtc, startMinutes);
  const businessEndUtc = addMinutes(startOfDayUtc, endMinutes);

  // If same-day booking is NOT permitted and selected date is today in orgTZ -> return empty
  const todayInOrg = formatInTimeZone(new Date(), orgTZ, "yyyy-MM-dd");
  const selectedInOrg = formatInTimeZone(startOfDayUtc, orgTZ, "yyyy-MM-dd");
  if (!sameDayBookingPermitted && selectedInOrg === todayInOrg) {
    return {
      date: normalizedDate,
      availableTimes: [],
      unavailableTimes: [],
      callLengthMinutes: callLength,
      bufferMinutes,
    };
  }

  // compute "cutoff" (now + effectiveLead) in UTC to exclude slots before allowed lead time
  // effectiveLead = max(bufferMinutes, createWindowMinutes)
  const nowUtc = new Date();
  const effectiveLeadMinutes = Math.max(bufferMinutes, createWindowMinutes);
  const cutoffUtc = addMinutes(nowUtc, effectiveLeadMinutes);

  // helper: check overlap with existing booked events array of { normalizedUtc } or { start, end }
  const parseBooked = (ev) => {
    if (ev && ev.normalizedUtc) {
      const s = parseISO(ev.normalizedUtc);
      const e = addMinutes(s, callLength + bufferMinutes);
      return { start: s, end: e };
    }
    if (ev && ev.start && ev.end) {
      return { start: parseISO(ev.start), end: parseISO(ev.end) };
    }
    return null;
  };
  const parsedBooked = (bookedEvents || []).map(parseBooked).filter(Boolean);

  const candidateSlots = [];
  const unavailableTimes = [];

  // iterate slots (cursor in UTC)
  let cursor = new Date(businessStartUtc);
  while (isBefore(addMinutes(cursor, callLength), businessEndUtc) || +addMinutes(cursor, callLength) === +businessEndUtc) {
    const slotStartUtc = new Date(cursor);
    const slotEndUtc = addMinutes(slotStartUtc, callLength);

    // 1) if same-day and selected date is today, respect cutoff; otherwise normal allowance
    if (selectedInOrg === todayInOrg && !sameDayBookingPermitted) {
      // already returned earlier; left for clarity
      unavailableTimes.push(slotStartUtc.toISOString());
    } else {
      // 2) exclude past / too-soon slots
      if (slotStartUtc < cutoffUtc) {
        unavailableTimes.push(slotStartUtc.toISOString());
      } else {
        // 3) check overlap with existing bookings (consider buffer applied to booked events)
        const overlaps = parsedBooked.some((b) => slotStartUtc < b.end && slotEndUtc > b.start);
        if (overlaps) {
          unavailableTimes.push(slotStartUtc.toISOString());
        } else {
          candidateSlots.push(slotStartUtc.toISOString());
        }
      }
    }

    cursor = addMinutes(cursor, slotStep);
  }

  return {
    date: normalizedDate,
    availableTimes: candidateSlots,
    unavailableTimes,
    callLengthMinutes: callLength,
    bufferMinutes,
  };
}

module.exports = { getAvailability, getDayBounds };
