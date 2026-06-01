const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const Notification = require("../models/Notification");
const sendEmail = require("../utils/sendEmail");
const { protect } = require("../middleware/authMiddleware");

// ✅ Check vehicle availability (POST body)
router.post("/check-availability", async (req, res) => {
  try {
    const { vehicle, startDate, endDate } = req.body;

    if (!vehicle || !startDate || !endDate) {
      return res.status(400).json({ msg: "Please provide vehicle ID, start date, and end date" });
    }

    const requestedStart = new Date(startDate);
    const requestedEnd = new Date(endDate);

    if (isNaN(requestedStart.getTime()) || isNaN(requestedEnd.getTime())) {
      return res.status(400).json({ msg: "Invalid date format. Please choose valid pickup and return dates." });
    }

    if (requestedEnd <= requestedStart) {
      return res.status(400).json({ msg: "Return Date must be after Pickup Date." });
    }

    // Search for overlapping bookings for the same vehicle
    // Overlap condition: existingStartDate <= requestedEndDate AND existingEndDate >= requestedStartDate
    const conflictingBooking = await Booking.findOne({
      vehicle,
      status: { $in: ["pending-owner-approval", "approved-awaiting-payment", "confirmed", "confirmed-awaiting-cash-payment", "active"] },
      startDate: { $lte: requestedEnd },
      endDate: { $gte: requestedStart }
    });

    if (conflictingBooking) {
      return res.status(200).json({
        available: false,
        msg: "This vehicle is already booked for the selected dates. Please choose another date range."
      });
    }

    res.status(200).json({ available: true });
  } catch (err) {
    console.error("Check availability error:", err);
    res.status(500).json({ msg: "Check availability error: " + err.message });
  }
});

// ✅ GET availability status for a vehicle (used by VehicleDetailsPage)
// Optionally accepts ?startDate=&endDate= for date-specific checks
// Optionally accepts Authorization header to check if logged-in user has a booking
const BLOCKING_STATUSES = ["pending-owner-approval", "approved-awaiting-payment", "confirmed", "confirmed-awaiting-cash-payment", "active"];
const jwt = require("jsonwebtoken");

router.get("/vehicle/:vehicleId/availability", async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { startDate, endDate } = req.query;
    let userId = null;

    // 1. Try to extract user from token (optional auth)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.user?.id || decoded.id; // handle different token structures just in case
      } catch (tokenErr) {
        // Ignore token errors, treat as guest
      }
    }

    // 2. Check for user's specific booking if logged in
    let userBooking = null;
    if (userId) {
      userBooking = await Booking.findOne({
        vehicle: vehicleId,
        user: userId,
      })
      .sort({ createdAt: -1 })
      .select("status paymentStatus startDate endDate totalPrice");
    }

    let conflictQuery = {
      vehicle: vehicleId,
      status: { $in: BLOCKING_STATUSES }
    };

    // If dates provided, check for overlap; otherwise just check if any active booking exists
    if (startDate && endDate) {
      const reqStart = new Date(startDate);
      const reqEnd = new Date(endDate);
      if (!isNaN(reqStart) && !isNaN(reqEnd)) {
        conflictQuery.startDate = { $lte: reqEnd };
        conflictQuery.endDate = { $gte: reqStart };
      }
    }

    const activeBooking = await Booking.findOne(conflictQuery)
      .populate("user", "name")
      .select("status startDate endDate paymentStatus");

    if (activeBooking) {
      // If the active booking happens to belong to the logged in user, don't flag as generally unavailable?
      // Actually, if the logged-in user has the booking, it IS unavailable for NEW bookings.
      // But we will return userBooking so the frontend can handle it.
      return res.json({
        isAvailable: false,
        activeBooking: {
          status: activeBooking.status,
          startDate: activeBooking.startDate,
          endDate: activeBooking.endDate
        },
        userBooking
      });
    }

    res.json({ isAvailable: true, userBooking });
  } catch (err) {
    console.error("Vehicle availability GET error:", err);
    res.status(500).json({ msg: "Server error checking availability" });
  }
});

// ✅ GET blocked date ranges for a vehicle (for calendar pickers)
router.get("/vehicle/:vehicleId/blocked-dates", async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const bookings = await Booking.find({
      vehicle: vehicleId,
      status: { $in: BLOCKING_STATUSES }
    }).select("startDate endDate status");

    const blockedDates = bookings.map(b => ({
      startDate: b.startDate,
      endDate: b.endDate,
      status: b.status
    }));

    res.json({ blockedDates });
  } catch (err) {
    console.error("Blocked dates error:", err);
    res.status(500).json({ msg: "Server error fetching blocked dates" });
  }
});


