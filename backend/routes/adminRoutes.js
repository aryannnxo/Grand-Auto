const express = require("express");
const router = express.Router();
const OwnerApplication = require("../models/OwnerApplication");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const { protect, admin } = require("../middleware/authMiddleware");

// ✅ ADMIN: Get dashboard summary stats
router.get("/stats", protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVehicles = await Vehicle.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const activeRentals = await Booking.countDocuments({ rentalStatus: "Active" });
    
    // Calculate total revenue
    const bookings = await Booking.find({ paymentStatus: "Paid" });
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    // Recent activity
    const recentUsers = await User.find().sort("-createdAt").limit(5).select("name email role createdAt");
    const recentBookings = await Booking.find()
      .populate("user", "name email")
      .populate("vehicle", "name brand model")
      .sort("-createdAt")
      .limit(5);

    // Monthly data for charts (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthlyBookings = await Booking.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });
      
      const monthlyRevenue = (await Booking.find({
        paymentStatus: "Paid",
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      })).reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      monthlyData.push({
        month: date.toLocaleString('default', { month: 'short' }),
        bookings: monthlyBookings,
        revenue: monthlyRevenue
      });
    }

    res.json({
      totalUsers,
      totalVehicles,
      totalBookings,
      activeRentals,
      totalRevenue,
      recentUsers,
      recentBookings,
      monthlyData
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});
router.get("/owner-applications", protect, admin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const applications = await OwnerApplication.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error("Admin get applications error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/admin/owner-applications/:id
router.get("/owner-applications/:id", protect, admin, async (req, res) => {
  try {
    const application = await OwnerApplication.findById(req.params.id).populate("user", "name email");
    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }
    res.json(application);
  } catch (err) {
    console.error("Admin get single application error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/admin/owner-applications/:id/approve
router.put("/owner-applications/:id/approve", protect, admin, async (req, res) => {
  try {
    const application = await OwnerApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }

    if (application.status !== "pending") {
      return res.status(400).json({ msg: "Only pending applications can be approved" });
    }

    application.status = "approved";
    await application.save();

    const user = await User.findById(application.user);
    if (user) {
        user.role = "owner";
        user.isVerifiedOwner = true;
        user.ownerApplicationStatus = "approved";
        user.ownerVerificationApprovedAt = new Date();
        await user.save();
    }

    res.json({ msg: "Application approved successfully", application });
  } catch (err) {
    console.error("Approve error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/admin/owner-applications/:id/reject
router.put("/owner-applications/:id/reject", protect, admin, async (req, res) => {
  try {
    const { reason } = req.body;
    const application = await OwnerApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }

    if (application.status !== "pending") {
      return res.status(400).json({ msg: "Only pending applications can be rejected" });
    }

    application.status = "rejected";
    application.rejectionReason = reason;
    await application.save();

    const user = await User.findById(application.user);
    if (user) {
        user.ownerApplicationStatus = "rejected";
        user.ownerVerificationRejectedAt = new Date();
        user.ownerRejectionReason = reason;
        await user.save();
    }

    res.json({ msg: "Application rejected", application });
  } catch (err) {
    console.error("Reject error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ==========================================
// VEHICLE VERIFICATION ROUTES
// ==========================================

// GET /api/admin/vehicles
router.get("/vehicles", protect, admin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.verificationStatus = status;

    const vehicles = await Vehicle.find(query)
      .populate("owner", "name email")
      .sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    console.error("Admin view vehicles error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/admin/vehicles/:id
router.get("/vehicles/:id", protect, admin, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate("owner", "name email phone");
    if (!vehicle) return res.status(404).json({ msg: "Not found" });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/admin/vehicles/:id/approve
router.put("/vehicles/:id/approve", protect, admin, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ msg: "Not found" });

    vehicle.verificationStatus = "approved";
    vehicle.isPublic = true;
    vehicle.isBookable = true;
    vehicle.isVerified = true;
    vehicle.verifiedAt = new Date();
    vehicle.verifiedBy = req.user._id;

    await vehicle.save();
    res.json({ msg: "Vehicle approved", vehicle });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/admin/vehicles/:id/reject
router.put("/vehicles/:id/reject", protect, admin, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ msg: "Not found" });

    vehicle.verificationStatus = "rejected";
    vehicle.isPublic = false;
    vehicle.isBookable = false;
    vehicle.rejectedAt = new Date();
    vehicle.rejectionReason = req.body.reason || "Did not meet platform standards.";

    await vehicle.save();
    res.json({ msg: "Vehicle rejected", vehicle });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ==========================================
// CARS MANAGEMENT ROUTES (Full CRUD for Admin)
// ==========================================

// GET /api/admin/cars
router.get("/cars", protect, admin, async (req, res) => {
  try {
    const { operationalStatus, search } = req.query;
    let query = {};
    if (operationalStatus) query.operationalStatus = operationalStatus;
    if (search) {
      query.$or = [
        { brand: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
      ];
    }

    const cars = await Vehicle.find(query)
      .populate("owner", "name email")
      .sort({ createdAt: -1 });
    res.json(cars);
  } catch (err) {
    console.error("Admin view cars error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/admin/cars/:id
router.get("/cars/:id", protect, admin, async (req, res) => {
  try {
    const car = await Vehicle.findById(req.params.id).populate("owner", "name email phone");
    if (!car) return res.status(404).json({ msg: "Car not found" });

    // Fetch recent bookings
    const bookings = await Booking.find({ vehicle: car._id })
      .populate("user", "name email")
      .sort({ startDate: -1 });

    res.json({ car, bookings });
  } catch (err) {
    console.error("Admin single car error", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/admin/cars/:id
router.put("/cars/:id", protect, admin, async (req, res) => {
  try {
    const car = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!car) return res.status(404).json({ msg: "Car not found" });

    if (req.body.operationalStatus === "inactive" || req.body.operationalStatus === "maintenance" || req.body.operationalStatus === "rented") {
        car.available = false;
        await car.save();
    } else if (req.body.operationalStatus === "available") {
        car.available = true;
        await car.save();
    }

    res.json({ msg: "Car updated successfully", car });
  } catch (err) {
    console.error("Admin update car error", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE /api/admin/cars/:id
router.delete("/cars/:id", protect, admin, async (req, res) => {
  try {
    const car = await Vehicle.findByIdAndDelete(req.params.id);
    if (!car) return res.status(404).json({ msg: "Car not found" });
    
    // optionally delete bookings related to this car or keep them
    // await Booking.deleteMany({ vehicle: req.params.id });

    res.json({ msg: "Car deleted successfully" });
  } catch (err) {
    console.error("Admin delete car error", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ==========================================
// ACTIVE RENTALS / LOGISTICS MANAGEMENT ROUTES
// ==========================================

// GET /api/admin/rentals
router.get("/rentals", protect, admin, async (req, res) => {
  try {
    const { rentalStatus } = req.query;
    
    // Fetch all vehicles to show the full fleet (sorted by newest)
    const vehicles = await Vehicle.find().populate("owner", "name email phone").sort({ createdAt: -1 });
    
    // Fetch all bookings (you might want to filter recent or active ones)
    let bookingQuery = {};
    if (rentalStatus) bookingQuery.rentalStatus = rentalStatus;

    const bookings = await Booking.find(bookingQuery)
      .populate("user", "name email phone")
      .populate("vehicle", "name brand model type images")
      .sort({ startDate: 1 });

    res.json({ vehicles, bookings });
  } catch (err) {
    console.error("Admin fetch rentals error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/admin/rentals/:id/status
router.put("/rentals/:id/status", protect, admin, async (req, res) => {
  try {
    const { rentalStatus } = req.body;
    const rental = await Booking.findById(req.params.id).populate("vehicle");
    if (!rental) {
      return res.status(404).json({ msg: "Rental record not found" });
    }

    rental.rentalStatus = rentalStatus;
    
    // Automatically close out if marked Completed
    if (rentalStatus === "Completed") {
       rental.status = "Completed";
    } else if (rentalStatus === "Cancelled") {
       rental.status = "Cancelled";
       rental.paymentStatus = "Cancelled";
    }

    await rental.save();

    if (rentalStatus === "Cancelled") {
      try {
        const vehicleName = rental.vehicle ? `${rental.vehicle.brand} ${rental.vehicle.model}` : "Vehicle";
        await Notification.create({
          user: rental.user,
          title: "Booking Cancelled",
          message: `Your booking for vehicle ${vehicleName} has been cancelled.`,
          type: "booking_cancelled"
        });
      } catch (notifErr) {
        console.error("Failed to create cancellation notification:", notifErr);
      }
    }
    res.json({ msg: "Rental status updated successfully", rental });
  } catch (err) {
    console.error("Admin update rental status error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/admin/rentals/:id/delivery-status
router.put("/rentals/:id/delivery-status", protect, admin, async (req, res) => {
  try {
    const { deliveryStatus } = req.body;
    const rental = await Booking.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ msg: "Rental record not found" });
    }

    rental.deliveryStatus = deliveryStatus;
    await rental.save();
    res.json({ msg: "Delivery status updated successfully", rental });
  } catch (err) {
    console.error("Admin update delivery status error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ==========================================
// PAYMENTS MANAGEMENT ROUTES
// ==========================================

// GET /api/admin/payments/summary
router.get("/payments/summary", protect, admin, async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$amountPaid", 0]
            }
          },
          esewaPayments: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$paymentStatus", "paid"] }, { $eq: ["$paymentMethod", "eSewa"] }] },
                "$amountPaid",
                0
              ]
            }
          },
          cashPayments: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$paymentStatus", "paid"] }, { $eq: ["$paymentMethod", "Cash"] }] },
                "$amountPaid",
                0
              ]
            }
          },
          pendingBalances: {
            $sum: {
              $cond: [{ $in: ["$paymentStatus", ["pending", "unpaid"] ]}, "$remainingAmount", 0]
            }
          },
          paidCount: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] } },
          unpaidCount: { $sum: { $cond: [{ $eq: ["$paymentStatus", "unpaid"] }, 1, 0] } },
          pendingCount: { $sum: { $cond: [{ $eq: ["$paymentStatus", "pending"] }, 1, 0] } },
          failedCount: { $sum: { $cond: [{ $eq: ["$paymentStatus", "failed"] }, 1, 0] } },
          refundedCount: { $sum: { $cond: [{ $eq: ["$paymentStatus", "refunded"] }, 1, 0] } },
        }
      }
    ];

    const result = await Booking.aggregate(pipeline);
    
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.json({
        totalRevenue: 0,
        esewaPayments: 0,
        cashPayments: 0,
        pendingBalances: 0,
        paidCount: 0,
        unpaidCount: 0,
        pendingCount: 0,
        failedCount: 0,
        refundedCount: 0
      });
    }
  } catch (err) {
    console.error("Admin fetch payments summary error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/admin/payments
router.get("/payments", protect, admin, async (req, res) => {
  try {
    const { status, method, search, dateFrom, dateTo } = req.query;
    let query = {};
    
    if (status) query.paymentStatus = status;
    if (method) query.paymentMethod = method;

    if (dateFrom && dateTo) {
      query.createdAt = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo)
      };
    }

    // To support deep searching (user name/email, vehicle name), we can populate and then filter,
    // or use a complex aggregation. For simplicity and robustness with Mongoose, we'll fetch populated
    // and filter in memory if a search string exists.
    
    let payments = await Booking.find(query)
      .populate("user", "name email")
      .populate("vehicle", "name brand model images")
      .sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      payments = payments.filter(p => {
        return (
          p._id.toString().toLowerCase().includes(s) ||
          (p.transactionId && p.transactionId.toLowerCase().includes(s)) ||
          (p.user && p.user.name && p.user.name.toLowerCase().includes(s)) ||
          (p.user && p.user.email && p.user.email.toLowerCase().includes(s)) ||
          (p.vehicle && p.vehicle.brand && p.vehicle.brand.toLowerCase().includes(s)) ||
          (p.vehicle && p.vehicle.model && p.vehicle.model.toLowerCase().includes(s))
        );
      });
    }

    res.json(payments);
  } catch (err) {
    console.error("Admin fetch payments error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/admin/payments/:id/status
router.put("/payments/:id/status", protect, admin, async (req, res) => {
  try {
    const { paymentStatus, paidAmount, transactionId, adminNote } = req.body;

    // Normalize to lowercase to match Mongoose enum: paid/unpaid/pending/failed/refunded
    const normalizedStatus = paymentStatus ? paymentStatus.toLowerCase() : null;

    const allowedStatuses = ["paid", "unpaid", "pending", "failed", "refunded"];
    if (!normalizedStatus || !allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ msg: `Invalid status. Allowed: ${allowedStatuses.join(", ")}` });
    }

    const booking = await Booking.findById(req.params.id).populate("vehicle");
    if (!booking) {
      return res.status(404).json({ msg: "Booking/Payment not found" });
    }

    const oldPaymentStatus = booking.paymentStatus;
    booking.paymentStatus = normalizedStatus;

    if (normalizedStatus === "paid") {
      // Only update booking status if it's in a state that makes sense to confirm
      if (["approved-awaiting-payment", "confirmed-awaiting-cash-payment"].includes(booking.status)) {
        booking.status = "confirmed";
      }
      const paid = paidAmount !== undefined && paidAmount !== "" ? Number(paidAmount) : booking.totalPrice;
      booking.amountPaid = paid;
      booking.remainingAmount = Math.max(0, booking.totalPrice - paid);
      if (transactionId && transactionId.trim() !== "") booking.transactionId = transactionId.trim();
      if (!booking.paidAt) booking.paidAt = new Date();
    } else if (normalizedStatus === "unpaid") {
      booking.amountPaid = 0;
      booking.remainingAmount = booking.totalPrice;
    } else if (normalizedStatus === "pending") {
      // Keep existing amounts as-is
    } else if (normalizedStatus === "refunded") {
      booking.status = "cancelled";
    } else if (normalizedStatus === "failed") {
      booking.status = "cancelled";
    }

    await booking.save();

    // Trigger Notifications only when status actually changes
    if (oldPaymentStatus !== normalizedStatus) {
      try {
        const vehicleName = booking.vehicle ? `${booking.vehicle.brand} ${booking.vehicle.model}` : "Vehicle";

        if (normalizedStatus === "paid") {
          await Notification.create({
            user: booking.user,
            title: "Payment Successful",
            message: `Your payment of Rs. ${booking.amountPaid.toLocaleString()} for vehicle ${vehicleName} was confirmed by an Admin.`,
            type: "payment_successful"
          });
        } else if (normalizedStatus === "refunded") {
          await Notification.create({
            user: booking.user,
            title: "Refund Processed",
            message: `Your refund for vehicle ${vehicleName} has been processed successfully.`,
            type: "refund_processed"
          });
        } else if (normalizedStatus === "failed") {
          await Notification.create({
            user: booking.user,
            title: "Payment Failed",
            message: `Your payment for vehicle ${vehicleName} has been marked as failed.`,
            type: "info"
          });
        }
      } catch (notifErr) {
        console.error("Failed to create admin payment change notifications:", notifErr);
      }
    }

    res.json({ msg: "Payment status updated successfully", booking });
  } catch (err) {
    console.error("Admin update payment status error:", err.message, err.stack);
    res.status(500).json({ msg: err.message || "Server error" });
  }
});

// ==========================================
// USER MANAGEMENT ROUTES
// ==========================================

// GET /api/admin/users
router.get("/users", protect, admin, async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 }).select("-password");
    
    // Aggregated stats for the user panel
    const stats = {
      total: await User.countDocuments(),
      admins: await User.countDocuments({ role: "admin" }),
      owners: await User.countDocuments({ role: "owner" }),
      renters: await User.countDocuments({ role: "user" })
    };

    res.json({ users, stats });
  } catch (err) {
    console.error("Admin fetch users error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/admin/users/:id
router.get("/users/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Fetch user activity
    const bookings = await Booking.find({ user: user._id }).sort("-createdAt");
    const vehicles = await Vehicle.find({ owner: user._id }).sort("-createdAt");

    res.json({ user, bookings, vehicles });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/admin/users/:id
router.put("/users/:id", protect, admin, async (req, res) => {
  try {
    const { role, name, email, phone, isVerifiedOwner } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (role) user.role = role;
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (isVerifiedOwner !== undefined) user.isVerifiedOwner = isVerifiedOwner;

    await user.save();
    res.json({ msg: "User updated successfully", user });
  } catch (err) {
    console.error("Admin update user error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Prevent deleting self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ msg: "You cannot delete your own admin account" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "User account deleted permanently" });
  } catch (err) {
    console.error("Admin delete user error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
