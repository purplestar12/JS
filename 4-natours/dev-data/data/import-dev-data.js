const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

const db = process.env.DATABASE.replace(
  '<DATABASE_PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(db).then(() => console.log('DB connect succesfully!'));

const tourData = JSON.parse(
  fs.readFileSync('./dev-data/data/tours.json', 'utf-8'),
);

console.log(typeof tourData);

const importData = async () => {
  try {
    await Tour.create(tourData);
    console.log('Data imported successfully');
  } catch (err) {
    console.log(err.message);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted successfully');
  } catch (err) {
    console.log(err.message);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
