const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const uniqid = require('uniqid');

const { generateToken } = require('../config/jwtToken');
const { generateRefreshToken } = require('../config/refreshToken');
const validateMongoDbId = require('../utils/validateMongodbid');

const Users = require('../models/userModel');
const Roles = require('../models/roleModel');
const { sendEmail } = require('./emailController');

const createUser = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Register']
    #swagger.description = Register - Create new customer aaa {
    "firstname": "Van",
    "lastname": "My Anh",
    "email": "vthmyanh2604@gmail.com",
    "phone": "0951258456",
    "password": "myanh123",
    "gender": "female",
    "YOB": 2002,
    "role": "646b6c50adcb2a812de75c26" }
    
  */
  const { email, firstname, lastname, phone, password, gender, YOB, role } =
    req.body;
  let isValid = await Roles.findById(role);
  if (!isValid) {
    throw new Error('Role id is not valid or not found');
  }

  const findUser = await Users.findOne({ email: email });
  if (!findUser) {
    //Create a new user
    const newUser = await Users.create(req.body);
    res.status(201).json({
      status: 201,
      message: 'Create a new user successfully.',
      data: {
        user: newUser,
      },
    });
  } else {
    throw new Error('User already exists!');
  }
});

const createOwner = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Register']
    #swagger.description = Register - Create new owner - {
    "firstname": "Van",
    "lastname": "My Anh",
    "email": "vthmyanh2604@gmail.com",
    "phone": "0951258456",
    "password": "myanh123",
    "gender": "female",
    "YOB": 2002,
    "role": "646b6c50adcb2a812de75c26" }
  */
  const { email, firstname, lastname, phone, password, gender, YOB, role } =
    req.body;
  let isValid = await Roles.findById(role);
  if (!isValid) {
    throw new Error('Role id is not valid or not found');
  }

  const findUser = await Users.findOne({ email: email });
  if (!findUser) {
    //Create a new user
    const newUser = await Users.create(req.body);
    res.status(201).json({
      status: 201,
      message: 'Create a new owner successfully.',
      data: {
        user: newUser,
      },
    });
  } else {
    res.status(400).json({
      status: 400,
      message: 'User already exists!',
    });
  }
});

const createAdmin = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Register']
    #swagger.description = Register - Create new admin - {
    "firstname": "Van",
    "lastname": "My Anh",
    "email": "vthmyanh2604@gmail.com",
    "phone": "0951258456",
    "password": "myanh123",
    "gender": "female",
    "YOB": 2002,
    "role": "646b6c50adcb2a812de75c26" }
  */
  const { email, firstname, lastname, phone, password, gender, YOB, role } =
    req.body;
  let isValid = await Roles.findById(role);
  if (!isValid) {
    throw new Error('Role id is not valid or not found');
  }

  const findUser = await Users.findOne({ email: email });
  if (!findUser) {
    //Create a new user
    const newUser = await Users.create(req.body);
    res.status(201).json({
      status: 201,
      message: 'Create a new admin successfully.',
      data: {
        user: newUser,
      },
    });
  } else {
    throw new Error('User already exists!');
  }
});

//Login a user
const login = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Login']
    #swagger.description = Login a custom - { "email": "vthmyanh2604@gmail.com", "password": "myanh123" }
  */
  const { email, password } = req.body;
  //check id user exits or not
  const findUser = await Users.findOne({ email: email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id);

    const updateUser = await Users.findByIdAndUpdate(
      findUser._id,
      { refreshToken: refreshToken },
      { new: true }
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.status(200).json({
      status: 200,
      user: findUser,
      token: generateToken(findUser?._id),
    });
  } else {
    res.status(400).json({
      status: 400,
      message: 'Invalid credentials!',
    });
  }
});

//Owner login
const loginOwner = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Login']
    #swagger.description = Login a owner - { "email": "vthmyanh2604@gmail.com", "password": "myanh123" }
  */
  const { email, password } = req.body;
  //check id user exits or not
  const findOwner = await Users.findOne({ email: email }).populate('role');
  if (findOwner.role.name !== 'owner') {
    res.status(403).json({
      status: 403,
      message: 'Not Authorized!',
    });
  }
  if (findOwner && (await findOwner.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findOwner?._id);

    const updateUser = await Users.findByIdAndUpdate(
      findOwner._id,
      { refreshToken: refreshToken },
      { new: true }
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.status(200).json({
      status: 200,
      user: findOwner,
      token: generateToken(findOwner?._id),
    });
  } else {
    res.status(400).json({
      status: 400,
      message: 'Invalid credentials!',
    });
  }
});

