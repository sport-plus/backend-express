const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const sportFieldSchema = new Schema(
  {
    fieldType: {
      type: String,
      default: '5 x 5',
    },
    sportCenter: {
      type: Schema.Types.ObjectId,
      ref: 'sportCenters',
      require: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const SportFields = mongoose.model('sportFields', sportFieldSchema);

module.exports = SportFields;
