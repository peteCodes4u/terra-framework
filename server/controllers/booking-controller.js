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
      const { name, email, phoneNumber, slotIso, end } = req.body;

      if (!slotIso) {
        return res.status(400).json({ message: "Booking time is required" });
      }

      // Always interpret incoming slotIso as UTC if it ends with Z, else assume orgTZ
      let normalizedUtcStart;
      if (slotIso.endsWith("Z")) {
        normalizedUtcStart = new Date(slotIso);
      } else {
        normalizedUtcStart = zonedTimeToUtc(slotIso, orgTZ);
      }

      const normalizedUtcEnd = end
        ? (end.endsWith("Z") ? new Date(end) : zonedTimeToUtc(end, orgTZ))
        : addMinutes(normalizedUtcStart, calendarData.callLengthMinutes);

      // Derive org-local times for validation
      const startOrgLocal = utcToZonedTime(normalizedUtcStart, orgTZ);
      const endOrgLocal = utcToZonedTime(normalizedUtcEnd, orgTZ);

      const dateStr = startOrgLocal.toISOString().slice(0, 10);

      // Fetch all bookings for that date
      const existingBookings = await Booking.find({ date: dateStr });

      // console.group("📥 CREATE BOOKING DEBUG");
      // console.log("Incoming payload:", req.body);
      // console.log("Org TZ:", orgTZ);
      // console.log("normalizedUtcStart:", normalizedUtcStart);
      // console.log("normalizedUtcEnd:", normalizedUtcEnd);
      // console.groupEnd();

      const validation = validateBooking(normalizedUtcStart, normalizedUtcEnd, existingBookings);
      if (!validation.valid) {
        return res.status(400).json({
          error: "conflict",
          message: validation.message,
        });
      }

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


  // Update booking
  async updateBooking(req, res) {
    try {
      const { name, email, phoneNumber, slotIso, end } = req.body;
      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      let normalizedUtcStart = booking.start;
      let normalizedUtcEnd = booking.end;

      // Only recalc times if slotIso is provided (i.e., user changed the time)
      if (slotIso) {
        if (slotIso.endsWith("Z")) {
          normalizedUtcStart = new Date(slotIso);
        } else {
          normalizedUtcStart = zonedTimeToUtc(slotIso, orgTZ);
        }

        normalizedUtcEnd = end
          ? (end.endsWith("Z") ? new Date(end) : zonedTimeToUtc(end, orgTZ))
          : addMinutes(normalizedUtcStart, calendarData.callLengthMinutes);
      }

      const startOrgLocal = utcToZonedTime(normalizedUtcStart, orgTZ);
      const endOrgLocal = utcToZonedTime(normalizedUtcEnd, orgTZ);
      const dateStr = startOrgLocal.toISOString().slice(0, 10);

      const existingBookings = await Booking.find({
        date: dateStr,
        _id: { $ne: booking._id },
      });

      // Only revalidate conflicts if time changed
      if (slotIso) {
        const validation = validateBooking(normalizedUtcStart, normalizedUtcEnd, existingBookings);
        if (!validation.valid) {
          return res.status(400).json({
            error: "conflict",
            message: validation.message,
          });
        }
      }

      // Update only fields that were sent
      if (slotIso) {
        booking.start = normalizedUtcStart;
        booking.end = normalizedUtcEnd;
        booking.date = dateStr;
      }
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