//Admin login
const loginAdmin = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Login']
    #swagger.description = Login an admin - { "email": "vthmyanh2604@gmail.com", "password": "myanh123" }
  */
  const { email, password } = req.body;
  //check id user exits or not
  const findAdmin = await Users.findOne({ email: email }).populate('role');
  console.log('x', findAdmin);
  if (findAdmin.role.name !== 'admin') {
    res.status(403).json({
      status: 403,
      message: 'Not Authorized!',
    });
  }
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);

    const updateUser = await Users.findByIdAndUpdate(
      findAdmin._id,
      { refreshToken: refreshToken },
      { new: true }
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.status(200).json({
      status: 200,
      user: findAdmin,
      token: generateToken(findAdmin?._id),
    });
  } else {
    res.status(400).json({
      status: 400,
      message: 'Invalid credentials!',
    });
  }
});

//Handle refresh token
const handlerRefreshToken = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Auth']
    #swagger.description = "Get refresh token"
  */
  const cookie = req.cookies;
  if (!cookie.refreshToken) {
    throw new Error('No refresh token in cookie!');
  }
  const refreshToken = cookie.refreshToken;
  const user = await Users.findOne({ refreshToken });
  if (!user) {
    throw new Error('No refresh token present in db or not matched!');
  }
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decode) => {
    if (err || user.id !== decode.id) {
      throw new Error('There is something wrong with refresh token!');
    }
    const accessToken = generateToken(user?._id);
    res.status(200).json({
      status: 200,
      accessToken: accessToken,
    });
  });
});

//Logout
const logout = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Auth']
    #swagger.description = "Logout account"
  */
  const cookie = req.cookies;
  console.log(cookie);
  if (!cookie?.refreshToken) {
    throw new Error('No refresh token in cookie!');
  }
  const refreshToken = cookie.refreshToken;
  const user = await Users.findOne({ refreshToken });
  if (!user) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); //forbidden
  }
  await Users.findOneAndUpdate(refreshToken, {
    refreshToken: '',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); //forbidden
});

