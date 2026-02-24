const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const emailSender = require('./../utils/email');

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
    //grant access to the protected route
    next();
  } catch (err) {
    next(err);
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(
        new AppError(
          'The user donot have permission to access the resource',
          403,
        ),
      );
    }
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  //1. find user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email id', 404));
  }

  //2. generate a random token
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false }); //not to run validators for this save. coz, we don't have 'confirm password' field which is available only for signup

  const resetURL = `${req.protocol}//${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Please click the link to update your password.\n${resetURL} 
  \nPlease ignore this email, if you didn't forget your password`;

  //3. send the random token to the given user email
  try {
    await emailSender({
      email: user.email,
      subject: 'Your password reset will expire in 10 minutes ',
      message: message,
    });
    res.status(200).json({
      status: 'success',
      message: 'gmail sent',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Error in sending email. Please try again!', 500));
  }
};

exports.resetPassword = async (req, res, next) => {
  // get the user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  console.log(hashedToken);

  const user = await User.findOne({ passwordResetToken: hashedToken });
  console.log('user: ', user);

  //if user exists & the token is not expired, update the password
  if (user && user.passwordResetExpires <= Date.now()) {
    user.password = req.body.password;
    user.isPasswordChangedAt = Date.now();
    await user.save();
  }
  next();
  //update the passwordChangedAt property

  //log the user in & send the fresh jwt
};
