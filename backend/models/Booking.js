const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending-owner-approval",
        "approved-awaiting-payment",
        "confirmed",
        "confirmed-awaiting-cash-payment",
        "active",
        "completed",
        "cancelled",
        "rejected"
      ],
      default: "pending-owner-approval",
    },
    cashPaymentConfirmedAt: {
      type: Date,
      default: null,
    },
    pickupLocation: {
      type: String,
      required: true,
    },
    dropoffLocation: {
      type: String,
    },
    pickupMethod: {
      type: String,
      enum: ["Self Pickup", "Home Delivery"],
      default: "Self Pickup"
    },
    returnMethod: {
      type: String,
      enum: ["Same Location", "Different Location"],
      default: "Same Location"
    },
    deliveryStatus: {
      type: String,
      enum: ["Not Applicable", "Scheduled", "Dispatched", "Delivered", "Return Scheduled", "Returned"],
      default: "Not Applicable",
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    rentalStatus: {
      type: String,
      enum: ["Pickup Scheduled", "Active", "Return Pending", "Completed", "Overdue", "Cancelled"],
      default: "Pickup Scheduled",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid", "failed", "refunded"],
      default: "unpaid",
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      default: function() { return this.totalPrice; }
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "eSewa"],
      default: "Cash",
    },
    transactionId: {
      type: String,
      default: "",
    },
    paidAt: {
      type: Date,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