//Get all users
const getAllUsers = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['User']
    #swagger.description = "Get all users"
  */
  try {
    const listUsers = await Users.find().populate('role');
    res.status(200).json({
      status: 200,
      results: listUsers.length,
      listUsers: listUsers,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//Get single user
const getUser = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['User']
    #swagger.description = "Get a user - User Detail"
  */
  const { id } = req.params;
  let isValid = await Users.findById(id);
  if (!isValid) {
    throw new Error('User id is not valid or not found');
  }

  try {
    const user = await Users.findById(id)
      .populate('role', 'name')
      .populate('bookingforUser')
      .populate('bookingforOwner')
      .populate('sportCenters');
    res.status(200).json({
      status: 200,
      user: user,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//Upsate a user
const updateUser = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['User']
    #swagger.description = Update user - {
    "firstname": "Van",
    "lastname": "My Anh",
    "email": "vthmyanh2604@gmail.com",
    "phone": "0951258456",
    "password": "myanh123",
    "gender": "female",
    "YOB": 2002,
    "role": "646b6c50adcb2a812de75c26" }
  */
  const { _id } = req.user;
  let isValid = await Users.findById(_id);
  if (!isValid) {
    throw new Error('User id is not valid or not found');
  }

  const { email, firstname, lastname, phone, password, gender, YOB, role } =
    req.body;
  try {
    const userUpdated = await Users.findOneAndUpdate(
      _id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        phone: req?.body?.phone,
        gender: req?.body?.gender,
        YOB: req?.body?.YOB,
        image: req?.body?.image,
      },
      { new: true }
    );
    res.status(202).json({
      status: 202,
      message: 'Update user successfully.',
      userUpdated: userUpdated,
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      error: error,
      message: 'Something went wrong!',
    });
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Auth']
    #swagger.description = Update password { "oldPassword": "quang123", "password": "quang456", "confirmPassword": "quang456" }
  */
  const { _id } = req.user;
  const { oldPassword, password, confirmPassword } = req.body;
  const user = await Users.findById(_id);
  if (!user) {
    throw new Error('User id is not valid or not found');
  }

  const isPasswordMatched = await user.isPasswordMatched(oldPassword);

  if (!isPasswordMatched) {
    throw new Error('Old password is incorrect');
    // res.status(400).json({
    //   status: 400,
    //   error: error,
    //   message: 'Old password is incorrect',
    // });
    // return;
  }

  if (password !== confirmPassword) {
    throw new Error('Confirm password does not match');
    // res.status(400).json({
    //   status: 400,
    //   error: error,
    //   message: 'Confirm password does not match',
    // });
    // return;
  }

  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    generateToken(user?._id);
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

//Save user address
const saveUserAddress = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['User']
    #swagger.description = "Update user's address"
  */
  const { _id } = req.user;
  const { address } = req.body;
  let isValid = await Users.findById(_id);
  if (!isValid) {
    throw new Error('User id is not valid or not found');
  }

  try {
    const userUpdated = await Users.findOneAndUpdate(
      _id,
      {
        address: address,
      },
      { new: true }
    );
    res.status(202).json({
      status: 202,
      message: 'Update user successfully.',
      userUpdated: userUpdated,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Auth']
    #swagger.description = Forgot Password - { "email": "vthmyanh2604@gmail.com" }
  */
  const { email } = req.body;
  console.log(email);
  const user = await Users.findOne({ email: email });
  if (!user) {
    throw new Error('User not found with this email address');
  }
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href="https://thethaoplus.vercel.app/reset-password/${token}">Click here</a>`;
    const data = {
      to: email,
      text: 'Hello user',
      subject: 'Forgot Password Link',
      html: resetURL,
    };
    sendEmail(data);
    res.status(202).json({
      status: 202,
      message: 'Email has been sent. Check your email!',
      token: token,
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: 'Email sent fail!',
    });
    // throw new Error(error);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Auth']
    #swagger.description = Reset Password - { "password": "son123" }
  */
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await Users.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    throw new Error('Token expired, Please try again!');
  }
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json({
    status: 200,
    user: user,
  });
});

const blockUser = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['User']
    #swagger.description = "Update user status by ID - Block user"
  */
  const { id } = req.params;
  let isValid = await Users.findById(id);
  if (!isValid) {
    throw new Error('User id is not valid or not found');
  }

  try {
    const block = await Users.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true }
    );
    res.status(202).json({
      status: 202,
      message: 'User Blocked.',
    });
  } catch (error) {
    throw new Error(error);
  }
});

const unBlockUser = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['User']
    #swagger.description = "Update user status by ID - Unblock user"
  */
  const { id } = req.params;
  let isValid = await Users.findById(id);
  if (!isValid) {
    throw new Error('User id is not valid or not found');
  }

  try {
    const unBlock = await Users.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { new: true }
    );
    res.status(202).json({
      status: 202,
      message: 'User Unblocked.',
    });
  } catch (error) {
    throw new Error(error);
  }
});

//Get single user
const deleteUser = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['User']
    #swagger.description = "Delete user by ID"
  */
  const { id } = req.params;
  let isValid = await Users.findById(id);
  if (!isValid) {
    throw new Error('User id is not valid or not found');
  }

  try {
    const userDelete = await Users.findByIdAndDelete(id);
    res.status(200).json({
      status: 200,
      message: 'Delete user successfully.',
      userDelete: userDelete,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//Get single owner
const getSportList = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Sport Owner']
    #swagger.description = "Get sport's list of Owner"
  */
  const { _id } = req.user;
  let isValid = await Users.findById(_id);
  if (!isValid) {
    throw new Error('User id is not valid or not found');
  }

  try {
    const findUser = await Users.findById(_id).populate('sportList');
    res.status(200).json({
      status: 200,
      ownerSportList: findUser.sportList,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getSportCenterList = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Sport Owner']
    #swagger.description = "Get all sport center for owner"
  */
  const { _id } = req.user;
  let isValid = await Users.findById(_id);
  if (!isValid) {
    throw new Error('User id is not valid or not found');
  }

  try {
    const findUser = await Users.findById(_id).populate('sportCenters');
    res.status(200).json({
      status: 200,
      OwnerSportCenterList: findUser.sportCenters,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  createOwner,
  createAdmin,
  login,
  loginOwner,
  loginAdmin,
  handlerRefreshToken,
  logout,
  getAllUsers,
  getUser,
  updateUser,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  blockUser,
  unBlockUser,
  deleteUser,
  getSportList,
  getSportCenterList,
  saveUserAddress,
};
