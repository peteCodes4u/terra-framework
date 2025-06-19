const router = require('express').Router();

// Import Booking functionality from controller to establish route with CRUD functions
const {
    createBooking,
    getOneBooking,
    deleteBooking,
    updateBooking,
    getAllBookings
} = require('../../controllers/booking-controller');

// import needed middleware from utils/auth
const { authMiddleware } = require('../../utils/auth');

router.route('/').post(createBooking).put(authMiddleware);

router.route('/me').get(authMiddleware, getOneBooking);
router.route('/all').get(authMiddleware, getAllBookings);

// Update and Delete Bookings
router
    .route('/:id')
    .put(authMiddleware, updateBooking)
    .delete(authMiddleware, deleteBooking)
    .get(authMiddleware, getOneBooking)
    .get(authMiddleware, getAllBookings)


module.exports = router;