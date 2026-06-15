// Apply Timezone to availability routes
const { userTimeZoneMiddleware } = require("../../middleware/user-timezone");
const express = require("express");
const router = express.Router();
const { checkAvailability } = require('../../controllers/availability-controller');

router.get("/", userTimeZoneMiddleware, checkAvailability);

module.exports = router;