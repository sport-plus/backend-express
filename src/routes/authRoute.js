const express = require('express');
const bodyParser = require('body-parser');

const {
  createUser,
  createOwner,
  createAdmin,
  login,
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
  saveUserAddress,
  loginOwner,
  getSportCenterList,
} = require('../controllers/userController');
const {
  authMiddleware,
  isAdmin,
  isOwner,
} = require('../middlewares/authMiddleware');

const authRouter = express.Router();

authRouter.use(bodyParser.json());

authRouter.route('/register-user').post(createUser);
authRouter.route('/register-owner').post(createOwner);
authRouter.route('/register-admin').post(createAdmin);
authRouter.route('/forgot-password-token').post(forgotPasswordToken);
authRouter.route('/password').put(authMiddleware, updatePassword);
authRouter.route('/login').post(login);
authRouter.route('/owner-login').post(loginOwner);
authRouter.route('/admin-login').post(loginAdmin);

authRouter.route('/get-sport-list').get(authMiddleware, isOwner, getSportList);
authRouter
  .route('/get-sport-center-list')
  .get(authMiddleware, isOwner, getSportCenterList);

authRouter.route('/reset-password/:token').put(resetPassword);
authRouter.route('/edit').put(authMiddleware, updateUser);
authRouter.route('/save-address').put(authMiddleware, saveUserAddress);

authRouter.route('/refresh').get(handlerRefreshToken);
authRouter.route('/logout').get(logout);

authRouter.route('/all-users').get(authMiddleware, isAdmin, getAllUsers);
authRouter.route('/block-user/:id').put(authMiddleware, isAdmin, blockUser);
authRouter.route('/unblock-user/:id').put(authMiddleware, isAdmin, unBlockUser);
authRouter
  .route('/:id')
  .get(authMiddleware, isAdmin, getUser)
  .delete(authMiddleware, isAdmin, deleteUser);

module.exports = authRouter;
