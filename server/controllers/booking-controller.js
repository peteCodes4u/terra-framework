const { Booking } = require("../models");
const { signToken } = require("../utils/auth");
const calendarData = require("../calendarData.json");
const { validateBooking } = require("../utils/bookingRules");
const { utcToZonedTime, zonedTimeToUtc } = require("date-fns-tz");
const { addMinutes } = require("date-fns");

const orgTZ = calendarData.timeZone;

module.exports = {
  // Create a new booking
  async createBooking(req, res) {
    try {
      const { name, email, phoneNumber } = req.body;

      // Use middleware-provided times if present, fallback to slotIso
      let { normalizedUtcStart, normalizedUtcEnd, startOrgLocal, endOrgLocal } =
        req.bookingTimes || {};

      if (!normalizedUtcStart) {
        const { slotIso, end } = req.body;
        if (!slotIso) {
          return res.status(400).json({ message: "Booking time is required" });
        }

        const slotUtc = slotIso.endsWith("Z")
          ? new Date(slotIso)
          : zonedTimeToUtc(slotIso, orgTZ);

        normalizedUtcStart = slotUtc;

        normalizedUtcEnd = end
          ? (end.endsWith("Z") ? new Date(end) : zonedTimeToUtc(end, orgTZ))
          : addMinutes(normalizedUtcStart, calendarData.callLengthMinutes);

        startOrgLocal = utcToZonedTime(normalizedUtcStart, orgTZ);
        endOrgLocal = utcToZonedTime(normalizedUtcEnd, orgTZ);
      }

      const dateStr = normalizedUtcStart.toISOString().slice(0, 10);

      // Fetch all bookings for that date
      const existingBookings = await Booking.find({ date: dateStr });

      // Validate using org-local times
      const validation = validateBooking(startOrgLocal, endOrgLocal, existingBookings);
      if (!validation.valid) {
        return res.status(400).json({
          error: "conflict",
          message: validation.message,
        });
      }

      // Store UTC values in DB
      const booking = await Booking.create({
        name,
        email,
        phoneNumber,
        start: normalizedUtcStart,
        end: normalizedUtcEnd,
        date: dateStr,
        user: req.user._id,
      });

      const token = signToken(req.user);
      res.status(200).json({ booking, token, user: req.user });
    } catch (err) {
      console.error("Error creating booking:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },

  // Update a booking
  async updateBooking(req, res) {
    try {
      const { name, email, phoneNumber } = req.body;

      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Use middleware-provided times if present, fallback to slotIso normalized to orgTZ
      let { normalizedUtcStart, normalizedUtcEnd, startOrgLocal, endOrgLocal } =
        req.bookingTimes || {};

      if (!normalizedUtcStart) {
        const { slotIso, end } = req.body;
        normalizedUtcStart = slotIso
          ? (slotIso.endsWith("Z") ? new Date(slotIso) : zonedTimeToUtc(slotIso, orgTZ))
          : booking.start;
        normalizedUtcEnd = end
          ? (end.endsWith("Z") ? new Date(end) : zonedTimeToUtc(end, orgTZ))
          : addMinutes(normalizedUtcStart, calendarData.callLengthMinutes);

        startOrgLocal = utcToZonedTime(normalizedUtcStart, orgTZ);
        endOrgLocal = utcToZonedTime(normalizedUtcEnd, orgTZ);
      }

      const dateStr = normalizedUtcStart.toISOString().slice(0, 10);

      const existingBookings = await Booking.find({
        date: dateStr,
        _id: { $ne: booking._id },
      });

      const validation = validateBooking(startOrgLocal, endOrgLocal, existingBookings);
      if (!validation.valid) {
        return res.status(400).json({
          error: "conflict",
          message: validation.message,
        });
      }

      // Update booking in UTC
      booking.start = normalizedUtcStart;
      booking.end = normalizedUtcEnd;
      booking.date = dateStr;
      if (name !== undefined) booking.name = name;
      if (email !== undefined) booking.email = email;
      if (phoneNumber !== undefined) booking.phoneNumber = phoneNumber;

      await booking.save();

      const token = signToken(req.user);
      res.status(200).json({ booking, token, user: req.user });
    } catch (err) {
      console.error("Error updating booking:", err);
      res.status(400).json({ message: "Error updating booking", error: err.message });
    }
  },

  // Get all bookings
  async getAllBookings(req, res) {
    try {
      const bookings = await Booking.find({ user: req.user._id });
      res.json(bookings);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Delete a booking
  async deleteBooking(req, res) {
    try {
      const booking = await Booking.findByIdAndDelete(req.params.id);
      if (!booking) return res.status(404).json({ message: "Booking not found" });

      const token = signToken(req.user);
      res.status(200).json({ success: true, token, user: req.user });
    } catch (err) {
      res.status(500).json({ message: "Error deleting booking", error: err.message });
    }
  },
};
