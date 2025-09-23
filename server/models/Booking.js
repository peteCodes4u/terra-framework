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
      type: String,
      required: true,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Ensure that a booking is always associated with a user
    }
  },
  // set to use virtuals if needed
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

// Prevents duplicate bookings for same start time on same date
bookingSchema.index({ date: 1, start: 1 }, { unique: true });

const Booking = model('Booking', bookingSchema);
module.exports = Booking;
