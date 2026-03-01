const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [20, 'A tour must have less than or equal to 20 characters'],
      minlength: [10, 'A tour must have more than or equal to 10 characters'],
      // validate: [
      //   validator.isAlpha,
      //   'Tour name must only contain characters',
      // ],
    },
    slug: String,
    secretTour: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'The difficulty should be either easy, medium, or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating should be more than or equal to 1'],
      max: [5, 'Rating should be less than or equal to 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price; //'this' referes to the new document being created , not for update
        },
        message: 'Discount price {VALUE} must always less than the price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now, //if Date.now() used, the time is created at the time of schema creation , not at the document creation
      select: false,
    },
    startDates: [Date],
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User', //child reference to the 'User' collection
      },
    ],
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

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//storing an array of child id which grows indefinitely would not be a good design
//if a parent need to access the child --> 'virtual populate'(do the referencing to the child without persisting the data of child)
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//DOCUMENT MIDDLEWARE -- do 'pre' work before 'save' and 'create' operation, not work for 'insertMany'
tourSchema.pre('save', function () {
  this.slug = slugify(this.name, { lower: true }); //'this' - currently being saved document
});

// //middleware that embed the user-details from 'user' collection in the 'tour' collection, using the 'id' in 'tour' collection
// tourSchema.pre('save', async function () {
//   const guidesPromises = this.guides.map((user) => User.findById(user));
//   this.guides = await Promise.all(guidesPromises);
// });

//QUERY MIDDLEWARE
tourSchema.pre(/^find/, function () {
  //the regex 'find' matches with 'findOne', 'findANdUpdate' etc.,
  this.find({ secretTour: { $ne: true } }); //'this' - query object
  this.start = Date.now();
});

tourSchema.pre(/^find/, function () {
  this.populate({
    path: 'guides',
    select: '-__v -passwordResetExpires -passwordResetToken',
  });
});

tourSchema.post(/^find/, function (docs) {
  console.log(`The query took ${Date.now() - this.start} milliseconds`);
});

tourSchema.pre('aggregate', function () {
  this.pipeline().unshift({
    //'this' - query object
    $match: {
      secretTour: { $ne: true },
    },
  });
});
// tourSchema.post('save', function (doc, next) {
//   console.log('After saving.... this func exe');
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
