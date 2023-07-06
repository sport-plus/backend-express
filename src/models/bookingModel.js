const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    totalPrice: {
      type: Number,
      required: true,
    },
    deposit: {
      type: Number,
      required: true,
    },
    start: {
      type: String,
      required: [true, 'Please Insert The Start of your event'],
      min: [new Date(), "can't be before now!!"],
    },
    end: {
      type: String,
      required: true
      // min: [
      //   function () {
      //     const date = new Date(this.start);
      //     const validDate = new Date(date.setHours(date.getHours() + 1));
      //     return validDate;
      //   },
      //   'Event End must be at least one hour a head of event time',
      // ],
      // default: function () {
      //   const date = new Date(this.start);
      //   return date.setDate(date.getHours() + 1, date.getMinutes() + 30);
      // },
    },
    tracking: {
      type: String,
      default: 'Pending',
    },
    // information user don have account have booking
    userBooking: {
      type: String,
    },
    phoneBooking: {
      type: String,
    },
    //
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      require: true,
    },
    sportCenter: {
      type: Schema.Types.ObjectId,
      ref: 'sportCenters',
      require: true,
    },
    sportField: {
      type: Schema.Types.ObjectId,
      ref: 'sportFields',
    },
    payments: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Boolean,
      default: true,
    },
    date: {
      type: Date,
      required: true,
    }
  },
);

const Bookings = mongoose.model('bookings', bookingSchema);

module.exports = Bookings;
