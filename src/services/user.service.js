const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

const createUser = async (userBody) => {
  const userExists = await User.findOne({ where: { email: userBody.email } });
  if (userExists) throw new ApiError(httpStatus.BAD_REQUEST, 'User already exists');
  const data = { ...userBody };
  data.password = await bcrypt.hash(data.password, 8);

  return User.create(data);
};

const getUserById = async (id) => {
  return User.findByPk(id);
};

const getUserByEmail = async (email) => {
  return User.findOne({ where: { email } });
};

const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.findOne({ where: { email: updateBody.email } }))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.destroy();
  return user;
};

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
};
