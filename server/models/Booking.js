const { Schema, model } = require('mongoose');

const bookingSchema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      match: [/.+@.+\..+/, "Must use a valid email address"],
    },
    phoneNumber: {
      type: String,
      required: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Must use a valid phone number"],
    },
    // YYYY-MM-DD in orgTZ
    date: { type: String, required: true },
    // UTC
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Prevent duplicate bookings for same start time on same date
bookingSchema.index({ date: 1, start: 1 }, { unique: true });

// turn on for debug: logs every save
// bookingSchema.pre('save', function (next) {
//   console.log("💾 Booking save trace:");
//   console.log(" - date (orgTZ):", this.date);
//   console.log(" - start (UTC):", this.start.toISOString());
//   console.log(" - end (UTC):", this.end.toISOString());
//   next();
// });

const Booking = model('Booking', bookingSchema);
module.exports = Booking;
