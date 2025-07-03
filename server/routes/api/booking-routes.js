const router = require('express').Router();

// Import Booking functionality from controller to establish route with CRUD functions
const {
    createBooking,
    getAllBookings,
    deleteBooking,
    updateBooking
} = require('../../controllers/booking-controller');

// import needed middleware from utils/auth
const { authMiddleware } = require('../../utils/auth');

// create and get Bookings
// POST to create a booking and GET to retrieve all bookings
router.route('/').post(authMiddleware, createBooking).get(authMiddleware, getAllBookings);


// Update and Delete Bookings
router
    .route('/:id')
    .put(authMiddleware, updateBooking)
    .delete(authMiddleware, deleteBooking);

module.exports = router;