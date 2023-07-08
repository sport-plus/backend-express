const express = require('express');
const bodyParser = require('body-parser');

const { authMiddleware, isOwner } = require('../middlewares/authMiddleware');
const {
  createSportField,
  getAllSportFields,
  getSportField,
  updateSportField,
  deleteSportField,
  blockSportField,
  unBlockSportField,
  getSportFieldsTypeOfSportCenter,
} = require('../controllers/sportFieldController');

const sportFieldRouter = express.Router();

sportFieldRouter.use(bodyParser.json());

sportFieldRouter.route('/').post(authMiddleware, isOwner, createSportField);

sportFieldRouter.route('/').get(authMiddleware, getAllSportFields);

sportFieldRouter.route('/types').get(authMiddleware, getSportFieldsTypeOfSportCenter);

sportFieldRouter
  .route('/:id')
  .get(authMiddleware, getSportField)
  .put(authMiddleware, isOwner, updateSportField);

sportFieldRouter
  .route('/:id/:sportCenterId')
  .delete(authMiddleware, isOwner, deleteSportField);

sportFieldRouter
  .route('/block-sport-field/:id')
  .put(authMiddleware, isOwner, blockSportField);

sportFieldRouter
  .route('/unblock-sport-field/:id')
  .put(authMiddleware, isOwner, unBlockSportField);


module.exports = sportFieldRouter;
