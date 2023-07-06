const express = require('express');
const bodyParser = require('body-parser');

const { authMiddleware, isOwner } = require('../middlewares/authMiddleware');
const {
  createSportCenter,
  getAllSportCenters,
  getSportCenter,
  updateSportCenter,
  blockSportCenter,
  unBlockSportCenter,
  deleteSportCenter,
  getSportFieldListByID,
  getAllSportCenterForOwner,
} = require('../controllers/sportCenterController');
const { validateAttributesCreateSportCenter } = require('../middlewares/validateAttributesCreateSportCenter');

const sportCenterRouter = express.Router();

sportCenterRouter.use(bodyParser.json());

sportCenterRouter.route('/').post(authMiddleware, isOwner, validateAttributesCreateSportCenter,createSportCenter);

sportCenterRouter.route('/').get(authMiddleware, getAllSportCenters);

sportCenterRouter
  .route('/sport-center-of-owner')
  .get(authMiddleware, isOwner, getAllSportCenterForOwner);

sportCenterRouter
  .route('/get-sport-field-list/:sportCenterId')
  .get(authMiddleware, getSportFieldListByID);

sportCenterRouter
  .route('/:id')
  .get(authMiddleware, getSportCenter)
  .put(authMiddleware, isOwner, updateSportCenter);

sportCenterRouter
  .route('/:id/:sportId')
  .delete(authMiddleware, isOwner, deleteSportCenter);

sportCenterRouter
  .route('/block-sport-center/:id')
  .put(authMiddleware, isOwner, blockSportCenter);

sportCenterRouter
  .route('/unblock-sport-center/:id')
  .put(authMiddleware, isOwner, unBlockSportCenter);

module.exports = sportCenterRouter;
