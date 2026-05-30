// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// // @route   POST api/auth/register
// // @desc    Register user
// // @access  Public
// router.post("/register", async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
//     let user = await User.findOne({ email });

//     if (user) {
//       return res.status(400).json({ msg: "User already exists" });
//     }

//     user = new User({
//       name,
//       email,
//       password,
//     });

//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(password, salt);

//     await user.save();

//     const payload = {
//       user: {
//         id: user.id,
//       },
//     };

//     jwt.sign(
//       payload,
//       process.env.JWT_SECRET,
//       { expiresIn: "5 days" },
//       (err, token) => {
//         if (err) throw err;
//         res.json({ token });
//       }
//     );
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server error");
//   }
// });

// // @route   POST api/auth/login
// // @desc    Authenticate user & get token
// // @access  Public
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     let user = await User.findOne({ email });

//     if (!user) {
//       return res.status(400).json({ msg: "Invalid Credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(400).json({ msg: "Invalid Credentials" });
//     }

//     const payload = {
//       user: {
//         id: user.id,
//       },
//     };

//     jwt.sign(
//       payload,
//       process.env.JWT_SECRET,
//       { expiresIn: "5 days" },
//       (err, token) => {
//         if (err) throw err;
//         res.json({ token });
//       }
//     );
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server error");
//   }
// });

// module.exports = router;





// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const PendingUser = require("../models/PendingUser");
const sendEmail = require("../utils/sendEmail");
const otpEmailTemplate = require("../utils/otpEmailTemplate");

// helper: 6-digit OTP
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

// ✅ STEP 1: Request OTP (NO account created here)
router.post("/register/request-otp", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters" });
    }

    // If real user already exists, block
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // hash password now (safe to store)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // create OTP + hash it
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, salt);

    // 10 min expiry
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // upsert pending record (resend OTP if exists)
    await PendingUser.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        otpHash,
        expiresAt,
        attempts: 0,
      },
      { upsert: true, new: true }
    );

    // send OTP via email
    await sendEmail({
      to: email,
      subject: "Verify your CarRental account",
      html: otpEmailTemplate(otp),
    });

    return res.json({ msg: "OTP sent to your email", email });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server error");
  }
});

// ✅ STEP 2: Verify OTP → Create account ONLY here
router.post("/register/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ msg: "Email and OTP are required" });
    }

    const pending = await PendingUser.findOne({ email: email.toLowerCase().trim() });
    if (!pending) {
      return res.status(400).json({ msg: "No OTP request found. Please sign up again." });
    }

    // expired?
    if (pending.expiresAt < new Date()) {
      await PendingUser.deleteOne({ _id: pending._id });
      return res.status(400).json({ msg: "OTP expired. Please request a new one." });
    }

    // optional: attempt limit
    if (pending.attempts >= 5) {
      await PendingUser.deleteOne({ _id: pending._id });
      return res.status(400).json({ msg: "Too many attempts. Please request a new OTP." });
    }

    const isMatch = await bcrypt.compare(String(otp), pending.otpHash);
    if (!isMatch) {
      pending.attempts += 1;
      await pending.save();
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    // create the real user now
    const user = new User({
      name: pending.name,
      email: pending.email,
      password: pending.passwordHash, // already hashed
    });

    await user.save();
    await PendingUser.deleteOne({ _id: pending._id });

    // sign token
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" }, (err, token) => {
      if (err) throw err;
      return res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerifiedOwner: user.isVerifiedOwner }
      });
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server error");
  }
});

// ✅ LOGIN ROUTE (your frontend calls: POST /api/auth/login)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" }, (err, token) => {
      if (err) throw err;
      return res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerifiedOwner: user.isVerifiedOwner }
      });
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server error");
  }
});

module.exports = router;

