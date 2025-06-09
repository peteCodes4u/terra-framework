const { Schema, model } = require('mongoose');

// Model will have name, email, date, and time fields

const bookingSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      match: [/.+@.+\..+/, "Must use a valid email address"],
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
  },
  // set to use virtuals if needed
  {
    toJSON: {
      virtuals: true,
    },
  }
);

const Booking = model('Booking', bookingSchema);
module.exports = Booking;
