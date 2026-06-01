// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model("User", UserSchema);



const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String, // store filename or URL
      default: "",
    },
    resetPasswordToken: { type: String, default: "" },
    resetPasswordExpire: { type: Date },
    role: {
      type: String,
      enum: ["user", "owner", "admin", "mechanic"],
      default: "user",
    },
    ownerApplicationStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    isVerifiedOwner: {
      type: Boolean,
      default: false,
    },
    ownerVerificationSubmittedAt: { type: Date },
    ownerVerificationApprovedAt: { type: Date },
    ownerVerificationRejectedAt: { type: Date },
    ownerRejectionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
