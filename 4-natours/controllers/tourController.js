const fs = require('fs');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const handlerFactory = require('./handlerFactory');

//  2. ROUTE HANDLERS

exports.getTopTours = (req, res, next) => {
  // limit=5&sort=-ratingsAverage,price
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,difficulty,summary';
  next();
};

exports.createTour = handlerFactory.createOne(Tour);
exports.updateTour = handlerFactory.updateOne(Tour);
exports.deleteTour = handlerFactory.deleteOne(Tour);
exports.getTour = handlerFactory.getOne(Tour, { path: 'reviews' });
exports.getAllTours = handlerFactory.getAll(Tour);

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          sumRatingsQty: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          tourCount: { $sum: 1 }, //count++
          tours: {
            $push: '$name',
          },
        },
      },
      {
        $sort: {
          avgPrice: 1, // '1' for ascending order
        },
      },
      // {
      //   $match: {
      //     _id: { $ne: 'EASY' },
      //   },
      // },
    ]);
    return res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failure',
      message: err.message,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          $expr: {
            $eq: [{ $year: '$startDates' }, year],
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%B',
              date: '$startDates',
            },
          },
          tourCountMonthwise: { $sum: 1 },
          tours: {
            $push: '$name',
          },
        },
      },
      {
        $addFields: {
          month: '$_id',
        },
      },
      {
        $sort: {
          tourCountMonthwise: -1,
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $limit: 3,
      },
    ]);

    return res.status(200).json({
      status: 'success',
      planLength: plan.length,
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failure',
      message: err.message,
    });
  }
};
