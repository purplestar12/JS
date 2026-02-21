const User = require('./../models/userModel');

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
