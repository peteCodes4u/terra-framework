const express = require("express");
const router = express.Router();
const { checkAvailability } = require('../../controllers/availability-controller');

router.get("/", checkAvailability);

module.exports = router;
