const fs = require("fs");
const path = require("path");
const { zonedTimeToUtc } = require("date-fns-tz");

function normalizeCalendarData() {
  const filePath = path.join(__dirname, "..", "calendarData.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);

  const orgTZ = data.timeZone || 'UTC'

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

      const startUtc = zonedTimeToUtc(`${date}T00:00:00`, orgTZ);
      const endUtc = zonedTimeToUtc(`${date}T23:59:59`, orgTZ);

      events.push({
        id: `unavail-${i}`,
        title: "Unavailable (Business Rule)",
        start: startUtc.toISOString(),
        end: endUtc.toISOString(),
        source: "homebrew"
      });
    });
  }

  return events;
}

module.exports= { normalizeCalendarData }
