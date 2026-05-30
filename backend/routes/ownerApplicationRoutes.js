const express = require("express");
const router = express.Router();
const OwnerApplication = require("../models/OwnerApplication");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// POST /api/owner-applications/apply
// Using an array of fields since there are multiple files
router.post(
  "/apply",
  protect,
  upload.fields([
    { name: "ownershipProof", maxCount: 1 },
    { name: "idPhoto", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const user = req.user;

      if (user.ownerApplicationStatus === "pending") {
        return res.status(400).json({ msg: "You already have a pending application" });
      }
      if (user.role === "owner" || user.isVerifiedOwner) {
        return res.status(400).json({ msg: "You are already a verified owner" });
      }

      const {
        fullName,
        email,
        phone,
        address,
        idNumber,
        licenseNumber,
        reason,
      } = req.body;

      // Validate files
      if (!req.files || !req.files.ownershipProof || !req.files.idPhoto) {
        return res.status(400).json({ msg: "Both Ownership Proof and ID Photo are required" });
      }

      const ownershipProofPath = `/uploads/${req.files.ownershipProof[0].filename}`;
      const idPhotoPath = `/uploads/${req.files.idPhoto[0].filename}`;

      const application = new OwnerApplication({
        user: user._id,
        fullName,
        email,
        phone,
        address,
        idNumber,
        licenseNumber,
        ownershipProof: ownershipProofPath,
        idPhoto: idPhotoPath,
        reason: reason || "",
      });

      await application.save();

      user.ownerApplicationStatus = "pending";
      user.ownerVerificationSubmittedAt = new Date();
      await user.save();

      res.status(201).json({ msg: "Application submitted successfully", application });
    } catch (err) {
      console.error("Apply error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// GET /api/owner-applications/me
router.get("/me", protect, async (req, res) => {
  try {
    const application = await OwnerApplication.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    // if no app, return null or a specific status
    res.json(application || { status: "none", reason: req.user.ownerRejectionReason });
  } catch (err) {
    console.error("Get my application error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