// ✅ Create a new booking
router.post("/", protect, async (req, res) => {
  try {
    const {
      vehicle, startDate, endDate, totalPrice,
      pickupLocation, dropoffLocation, pickupMethod,
      returnMethod, deliveryFee, paymentMethod
    } = req.body;

    if (!vehicle || !startDate || !endDate || !totalPrice || !pickupLocation || !dropoffLocation) {
      return res.status(400).json({ msg: "Please provide all essential booking details" });
    }

    const requestedStart = new Date(startDate);
    const requestedEnd = new Date(endDate);

    if (isNaN(requestedStart.getTime()) || isNaN(requestedEnd.getTime())) {
      return res.status(400).json({ msg: "Invalid date format. Please choose valid pickup and return dates." });
    }

    if (requestedEnd <= requestedStart) {
      return res.status(400).json({ msg: "Return Date must be after Pickup Date." });
    }

    const isDeliveryRequested = pickupMethod === "Home Delivery" || returnMethod === "Different Location";
    const initialDeliveryStatus = isDeliveryRequested ? "Scheduled" : "Not Applicable";

    const vehicleDoc = await Vehicle.findById(vehicle);
    if (!vehicleDoc) {
      return res.status(404).json({ msg: "Vehicle not found" });
    }
    
    if (!vehicleDoc.isBookable) {
      return res.status(400).json({ msg: "This vehicle is currently under review or unavailable for booking." });
    }

    // Double Booking Check
    const conflictingBooking = await Booking.findOne({
      vehicle,
      status: { $in: ["pending-owner-approval", "approved-awaiting-payment", "confirmed", "confirmed-awaiting-cash-payment", "active"] },
      startDate: { $lte: requestedEnd },
      endDate: { $gte: requestedStart }
    });

    if (conflictingBooking) {
      return res.status(409).json({ msg: "This vehicle is already booked for the selected dates. Please choose another date range." });
    }

    const booking = await Booking.create({
      user: req.user._id,
      vehicle,
      startDate,
      endDate,
      totalPrice,
      pickupLocation,
      dropoffLocation,
      pickupMethod: pickupMethod || "Self Pickup",
      returnMethod: returnMethod || "Same Location",
      deliveryStatus: initialDeliveryStatus,
      deliveryFee: deliveryFee || 0,
      paymentMethod: paymentMethod || "Cash",
      status: "pending-owner-approval",
      paymentStatus: "unpaid",
    });

    // Send in-app notification to renter about submitted request
    try {
      const vehicleName = `${vehicleDoc.brand} ${vehicleDoc.model}`;
      await Notification.create({
        user: req.user._id,
        title: "Booking Request Submitted",
        message: `Your booking request for ${vehicleName} was submitted successfully and is awaiting owner approval.`,
        type: "info",
      });
    } catch (notifErr) {
      console.error("Failed to create booking submitted notification:", notifErr);
    }

    res.status(201).json(booking);
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ msg: "Create booking error: " + err.message });
  }
});

