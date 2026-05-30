const mongoose = require("mongoose");

const OwnerApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    idNumber: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, trim: true },
    ownershipProof: { type: String, required: true }, // File path
    idPhoto: { type: String, required: true }, // File path
    reason: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNotes: { type: String, default: "" },
    rejectionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OwnerApplication", OwnerApplicationSchema);
