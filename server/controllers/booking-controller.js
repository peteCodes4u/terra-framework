// Import Booking model
const { Booking } = require("../models");

const { signToken } = require("../utils/auth");

// Establish CRUD methods for bookings
module.exports = {
  // Create a new booking
  async createBooking(req, res) {
    try {
      console.log("req.user:", req.user); // Add this
      console.log("req.body:", req.body);
      const booking = await Booking.create({
        ...req.body,
        user: req.user._id, // Attach user ID from auth middleware 
      });
      res.status(200).json(booking);

    } catch (err) {
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
  //   Delete a booking
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
      res.status(500).json(err);
    }
  },
};
