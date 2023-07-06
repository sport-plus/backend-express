const express = require('express');
const bodyParser = require('body-parser');

const {
  authMiddleware,
  isOwner,
  isUser,
} = require('../middlewares/authMiddleware');
const {
  updateBooking,
  getBooking,
  createBookingForUser,
  createBookingForOwner,
  getHistoryBooking,
  getAllBookingForOwner,
  cancelBooking,
  updateTrackingBooking,
  validateDateBooking,
  bookingsAvailable,
} = require('../controllers/bookingController');

const bookingRouter = express.Router();

bookingRouter.use(bodyParser.json());

bookingRouter
  .route('/validate-date-booking')
  .get(authMiddleware, isUser, validateDateBooking);

bookingRouter
  .route('/bookings-available')
  .get(authMiddleware, isUser, bookingsAvailable);


bookingRouter
  .route('/create-booking-for-user')
  .post(authMiddleware, isUser, createBookingForUser);

bookingRouter
  .route('/create-booking-for-owner')
  .post(authMiddleware, isOwner, createBookingForOwner);

bookingRouter
  .route('/customer-history-booking')
  .get(authMiddleware, getHistoryBooking);

bookingRouter
  .route('/booking-of-owner')
  .get(authMiddleware, isOwner, getAllBookingForOwner);

bookingRouter
  .route('/:id')
  .get(authMiddleware, getBooking)
  .put(authMiddleware, updateBooking);

bookingRouter.route('/cancel-booking/:id').put(authMiddleware, cancelBooking);

bookingRouter.route('/tracking/:id').put(authMiddleware, updateTrackingBooking);

module.exports = bookingRouter;
