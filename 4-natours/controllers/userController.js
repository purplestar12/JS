const User = require('./../models/userModel');
const AppError = require('./../utils/appError');

const filterBody = (bodyObj, ...allowedFields) => {
  let filteredBodyObj = {};
  Object.keys(bodyObj).forEach((key) => {
    if (allowedFields.includes(key)) filteredBodyObj[key] = bodyObj[key];
  });

  return filteredBodyObj;
};

exports.getAllUsers = async (req, res) => {
  const users = await User.find();

  return res.status(200).json({
    status: 'success',
    numUsers: users.length,
    data: {
      users,
    },
  });
};

exports.getUser = (req, res) => {
  return res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.createUser = (req, res) => {
  return res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.updateUser = (req, res) => {
  return res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.deleteUser = (req, res) => {
  return res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.updateMe = async (req, res, next) => {
  //password shouldnot be updated in this route
  console.log('req.body.password', req.body.password);
  if (req.body.password || req.body.confirmPassword) {
    console.log('req.body. after', req.body.password);
    return next(
      new AppError(
        'Password cannot be changed here. Only the user data can be updated',
        400,
      ),
    );
  }

  //filter out the fields which shouldnot get updated using user input
  const filteredBody = filterBody(req.body, 'name', 'email');

  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: { updatedUser },
    },
  });
};

exports.deleteMe = async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
