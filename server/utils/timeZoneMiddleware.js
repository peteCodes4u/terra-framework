// utils/timeZoneMiddleware.js
const { zonedTimeToUtc, utcToZonedTime } = require("date-fns-tz");
const { addMinutes } = require("date-fns");
const calendarData = require("../calendarData.json");

const defaultOrgTZ = calendarData.timeZone;

function timeZoneMiddleware(orgTZ = defaultOrgTZ) {
  return function (req, res, next) {
    try {
      const { date, time, slotIso } = req.body;
      const callLength = calendarData.callLengthMinutes || 30;
      const buffer = calendarData.bufferMinutes || 0;

      // --- Determine start UTC ---
      let normalizedUtcStart;
      if (slotIso) {
        // Frontend sent UTC directly → use as-is
        normalizedUtcStart = new Date(slotIso);
      } else if (date && time) {
        // Fallback: combine date+time string in orgTZ
        const localString = `${date}T${time}`;
        normalizedUtcStart = zonedTimeToUtc(localString, orgTZ);
      } else {
        // No date/time provided → skip middleware
        return next();
      }

      // --- Compute end UTC with call length + buffer ---
      const normalizedUtcEnd = addMinutes(normalizedUtcStart, callLength + buffer);

      // --- Compute orgTZ local references for logging/validation ---
      const startOrgLocal = utcToZonedTime(normalizedUtcStart, orgTZ);
      const endOrgLocal = utcToZonedTime(normalizedUtcEnd, orgTZ);

      // --- Attach to request ---
      req.bookingTimes = {
        normalizedUtcStart,
        normalizedUtcEnd,
        startOrgLocal,
        endOrgLocal,
      };

      // --- Logging for debug ---
      console.group("🧭 TIMEZONE MIDDLEWARE TRACE");
      console.log("Input slotIso:", slotIso);
      console.log("Input date:", date, "time:", time);
      console.log("Normalized UTC start:", normalizedUtcStart);
      console.log("Normalized UTC end:", normalizedUtcEnd);
      console.log("Start orgTZ local:", startOrgLocal);
      console.log("End orgTZ local:", endOrgLocal);
      console.groupEnd();

      next();
    } catch (err) {
      console.error("TimeZoneMiddleware error:", err);
      next(err);
    }
  };
}

module.exports = { timeZoneMiddleware };
