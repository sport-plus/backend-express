const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const roleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Roles = mongoose.model('roles', roleSchema);

module.exports = Roles;
