const router = require('express').Router();

// Import Booking functionality from controller to establish route with CRUD functions
const {
    createBooking,
    getAllBookings,
    deleteBooking,
    updateBooking
} = require('../../controllers/booking-controller');

const calendarData = require('../../calendarData.json');
const defaultOrgTZ = calendarData.timeZone;

// import needed middleware from utils/auth
const { authMiddleware } = require('../../utils/auth');

const { timeZoneMiddleware } = require('../../utils/timeZoneMiddleware');

// create and get Bookings
// POST to create a booking and GET to retrieve all bookings
router.route('/').post(authMiddleware, timeZoneMiddleware(defaultOrgTZ), createBooking).get(authMiddleware, getAllBookings);


// Update and Delete Bookings
router
    .route('/:id')
    .put(authMiddleware, timeZoneMiddleware(defaultOrgTZ), updateBooking)
    .delete(authMiddleware, deleteBooking);

module.exports = router;