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
// import user timezone middleware to ensure we have a valid timezone for the user making the request
const { userTimeZoneMiddleware } = require('../../middleware/user-timezone');
// const { timeZoneMiddleware } = require('../../utils/timeZoneMiddleware');

// create and get Bookings
// POST to create a booking and GET to retrieve all bookings
router.route('/').post(authMiddleware, userTimeZoneMiddleware, createBooking).get(authMiddleware, userTimeZoneMiddleware, getAllBookings);


// Update and Delete Bookings
router
    .route('/:id')
    .put(authMiddleware, userTimeZoneMiddleware, updateBooking)
    .delete(authMiddleware, userTimeZoneMiddleware, deleteBooking);

module.exports = router;