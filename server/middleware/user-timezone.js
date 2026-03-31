// Middleware to extract the user's timezone from the request headers and validate it.
function userTimeZoneMiddleware(req, res, next) {
    const rawTz = req.headers["x-user-timezone"];
    // Ensure empty values dont pass through as valid timezones
    const tz = typeof rawTz === "string" ? rawTz.trim() : "";

    let validTz = "";
    if (tz) {
        try {
            Intl.DateTimeFormat(undefined, { timeZone: tz });
            validTz = tz;
        } catch (error) {
            validTz = "";
        }
    }

    req.userTimeZone = validTz || "UTC";
    next();
}

module.exports = { userTimeZoneMiddleware };