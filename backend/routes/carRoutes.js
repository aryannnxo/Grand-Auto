// routes/carRoutes.js
const express = require('express');
const router = express.Router();
const Car = require('../models/Car');

// @desc    Get all cars
// @route   GET /api/cars
// @access  Public
router.get('/', async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Add a new car
// @route   POST /api/cars
// @access  Public (later you can protect this with auth)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      brand,
      modelYear,
      seats,
      dailyPrice,
      fuelType,
      transmission,
      isAvailable,
      imageUrl,
    } = req.body;

    const car = new Car({
      name,
      brand,
      modelYear,
      seats,
      dailyPrice,
      fuelType,
      transmission,
      isAvailable,
      imageUrl,
    });

    const createdCar = await car.save();
    res.status(201).json(createdCar);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid car data' });
  }
});

module.exports = router;
