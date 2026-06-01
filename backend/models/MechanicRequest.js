const mongoose = require("mongoose");

const mechanicRequestSchema = new mongoose.Schema(
  {
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    requestSource: { type: String, enum: ["customer", "seller"], required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
    issueType: {
      type: String,
      enum: [
        "Accident / Damage",
        "Engine Issue",
        "Flat Tyre",
        "Battery Problem",
        "Brake Problem",
        "Roadside Assistance",
        "General Service",
        "Other",
      ],
      required: true,
    },
    problemDescription: { type: String, required: true },
    location: { type: String, required: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    images: [{ type: String }],
    contactPhone: { type: String, default: "" },
    isEmergency: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "emergency"],
      default: "medium",
    },
    status: {
      type: String,
      enum: [
        "pending-admin-review",
        "approved",
        "assigned",
        "accepted-by-mechanic",
        "in-progress",
        "fixed",
        "completed",
        "rejected",
        "cancelled",
      ],
      default: "pending-admin-review",
    },
    assignedMechanic: { type: mongoose.Schema.Types.ObjectId, ref: "Mechanic", default: null },
    mechanicName: { type: String, default: "" },
    mechanicPhone: { type: String, default: "" },
    estimatedCost: { type: Number, default: null },
    finalCost: { type: Number, default: null },
    adminNotes: { type: String, default: "" },
    mechanicNotes: { type: String, default: "" },
    ownerVerificationNotes: { type: String, default: "" },
    rejectionReason: { type: String, default: "" },
    afterRepairImages: [{ type: String }],
    fixedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MechanicRequest", mechanicRequestSchema);
