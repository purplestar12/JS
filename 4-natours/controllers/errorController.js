const AppError = require('./../utils/appError');

const sendErrorDev = (err, req, res) => {
  console.log('req:: ', req.url, req.originalUrl);
  //API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    //RENDERED WEBSITE FOR ERRORS
    console.log('err.status::: ', err);
    res
      .status(err.statusCode)
      .render('error', { title: 'Something went wrong!', msg: err.message });
  }
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorProd = (err, req, res) => {
  //A) API
  if (req.originalUrl.startsWith('/api')) {
    if (
      err.isOperational
    ) //Operational: trusted error-send message to the client
    {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      //programming or unknown error - dont leak error details
      console.error('error: ', err);
      //send generic message
      return res.send(500).json({
        status: 'error',
        message: 'Something went wrong! ',
      });
    }
  } else {
    //B) RENDERED WEBSITE FOR ERRORS
    if (err.isOperational) {
      console.log('err::: ', err);
      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message,
      });
    }
    return res.status(500).render('error', {
      title: 'Something went wrong!',
      msg: 'Please try again later!',
    });
  }
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
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleTokenExpiredError();
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    sendErrorProd(err, req, res);
  }
  next();
};
