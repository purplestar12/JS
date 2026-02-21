const AppError = require('./../utils/appError');

const sendErrorDev = (err, res) => {
  console.log('error: ', err);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

const handleJWTError = () => {
  new AppError('Invalid Token. Please login and try', 401);
};

const handleTokenExpiredError = () => {
  new AppError('Your token is expired. Please login again', 401);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'JsonWebTokenError') error = handleJWTError();

    if (err.name === 'TokenExpiredError')
      error = handleTokenExpiredError();

    sendErrorProd(err, res);
  }
  next();
};
