// backend/routes/sellerRoutes.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const { protect } = require('../middleware/authMiddleware');

// ✅ GET /api/seller/commission - returns total earnings and platform commission (20%) for the logged-in seller
router.get('/commission', protect, async (req, res) => {
  try {
    // Find vehicles owned by the seller
    const sellerId = req.user._id;
    const vehicles = await Vehicle.find({ owner: sellerId }).select('_id');
    const vehicleIds = vehicles.map(v => v._id);

    // Aggregate bookings for these vehicles where payment is completed
    const bookings = await Booking.find({
      vehicle: { $in: vehicleIds },
      paymentStatus: 'paid'
    });

    const totalEarnings = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const commission = Math.round(totalEarnings * 0.20);

    res.json({ totalEarnings, commission });
  } catch (err) {
    console.error('Seller commission error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
