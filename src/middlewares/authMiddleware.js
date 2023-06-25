const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Users = require('../models/userModel');

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith('Bearer')) {
    token = req?.headers?.authorization.split(' ')[1];
    try {
      if (token) {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Users.findById(decode?.id);
        req.user = user;
        next();
      }
    } catch (error) {
      throw new Error('Not Authorized token expired, Please login again!');
    }
  } else {
    throw new Error('There is not token attached to header!');
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const adminUser = await Users.findOne({ email: email }).populate('role');
  if (adminUser.role.name !== 'admin') {
    throw new Error('You are not an admin');
  } else {
    next();
  }
});

const isOwner = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const OwnerUser = await Users.findOne({ email: email }).populate('role');
  if (OwnerUser.role.name !== 'owner') {
    throw new Error('You are not an owner');
  } else {
    next();
  }
});

const isUser = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const OwnerUser = await Users.findOne({ email: email }).populate('role');
  if (OwnerUser.role.name !== 'user') {
    throw new Error('You are not an user');
  } else {
    next();
  }
});

module.exports = { authMiddleware, isAdmin, isOwner, isUser };
