// // routes/userRoutes.js
// const express = require("express");
// const router = express.Router();
// const User = require("../models/User");
// const { protect } = require("../middleware/authMiddleware");

// // GET /api/users/me  -> current user profile
// router.get("/me", protect, async (req, res) => {
//   res.json(req.user);
// });

// // PUT /api/users/me  -> update profile (name for now)
// router.put("/me", protect, async (req, res) => {
//   try {
//     const { name } = req.body;

//     const user = await User.findById(req.user._id);
//     if (!user) return res.status(404).json({ msg: "User not found" });

//     if (name) user.name = name.trim();

//     const updated = await user.save();

//     res.json({
//       id: updated._id,
//       name: updated.name,
//       email: updated.email,
//     });
//   } catch (err) {
//     console.error("Update profile error:", err);
//     res.status(500).send("Server error");
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");


/**
 * POST /api/users/upload-profile
 */
router.post(
  "/upload-profile",
  protect,
  upload.single("image"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      user.profileImage = `/uploads/${req.file.filename}`;
      await user.save();

      res.json({ profileImage: user.profileImage });
    } catch (err) {
      res.status(500).send("Upload failed");
    }
  }
)

/**
 * GET /api/users/me
 */
router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

/**
 * PUT /api/users/me
 * Update name + bio
 */
router.put("/me", protect, async (req, res) => {
  const { name, bio } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ msg: "User not found" });

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();

    const updated = await user.save();

    res.json({
      name: updated.name,
      email: updated.email,
      bio: updated.bio,
      profileImage: updated.profileImage,
    });
  } catch (err) {
    console.error("Profile update error:", err.message);
    res.status(500).send("Server error");
  }
});

/**
 * PUT /api/users/change-password
 */
router.put("/change-password", protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ msg: "All fields required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ msg: "Password too short" });
    }

    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Current password incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    console.error("Password change error:", err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
