// Apply Timezone to availability routes
import { userTimeZoneMiddleware } from "../../middleware/user-timezone";
const express = require("express");
const router = express.Router();
const { checkAvailability } = require('../../controllers/availability-controller');

router.get("/", userTimeZoneMiddleware, checkAvailability);

module.exports = router;