const mongoose = require("mongoose");

const mechanicSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true },
    specialization: {
      type: String,
      enum: [
        "General Mechanic",
        "Engine Specialist",
        "Electrical / Battery",
        "Tyre & Wheel",
        "Brake Specialist",
        "Body & Damage",
        "AC & Cooling",
        "Roadside Assistance",
        "Multi-Specialist",
      ],
      default: "General Mechanic",
    },
    location: { type: String, default: "" },
    experienceYears: { type: Number, default: 0 },
    availabilityStatus: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "available",
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalJobs: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Mechanic", mechanicSchema);
