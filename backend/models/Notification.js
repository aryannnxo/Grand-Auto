const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "booking_approved", "booking_rejected", "payment_successful", 
        "booking_cancelled", "refund_processed", "info",
        "mechanic_approved", "mechanic_rejected", "mechanic_assigned", 
        "mechanic_in_progress", "mechanic_completed", "mechanic_cancelled"
      ],
      default: "info",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
