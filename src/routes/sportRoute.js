const express = require('express');
const bodyParser = require('body-parser');

const {
  isAdmin,
  authMiddleware,
  isOwner,
} = require('../middlewares/authMiddleware');
const {
  createSport,
  getAllSports,
  getSport,
  updateSport,
  deleteSport,
  blockSport,
  unBlockSport,
  addToSportOwnerList,
} = require('../controllers/sportController');

const sportRouter = express.Router();

sportRouter.use(bodyParser.json());
sportRouter
  .route('/sportlist')
  .put(authMiddleware, isOwner, addToSportOwnerList);

sportRouter.route('/').post(createSport).get(getAllSports);

sportRouter
  .route('/:id')
  .get(getSport)
  .put(authMiddleware, isAdmin, updateSport)
  .delete(authMiddleware, isAdmin, deleteSport);

sportRouter.route('/block-sport/:id').put(authMiddleware, isAdmin, blockSport);
sportRouter
  .route('/unblock-sport/:id')
  .put(authMiddleware, isAdmin, unBlockSport);

module.exports = sportRouter;
