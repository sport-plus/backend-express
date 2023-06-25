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
} = require('../controllers/paymentController');

const paymentRouter = express.Router();

paymentRouter.use(bodyParser.json());

paymentRouter
  .route('/create-booking-for-user')
  .post(authMiddleware, isUser, createBookingForUser);

paymentRouter
  .route('/create-booking-for-owner')
  .post(authMiddleware, isOwner, createBookingForOwner);

paymentRouter
  .route('/customer-history-booking')
  .get(authMiddleware, getHistoryBooking);

paymentRouter
  .route('/booking-of-owner')
  .get(authMiddleware, isOwner, getAllBookingForOwner);

paymentRouter
  .route('/:id')
  .get(authMiddleware, getBooking)
  .put(authMiddleware, updateBooking);

paymentRouter.route('/cancel-booking/:id').put(authMiddleware, cancelBooking);

paymentRouter.route('/tracking/:id').put(authMiddleware, updateTrackingBooking);

module.exports = paymentRouter;
