const express = require("express");
const router = express.Router();
const MechanicRequest = require("../models/MechanicRequest");
const Vehicle = require("../models/Vehicle");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { protect, admin, verifiedOwner } = require("../middleware/authMiddleware");

// ✅ OWNER: Get requests for owner's vehicles
router.get("/owner-requests", protect, verifiedOwner, async (req, res) => {
  try {
    const ownerVehicles = await Vehicle.find({ owner: req.user._id }).select('_id');
    const vehicleIds = ownerVehicles.map(v => v._id);

    const requests = await MechanicRequest.find({ vehicle: { $in: vehicleIds } })
      .populate("user", "name email phone")
      .populate("vehicle", "name brand model images")
      .sort("-createdAt");
      
    res.json(requests);
  } catch (err) {
    console.error("Owner get requests error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ USER: Create a mechanic request
router.post("/", protect, async (req, res) => {
  try {
    const { 
      vehicle, booking, serviceType, description, location, requestedDate,
      city, landmark, latitude, longitude, preferredTime, isEmergency,
      images, contactName, contactEmail, contactPhone
    } = req.body;

    if (!serviceType || !description || !location || !requestedDate) {
      return res.status(400).json({ msg: "Please provide all required fields" });
    }

    const priority = isEmergency ? "emergency" : "medium";

    const mechanicRequest = await MechanicRequest.create({
      user: req.user._id,
      vehicle: vehicle || undefined,
      booking: booking || undefined,
      serviceType,
      description,
      location,
      city,
      landmark,
      latitude,
      longitude,
      requestedDate,
      preferredTime,
      isEmergency,
      priority,
      images: images || [],
      contactName,
      contactEmail,
      contactPhone,
      status: "pending"
    });

    // Notify admins about new request
    const admins = await User.find({ role: "admin" });
    const notifications = admins.map(adminUser => ({
      user: adminUser._id,
      title: isEmergency ? "🚨 Emergency Mechanic Request" : "New Mechanic Request",
      message: `${contactName || req.user.name} requested ${serviceType} at ${location}.`,
      type: "info"
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json(mechanicRequest);
  } catch (err) {
    console.error("Create mechanic request error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ USER: Get logged in user's mechanic requests
router.get("/my-requests", protect, async (req, res) => {
  try {
    const requests = await MechanicRequest.find({ user: req.user._id })
      .populate("vehicle", "name brand model")
      .populate("booking", "startDate endDate")
      .sort("-createdAt");
    
    res.json(requests);
  } catch (err) {
    console.error("Get user requests error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ ADMIN: Get all mechanic requests
router.get("/admin", protect, admin, async (req, res) => {
  try {
    const requests = await MechanicRequest.find()
      .populate("user", "name email phone")
      .populate("vehicle", "name brand model images")
      .sort({ isEmergency: -1, createdAt: -1 }); // Sort emergency first, then newest
      
    res.json(requests);
  } catch (err) {
    console.error("Admin get requests error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ USER/ADMIN: Get a single request
router.get("/:id", protect, async (req, res) => {
  try {
    const request = await MechanicRequest.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("vehicle", "name brand model images")
      .populate("booking");

    if (!request) return res.status(404).json({ msg: "Request not found" });

    // Check auth
    if (req.user.role !== "admin" && request.user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ msg: "Not authorized to view this request" });
    }

    res.json(request);
  } catch (err) {
    console.error("Get single request error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ ADMIN: Assign mechanic to request
router.patch("/admin/:id/assign", protect, admin, async (req, res) => {
  try {
    const { assignedMechanicName, assignedMechanicPhone, assignedMechanicEmail, estimatedCost, adminNotes } = req.body;
    
    const request = await MechanicRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }

    request.assignedMechanicName = assignedMechanicName;
    request.assignedMechanicPhone = assignedMechanicPhone;
    request.assignedMechanicEmail = assignedMechanicEmail;
    request.assignedMechanic = assignedMechanicName; // backwards compat
    if (estimatedCost !== undefined) request.estimatedCost = estimatedCost;
    if (adminNotes !== undefined) request.adminNotes = adminNotes;
    
    request.status = "assigned";
    
    await request.save();

    // Notify user
    await Notification.create({
      user: request.user,
      title: "Mechanic Assigned",
      message: `A mechanic has been assigned to your ${request.serviceType} request.`,
      type: "mechanic_assigned"
    });

    res.json(request);
  } catch (err) {
    console.error("Assign mechanic error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ ADMIN: Update request status
router.patch("/admin/:id/status", protect, admin, async (req, res) => {
  try {
    const { status, adminNotes, rejectionReason, completionNotes, finalCost } = req.body;
    
    const request = await MechanicRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }

    if (status) request.status = status;
    if (adminNotes !== undefined) request.adminNotes = adminNotes;
    if (status === "rejected" && rejectionReason !== undefined) {
      request.rejectionReason = rejectionReason;
    }
    if (status === "completed") {
      if (completionNotes !== undefined) request.completionNotes = completionNotes;
      if (finalCost !== undefined) request.finalCost = finalCost;
      request.completedAt = Date.now();
    }
    
    await request.save();

    // Notification mapping
    const statusMessages = {
      approved: { title: "Request Approved", type: "mechanic_approved", msg: `Your request for ${request.serviceType} has been approved.` },
      rejected: { title: "Request Rejected", type: "mechanic_rejected", msg: `Your request was rejected. Reason: ${rejectionReason || 'No reason provided'}.` },
      "in-progress": { title: "Service In Progress", type: "mechanic_in_progress", msg: `Your ${request.serviceType} service has started.` },
      completed: { title: "Service Completed", type: "mechanic_completed", msg: `Your ${request.serviceType} has been completed.` },
    };

    if (statusMessages[status]) {
      await Notification.create({
        user: request.user,
        title: statusMessages[status].title,
        message: statusMessages[status].msg,
        type: statusMessages[status].type
      });
    }

    res.json(request);
  } catch (err) {
    console.error("Update request status error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ ADMIN: Update cost
router.patch("/admin/:id/cost", protect, admin, async (req, res) => {
  try {
    const { estimatedCost, finalCost } = req.body;
    const request = await MechanicRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: "Request not found" });

    if (estimatedCost !== undefined) request.estimatedCost = estimatedCost;
    if (finalCost !== undefined) request.finalCost = finalCost;

    await request.save();
    res.json(request);
  } catch (err) {
    console.error("Update cost error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ USER: Cancel request
router.patch("/:id/cancel", protect, async (req, res) => {
  try {
    const request = await MechanicRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: "Request not found" });

    if (request.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    if (request.status !== "pending" && request.status !== "approved") {
      return res.status(400).json({ msg: "Cannot cancel a request that is already assigned or in-progress." });
    }

    request.status = "cancelled";
    await request.save();

    await Notification.create({
      user: request.user,
      title: "Request Cancelled",
      message: `You have successfully cancelled your ${request.serviceType} request.`,
      type: "mechanic_cancelled"
    });

    res.json(request);
  } catch (err) {
    console.error("Cancel request error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
