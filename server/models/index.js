// index.js is a file that will export all of our models in one place.
// This will allow us to import all of our models collectively from one location rather than requiring each model individually.
// all models will be imported into this file and then exported as an object. Add additional models to the object as needed.
const User = require('./User');
const Booking = require('./Booking');

module.exports = { User, Booking };