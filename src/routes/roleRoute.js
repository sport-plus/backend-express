const express = require('express');
const bodyParser = require('body-parser');

const {
  createRole,
  getAllRoles,
  getRole,
  updateRole,
  deleteRole,
  blockRole,
  unBlockRole,
} = require('../controllers/roleController');
const { isAdmin, authMiddleware } = require('../middlewares/authMiddleware');

const roleRouter = express.Router();

roleRouter.use(bodyParser.json());

roleRouter.route('/').post(createRole).get(getAllRoles);

roleRouter
  .route('/:id')
  .get(authMiddleware, isAdmin, getRole)
  .put(authMiddleware, isAdmin, updateRole)
  .delete(authMiddleware, isAdmin, deleteRole);

roleRouter.route('/block-role/:id').put(authMiddleware, isAdmin, blockRole);
roleRouter.route('/unblock-role/:id').put(authMiddleware, isAdmin, unBlockRole);

module.exports = roleRouter;
