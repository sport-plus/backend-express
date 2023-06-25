const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const sportSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      default:
        'https://firebasestorage.googleapis.com/v0/b/thethaoplus-4d4e2.appspot.com/o/sport.png?alt=media&token=2d2c6703-5121-4242-9841-3b41fa9eaba1',
    },
    status: {
      type: Boolean,
      default: true,
    },
    add: {
      type: Boolean,
      default: false,
    },
    sportCenters: [
      {
        type: Schema.Types.ObjectId,
        ref: 'sportCenters',
      },
    ],
  },
  { timestamps: true }
);

const Sports = mongoose.model('sports', sportSchema);

module.exports = Sports;