// ✅ Get bookings for the logged-in user
router.get("/my-bookings", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("vehicle", "name brand model images")
      .sort("-createdAt");
    res.json(bookings);
  } catch (err) {
    console.error("Get user bookings error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Get incoming bookings for an owner's vehicles
router.get("/owner-bookings", protect, async (req, res) => {
  try {
    // 1. Find all vehicles owned by this user
    const ownerVehicles = await Vehicle.find({ owner: req.user._id }).select('_id');
    const vehicleIds = ownerVehicles.map(v => v._id);

    // 2. Find all bookings for these vehicles
    const bookings = await Booking.find({ vehicle: { $in: vehicleIds } })
      .populate("vehicle", "name brand model images pricePerDay")
      .populate("user", "name email phone")
      .sort("-createdAt");
      
    res.json(bookings);
  } catch (err) {
    console.error("Get owner bookings error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Get blocked date ranges for a vehicle (public — no auth needed for calendar display)
router.get("/vehicle/:vehicleId/blocked-dates", async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const BLOCKING_STATUSES = [
      "pending-owner-approval",
      "approved-awaiting-payment",
      "confirmed",
      "confirmed-awaiting-cash-payment",
      "active",
    ];

    const bookings = await Booking.find({
      vehicle: vehicleId,
      status: { $in: BLOCKING_STATUSES },
    }).select("startDate endDate status");

    const blockedRanges = bookings.map((b) => ({
      startDate: b.startDate,
      endDate: b.endDate,
      status: b.status,
    }));

    res.json(blockedRanges);
  } catch (err) {
    console.error("Blocked dates error:", err);
    res.status(500).json({ msg: "Server error: " + err.message });
  }
});

// ✅ Get a specific booking by ID
router.get("/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("vehicle")
      .populate("user", "name email");
      
    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    // Security check: only the user who booked or an admin can see this
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ msg: "Not authorized" });
    }

    res.json(booking);
  } catch (err) {
    console.error("Get single booking error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Owner: Confirm cash payment for a booking
router.put("/:id/confirm-cash-payment", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("vehicle", "name brand model")
      .populate("user", "name email");

    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    // Ensure only the vehicle owner can confirm
    const vehicle = await Vehicle.findById(booking.vehicle._id);
    if (!vehicle || vehicle.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Not authorized. Only the vehicle owner can confirm cash payment." });
    }

    // Prevent double confirmation
    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ msg: "Payment has already been confirmed for this booking." });
    }

    // Update booking fields
    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    booking.amountPaid = booking.totalPrice;
    booking.remainingAmount = 0;
    booking.paidAt = new Date();
    booking.cashPaymentConfirmedAt = new Date();
    await booking.save();

    // Send in-app notification to renter
    try {
      const vehicleName = `${booking.vehicle.brand} ${booking.vehicle.model}`;
      await Notification.create({
        user: booking.user._id,
        title: "Cash Payment Confirmed",
        message: `Your cash payment of Rs. ${booking.totalPrice.toLocaleString()} for ${vehicleName} has been verified and confirmed by the owner.`,
        type: "payment_successful",
      });
    } catch (notifErr) {
      console.error("Failed to create cash confirmation notification:", notifErr);
    }

    // Send receipt email to renter
    try {
      const vehicleName = `${booking.vehicle.brand} ${booking.vehicle.model}`;
      const confirmedAt = new Date(booking.cashPaymentConfirmedAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
      await sendEmail({
        to: booking.user.email,
        subject: `Cash Payment Confirmed — ${vehicleName} Booking`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1e293b;">
            <div style="background: #0f172a; padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 22px; letter-spacing: 1px;">PAYMENT CONFIRMED</h1>
              <p style="color: #94a3b8; margin: 8px 0 0; font-size: 13px;">Grand-Auto Cash Receipt</p>
            </div>
            <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
              <p style="margin: 0 0 24px;">Hi <strong>${booking.user.name}</strong>,</p>
              <p>Your cash payment for the following booking has been verified and confirmed by the vehicle owner.</p>
              <table style="width:100%; border-collapse:collapse; margin: 24px 0;">
                <tr><td style="padding:10px 0; border-bottom:1px solid #e2e8f0; color:#64748b; font-size:13px;">Vehicle</td><td style="padding:10px 0; border-bottom:1px solid #e2e8f0; font-weight:bold; text-align:right;">${vehicleName}</td></tr>
                <tr><td style="padding:10px 0; border-bottom:1px solid #e2e8f0; color:#64748b; font-size:13px;">Booking Dates</td><td style="padding:10px 0; border-bottom:1px solid #e2e8f0; text-align:right;">${new Date(booking.startDate).toLocaleDateString()} – ${new Date(booking.endDate).toLocaleDateString()}</td></tr>
                <tr><td style="padding:10px 0; border-bottom:1px solid #e2e8f0; color:#64748b; font-size:13px;">Payment Method</td><td style="padding:10px 0; border-bottom:1px solid #e2e8f0; text-align:right;">Cash</td></tr>
                <tr><td style="padding:10px 0; border-bottom:1px solid #e2e8f0; text-align:right;">Confirmed At</td><td style="padding:10px 0; border-bottom:1px solid #e2e8f0; text-align:right;">${confirmedAt}</td></tr>
                <tr><td style="padding:10px 0; color:#64748b; font-size:13px;">Total Amount</td><td style="padding:10px 0; font-weight:bold; font-size:18px; color:#16a34a; text-align:right;">Rs. ${booking.totalPrice.toLocaleString()}</td></tr>
              </table>
              <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:16px; margin-top:24px;">
                <p style="margin:0; color:#166534; font-size:13px; font-weight:bold;">✅ Your booking is now fully confirmed. Enjoy your ride!</p>
              </div>
              <p style="margin-top:32px; font-size:12px; color:#94a3b8;">This is an automated receipt from Grand-Auto. Please keep it for your records.</p>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Failed to send cash confirmation email:", emailErr);
    }

    res.json({ msg: "Cash payment confirmed successfully.", booking });
  } catch (err) {
    console.error("Confirm cash payment error:", err);
    res.status(500).json({ msg: "Server error: " + err.message });
  }
});

// ✅ Approve a booking request (Owner or Admin)
router.patch("/:id/approve", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("vehicle");
    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    // Verify authorized user: admin or the vehicle owner
    const isOwner = booking.vehicle?.owner?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ msg: "Not authorized. Only the vehicle owner or admin can approve this booking." });
    }

    if (booking.status !== "pending-owner-approval") {
      return res.status(400).json({ msg: "Only pending bookings can be approved." });
    }

    if (booking.paymentStatus === "paid") {
      booking.status = "confirmed";
    } else {
      booking.status = "approved-awaiting-payment";
    }
    
    await booking.save();

    // Create Notification
    try {
      const vehicleName = booking.vehicle ? `${booking.vehicle.brand} ${booking.vehicle.model}` : "Vehicle";
      await Notification.create({
        user: booking.user,
        title: "Booking Approved",
        message: `Your booking request for ${vehicleName} has been approved. You can now complete your payment.`,
        type: "booking_approved"
      });
    } catch (notifErr) {
      console.error("Failed to create approval notification:", notifErr);
    }

    res.json({ msg: "Booking approved successfully.", booking });
  } catch (err) {
    console.error("Approve booking error:", err);
    res.status(500).json({ msg: "Server error: " + err.message });
  }
});

