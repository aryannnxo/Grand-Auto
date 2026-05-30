// models/Car.js
const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    modelYear: {
      type: Number,
      required: true,
    },
    seats: {
      type: Number,
      required: true,
    },
    dailyPrice: {
      type: Number,
      required: true,
    },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
      default: 'Petrol',
    },
    transmission: {
      type: String,
      enum: ['Manual', 'Automatic'],
      default: 'Automatic',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Car = mongoose.model('Car', carSchema);

module.exports = Car;
