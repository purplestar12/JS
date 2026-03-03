//review string, rating, createdAt, tour ref, user ref
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'The review shouldnot be empty'],
    },
    rating: {
      type: Number,
      min: [1, 'The review should be more than or equal to 1'],
      max: [5, 'The review should be less than or equal to 5'],
    },
    reviewCreatedAt: {
      type: Date,
      default: Date.now, //calls automatically when a new doc is created
    },
    tour: {
      //Parent referencing - in every tour, review is there. so tour is the parent which produces the child
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'The tour shouldnot be empty'],
    },
    user: {
      //Parent referencing
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'The user shouldnot be empty'],
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);

//one user cannot write multiple review for the same tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function () {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'userId',
  //   select: 'name photo',
  // });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
});

reviewSchema.statics.calcRatingsAverage = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } }, //'this' ref to the 'model' itself as it is 'static method'
    {
      $group: {
        _id: '$tour',
        nRatings: {
          $sum: 1,
        },
        avgRating: {
          $avg: '$rating',
        },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating, //stats = [{}] , so accessing index '0'
      ratingsQuantity: stats[0].nRatings,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post('save', async function () {
  //'this.constructor' ref to 'the model' which creates this doc 'this'
  await this.constructor.calcRatingsAverage(this.tour); //'this' ref to 'current doc'
});

reviewSchema.pre(/^findOneAnd/, async function () {
  this.r = await this.clone().findOne(); //clone query obj, change the operation from 'findOneAnd' to get 'findOne' with filter without options
});

reviewSchema.post(/findOneAnd/, async function () {
  await this.r.constructor.calcRatingsAverage(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
