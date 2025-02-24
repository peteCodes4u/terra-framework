// index.js is a file that will export all of our routes in one place.
// Index files are needed for express to identify API routes and import them into the server.
// all API routes will be imported into this file and then exported as an object. Add additional routes to the object as needed.
// This file will be used to collect all of the API routes and package them for use in the server.
const router = require('express').Router();
const userRoutes = require('./user-routes');

router.use('/users', userRoutes);

module.exports = router;