// ✅ Reject a booking request (Owner or Admin)
router.patch("/:id/reject", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("vehicle");
    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    // Verify authorized user: admin or the vehicle owner
    const isOwner = booking.vehicle?.owner?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ msg: "Not authorized. Only the vehicle owner or admin can reject this booking." });
    }

    if (booking.status !== "pending-owner-approval") {
      return res.status(400).json({ msg: "Only pending bookings can be rejected." });
    }

    booking.status = "rejected";
    booking.paymentStatus = "unpaid";
    await booking.save();

    // Create Notification
    try {
      const vehicleName = booking.vehicle ? `${booking.vehicle.brand} ${booking.vehicle.model}` : "Vehicle";
      await Notification.create({
        user: booking.user,
        title: "Booking Rejected",
        message: `Your booking request for ${vehicleName} has been rejected.`,
        type: "booking_rejected"
      });
    } catch (notifErr) {
      console.error("Failed to create rejection notification:", notifErr);
    }

    res.json({ msg: "Booking rejected successfully.", booking });
  } catch (err) {
    console.error("Reject booking error:", err);
    res.status(500).json({ msg: "Server error: " + err.message });
  }
});

// ✅ Renter or Owner: Complete a booking
router.patch("/:id/complete", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("vehicle");
    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    // Verify authorized user: admin, vehicle owner, or the renter
    const isOwner = booking.vehicle?.owner?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    const isRenter = booking.user?.toString() === req.user._id.toString();
    if (!isOwner && !isAdmin && !isRenter) {
      return res.status(403).json({ msg: "Not authorized. You cannot complete this booking." });
    }

    if (!["confirmed", "active"].includes(booking.status)) {
      return res.status(400).json({ msg: "Only confirmed or active bookings can be completed." });
    }

    booking.status = "completed";
    await booking.save();

    // Create Notification
    try {
      const vehicleName = booking.vehicle ? `${booking.vehicle.brand} ${booking.vehicle.model}` : "Vehicle";
      await Notification.create({
        user: booking.user,
        title: "Trip Completed",
        message: `Your trip for ${vehicleName} has been marked as completed. You can now leave a review on the vehicle's page!`,
        type: "info"
      });
    } catch (notifErr) {
      console.error("Failed to create completion notification:", notifErr);
    }

    res.json({ msg: "Booking marked as completed.", booking });
  } catch (err) {
    console.error("Complete booking error:", err);
    res.status(500).json({ msg: "Server error: " + err.message });
  }
});

// ✅ Renter: Select Cash payment method after approval
router.put("/:id/select-cash", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("vehicle");
    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    if (booking.status !== "approved-awaiting-payment") {
      return res.status(400).json({ msg: "This booking must be approved and awaiting payment." });
    }

    booking.paymentMethod = "Cash";
    booking.paymentStatus = "pending";
    booking.status = "confirmed-awaiting-cash-payment";
    await booking.save();

    // Create notification
    try {
      const vehicleName = booking.vehicle ? `${booking.vehicle.brand} ${booking.vehicle.model}` : "Vehicle";
      await Notification.create({
        user: booking.user,
        title: "Cash Booking Confirmed",
        message: `Your cash booking request for ${vehicleName} is confirmed. Please pay the owner on pickup.`,
        type: "info"
      });
    } catch (notifErr) {
      console.error("Failed to create cash selection notification:", notifErr);
    }

    res.json({ msg: "Cash payment selected successfully.", booking });
  } catch (err) {
    console.error("Select cash payment error:", err);
    res.status(500).json({ msg: "Server error: " + err.message });
  }
});

module.exports = router;
