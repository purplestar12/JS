const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const handlerFactory = require('./handlerFactory');

const filterBody = (bodyObj, ...allowedFields) => {
  let filteredBodyObj = {};
  Object.keys(bodyObj).forEach((key) => {
    if (allowedFields.includes(key)) filteredBodyObj[key] = bodyObj[key];
  });

  return filteredBodyObj;
};

exports.createUser = (req, res) => {
  return res.status(500).json({
    status: 'error',
    message:
      'This route is not yet defined! Please use /signin to create a user',
  });
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  return next();
};

exports.updateMe = async (req, res, next) => {
  //password shouldnot be updated in this route
  if (req.body.password || req.body.confirmPassword) {
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

//do not UPADATE password in this
exports.updateUser = handlerFactory.updateOne(User);
exports.deleteUser = handlerFactory.deleteOne(User);
exports.getUser = handlerFactory.getOne(User);
exports.getAllUsers = handlerFactory.getAll(User);
