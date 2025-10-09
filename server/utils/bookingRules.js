const { addMinutes, isBefore, isAfter } = require("date-fns");
const { utcToZonedTime, formatInTimeZone } = require("date-fns-tz");
const calendarData = require("../calendarData.json");

/**
 * Validate a booking against organization rules
 * @param {Date} startDate - UTC start time of booking
 * @param {Date} endDate - UTC end time of booking
 * @param {Array} existingBookings - Array of existing bookings [{start, end}]
 * @returns {Object} - { valid: boolean, message?: string }
 */
function validateBooking(startDate, endDate, existingBookings = []) {
  const orgTZ = calendarData.timeZone;

  // Convert UTC start/end into org time for **all business logic**
  const startLocal = utcToZonedTime(startDate, orgTZ);
  const endLocal = utcToZonedTime(endDate, orgTZ);

  // --- Organization date & day calculations ---
  const dateStr = formatInTimeZone(startLocal, orgTZ, "yyyy-MM-dd"); // Org date
  const day = formatInTimeZone(startLocal, orgTZ, "EEEE").toLowerCase(); // Org day

  // 1️⃣ Unavailable dates
  if (calendarData.unavailableDates.includes(dateStr)) {
    return {
      valid: false,
      message:
        "We're sorry, this date is unavailable. Please select another and try again, thank you.",
    };
  }

  // 2️⃣ Business hours check
  const hours = calendarData.businessHours[day];
  if (!hours) {
    return {
      valid: false,
      message: "We're sorry, this time is outside of our business hours.",
    };
  }

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

  // 3️⃣ Same-day booking restriction
  const todayStr = formatInTimeZone(new Date(), orgTZ, "yyyy-MM-dd");
  if (!calendarData.sameDayBookingPermitted && dateStr === todayStr) {
    return {
      valid: false,
      message:
        "We're sorry, same day booking is not permitted by the organization at this time.",
    };
  }

  // 4️⃣ Past date restriction
  if (dateStr < todayStr) {
    return {
      valid: false,
      message:
        "We're sorry, that is a past date. Past dates are not valid booking dates.",
    };
  }

  // 5️⃣ Slot length / call length
  const durationMinutes = (endDate - startDate) / (1000 * 60);
  if (durationMinutes !== calendarData.callLengthMinutes) {
    return {
      valid: false,
      message: `Sorry, times are restricted by the organization limit of ${calendarData.callLengthMinutes} minutes.`,
    };
  }
  if (durationMinutes > calendarData.slotLengthMinutes) {
    return {
      valid: false,
      message: `Sorry, this booking exceeds the length of ${calendarData.slotLengthMinutes} minutes as set by the organization.`,
    };
  }

  // 6️⃣ Conflict with existing bookings + buffer
  const buffer = calendarData.bufferMinutes || 0;
  const conflict = existingBookings.some((b) => {
    const bookingStartOrg = utcToZonedTime(b.start, orgTZ);
    const bookingEndOrg = utcToZonedTime(b.end, orgTZ);
    const bufferStart = addMinutes(bookingStartOrg, -buffer);
    const bufferEnd = addMinutes(bookingEndOrg, buffer);

    return startLocal < bufferEnd && endLocal > bufferStart;
  });

  if (conflict) {
    return {
      valid: false,
      message:
        "We're sorry, you just missed it. While you were deciding, someone else booked this time slot. Please select a new time and try again.",
    };
  }

  // ✅ Passed all rules
  return { valid: true };
}

module.exports = { validateBooking };
