const { Booking } = require("../models");
const { addMinutes } = require("date-fns");

module.exports = {
  // Create a new booking
  async createBooking(req, res) {
    try {
      const { start, end, name, email, phoneNumber } = req.body;

      if (!start || !end) {
        return res.status(400).json({ message: "Start and end times are required" });
      }

      const startDate = new Date(start);
      const endDate = new Date(end);

      // Derive date string (YYYY-MM-DD)
      const dateStr = startDate.toISOString().split("T")[0];

      // Conflict check: find existing bookings on the same day
      const existingBookings = await Booking.find({ date: dateStr });

      const conflict = existingBookings.some((b) => {
      const bufferStart = addMinutes(new Date(b.start), -30);
      const bufferEnd = addMinutes(new Date(b.end), 30);

      // New booking overlaps or too close to an existing one
      return startDate < bufferEnd && endDate > bufferStart;
      });

      if (conflict) {
        return res.status(400).json({
          message: "This slot is already booked or too close to another booking",
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

      res.status(200).json(booking);
    } catch (err) {
      console.error("Error creating booking:", err);
      res.status(500).json({ message: "Server error", error: err.message });
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
      res.status(200).json({ message: "Booking deleted successfully" });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Update a booking
  async updateBooking(req, res) {
    try {
      const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.status(200).json(booking);
    } catch (err) {
      res.status(400).json(err);
    }
  },
};
