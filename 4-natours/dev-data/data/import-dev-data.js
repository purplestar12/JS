const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

const db = process.env.DATABASE.replace(
  '<DATABASE_PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(db)
  .then(() => console.log('DB connect succesfully!'));

const tourData = JSON.parse(
  fs.readFileSync('./dev-data/data/tours-simple.json', 'utf-8'),
);

console.log(typeof tourData);

const createDocs = async () => {
  try {
    await Tour.create(tourData);
  } catch (err) {
    console.log(err.message);
  }
};

createDocs();
