const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const paymentSchema = new Schema(
  {
    totalPrice: {
      type: Number,
      required: true,
    },
    deposit: {
      type: Number,
      required: true,
    },
    datepayment: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    hours: {
      type: String,
      required: true,
    },
    tracking: {
      type: String,
      default: 'Booked',
    },
    // information user don have account have payment
    userpayment: {
      type: String,
    },
    phonepayment: {
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
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Payments = mongoose.model('payments', paymentSchema);

module.exports = Payments;
