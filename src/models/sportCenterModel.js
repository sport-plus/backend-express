const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const priceSchema = new mongoose.Schema({
  timeStart: {
    type: Number,
  },
  timeEnd: {
    type: Number,
  },
  price: {
    type: Number,
    required: true,
  },
});
const slotsSchema = new mongoose.Schema({
  startTime: {
    type: String,
  },
  endTime: {
    type: String,
  },
});
const priceOptionSchema = new mongoose.Schema({
  fieldType: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  listPrice: {
    type: [priceSchema],
    required: true,
  },
  slots: {
    type: [slotsSchema],
    required: true,
  },
});
const sportCenterSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    image: [],
    address: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    latitude: {
      type: String,
      required: true,
    },
    longtitude: {
      type: String,
      required: true,
    },
    openTime: {
      type: String,
      required: true,
    },
    closeTime: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    ratings: [
      {
        star: Number,
        comment: String,
        postedby: {
          type: Schema.Types.ObjectId,
          ref: 'users',
        },
      },
    ],
    totalrating: {
      type: String,
      default: 0,
    },
    // for get list booking owner have
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      require: true,
    },
    sport: {
      type: Schema.Types.ObjectId,
      ref: 'sports',
      require: true,
    },
    priceOption: {
      type: [priceOptionSchema],
      required: true,
    },
    
  },
  { timestamps: true }
);

const SportCenters = mongoose.model('sportCenters', sportCenterSchema);

module.exports = SportCenters;
