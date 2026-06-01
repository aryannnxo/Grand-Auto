const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const { protect } = require("../middleware/authMiddleware");

// POST /api/reviews
router.post("/", protect, async (req, res) => {
  try {
    const { vehicleId, rating, comment } = req.body;

    if (!vehicleId || !rating || !comment) {
      return res.status(400).json({ msg: "Please provide all required fields." });
    }

    const completedBookings = await Booking.find({
      user: req.user._id,
      vehicle: vehicleId,
      status: "completed",
    }).sort({ createdAt: -1 });

    if (!completedBookings || completedBookings.length === 0) {
      return res.status(403).json({ msg: "You can only review this car after completing a booking." });
    }

    let eligibleBookingId = null;
    for (const booking of completedBookings) {
      const existingReview = await Review.findOne({ booking: booking._id });
      if (!existingReview) {
        eligibleBookingId = booking._id;
        break;
      }
    }

    if (!eligibleBookingId) {
      return res.status(400).json({ msg: "You have already reviewed all your completed bookings for this car." });
    }

    const review = await Review.create({
      user: req.user._id,
      vehicle: vehicleId,
      booking: eligibleBookingId,
      rating: Number(rating),
      comment,
    });

    const reviews = await Review.find({ vehicle: vehicleId });
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / totalReviews;

    await Vehicle.findByIdAndUpdate(vehicleId, {
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
    });

    await review.populate("user", "name");

    res.status(201).json(review);
  } catch (err) {
    console.error("Create review error:", err);
    // Handle unique constraint error if it occurs
    if (err.code === 11000) {
      return res.status(400).json({ msg: "You have already reviewed this booking." });
    }
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/reviews/listing/:listingId
router.get("/listing/:listingId", async (req, res) => {
  try {
    const reviews = await Review.find({ vehicle: req.params.listingId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error("Get reviews error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/reviews/can-review/:listingId
router.get("/can-review/:listingId", protect, async (req, res) => {
  try {
    const completedBookings = await Booking.find({
      user: req.user._id,
      vehicle: req.params.listingId,
      status: "completed",
    });

    if (!completedBookings || completedBookings.length === 0) {
      return res.json({ canReview: false });
    }

    for (const booking of completedBookings) {
      const existingReview = await Review.findOne({ booking: booking._id });
      if (!existingReview) {
        return res.json({ canReview: true });
      }
    }

    return res.json({ canReview: false });
  } catch (err) {
    console.error("Check review eligibility error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
