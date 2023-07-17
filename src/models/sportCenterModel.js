const mongoose = require('mongoose');

const Schema = mongoose.Schema;

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
  },
  { timestamps: true }
);

const SportCenters = mongoose.model('sportCenters', sportCenterSchema);

module.exports = SportCenters;
