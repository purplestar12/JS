const Tour = require('../models/tourModel');
const Review = require('../models/reviewModel');

exports.getOverview = async (req, res) => {
  //get tour collection
  const tours = await Tour.find();
  //build the template
  //render that template using our tour data from the collection
  return res.status(200).render('overview', { title: 'All Tours', tours });
};

exports.getTourDetails = async (req, res) => {
  //get data for the requested tour(including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  //build template

  //render the template for the respective tour
  return res.status(200).render('tour', { title: `${tour.name} Tour`, tour });
};

exports.getLoginPage = (req, res) => {
  return res.status(200).render('login');
};
