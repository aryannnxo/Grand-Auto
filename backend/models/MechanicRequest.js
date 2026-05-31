const mongoose = require("mongoose");

const mechanicRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    serviceType: {
      type: String,
      enum: ["Roadside Assistance", "Workshop Repair", "Vehicle Inspection", "Tire / Wheel Issue", "Battery Issue", "Engine Problem", "Brake Problem", "Accident / Damage Check", "General Maintenance", "Other", "Emergency Breakdown", "Inspection"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    city: {
      type: String,
    },
    landmark: {
      type: String,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    requestedDate: {
      type: Date,
      required: true,
    },
    preferredTime: {
      type: String,
    },
    isEmergency: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "emergency"],
      default: "medium",
    },
    images: [{
      type: String,
    }],
    contactName: {
      type: String,
    },
    contactEmail: {
      type: String,
    },
    contactPhone: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "assigned", "in-progress", "completed", "cancelled", "rejected"],
      default: "pending",
    },
    assignedMechanicName: {
      type: String,
    },
    assignedMechanicPhone: {
      type: String,
    },
    assignedMechanicEmail: {
      type: String,
    },
    // Backwards compatibility
    assignedMechanic: {
      type: String,
      default: "",
    },
    estimatedCost: {
      type: Number,
    },
    finalCost: {
      type: Number,
    },
    adminNotes: {
      type: String,
      default: "",
    },
    rejectionReason: {
      type: String,
    },
    completionNotes: {
      type: String,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MechanicRequest", mechanicRequestSchema);
