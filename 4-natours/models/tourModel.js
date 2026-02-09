const mongoose = require('mongoose');

const tourSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'The tour name is mandatory'],
    unique: true,
  },
  rating: { type: Number, default: 4.5 },
  price: {
    type: Number,
    required: [true, 'The tour price is mandatory'],
  },
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
