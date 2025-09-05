import { normalizeCalendarData } from './normalizeCalendar';
import calendarData from "../../server/calendarData.json" assert { type: "json" };
import { addMinutes, isBefore, isAfter, parseISO, format } from "date-fns";

export function getAvailability(dateStr) {
  const events = normalizeCalendarData();
  const businessHours = calendarData.businessHours;

  const date = new Date(dateStr);
  const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const hours = businessHours[dayOfWeek];

  if (!hours) {
    return { date: dateStr, availableTimes: [], unavailableTimes: [] };
  }

  // Generate 30-min slots within business hours
  let slots = buildSlots(dateStr, hours.start, hours.end, 30);

  // 1. Remove past slots
  slots = slots.filter(slot => isAfter(parseISO(slot), new Date()));

  // 2. Remove slots that fall on unavailable dates
  const unavailableDates = calendarData.unavailableDates;
  if (unavailableDates.includes(dateStr)) {
    return { date: dateStr, availableTimes: [], unavailableTimes: slots };
  }

  // 3. Filter out conflicts with events (+ buffer)
  const conflictFree = slots.filter(slot => {
    const slotStart = parseISO(slot);
    return events.every(ev => {
      const evStart = parseISO(ev.start);
      const evEnd = parseISO(ev.end);

      const bufferBefore = addMinutes(evStart, -30);
      const bufferAfter = addMinutes(evEnd, 30);

      // slot is invalid if it falls inside event or buffer
      if (slotStart >= bufferBefore && slotStart < bufferAfter) {
        return false;
      }
      return true;
    });
  });

  const unavailableTimes = slots.filter(s => !conflictFree.includes(s));

  return {
    date: dateStr,
    availableTimes: conflictFree.map(s => format(parseISO(s), "HH:mm")),
    unavailableTimes: unavailableTimes.map(s => format(parseISO(s), "HH:mm"))
  };
}

// helper to build 30-min slots
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
