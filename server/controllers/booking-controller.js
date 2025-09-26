const { Booking } = require("../models");
const { signToken } = require("../utils/auth");
const calendarData = require("../calendarData.json");
const { validateBooking } = require("../utils/bookingRules");

module.exports = {
  // Create a new booking
  async createBooking(req, res) {
    try {
      const { start, end, name, email, phoneNumber } = req.body;

      if (!start || !end) {
        return res
          .status(400)
          .json({ message: "Start and end times are required" });
      }

      const startDate = new Date(start);
      const endDate = new Date(end);
      const dateStr = startDate.toISOString().split("T")[0];

      // Fetch all bookings for that date
      const existingBookings = await Booking.find({ date: dateStr });

      // Run validation
      const validation = validateBooking(startDate, endDate, existingBookings);
      if (!validation.valid) {
        return res.status(400).json({
          error: 'conflict',
          message: validation.message
        });
      }

      // Create booking
      const booking = await Booking.create({
        name,
        email,
        phoneNumber,
        start: startDate,
        end: endDate,
        date: dateStr,
        user: req.user._id,
      });

      const token = signToken(req.user);
      res.status(200).json({ booking, token, user: req.user });
    } catch (err) {
      console.error("Error creating booking:", err);
      res
        .status(500)
        .json({ message: "Server error", error: err.message });
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
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      const token = signToken(req.user);
      res.status(200).json({ success: true, token, user: req.user });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Update a booking
  async updateBooking(req, res) {
    try {
      const { name, email, phoneNumber, start, end } = req.body;

      // Ensure booking exists
      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // If start/end provided, run validation
      if (start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const dateStr = startDate.toISOString().split("T")[0];

        // Exclude current booking when checking conflicts
        const existingBookings = await Booking.find({
          date: dateStr,
          _id: { $ne: booking._id },
        });

        const validation = validateBooking(
          startDate,
          endDate,
          existingBookings
        );
        if (!validation.valid) {
          return res.status(400).json({
            error: "conflict",
            message: validation.message,
          });
        }

        booking.start = startDate;
        booking.end = endDate;
        booking.date = dateStr;
      }

      // Update other allowed fields
      if (name !== undefined) booking.name = name;
      if (email !== undefined) booking.email = email;
      if (phoneNumber !== undefined) booking.phoneNumber = phoneNumber;

      await booking.save();

      const token = signToken(req.user);
      res.status(200).json({ booking, token, user: req.user });
    } catch (err) {
      console.error("Error updating booking:", err);
      res
        .status(400)
        .json({ message: "Error updating booking", error: err.message });
    }
  },
};
