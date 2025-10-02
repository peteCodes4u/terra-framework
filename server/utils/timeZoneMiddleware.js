// utils/timeZoneMiddleware.js
const { zonedTimeToUtc, utcToZonedTime } = require("date-fns-tz");
const { addMinutes } = require("date-fns");
const calendarData = require("../calendarData.json");

const defaultOrgTZ = calendarData.timeZone;

function timeZoneMiddleware(orgTZ = defaultOrgTZ) {
  return function (req, res, next) {
    try {
      const { date, time } = req.body;

      // If no date/time provided, skip
      if (!date || !time) return next();

      // Combine date+time string as if it's in orgTZ
      const localString = `${date}T${time}`;

      // Always normalize to UTC for storage
      const normalizedUtcStart = zonedTimeToUtc(localString, orgTZ);

      // Add call length + buffer
      const callLength = calendarData.callLengthMinutes || 30;
      const buffer = calendarData.bufferMinutes || 0;
      const normalizedUtcEnd = addMinutes(
        normalizedUtcStart,
        callLength + buffer
      );

      // Convert back to org local (for validation / display only)
      const startOrgLocal = utcToZonedTime(normalizedUtcStart, orgTZ);
      const endOrgLocal = utcToZonedTime(normalizedUtcEnd, orgTZ);

      // Attach only UTC + useful local reference
      req.bookingTimes = {
        normalizedUtcStart,
        normalizedUtcEnd,
        startOrgLocal,
        endOrgLocal,
      };

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { timeZoneMiddleware };
