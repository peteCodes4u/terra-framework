// Import Booking model
const { Booking } = require("../models");

const { signToken } = require("../utils/auth");

// Establish CRUD methods for bookings
module.exports = {
  // Create a new booking
  async createBooking(req, res) {
    const booking = await Booking.create(req.body);

    if (!booking) {
      return res.status(400).console.log(json({
        message: "Something went wrong - could not create booking, please try again",
      }));

    }
    const token = signToken(booking);
    res.json({ token, booking });
  },
  // Need to update this route to get all bookings
  // Get all bookings
  async getAllBookings(context) {

    try {
      const bookings = await Booking.find({});
      if (!bookings || bookings.length === 0) {
        return res.status(404).json({ message: "No bookings found" });
      }
      res.json(bookings);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
    // const token = signToken(bookings);
    // res.json({ token, bookings });
  },
  // Get user by id or email
  // async getOneBooking({ name = null, params }, res) {
  //   try {
  //     const foundBooking = await Booking.findOne({
  //       $or: [
  //         { _id: name ? name._id : params.id }

  //       ],
  //     });
  //     if (!foundBooking) {
  //       return res.status(400).json({
  //         message: "Sorry this booking doesn't exist in our records",
  //       });
  //     }
  //     res.json(foundBooking);
  //   } catch (err) {
  //     res.status(500).json({ message: "internal server error" });
  //   }
  // },
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
