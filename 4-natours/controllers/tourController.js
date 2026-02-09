const fs = require('fs');
const Tour = require('./../models/tourModel');

// const tourDataFileLoc = `${__dirname}/../dev-data/data/tours-simple.json`;
// const tours = JSON.parse(fs.readFileSync(tourDataFileLoc));

//  2. ROUTE HANDLERS
exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();
    return res.status(200).send({
      status: 'success',
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failure',
      message: err.message,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    //Tour.findOne({_id: req.params.id})
    return res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failure',
      message: err.message,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    //const newTour = new Tour({})
    //newTour.save()
    res.status(201).json({
      status: 'success',
      data: {
        newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failure',
      message: err.message,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,

        runValidators: true,
      },
    );
    return res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failure',
      message: err.message,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    console.log(tour);
    return res.status(204).json({
      //204 - NO CONTENT
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'failure',
      message: err.message,
    });
  }
};
