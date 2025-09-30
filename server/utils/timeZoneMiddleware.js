const { zonedTimeToUtc, utcToZonedTime } = require("date-fns-tz");
const { addMinutes } = require("date-fns");
const calendarData = require("../calendarData.json");

const defaultOrgTZ = calendarData.timeZone;

function timeZoneMiddleware(orgTZ = defaultOrgTZ) {
  return function (req, res, next) {
    try {
      const { date, time } = req.body;
      if (!date || !time) return next();

      const localString = `${date}T${time}`;

      // Start time in UTC
      const normalizedUtcStart = zonedTimeToUtc(localString, orgTZ);

      // Add call length + buffer from config
      const callLength = calendarData.callLengthMinutes || 30;
      const buffer = calendarData.bufferMinutes || 0;
      const normalizedUtcEnd = addMinutes(
        normalizedUtcStart,
        callLength + buffer
      );

      // Org-local versions
      const startOrgLocal = utcToZonedTime(normalizedUtcStart, orgTZ);
      const endOrgLocal = utcToZonedTime(normalizedUtcEnd, orgTZ);

      req.booking = {
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
