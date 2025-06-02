const router = require('express').Router();
const {
  createUser,
  getSingleUser,
  login,
  updateUser,
  deleteUser,
} = require('../../controllers/user-controller');

// import needed middleware from utils/auth
const { authMiddleware } = require('../../utils/auth');

// update (METHOD = put) authMiddleware to send a token for verification on API requests
router.route("/").post(createUser).put(authMiddleware);

router.route("/login").post(login);

router.route("/me").get(authMiddleware, getSingleUser);



// update (METHOD = put) authMiddleware to send a token for verification on API requests
// delete (METHOD = delete) authMiddleware to send a token for verification on API requests
router
  .route('/:id')
  .put(authMiddleware, updateUser)
  .delete(authMiddleware, deleteUser);

module.exports = router;
