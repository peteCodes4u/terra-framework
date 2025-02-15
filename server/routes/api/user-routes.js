const router = require('express').Router();
const {
    createUser,
    getSingleUser,
    login,

} = require('../../controllers/user-controller');

// import necessary middleware
const { authMiddleware } = require('../../utils/auth');

// auth middleware for token verification on API requests
router.route('/').post(createUser).put(authMiddleware);
router.route('/login').post(login);
router.route('/me').get(authMiddleware, getSingleUser);

module.exports = router;