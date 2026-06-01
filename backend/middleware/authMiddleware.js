// // middleware/authMiddleware.js
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// const protect = async (req, res, next) => {
//   try {
//     const auth = req.headers.authorization;

//     if (!auth || !auth.startsWith("Bearer ")) {
//       return res.status(401).json({ msg: "Not authorized, no token" });
//     }

//     const token = auth.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     req.user = await User.findById(decoded.id).select("-password");
//     if (!req.user) return res.status(401).json({ msg: "User not found" });

//     next();
//   } catch (err) {
//     return res.status(401).json({ msg: "Not authorized, token failed" });
//   }
// };

// module.exports = { protect };




const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.user.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ msg: "User not found" });
    }

    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ msg: `Token failed: ${err.message}` });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ msg: "Not authorized as an admin" });
  }
};

const verifiedOwner = (req, res, next) => {
  if (req.user && (req.user.isVerifiedOwner || req.user.role === "admin")) {
    next();
  } else {
    res.status(403).json({ msg: "Not authorized. Must be a verified owner." });
  }
};

const mechanic = (req, res, next) => {
  if (req.user && (req.user.role === "mechanic" || req.user.role === "admin")) {
    next();
  } else {
    res.status(403).json({ msg: "Not authorized as a mechanic" });
  }
};

module.exports = { protect, admin, verifiedOwner, mechanic };
