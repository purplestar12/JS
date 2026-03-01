const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

//1.  MIDDLEWARES
//set security http headers
app.use(helmet()); //helmet() -func call returns a func

console.log('node_env: ', process.env.NODE_ENV);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //http request logger middleware
}

//API Limiting per ip.If >100 req are coming from the same ip within an hour, this error message is thrown
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, //1 hour in milliseconds
  message: 'Too many requests from this IP. Please try an hour later!',
});

app.use('/api', limiter);

//for POST method
//It is a body parser, to add data from body to the req obj
//express.json() - internally calls next()
app.use(express.json({ limit: '10kb' })); //limits the body within limit

//SECURITY MIDDLEWARES - mongoSanitize, xss, hpp
//sanitize the req body against NoSQL query injection
app.use(mongoSanitize());

//sanitize the req body against xss
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'maxGroupSize',
      'difficulty',
      'ratingsAverage',
      'ratingsQuantity',
      'price',
    ],
  }),
);

//to access a file from a folder, not from the route
//serving static files
app.use(express.static(`${__dirname}/public`));

//CUSTOM MIDDLE-WARE FUNCTION
//for just normal testing -this middleware
app.use((req, res, next) => {
  console.log('request log');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour); //route params :variablename in url path
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//  3. ROUTES

//    C. MOUNT ROUTER
app.use('/api/v1/tours', tourRouter); //app.use(path, middleware_func)
app.use('/api/v1/users', userRouter);

app.use('/api/v1/reviews', reviewRouter);

app.use(globalErrorHandler);

module.exports = app;
