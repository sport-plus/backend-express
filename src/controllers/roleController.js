const asyncHandler = require('express-async-handler');
const Roles = require('../models/roleModel');

const createRole = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Role']
    #swagger.description = Create new role - { "name": "admin" }
  */
  const name = req.body.name;
  try {
    const newRole = await Roles.create(req.body);
    res.status(201).json({
      status: 201,
      message: 'Role created successfully.',
      newRole: newRole,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getAllRoles = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Role']
    #swagger.description = Get all roles
  */
  try {
    const listRole = await Roles.find();
    res.status(200).json({
      status: 200,
      results: listRole.length,
      listRole: listRole,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getRole = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Role']
    #swagger.description = Get one role - detail
  */
  const { id } = req.params;
  let isValid = await Roles.findById(id);
  if (!isValid) {
    throw new Error('Role id is not valid or not found');
  }

  try {
    const getRole = await Roles.findById(id);
    res.status(200).json({
      status: 200,
      getRole: getRole,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updateRole = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Role']
    #swagger.description = Update role by ID - { "name": "admin" }
  */
  const { id } = req.params;
  let isValid = await Roles.findById(id);
  if (!isValid) {
    throw new Error('Role id is not valid or not found');
  }

  const name = req.body.name;
  try {
    const updateRole = await Roles.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json({
      status: 200,
      message: 'Role updated successfully.',
      updateRole: updateRole,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const blockRole = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Role']
    #swagger.description = "Update role status by ID - Block role"
  */
  const { id } = req.params;
  let isValid = await Roles.findById(id);
  if (!isValid) {
    throw new Error('Role id is not valid or not found');
  }

  try {
    const block = await Roles.findByIdAndUpdate(
      id,
      { status: false },
      { new: true }
    );
    res.status(202).json({
      status: 202,
      message: 'Role Blocked.',
    });
  } catch (error) {
    throw new Error(error);
  }
});

const unBlockRole = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Role']
    #swagger.description = "Update role status by ID - Unblock role"
  */
  const { id } = req.params;
  let isValid = await Roles.findById(id);
  if (!isValid) {
    throw new Error('Role id is not valid or not found');
  }

  try {
    const block = await Roles.findByIdAndUpdate(
      id,
      { status: true },
      { new: true }
    );
    res.status(202).json({
      status: 202,
      message: 'Role Unblocked.',
    });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteRole = asyncHandler(async (req, res) => {
  /* 
    #swagger.tags = ['Role']
    #swagger.description = "Delete role by ID"
  */
  const { id } = req.params;
  let isValid = await Roles.findById(id);
  if (!isValid) {
    throw new Error('Role id is not valid or not found');
  }

  try {
    const deleteRole = await Roles.findByIdAndDelete(id);
    res.status(200).json({
      status: 200,
      message: 'Role deleted successfully.',
      deleteRole: deleteRole,
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createRole,
  getAllRoles,
  getRole,
  updateRole,
  deleteRole,
  blockRole,
  unBlockRole,
};
