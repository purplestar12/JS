const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');

dotenv.config((path = './../config.env'));

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TOKEN_EXPIRES_IN,
  });
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      passwordChangedAt: req.body.passwordChangedAt || Date.now(),
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        users: newUser,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failure',
      message: err.message,
    });
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!password || !email) {
    return next(new AppError('Please provide email and password', 401));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new Error('User or password does not match'));
  }
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.protectRoute = async (req, res, next) => {
  try {
    const headers = req.headers;
    let token = '';
    //1. Check if jwt token is there
    if (headers.authorization && headers.authorization.startsWith('Bearer')) {
      token = headers.authorization.split(' ')[1];
    }
    if (!token) {
      return next(
        new AppError(
          'You are not logged in! Please login to get the access',
          401,
        ),
      );
    }
    //2. verify the token
    const decodedJwt = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET,
    );

    console.log('decodedJwt: ', decodedJwt);

    //3. Check if user exist based on id
    const currentUser = await User.findById(decodedJwt.id);
    if (!currentUser) {
      next(new AppError('The user belongs to the token doesnot exist', 401));
    }

    //4. Check if password is changed after the token issuance
    const isPasswordChanged = currentUser.isPasswordChangedAfterJWT(
      decodedJwt.iat,
    );

    if (isPasswordChanged) {
      return next(new AppError('User changed password recently !', 401));
    }
    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
  //grant access to the protected route
};
