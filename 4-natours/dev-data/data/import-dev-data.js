const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

dotenv.config({ path: './config.env' });

const db = process.env.DATABASE.replace(
  '<DATABASE_PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(db).then(() => console.log('DB connect succesfully!'));

const tourData = JSON.parse(
  fs.readFileSync('./dev-data/data/tours.json', 'utf-8'),
);

const userData = JSON.parse(
  fs.readFileSync('./dev-data/data/users.json', 'utf-8'),
);

const reviewData = JSON.parse(
  fs.readFileSync('./dev-data/data/reviews.json', 'utf-8'),
);

const importData = async () => {
  try {
    console.log('importing started');
    // await Tour.create(tourData);
    // await User.create(userData, { validateBeforeSave: false });
    await Review.create(reviewData);

    console.log('Data imported successfully');
  } catch (err) {
    console.log(err.message);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log('Data deleted successfully');
  } catch (err) {
    console.log(err.message);
  }
};

if (process.argv[2] === '--import') {
  importData();
  console.log('gonna import data');
} else if (process.argv[2] === '--delete') {
  deleteData();
}
