const router = require('express').Router();
const {
    createBooking,
    getAllBookings,
    updateBooking,
    deleteBooking,
} = require("../../controllers/booking-controller");

// import needed middleware from utils/auth
const { authMiddleware } = require("../../utils/auth");

// When booking is created, GET all bookings
router.route('/').post(authMiddleware, createBooking).get(authMiddleware, getAllBookings);
// When booking is updated, PUT to update the booking


module.exports = router;