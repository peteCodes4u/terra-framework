const router = require('express').Router();

// Import Booking functionality from controller to establish route with CRUD functions
const {
    createBooking,
    getOneBooking,
    deleteBooking,
    updateBooking
} = require('../../controllers/booking-controller');

// import needed middleware from utils/auth
const { authMiddleware } = require('../../utils/auth');

router.route('/').post(createBooking).put(authMiddleware);

router.route('me').get(authMiddleware, getOneBooking);

// Update and Delete Bookings
router
    .route('/:id')
    .put(authMiddleware, updateBooking)
    .delete(authMiddleware, deleteBooking);

module.exports = router;