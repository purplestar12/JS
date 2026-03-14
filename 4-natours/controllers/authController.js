const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

dotenv.config((path = './../config.env'));

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000, //till cookie expire timestamp, stored in browser
    ),
    httpOnly: true,
    sameSite: 'Strict',
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  //remove password in response while creating a doc.
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      users: user,
    },
  });
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TOKEN_EXPIRES_IN,
  });
};

exports.signup = async (req, res, next) => {
  try {
    // const { name, email, password, confirmPassword } = req.body;
    // const newUser = await User.create({
    //   name,  http://127.0.0.1:9000/me
    //   email, http://127.0.0.1:9000/me
    //   password,
    //   confirmPassword,
    // });
    const newUser = await User.create(req.body);
    const url = `${req.protocol}://${req.get('host')}/me`;

    console.log('url: ', url);
    console.log('before sendwelcome');

    await new Email(newUser, url).sendWelcome();

    createAndSendToken(newUser, 201, res);
  } catch (err) {
    res.status(400).json({
      status: 'failure',
      message: err.message,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!password || !email) {
      return next(new AppError('Please provide email and password', 401));
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.checkPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password'));
    }
    createAndSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      status: 'failure',
      message: err.message,
    });
  }
};

exports.protectRoute = async (req, res, next) => {
  try {
    const headers = req.headers;
    let token = '';
    //1. Check if jwt token is there
    if (headers.authorization && headers.authorization.startsWith('Bearer')) {
      token = headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
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
      return next(
        new AppError(
          'User changed password recently! Please login again!',
          401,
        ),
      );
    }
    req.user = currentUser;
    res.locals.user = currentUser;
    //grant access to the protected route
    next();
  } catch (err) {
    next(err);
  }
};

exports.isLoggedInUser = async (req, res, next) => {
  try {
    let token = '';
    //1. Check if jwt token is there
    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token) {
      return next();
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
      return next();
    }

    //4. Check if password is changed after the token issuance
    const isPasswordChanged = currentUser.isPasswordChangedAfterJWT(
      decodedJwt.iat,
    );

    if (isPasswordChanged) {
      return next();
    }
    //5. THERE IS A LOGGED IN USER
    res.locals.user = currentUser; //'.locals' can b accessed in all templates
    //grant access to the protected route
    return next();
  } catch (err) {
    return next(); //if loggedout, jwt is malformed. in that case, we don't want to cause error. not used next(err)
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
  console.log('user: ', user);

  //3. send the random token to the given user email
  try {
    console.log('tryyyyyyyyyyyy');
    await new Email(user, resetURL).sendPasswordReset();
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
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    //if user exists & the token is not expired, update the password
    if (!user) {
      return next(new AppError('Token is invalid or expired'), 400);
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    //update the passwordChangedAt property -- in pre('save')

    await user.save();

    //log the user in & send the fresh jwt
    createAndSendToken(user, 200, res);
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

exports.updatePassword = async (req, res, next) => {
  //get user based on email and password

  const user = await User.findById(req.user._id).select('+password');

  const isPasswordMatchWithDB = await user.checkPassword(
    req.body.currentPassword,
    user.password,
  );
  if (!isPasswordMatchWithDB) {
    return next(new AppError('Please provide the correct password', 400));
  }
  try {
    user.password = req.body.newPassword;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();
    createAndSendToken(user, 200, res);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};
