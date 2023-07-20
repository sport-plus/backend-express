const asyncHandler = require('express-async-handler');
const SportCenters = require('../models/sportCenterModel');
const Bookings = require('../models/bookingModel');
const Users = require('../models/userModel');
const SportFields = require('../models/sportFieldModel');
const Slots = require('../models/slotModel');
const morgan = require('morgan');
const moment = require('moment');
const DatePrices = require('../models/datePriceModel');

const validateDateBooking = async (req, res, next) => {
  const { date, start, end, sportFieldId } = req.query
  const bookings = await Bookings.find({
    $and: [
      { sportField: sportFieldId },
      { start },
      { end },
      { date: new Date(date).setHours(0, 0, 0, 0) },
    ]
  })
  console.log(bookings);
  if (bookings.length > 0) return res.status(400).json({
    message: 'this time already booking'
  })

  return res.status(200).json({
    message: "Ok"
  })
}



const bookingsAvailable = async (req, res) => {
  const { sportCenterId, fieldType, date } = req.query


  let sportFieldAvailable = ''
  const sportFields = (await SportFields.find({
    $and: [
      { sportCenter: sportCenterId },
      { fieldType }
    ]
  })).map(field => field.id)

  const slots = await Slots.find({
    sportFieldId: {
      "$in": sportFields
    }
  })
  const bookings = await Bookings.find({
    $and: [
      {
        sportField: {
          "$in": sportFields
        }
      },
      { date: new Date(date).setHours(0, 0, 0, 0) },
    ]
  })

  const newSlots = []
  const list = slots[0]?.availability.map((slot, index) => ({
    startTime: slot.startTime,
    endTime: slot.endTime,
    available: true,
  })) || []
  const map = new Map();

  const dateFormat = moment(date);
  const weekday = dateFormat.format('dddd');
  const datePrice = (await DatePrices.find({
    $and: [{
      sportFieldId: sportFields[0]
    }, { weekday: weekday.toLowerCase() }]
  })).map((date) => date.price)


  sportFieldAvailable = sportFields[0]

  if (bookings.length > 0) {

    bookings.forEach((booking) => {

      slots.forEach((slot) => {
        slot.availability.forEach((time) => {

          if (time.startTime === booking.start
            && time.endTime === booking.end
            && slot.sportFieldId.toString() === booking.sportField.toString()) {


            map.set(time.startTime + time.endTime,
              false)
          } else if (time.startTime === booking.start &&
            time.endTime === booking.end &&
            slot.sportFieldId.toString() !== booking.sportField.toString()
            && sportCenterId.toString() === booking.sportCenter.toString()) {
            map.set(time.startTime + time.endTime,
              true)
            sportFieldAvailable = slot.sportFieldId.toString()
          }
        })
      }
      )



    })
  }


  list.forEach(item => {
    const x = {
      ...item,
    }
    if (map.has(item.startTime + item.endTime))
      x.available = map.get(item.startTime + item.endTime)

    newSlots.push(x)

  })

  if (sportFieldAvailable === '') return res.status(400).json({
    status: 400,
    message: 'not have sport field available'
  });

  return res.status(201).json({
    status: 201,
    sportFieldId: sportFieldAvailable,
    availability: newSlots,
    price: datePrice
  });
}


const createBookingForUser = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Booking']
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
    ownerCenterId,
    sportCenterId,
    sportFieldId,
    totalPrice,
    deposit,
    start,
    end,
    date
  } = req.body;



  const newBookingBody = {
    ownerCenter: ownerCenterId,
    sportCenter: sportCenterId,
    sportField: sportFieldId,
    totalPrice,
    deposit,
    start,
    end,
    date: new Date(date).setHours(0, 0, 0, 0)
  };

  try {
    const bookings = await Bookings.find({
      $and: [
        { sportField: sportFieldId },
        { start },
        { end },
        { date: new Date(date).setHours(0, 0, 0, 0) },
      ]
    })
    if (bookings.length > 0) return res.status(400).json({
      message: 'this time already booking'
    })


    let isValidUser = await Users.findById(ownerCenterId);
    if (!isValidUser) {
      throw new Error('Owner id is not valid or not found');
    }

    let isValidSportCenter = await SportCenters.findById(sportCenterId);
    if (!isValidSportCenter) {
      throw new Error('Sport Center id is not valid or not found');
    }

    let isValidSportField = await SportFields.findById(sportFieldId);
    if (!isValidSportField) {
      throw new Error('Sport Field id is not valid or not found');
    }
    const newBooking = await Bookings.create(newBookingBody);
    console.log();
    addToUserBooking(_id, newBooking);
    return res.status(201).json({
      status: 201,
      message: 'Sport Field created successfully.',
      newBooking: newBooking,
    });
  } catch (error) {
    return res.status(400).json({
      status: 400,
      message: error.message,
    });
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
    #swagger.tags = ['Booking']
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
    sportCenterId: sportCenter,
    sportFieldId: sportField,
    totalPrice,
    deposit,
    start,
    end,
    userBooking,
    phoneBooking,
  } = req.body;

  const newBookingBody = {
    owner: _id,
    sportCenter,
    sportField,
    totalPrice,
    deposit,
    start,
    end,
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
    res.status(400).json({
      status: 400,
      message: 'Bad request.',
    });
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
    #swagger.tags = ['Booking']
    #swagger.description = "Get history booking for customers"
  */
  const { _id } = req.user;
  let isValid = await Users.findById(_id);
  if (!isValid) {
    throw new Error('User id is not valid or not found');
  }
  try {
    const bookingHistory = await Users.findById(_id).populate({
      path: 'bookingforUser',
      populate: [{
        path: 'sportCenter',
      }, {
        path: 'sportField',
      }],

    })


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
    #swagger.tags = ['Booking']
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
    const bookingCalendar = await Bookings.find(
      { owner: _id },
      'start end sportField sportCenter'
    )
      .populate(
        'sportCenter',
        'name image address latitude longtitude openTime closeTime status'
      )
      .populate('sportField', 'name price fieldType status');
    console.log(bookingCalendar);
    // .populate('owner', 'firstname  lastname email phone image');
    res.status(200).json({
      status: 200,
      results: bookingOfOwner.length,
      bookingOfOwner: bookingOfOwner,
      bookings: bookingCalendar,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getBooking = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Booking']
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
    #swagger.tags = ['Booking']
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
    #swagger.tags = ['Booking']
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
    #swagger.tags = ['Booking']
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
  validateDateBooking,
  bookingsAvailable
};
