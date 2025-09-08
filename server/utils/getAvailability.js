const calendarData = require("../calendarData.json");
const { addMinutes, isBefore, isAfter, parseISO, format } = require("date-fns");
const {normalizeCalendarData} = require("./normalizeCalendar");

function getAvailability(dateStr) {
  const events = normalizeCalendarData();
  const businessHours = calendarData.businessHours;
  const slotLength = calendarData.slotLengthMinutes || 30;

  const date = new Date(dateStr);
  const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const hours = businessHours[dayOfWeek];

  if (!hours) return { date: dateStr, availableTimes: [], unavailableTimes: [] };

  let slots = buildSlots(dateStr, hours.start, hours.end, slotLength);

  // Remove past slots
  slots = slots.filter(slot => isAfter(parseISO(slot), new Date()));

  // Remove unavailable dates
  if (calendarData.unavailableDates.includes(dateStr)) {
    return { date: dateStr, availableTimes: [], unavailableTimes: slots };
  }

  // Filter conflicts with events (+buffer)
  const conflictFree = slots.filter(slot => {
    const slotStart = parseISO(slot);
    return events.every(ev => {
      const evStart = parseISO(ev.start);
      const evEnd = parseISO(ev.end);
      const bufferBefore = addMinutes(evStart, -slotLength);
      const bufferAfter = addMinutes(evEnd, slotLength);

      return !(slotStart >= bufferBefore && slotStart < bufferAfter);
    });
  });

  const unavailableTimes = slots.filter(s => !conflictFree.includes(s));

  return {
    date: dateStr,
    availableTimes: conflictFree.map(s => format(parseISO(s), "HH:mm")),
    unavailableTimes: unavailableTimes.map(s => format(parseISO(s), "HH:mm"))
  };
}

// Build slots using dynamic length
function buildSlots(dateStr, startTime, endTime, intervalMinutes) {
  const slots = [];
  let current = new Date(`${dateStr}T${startTime}:00`);
  const end = new Date(`${dateStr}T${endTime}:00`);

  while (isBefore(current, end)) {
    slots.push(current.toISOString());
    current = addMinutes(current, intervalMinutes);
  }

  return slots;
}

module.exports = {getAvailability};
