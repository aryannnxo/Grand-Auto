const express = require("express");
const router = express.Router();
const MechanicRequest = require("../models/MechanicRequest");
const Vehicle = require("../models/Vehicle");
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
    const { vehicle, booking, serviceType, description, location, requestedDate } = req.body;

    if (!serviceType || !description || !location || !requestedDate) {
      return res.status(400).json({ msg: "Please provide all required fields" });
    }

    const mechanicRequest = await MechanicRequest.create({
      user: req.user._id,
      vehicle: vehicle || undefined,
      booking: booking || undefined,
      serviceType,
      description,
      location,
      requestedDate,
    });

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
      .populate("user", "name email")
      .populate("vehicle", "name brand model images")
      .sort("-createdAt");
      
    res.json(requests);
  } catch (err) {
    console.error("Admin get requests error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ ADMIN: Assign mechanic to request
router.put("/admin/:id/assign", protect, admin, async (req, res) => {
  try {
    const { assignedMechanic } = req.body;
    
    const request = await MechanicRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }

    request.assignedMechanic = assignedMechanic;
    if (assignedMechanic && request.status === "pending") {
      request.status = "assigned";
    }
    
    await request.save();
    res.json(request);
  } catch (err) {
    console.error("Assign mechanic error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ ADMIN: Update request status
router.put("/admin/:id/status", protect, admin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const request = await MechanicRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }

    if (status) request.status = status;
    if (adminNotes !== undefined) request.adminNotes = adminNotes;
    
    await request.save();
    res.json(request);
  } catch (err) {
    console.error("Update request status error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ USER: Mark request as completed
router.put("/:id/complete", protect, async (req, res) => {
  try {
    const request = await MechanicRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }

    // Check if the request belongs to the user
    if (request.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    request.status = "completed";
    await request.save();
    
    res.json(request);
  } catch (err) {
    console.error("Complete request error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
