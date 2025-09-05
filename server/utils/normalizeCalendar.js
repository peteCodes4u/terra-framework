import fs from "fs";
import path from "path";

export function normalizeCalendarData() {
  const filePath = path.join(process.cwd(), "server", "calendarData.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);

  const events = [];

  // 1. Normalize mockEvents
  if (Array.isArray(data.mockEvents)) {
    data.mockEvents.forEach(evt => {
      events.push({
        id: evt.id,
        title: evt.title,
        start: evt.start,
        end: evt.end,
        source: evt.source || "google"
      });
    });
  }

  // 2. Convert unavailableDates into all-day "blocked" events
  if (Array.isArray(data.unavailableDates)) {
    data.unavailableDates.forEach((date, i) => {
      events.push({
        id: `unavail-${i}`,
        title: "Unavailable (Business Rule)",
        start: `${date}T00:00:00-04:00`,
        end: `${date}T23:59:59-04:00`,
        source: "homebrew"
      });
    });
  }

  return events;
}
