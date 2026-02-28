//review string, rating, createdAt, tour ref, user ref
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      maxLength: [50, 'The review length shouldnot exceed 50 characters'],
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
    tourId: {
      //Parent referencing - in every tour, review is there. so tour is the parent which produces the child
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'The tour shouldnot be empty'],
    },
    userId: {
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

reviewSchema.pre(/^find/, function () {
  // this.populate({
  //   path: 'tourId',
  //   select: 'name',
  // }).populate({
  //   path: 'userId',
  //   select: 'name photo',
  // });
  this.populate({
    path: 'userId',
    select: 'name photo',
  });
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
