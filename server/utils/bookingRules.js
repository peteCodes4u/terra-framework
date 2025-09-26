const { addMinutes, isBefore, isAfter } = require("date-fns");
const calendarData = require("../calendarData.json");

function validateBooking(startDate, endDate, existingBookings = []) {
  const dateStr = startDate.toISOString().split("T")[0];

  // 1. Unavailable Dates
  if (calendarData.unavailableDates.includes(dateStr)) {
    return { valid: false, message: "We'er sorry, This date is unavailable. Please select another and try again, thank you." };
  }

  // 2. Business Hours
  const day = startDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const hours = calendarData.businessHours[day];
  if (!hours) {
    return { valid: false, message: "We'er sorry, This time is outside of our business hours." };
  }

  const [startH, startM] = hours.start.split(":").map(Number);
  const [endH, endM] = hours.end.split(":").map(Number);

  const businessStart = new Date(startDate);
  businessStart.setHours(startH, startM, 0, 0);

  const businessEnd = new Date(startDate);
  businessEnd.setHours(endH, endM, 0, 0);

  if (isBefore(startDate, businessStart) || isAfter(endDate, businessEnd)) {
    return { valid: false, message: "We'er sorry, this Booking is outside of our business hours." };
  }

  // 3. Slot Length + Call Length
  const duration = (endDate - startDate) / (1000 * 60);
  if (duration !== calendarData.callLengthMinutes) {
    return { valid: false, message: `Sorry, Times are restricted by the organization limit of ${calendarData.callLengthMinutes} minutes.` };
  }
  if (duration > calendarData.slotLengthMinutes) {
    return { valid: false, message: `Sorry, this Booking exceeds the length of ${calendarData.slotLengthMinutes} minutes as set by the organization.` };
  }

  // 4. Conflict with Existing Bookings + Buffer
  const buffer = calendarData.bufferMinutes || 0;
  const conflict = existingBookings.some(b => {
    const bufferStart = addMinutes(new Date(b.start), -buffer);
    const bufferEnd = addMinutes(new Date(b.end), buffer);
    return startDate < bufferEnd && endDate > bufferStart;
  });

  if (conflict) {
    return { valid: false, message: "We're Sorry, you just missed it, While you were deciding, someone else just booked this time slot, please select a new time and try again thank you!" };
  }

  // ✅ Passed all rules
  return { valid: true };
}

module.exports = { validateBooking };
