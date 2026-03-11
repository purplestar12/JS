const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const viewRouter = require('./routes/viewRouter');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug'); //'view engine' - Which template engine to use
app.set('views', path.join(__dirname, 'views')); //'views' - Where template files are stored

//to access a file from a folder, not from the route
//serving static files
//For any incoming req, check inside the 'public' folder to see if a file matches the URL path
app.use(express.static(path.join(__dirname, 'public'))); //path.join()-to identify path separator based on OS

//1.  MIDDLEWARES
//set security http headers
// app.use(helmet()); //helmet() -func call returns a func
app.use(
  helmet.contentSecurityPolicy({
    //to allow my app to use external api from blocking
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://unpkg.com', 'https://cdn.jsdelivr.net'],
      styleSrc: ["'self'", 'https://unpkg.com', 'https://fonts.googleapis.com'],
      imgSrc: [
        "'self'",
        'data:',
        'https://*.tile.openstreetmap.org',
        'https://unpkg.com',
      ],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'https://unpkg.com', 'https://cdn.jsdelivr.net'],
    },
  }),
);

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
app.use(cookieParser()); //reads cookies(jwt) from the HTTP req header, parses them,& stores in req.cookies
app.use(express.urlencoded({ extended: true, limit: '10kb' })); //parses form data. extended:true -> parses nested objects

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

//CUSTOM MIDDLE-WARE FUNCTION
//for just normal testing -this middleware
app.use((req, res, next) => {
  console.log('request log');
  console.log(req.cookies);
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

app.use('/', viewRouter);

app.use('/api/v1/tours', tourRouter); //app.use(path, middleware_func)
app.use('/api/v1/users', userRouter);

app.use('/api/v1/reviews', reviewRouter);

// app.all('*', (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });
app.use(globalErrorHandler);

module.exports = app;
