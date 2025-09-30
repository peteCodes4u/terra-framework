const { zonedTimeToUtc, utcToZonedTime } = require("date-fns-tz");
const calendarData = require("../calendarData.json");

const defaultOrgTZ = calendarData.timeZone;

function timeZoneMiddleware(orgTZ = defaultOrgTZ) {
  return function (req, res, next) {
    try {
      const { date, time } = req.body;
      if (!date || !time) return next();

      const localString = `${date}T${time}`;
      const utcDate = zonedTimeToUtc(localString, orgTZ);

      req.booking = {
        normalizedUtc: utcDate,
        orgLocal: utcToZonedTime(utcDate, orgTZ),
      };

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { timeZoneMiddleware };
