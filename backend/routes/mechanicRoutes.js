const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const MechanicRequest = require("../models/MechanicRequest");
const Mechanic = require("../models/Mechanic");
const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { protect, admin } = require("../middleware/authMiddleware");

// ─────────────────────────────────────────────
// CUSTOMER: Create mechanic request from active booking
// ─────────────────────────────────────────────
router.post("/", protect, async (req, res) => {
  try {
    const {
      bookingId, vehicleId, issueType, problemDescription,
      location, latitude, longitude, isEmergency, images, contactPhone,
    } = req.body;

    if (!vehicleId || !issueType || !problemDescription || !location) {
      return res.status(400).json({ msg: "vehicleId, issueType, problemDescription and location are required." });
    }

    // Validate booking belongs to user and is in allowed statuses
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking) return res.status(404).json({ msg: "Booking not found." });
      if (booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ msg: "Not your booking." });
      }
      const allowed = ["confirmed", "active", "confirmed-awaiting-cash-payment"];
      if (!allowed.includes(booking.status)) {
        return res.status(400).json({ msg: "You can only request mechanic help for confirmed or active bookings." });
      }
    }

    const priority = isEmergency ? "emergency" : "medium";

    const request = await MechanicRequest.create({
      requestedBy: req.user._id,
      requestSource: "customer",
      customer: req.user._id,
      vehicle: vehicleId,
      booking: bookingId || null,
      issueType,
      problemDescription,
      location,
      latitude: latitude || null,
      longitude: longitude || null,
      isEmergency: !!isEmergency,
      priority,
      images: images || [],
      contactPhone: contactPhone || "",
      status: "pending-admin-review",
    });

    // Notify all admins
    const admins = await User.find({ role: "admin" });
    const notifs = admins.map(a => ({
      user: a._id,
      title: isEmergency ? "🚨 Emergency Mechanic Request" : "New Mechanic Request",
      message: `${req.user.name} requested ${issueType} help${isEmergency ? " — EMERGENCY" : ""}.`,
      type: "info",
    }));
    if (notifs.length) await Notification.insertMany(notifs);

    res.status(201).json(request);
  } catch (err) {
    console.error("Create mechanic request error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ─────────────────────────────────────────────
// SELLER: Create service request after completed booking
// ─────────────────────────────────────────────
router.post("/seller", protect, async (req, res) => {
  try {
    const {
      vehicleId, bookingId, issueType, problemDescription,
      location, images, priority,
    } = req.body;

    if (!vehicleId || !issueType || !problemDescription) {
      return res.status(400).json({ msg: "vehicleId, issueType, and problemDescription are required." });
    }

    // Validate vehicle belongs to seller
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ msg: "Vehicle not found." });
    if (vehicle.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not your vehicle." });
    }

    const request = await MechanicRequest.create({
      requestedBy: req.user._id,
      requestSource: "seller",
      seller: req.user._id,
      vehicle: vehicleId,
      booking: bookingId || null,
      issueType,
      problemDescription,
      location: location || vehicle.location || "Owner's garage",
      priority: priority || "medium",
      images: images || [],
      status: "pending-admin-review",
    });

    // Notify admins
    const admins = await User.find({ role: "admin" });
    const notifs = admins.map(a => ({
      user: a._id,
      title: "New Vehicle Service Request",
      message: `${req.user.name} requested service for ${vehicle.brand} ${vehicle.model}.`,
      type: "info",
    }));
    if (notifs.length) await Notification.insertMany(notifs);

    res.status(201).json(request);
  } catch (err) {
    console.error("Seller mechanic request error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ─────────────────────────────────────────────
// USER: Get own requests
// ─────────────────────────────────────────────
router.get("/my", protect, async (req, res) => {
  try {
    const requests = await MechanicRequest.find({ requestedBy: req.user._id })
      .populate("vehicle", "name brand model images")
      .populate("booking", "startDate endDate status")
      .populate("assignedMechanic", "name phone specialization")
      .sort("-createdAt");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ─────────────────────────────────────────────
// SELLER: Get requests for seller's vehicles
// ─────────────────────────────────────────────
router.get("/owner-requests", protect, async (req, res) => {
  try {
    const ownerVehicles = await Vehicle.find({ owner: req.user._id }).select("_id");
    const vehicleIds = ownerVehicles.map(v => v._id);
    const requests = await MechanicRequest.find({ vehicle: { $in: vehicleIds } })
      .populate("requestedBy", "name email phone")
      .populate("vehicle", "name brand model images")
      .populate("assignedMechanic", "name phone")
      .sort("-createdAt");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ─────────────────────────────────────────────
// ADMIN: Get all requests
// ─────────────────────────────────────────────
router.get("/admin", protect, admin, async (req, res) => {
  try {
    const requests = await MechanicRequest.find()
      .populate("requestedBy", "name email phone")
      .populate("vehicle", "name brand model images")
      .populate("booking", "startDate endDate status")
      .populate("assignedMechanic", "name phone specialization availabilityStatus")
      .sort({ isEmergency: -1, createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ─────────────────────────────────────────────
// ADMIN: Get all mechanics
// ─────────────────────────────────────────────
router.get("/admin/mechanics-list", protect, admin, async (req, res) => {
  try {
    const mechanics = await Mechanic.find().populate("user", "name email").sort("-createdAt");
    res.json(mechanics);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ─────────────────────────────────────────────
// ADMIN: Add a mechanic (optionally create user account)
// ─────────────────────────────────────────────
router.post("/admin/mechanics", protect, admin, async (req, res) => {
  try {
    const { name, email, phone, specialization, location, experienceYears, password } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ msg: "name, email and phone are required." });
    }

    let userId = null;
    if (password) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ msg: "User with this email already exists." });
      const hashed = await bcrypt.hash(password, 10);
      const newUser = await User.create({ name, email, password: hashed, role: "mechanic" });
      userId = newUser._id;
    }

    const mechanic = await Mechanic.create({
      user: userId,
      name, email, phone,
      specialization: specialization || "General Mechanic",
      location: location || "",
      experienceYears: experienceYears || 0,
    });

    res.status(201).json(mechanic);
  } catch (err) {
    console.error("Add mechanic error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ─────────────────────────────────────────────
// ADMIN: Edit mechanic
// ─────────────────────────────────────────────
router.patch("/admin/mechanics/:id", protect, admin, async (req, res) => {
  try {
    const { name, phone, specialization, location, experienceYears, availabilityStatus } = req.body;
    const mechanic = await Mechanic.findByIdAndUpdate(
      req.params.id,
      { $set: { name, phone, specialization, location, experienceYears, availabilityStatus } },
      { new: true }
    );
    if (!mechanic) return res.status(404).json({ msg: "Mechanic not found" });
    res.json(mechanic);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ─────────────────────────────────────────────
// ADMIN: Assign mechanic to a request
// ─────────────────────────────────────────────
router.patch("/admin/:id/assign", protect, admin, async (req, res) => {
  try {
    const { mechanicId, estimatedCost, adminNotes } = req.body;
    const request = await MechanicRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: "Request not found" });

    const mechanic = await Mechanic.findById(mechanicId);
    if (!mechanic) return res.status(404).json({ msg: "Mechanic not found" });

    request.assignedMechanic = mechanic._id;
    request.mechanicName = mechanic.name;
    request.mechanicPhone = mechanic.phone;
    request.status = "assigned";
    if (estimatedCost) request.estimatedCost = estimatedCost;
    if (adminNotes !== undefined) request.adminNotes = adminNotes;
    await request.save();

    // Mark mechanic busy
    mechanic.availabilityStatus = "busy";
    await mechanic.save();

    // Notify requester
    await Notification.create({
      user: request.requestedBy,
      title: "Mechanic Assigned 🔧",
      message: `${mechanic.name} has been assigned to your ${request.issueType} request.`,
      type: "info",
    });

    const populated = await MechanicRequest.findById(request._id)
      .populate("assignedMechanic", "name phone specialization");
    res.json(populated);
  } catch (err) {
    console.error("Assign mechanic error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ─────────────────────────────────────────────
// ADMIN: Update request status
// ─────────────────────────────────────────────
router.patch("/admin/:id/status", protect, admin, async (req, res) => {
  try {
    const { status, adminNotes, rejectionReason, ownerVerificationNotes, finalCost } = req.body;
    const request = await MechanicRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: "Request not found" });

    if (status) request.status = status;
    if (adminNotes !== undefined) request.adminNotes = adminNotes;
    if (rejectionReason !== undefined) request.rejectionReason = rejectionReason;
    if (ownerVerificationNotes !== undefined) request.ownerVerificationNotes = ownerVerificationNotes;
    if (finalCost !== undefined) request.finalCost = finalCost;
    if (status === "completed") request.completedAt = new Date();

    await request.save();

    // If completed, free mechanic
    if (status === "completed" && request.assignedMechanic) {
      await Mechanic.findByIdAndUpdate(request.assignedMechanic, {
        availabilityStatus: "available",
        $inc: { totalJobs: 1 },
      });
    }

    const msgMap = {
      approved: "Your mechanic request has been approved.",
      rejected: `Your request was rejected. Reason: ${rejectionReason || "No reason given"}.`,
      completed: "Your vehicle service has been completed! ✅",
    };
    if (msgMap[status]) {
      await Notification.create({
        user: request.requestedBy,
        title: status === "completed" ? "Service Completed ✅" : status === "rejected" ? "Request Rejected" : "Request Approved",
        message: msgMap[status],
        type: "info",
      });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ─────────────────────────────────────────────
// MECHANIC: Get assigned jobs (MUST be before /:id wildcard)
// ─────────────────────────────────────────────
router.get("/mechanic/jobs", protect, async (req, res) => {
  try {
    if (req.user.role !== "mechanic" && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not authorized" });
    }
    // Find mechanic profile linked to this user
    const mechanicProfile = await Mechanic.findOne({ user: req.user._id });
    if (!mechanicProfile) return res.status(404).json({ msg: "Mechanic profile not found" });

    const jobs = await MechanicRequest.find({ assignedMechanic: mechanicProfile._id })
      .populate("requestedBy", "name email phone")
      .populate("vehicle", "name brand model images")
      .populate("booking", "startDate endDate")
      .sort("-createdAt");
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ─────────────────────────────────────────────
// MECHANIC: Get all approved/pending requests (cars needing service)
// ─────────────────────────────────────────────
router.get("/mechanic/available-requests", protect, async (req, res) => {
  try {
    if (req.user.role !== "mechanic" && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not authorized" });
    }
    // Show all requests that are approved (admin approved but not yet assigned to a mechanic)
    const requests = await MechanicRequest.find({
      status: { $in: ["approved", "pending-admin-review"] },
      assignedMechanic: null,
    })
      .populate("requestedBy", "name email phone")
      .populate("vehicle", "name brand model images year")
      .populate("booking", "startDate endDate status")
      .sort({ isEmergency: -1, createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error("Available requests error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ─────────────────────────────────────────────
// USER: Get single request
// ─────────────────────────────────────────────
router.get("/:id", protect, async (req, res) => {
  try {
    const request = await MechanicRequest.findById(req.params.id)
      .populate("requestedBy", "name email phone")
      .populate("vehicle", "name brand model images")
      .populate("booking", "startDate endDate status")
      .populate("assignedMechanic", "name phone specialization rating");

    if (!request) return res.status(404).json({ msg: "Request not found" });

    const isOwner = request.requestedBy._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    const isMechanic = req.user.role === "mechanic";
    if (!isOwner && !isAdmin && !isMechanic) {
      return res.status(403).json({ msg: "Not authorized" });
    }
    res.json(request);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ─────────────────────────────────────────────
// USER: Cancel own request
// ─────────────────────────────────────────────
router.patch("/:id/cancel", protect, async (req, res) => {
  try {
    const request = await MechanicRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: "Request not found" });
    if (request.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Not authorized" });
    }
    const cancellable = ["pending-admin-review", "approved"];
    if (!cancellable.includes(request.status)) {
      return res.status(400).json({ msg: "Cannot cancel a request that is already assigned or in progress." });
    }
    request.status = "cancelled";
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ─────────────────────────────────────────────
// MECHANIC: Self-assign job
// ─────────────────────────────────────────────
router.patch("/mechanic/:id/self-assign", protect, async (req, res) => {
  try {
    if (req.user.role !== "mechanic") {
      return res.status(403).json({ msg: "Only mechanics can self-assign jobs" });
    }
    const request = await MechanicRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: "Request not found" });
    
    if (!["approved", "pending-admin-review"].includes(request.status) || request.assignedMechanic) {
      return res.status(400).json({ msg: "Job is not available for self-assignment" });
    }

    const mechanicProfile = await Mechanic.findOne({ user: req.user._id });
    if (!mechanicProfile) return res.status(404).json({ msg: "Mechanic profile not found" });

    request.assignedMechanic = mechanicProfile._id;
    request.mechanicName = mechanicProfile.name;
    request.mechanicPhone = mechanicProfile.phone;
    // We set status to assigned (or directly to accepted-by-mechanic if you want them to immediately start)
    // Assigned makes sense so they can still "Accept" or "Start" it explicitly.
    request.status = "assigned";
    await request.save();

    // Mark mechanic busy
    mechanicProfile.availabilityStatus = "busy";
    await mechanicProfile.save();

    await Notification.create({
      user: request.requestedBy,
      title: "Mechanic Assigned 🔧",
      message: `${mechanicProfile.name} has assigned themselves to your ${request.issueType} request.`,
      type: "info",
    });

    res.json(request);
  } catch (err) {
    console.error("Self assign error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ─────────────────────────────────────────────
// MECHANIC: Accept job
// ─────────────────────────────────────────────
router.patch("/mechanic/:id/accept", protect, async (req, res) => {
  try {
    const request = await MechanicRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: "Request not found" });
    if (request.status !== "assigned") {
      return res.status(400).json({ msg: "Job is not in assigned status" });
    }
    request.status = "accepted-by-mechanic";
    await request.save();

    await Notification.create({
      user: request.requestedBy,
      title: "Mechanic Accepted Your Request 🔧",
      message: `${request.mechanicName} has accepted your ${request.issueType} request and is on their way.`,
      type: "info",
    });

    res.json(request);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ─────────────────────────────────────────────
// MECHANIC: Start repair
// ─────────────────────────────────────────────
router.patch("/mechanic/:id/start", protect, async (req, res) => {
  try {
    const request = await MechanicRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: "Request not found" });
    if (request.status !== "accepted-by-mechanic") {
      return res.status(400).json({ msg: "Job must be accepted before starting" });
    }
    request.status = "in-progress";
    await request.save();

    await Notification.create({
      user: request.requestedBy,
      title: "Repair In Progress 🛠️",
      message: `${request.mechanicName} has started working on your vehicle.`,
      type: "info",
    });

    res.json(request);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ─────────────────────────────────────────────
// MECHANIC: Mark as Fixed
// ─────────────────────────────────────────────
router.patch("/mechanic/:id/fixed", protect, async (req, res) => {
  try {
    const { mechanicNotes, finalCost, afterRepairImages } = req.body;
    const request = await MechanicRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: "Request not found" });
    if (request.status !== "in-progress") {
      return res.status(400).json({ msg: "Job must be in progress to mark as fixed" });
    }
    request.status = "fixed";
    request.fixedAt = new Date();
    if (mechanicNotes) request.mechanicNotes = mechanicNotes;
    if (finalCost) request.finalCost = finalCost;
    if (afterRepairImages) request.afterRepairImages = afterRepairImages;
    await request.save();

    await Notification.create({
      user: request.requestedBy,
      title: "Vehicle Fixed! ✅",
      message: `${request.mechanicName} has marked your vehicle as fixed. Awaiting admin verification.`,
      type: "info",
    });

    // Notify admins too
    const admins = await User.find({ role: "admin" });
    const notifs = admins.map(a => ({
      user: a._id,
      title: "Vehicle Marked Fixed",
      message: `Mechanic ${request.mechanicName} marked job #${request._id} as fixed.`,
      type: "info",
    }));
    if (notifs.length) await Notification.insertMany(notifs);

    res.json(request);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Keep backward-compatible routes
router.get("/my-requests", protect, async (req, res) => {
  try {
    const requests = await MechanicRequest.find({ requestedBy: req.user._id })
      .populate("vehicle", "name brand model")
      .populate("booking", "startDate endDate")
      .sort("-createdAt");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
