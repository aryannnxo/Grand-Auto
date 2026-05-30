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
      enum: ["Roadside Assistance", "Workshop Repair", "Emergency Breakdown", "Inspection"],
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
    requestedDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "assigned", "in-progress", "completed", "cancelled", "rejected"],
      default: "pending",
    },
    assignedMechanic: {
      type: String,
      default: "",
    },
    adminNotes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MechanicRequest", mechanicRequestSchema);
