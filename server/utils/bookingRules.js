const { addMinutes } = require("date-fns");
const { utcToZonedTime, zonedTimeToUtc, formatInTimeZone } = require("date-fns-tz");
const calendarData = require("../calendarData.json");

/**
 * Validate a booking against organization rules
 * @param {Date} startDate - UTC start time of booking
 * @param {Date} endDate - UTC end time of booking
 * @param {Array} existingBookings - Array of existing bookings [{start, end}]
 * @returns {Object} - { valid: boolean, message?: string }
 */
function validateBooking(startDate, endDate, existingBookings = []) {
  if (!startDate || !endDate) {
    throw new Error("startDate and endDate must be provided");
  }

  const orgTZ = calendarData.timeZone;
  const callLength = calendarData.callLengthMinutes || 30;
  const slotLength = calendarData.slotLengthMinutes || 45;
  const buffer = calendarData.bufferMinutes || 0;

  // --- Org date & day from original UTC startDate
  const dateStr = formatInTimeZone(startDate, orgTZ, "yyyy-MM-dd");
  const day = formatInTimeZone(startDate, orgTZ, "EEEE").toLowerCase();

  // --- Logging
  console.log("🧭 VALIDATE BOOKING TRACE:");
  console.log(`• startDate (UTC): ${startDate.toISOString()}`);
  console.log(`• endDate (UTC): ${endDate.toISOString()}`);
  console.log(`• dateStr (orgTZ): ${dateStr}`);
  console.log(`• orgTZ: ${orgTZ}`);

  // 1️⃣ Unavailable dates
  if (calendarData.unavailableDates.includes(dateStr)) {
    return {
      valid: false,
      message: "We're sorry, this date is unavailable. Please select another and try again.",
    };
  }

  // 2️⃣ Business hours
  const hours = calendarData.businessHours[day];
  if (!hours) {
    return {
      valid: false,
      message: "We're sorry, this time is outside of our business hours.",
    };
  }

  // --- Compute all valid slots for the day in UTC (congruent with getAvailability)
  const slots = [];
  let slotStart = zonedTimeToUtc(`${dateStr}T${hours.start}:00`, orgTZ);
  const businessEndUtc = zonedTimeToUtc(`${dateStr}T${hours.end}:00`, orgTZ);

  while (slotStart < businessEndUtc) {
    const slotEnd = addMinutes(slotStart, callLength);
    if (slotEnd > businessEndUtc) break;
    slots.push({ start: slotStart, end: slotEnd });
    slotStart = addMinutes(slotStart, slotLength);
  }

  console.log("• Computed slots (UTC):", slots.map(s => s.start.toISOString()));

  // 3️⃣ Check if the booking matches any slot
  let slotMatch = null;
  for (const s of slots) {
    if (startDate.getTime() === s.start.getTime() && endDate.getTime() === s.end.getTime()) {
      slotMatch = s;
      break;
    }
  }

  if (!slotMatch) {
    console.warn("⚠️ Booking rejected: outside business hours boundary check.");
    console.log("• User selection does not match any valid slot:");
    console.log(`  - User startDate (UTC): ${startDate.toISOString()}`);
    console.log(`  - User endDate   (UTC): ${endDate.toISOString()}`);
    console.log("• Closest slots:");
    slots.forEach((s, i) =>
      console.log(`  Slot ${i + 1}: ${s.start.toISOString()} -> ${s.end.toISOString()}`)
    );
    return {
      valid: false,
      message: "We're sorry, this booking is outside of our business hours.",
    };
  }

  console.log("✅ Slot matched:", slotMatch.start.toISOString(), "->", slotMatch.end.toISOString());

  // 4️⃣ Same-day booking restriction
  const todayStr = formatInTimeZone(new Date(), orgTZ, "yyyy-MM-dd");
  if (!calendarData.sameDayBookingPermitted && dateStr === todayStr) {
    return {
      valid: false,
      message: "We're sorry, same day booking is not permitted by the organization at this time.",
    };
  }

  // 5️⃣ Past date restriction
  if (dateStr < todayStr) {
    return {
      valid: false,
      message: "We're sorry, that is a past date. Past dates are not valid booking dates.",
    };
  }

  // 6️⃣ Slot length / call length validation
  const durationMinutes = (endDate - startDate) / (1000 * 60);
  if (durationMinutes !== callLength) {
    return {
      valid: false,
      message: `Sorry, times are restricted by the organization limit of ${callLength} minutes.`,
    };
  }
  if (durationMinutes > slotLength) {
    return {
      valid: false,
      message: `Sorry, this booking exceeds the length of ${slotLength} minutes as set by the organization.`,
    };
  }

  // 7️⃣ Conflict with existing bookings + buffer
  if (!Array.isArray(existingBookings)) existingBookings = [];
  const startLocal = utcToZonedTime(startDate, orgTZ);
  const endLocal = utcToZonedTime(endDate, orgTZ);

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
      message: "We're sorry, you just missed it. While you were deciding, someone else booked this time slot. Please select a new time and try again.",
    };
  }

  // ✅ Passed all rules
  return { valid: true };
}

module.exports = { validateBooking };
