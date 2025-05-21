// Import Booking model
const { Booking } = require('../models');

// Establish CRUD methods for bookings
module.exports = {
  // Create a new booking
  async createBooking(req, res) {
    try {
      const booking = await Booking.create(req.body);
      res.status(201).json(booking);
    } catch (err) {
      res.status(500).json(err);
    }
  },
  // Get all bookings
  async getAllBookings(req, res) {
    try {
      const bookings = await Booking.find();
      res.status(200).json(bookings);
    } catch (err) {
      res.status(500).json(err);
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