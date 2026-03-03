const fs = require('fs');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const handlerFactory = require('./handlerFactory');
const AppError = require('./../utils/appError');

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

//tours-within/233/center/34.136471,-118.416363/unit/mi
exports.getAllToursWithin = async (req, res, next) => {
  try {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    //distance should be converted to 'radians' by dividing earth's respective distance in 'mile/km'
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    console.log('distance / 3963.2::', distance / 3963.2);

    if (!lat || !lng) {
      return next(
        new AppError(
          'Please provide the latitude and longitude in the format- lat,lng',
          400,
        ),
      );
    }

    const tours = await Tour.find({
      startLocation: {
        $geoWithin: {
          $centerSphere: [[lng, lat], radius],
        },
      },
    });

    console.log('lat, lng: ', lat, lng);

    res.status(200).json({
      status: 'success',
      docLength: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message,
    });
  }
};

exports.getDistances = async (req, res, next) => {
  try {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    //mongo returns geo result in metres. if user want data in miles, then convert meter to miles

    if (!['mi', 'km'].includes(unit)) {
      return next(new AppError('Include the distance unit in km or mi'));
    }
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
    if (!lat || !lng) {
      return next(
        new AppError(
          'Please provide the latitude and longitude in the format- lat,lng',
          400,
        ),
      );
    }

    const tours = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1],
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier,
        },
      },
      {
        $project: {
          distance: 1,
          name: 1,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      docLength: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message,
    });
  }
};
