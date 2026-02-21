const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

//1.  MIDDLEWARES

console.log('node_env: ', process.env.NODE_ENV);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //http request logger middleware
}

//for POST method
//to add data from req body to the req obj //acts as middleware
//express.json() internally calls next()
app.use(express.json());

//to access a file from a folder, not from the route
app.use(express.static(`${__dirname}/public`));

//CUSTOM MIDDLE-WARE FUNCTION
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
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.use(globalErrorHandler);

module.exports = app;
