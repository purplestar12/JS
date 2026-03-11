const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');

exports.getOverview = async (req, res) => {
  //get tour collection
  const tours = await Tour.find();
  //build the template
  //render that template using our tour data from the collection
  return res.status(200).render('overview', { title: 'All Tours', tours });
};

exports.getTourDetails = async (req, res, next) => {
  //get data for the requested tour(including reviews and guides)
  try {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: 'review rating user',
    });
    if (!tour)
      return next(new AppError('There is no tour with that name', 404));

    //build template

    //render the template for the respective tour
    return res.status(200).render('tour', { title: `${tour.name} Tour`, tour });
  } catch (err) {
    return next(err);
  }
};

exports.getLoginPage = (req, res) => {
  return res.status(200).render('login');
};

exports.getMyAccount = (req, res) => {
  return res.status(200).render('account', { title: 'Your Account' });
};

exports.updateUserDetails = async (req, res, next) => {
  console.log('updating user:: ', req.body);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name: req.body.name, email: req.body.email },
      { new: true, runValidators: true },
    );
    req.user = updatedUser;
    res.locals.user = updatedUser;
    res.status(200).render('account', { title: 'Your account' });
  } catch (err) {
    return next(err);
  }
};
