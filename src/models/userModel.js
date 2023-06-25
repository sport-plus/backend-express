const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    YOB: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default:
        'https://firebasestorage.googleapis.com/v0/b/thethaoplus-4d4e2.appspot.com/o/avatar_user.jpg?alt=media&token=1d60a80b-a10e-43ac-8965-fce3aaf689ae',
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'roles',
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
    },
    sportList: [
      {
        type: Schema.Types.ObjectId,
        ref: 'sports',
      },
    ],
    sportCenters: [
      {
        type: Schema.Types.ObjectId,
        ref: 'sportCenters',
      },
    ],
    bookingforUser: [
      {
        type: Schema.Types.ObjectId,
        ref: 'bookings',
      },
    ],
    // for Owner create booking for customers booking by phone or another
    bookingforOwner: [
      {
        type: Schema.Types.ObjectId,
        ref: 'bookings',
      },
    ],
    refreshToken: {
      type: String,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

//Hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//Login: compare password
userSchema.methods.isPasswordMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//Update password
userSchema.methods.createPasswordResetToken = async function () {
  const resettoken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resettoken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 10 minutes
  return resettoken;
};

const Users = mongoose.model('users', userSchema);

module.exports = Users;
