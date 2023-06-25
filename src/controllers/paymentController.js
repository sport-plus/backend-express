const asyncHandler = require('express-async-handler');
const SportCenters = require('../models/sportCenterModel');
const Bookings = require('../models/bookingModel');
const Users = require('../models/userModel');
const SportFields = require('../models/sportFieldModel');

const createBookingForUser = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Payment']
    #swagger.description = User create new booking - {
      "name": "Sân bóng đá mini Tiến Minh",
      "address":"Số 141 – đường 339 – Phường Phước Long – Quận 9 – TPHCM",
      "latitude":"25.0359",
      "longtitude":"66.6431",
      "openTime":"08:00",
      "closeTime":"22:00",
      "sportId": "646b3fb2fb8ee6a504e04826"
    }
  */

  const { _id } = req.user;
  const {
    ownerCenterId: owner,
    sportCenterId: sportCenter,
    sportFieldId: sportField,
    totalPrice,
    deposit,
    dateBooking,
    startTime,
    hours,
  } = req.body;

  let isValidUser = await Users.findById(owner);
  if (!isValidUser) {
    throw new Error('Owner id is not valid or not found');
  }

  let isValidSportCenter = await SportCenters.findById(sportCenter);
  if (!isValidSportCenter) {
    throw new Error('Sport Center id is not valid or not found');
  }

  let isValidSportField = await SportFields.findById(sportField);
  if (!isValidSportField) {
    throw new Error('Sport Field id is not valid or not found');
  }

  const newBookingBody = {
    owner,
    sportCenter,
    sportField,
    totalPrice,
    deposit,
    dateBooking,
    startTime,
    hours,
  };

  try {
    const newBooking = await Bookings.create(newBookingBody);
    addToUserBooking(_id, newBooking);
    res.status(201).json({
      status: 201,
      message: 'Sport Field created successfully.',
      newBooking: newBooking,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const addToUserBooking = async (userId, newBooking) => {
  try {
    const user = await Users.findById(userId);
    const alreadyBooking = user.bookingforUser.find(
      (id) => id.toString() === newBooking._id
    );

    if (!alreadyBooking) {
      await Users.findByIdAndUpdate(
        userId,
        {
          $push: { bookingforUser: newBooking._id }, //Thêm vào mảng sportCenters
        },
        { new: true }
      );
    }
  } catch (error) {
    console.log(error);
  }
};

const createBookingForOwner = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Payment']
    #swagger.description = Owner create new booking - {
      "name": "Sân bóng đá mini Tiến Minh",
      "address":"Số 141 – đường 339 – Phường Phước Long – Quận 9 – TPHCM",
      "latitude":"25.0359",
      "longtitude":"66.6431",
      "openTime":"08:00",
      "closeTime":"22:00",
      "sportId": "646b3fb2fb8ee6a504e04826"
    }
  */

  const { _id } = req.user;
  const {
    ownerCenterId: owner,
    sportCenterId: sportCenter,
    sportFieldId: sportField,
    totalPrice,
    deposit,
    dateBooking,
    startTime,
    hours,
    userBooking,
    phoneBooking,
  } = req.body;

  const newBookingBody = {
    owner,
    sportCenter,
    sportField,
    totalPrice,
    deposit,
    dateBooking,
    startTime,
    hours,
    userBooking,
    phoneBooking,
  };

  try {
    const newBooking = await Bookings.create(newBookingBody);
    addToOwnerBooking(_id, newBooking);
    res.status(201).json({
      status: 201,
      message: 'Sport Field created successfully.',
      newBooking: newBooking,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const addToOwnerBooking = async (userId, newBooking) => {
  try {
    const user = await Users.findById(userId);
    const alreadyBooking = user.bookingforOwner.find(
      (id) => id.toString() === newBooking._id
    );

    if (!alreadyBooking) {
      await Users.findByIdAndUpdate(
        userId,
        {
          $push: { bookingforOwner: newBooking._id }, //Thêm vào mảng sportCenters
        },
        { new: true }
      );
    }
  } catch (error) {
    console.log(error);
  }
};

const getHistoryBooking = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Payment']
    #swagger.description = "Get history booking for customers"
  */
  const { _id } = req.user;
  let isValid = await Users.findById(_id);
  if (!isValid) {
    throw new Error('User id is not valid or not found');
  }
  try {
    const bookingHistory = await Users.findById(_id).populate('bookingforUser');
    res.status(200).json({
      status: 200,
      results: bookingHistory.length,
      bookingHistory: bookingHistory.bookingforUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getAllBookingForOwner = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Payment']
    #swagger.description = "Get all booking for owner"
  */
  const { _id } = req.user;
  console.log(_id);
  let isValid = await Users.findById(_id);
  if (!isValid) {
    throw new Error('User id is not valid or not found');
  }
  try {
    const bookingOfOwner = await Bookings.find({ owner: _id })
      .populate(
        'sportCenter',
        'name image address latitude longtitude openTime closeTime status'
      )
      .populate('sportField', 'name price fieldType status');
    // .populate('owner', 'firstname  lastname email phone image');
    res.status(200).json({
      status: 200,
      results: bookingOfOwner.length,
      bookingOfOwner: bookingOfOwner,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getBooking = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Payment']
    #swagger.description = "Get one booking - detail booking"
  */
  const { id } = req.params;
  let isValid = await Bookings.findById(id);
  if (!isValid) {
    throw new Error('Sport id is not valid or not found');
  }

  try {
    const getBooking = await Bookings.findById(id)
      .populate(
        'sportCenter',
        'name image address latitude longtitude openTime closeTime status'
      )
      .populate('sportField', 'name images price fieldType status');
    res.status(200).json({
      status: 200,
      getBooking: getBooking,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updateBooking = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Payment']
    #swagger.description = Update sport center by ID - {
      "name": "Sân bóng đá mini Tiến Minh",
      "address":"Số 141 – đường 339 – Phường Phước Long – Quận 9 – TPHCM",
      "latitude":"25.0359",
      "longtitude":"66.6431",
      "openTime":"08:00",
      "closeTime":"22:00",
      "sportId": "646b3fb2fb8ee6a504e04826"
    }
  */
  const { id } = req.params;
  let isValid = await Bookings.findById(id);
  if (!isValid) {
    throw new Error('Sport id is not valid or not found');
  }

  try {
    const updateBooking = await Bookings.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json({
      status: 200,
      message: 'Sport updated successfully.',
      updateBooking: updateBooking,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//for user
const cancelBooking = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Payment']
    #swagger.description = "Update sport center status by ID - Cancel"
  */

  const { id } = req.params;
  let isValid = await Bookings.findById(id);
  if (!isValid) {
    throw new Error('Sport id is not valid or not found');
  }

  try {
    const block = await Bookings.findByIdAndUpdate(
      id,
      { status: false },
      { new: true }
    );
    res.status(202).json({
      status: 202,
      message: 'Booking canceled.',
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updateTrackingBooking = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Payment']
    #swagger.description = "Update sport center status by ID - Unblock sport center"
  */

  const { id } = req.params;
  const { tracking } = req.body;
  let isValid = await Bookings.findById(id);
  if (!isValid) {
    throw new Error('Sport id is not valid or not found');
  }

  try {
    const booking = await Bookings.findByIdAndUpdate(
      id,
      { tracking: tracking },
      { new: true }
    );
    res.status(202).json({
      status: 202,
      message: 'Update tracking successfull.',
      booking: booking,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createBookingForUser,
  createBookingForOwner,
  getHistoryBooking,
  getAllBookingForOwner,
  getBooking,
  updateBooking,
  cancelBooking,
  updateTrackingBooking,
};
