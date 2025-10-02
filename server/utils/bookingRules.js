const { addMinutes, isBefore, isAfter } = require("date-fns");
const { utcToZonedTime, formatInTimeZone } = require("date-fns-tz");
const calendarData = require("../calendarData.json");

function validateBooking(startDate, endDate, existingBookings = []) {
  const orgTZ = calendarData.timeZone;

  // 🔑 Ensure startDate/endDate are treated in orgTZ
  const startLocal = utcToZonedTime(startDate, orgTZ);
  const endLocal = utcToZonedTime(endDate, orgTZ);

  const dateStr = formatInTimeZone(startDate, orgTZ, "yyyy-MM-dd");

  // 1. Enforce Unavailable Dates
  if (calendarData.unavailableDates.includes(dateStr)) {
    return {
      valid: false,
      message:
        "We're sorry, this date is unavailable. Please select another and try again, thank you.",
    };
  }

  // 2. Enforce Business Hours
  const day = formatInTimeZone(startDate, orgTZ, "EEEE").toLowerCase();
  const hours = calendarData.businessHours[day];
  if (!hours) {
    return {
      valid: false,
      message: "We're sorry, this time is outside of our business hours.",
    };
  }

  // 3. Restrict same day booking
  const todayStr = formatInTimeZone(new Date(), orgTZ, "yyyy-MM-dd");
  if (
    calendarData.sameDayBookingPermitted === false &&
    dateStr === todayStr
  ) {
    return {
      valid: false,
      message:
        "We're sorry, same day booking is not permitted by the organization at this time.",
    };
  }

  // 4. Restrict past date booking
  if (dateStr < todayStr) {
    return {
      valid: false,
      message:
        "We're sorry, that is a past date. Past dates are not valid booking dates.",
    };
  }

  // 🔑 Build business hours windows in orgTZ
  const [startH, startM] = hours.start.split(":").map(Number);
  const [endH, endM] = hours.end.split(":").map(Number);

  const businessStart = new Date(startLocal);
  businessStart.setHours(startH, startM, 0, 0);

  const businessEnd = new Date(startLocal);
  businessEnd.setHours(endH, endM, 0, 0);

  if (isBefore(startLocal, businessStart) || isAfter(endLocal, businessEnd)) {
    return {
      valid: false,
      message: "We're sorry, this booking is outside of our business hours.",
    };
  }

  // 5. Slot Length + Call Length
  const duration = (endDate - startDate) / (1000 * 60); // still safe in UTC
  if (duration !== calendarData.callLengthMinutes) {
    return {
      valid: false,
      message: `Sorry, times are restricted by the organization limit of ${calendarData.callLengthMinutes} minutes.`,
    };
  }
  if (duration > calendarData.slotLengthMinutes) {
    return {
      valid: false,
      message: `Sorry, this booking exceeds the length of ${calendarData.slotLengthMinutes} minutes as set by the organization.`,
    };
  }

  // 6. Conflict with Existing Bookings + Buffer
  const buffer = calendarData.bufferMinutes || 0;
  const conflict = existingBookings.some((b) => {
    const bufferStart = addMinutes(new Date(b.start), -buffer);
    const bufferEnd = addMinutes(new Date(b.end), buffer);
    return startDate < bufferEnd && endDate > bufferStart;
  });

  if (conflict) {
    return {
      valid: false,
      message:
        "We're sorry, you just missed it. While you were deciding, someone else booked this time slot. Please select a new time and try again.",
    };
  }

  // Passed all rules
  return { valid: true };
}

module.exports = { validateBooking };
