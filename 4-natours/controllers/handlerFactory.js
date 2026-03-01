const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = (Model) => async (req, res, next) => {
  //returning a function
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document is found with the given ID', 404));
    }
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

exports.updateOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document is found with the given ID', 404));
    }
    return res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message,
    });
  }
};

exports.createOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.create(req.body);
    //const newTour = new Tour({})
    //newTour.save()

    return res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 'failure',
      message: err.message,
    });
  }
};

exports.getOne = (Model, populateOptions) => async (req, res, next) => {
  try {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;
    if (!doc) {
      next(new AppError('No document is found with the given ID', 404));
    }
    return res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: err.message,
    });
  }
};

exports.getAll = (Model) => async (req, res, next) => {
  try {
    let filterObj = {};
    //to allow nested 'GET' reviews on TOUR
    if (req.params.tourId) filterObj = { tour: req.params.tourId };
    const feature = new APIFeatures(Model.find(filterObj), req.query)
      .filer()
      .sortByFields()
      .displayFields()
      .paginate();

    const docs = await feature.queryPrototype;
    return res.status(200).send({
      status: 'success',
      docLength: docs.length,
      data: {
        data: docs,
      },
    });
  } catch (err) {
    return res.status(404).json({
      status: 'failure',
      message: err.message,
    });
  }
};
