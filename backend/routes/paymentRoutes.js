const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/authMiddleware");

const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q"; 
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";

// Helper to generate signature
const generateEsewaSignature = (total_amount, transaction_uuid, product_code) => {
  const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
  const hmac = crypto.createHmac("sha256", ESEWA_SECRET_KEY);
  return hmac.update(message).digest("base64");
};

// @route   POST /api/payments/esewa/initiate
// @desc    Initiate eSewa payment and get signature
// @access  Private
router.post("/esewa/initiate", protect, async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ msg: "Booking ID is required" });
    }

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    // ✅ Approval guard: payment only allowed after owner approves
    if (booking.status !== "approved-awaiting-payment") {
      return res.status(400).json({
        msg: "This booking must be approved by the owner before payment can be processed.",
      });
    }

    if (booking.paymentStatus === "Paid") {
      return res.status(400).json({ msg: "Booking is already paid" });
    }

    // Generate UUID based on booking ID and timestamp to avoid uniqueness collision if retrying
    const transactionUuid = `${booking._id}-${Date.now()}`;
    const totalAmount = booking.totalPrice.toString(); // Ensure string for consistent signature

    const signature = generateEsewaSignature(totalAmount, transactionUuid, ESEWA_PRODUCT_CODE);

    // Update booking to pending payment and store the expected transaction UUID
    booking.paymentStatus = "pending";
    booking.paymentMethod = "eSewa";
    booking.transactionId = transactionUuid;
    await booking.save();

    res.json({
      amount: totalAmount,
      tax_amount: "0",
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: ESEWA_PRODUCT_CODE,
      product_delivery_charge: "0",
      product_service_charge: "0",
      signature: signature,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      success_url: "http://localhost:5000/api/payments/esewa/success",
      failure_url: "http://localhost:5000/api/payments/esewa/failure",
    });

  } catch (err) {
    console.error("eSewa initiation error:", err);
    res.status(500).json({ msg: "eSewa initiation error: " + err.message });
  }
});

// @route   GET /api/payments/esewa/success
// @desc    eSewa Success Callback
// @access  Public
router.get("/esewa/success", async (req, res) => {
  try {
    const { data } = req.query;
    if (!data) {
      return res.redirect("http://localhost:5173/payment/failure?error=no_data");
    }

    // eSewa sends base64 encoded data
    const decodedData = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
    
    // Validating signature from eSewa
    const { total_amount, transaction_uuid, product_code, transaction_code, signed_field_names, signature } = decodedData;

    const fieldsToSign = signed_field_names.split(",");
    const messageArray = fieldsToSign.map(field => `${field}=${decodedData[field] || ''}`);
    const message = messageArray.join(",");
    
    const hmac = crypto.createHmac("sha256", ESEWA_SECRET_KEY);
    const expectedSignature = hmac.update(message).digest("base64");

    if (expectedSignature !== signature) {
      console.error("eSewa signature verification failed");
      return res.redirect("http://localhost:5173/payment/failure?error=invalid_signature");
    }

    // Server-to-Server Verification (The "Legit" step)
    // IMPORTANT: Swap "rc-epay" with "epay" for production
    try {
      const verifyUrl = `https://rc-epay.esewa.com.np/api/epay/transaction/status/?product_code=${product_code}&total_amount=${total_amount}&transaction_uuid=${transaction_uuid}`;
      const verifyRes = await fetch(verifyUrl);
      const verifyData = await verifyRes.json();

      if (verifyData.status !== "COMPLETE") {
        console.error("eSewa transaction status NOT COMPLETE according to server verification:", verifyData);
        return res.redirect("http://localhost:5173/payment/failure?error=verification_failed");
      }
      console.log("eSewa transaction verified successfully via server-to-server API.");
    } catch (verifyErr) {
      console.warn("Verification API call failed (likely network or setup), proceeding with signature validation as fallback:", verifyErr.message);
    }

    // Extract booking ID
    const bookingId = transaction_uuid.split("-")[0];

    const booking = await Booking.findById(bookingId).populate("vehicle");
    if (!booking) {
      return res.redirect("http://localhost:5173/payment/failure?error=booking_not_found");
    }

    if (decodedData.status === "COMPLETE") {
      booking.paymentStatus = "paid";
      booking.status = "confirmed"; // Booking Approved
      booking.amountPaid = booking.totalPrice; 
      booking.remainingAmount = 0;
      booking.transactionId = transaction_code; 
      booking.paidAt = new Date();
      await booking.save();

      // Create notifications
      try {
        const vehicleName = booking.vehicle ? `${booking.vehicle.brand} ${booking.vehicle.model}` : "Vehicle";
        
        await Notification.create({
          user: booking.user,
          title: "Payment Successful",
          message: `Your payment of Rs. ${booking.totalPrice.toLocaleString()} for vehicle ${vehicleName} was successful.`,
          type: "payment_successful"
        });

        await Notification.create({
          user: booking.user,
          title: "Booking Approved",
          message: `Your booking request for vehicle ${vehicleName} has been approved and confirmed.`,
          type: "booking_approved"
        });
      } catch (notifErr) {
        console.error("Failed to create eSewa success notifications:", notifErr);
      }

      return res.redirect(`http://localhost:5173/payment/success?booking=${booking._id}&tx=${transaction_code}`);
    } else {
      booking.paymentStatus = "failed";
      await booking.save();
      return res.redirect("http://localhost:5173/payment/failure?error=payment_failed");
    }

  } catch (err) {
    console.error("eSewa success callback error:", err);
    return res.redirect("http://localhost:5173/payment/failure?error=server_error");
  }
});

// @route   GET /api/payments/esewa/failure
// @desc    eSewa Failure Callback
// @access  Public
router.get("/esewa/failure", async (req, res) => {
  // Can optionally log failure or extract transaction ID if returned
  return res.redirect("http://localhost:5173/payment/failure?error=user_cancelled");
});

// @route   POST /api/payments/esewa/mock-success
// @desc    Instantly mock a successful eSewa payment for local testing
// @access  Private
router.post("/esewa/mock-success", protect, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate("vehicle");
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    booking.paymentStatus = "paid";
    booking.status = "confirmed"; // Booking Approved
    booking.amountPaid = booking.totalPrice; 
    booking.remainingAmount = 0;
    booking.transactionId = `MOCK-ESEWA-${Date.now()}`;
    booking.paymentMethod = "eSewa";
    booking.paidAt = new Date();
    await booking.save();

    // Create notifications
    try {
      const vehicleName = booking.vehicle ? `${booking.vehicle.brand} ${booking.vehicle.model}` : "Vehicle";
      
      await Notification.create({
        user: booking.user,
        title: "Payment Successful",
        message: `Your payment of Rs. ${booking.totalPrice.toLocaleString()} for vehicle ${vehicleName} was successful.`,
        type: "payment_successful"
      });

      await Notification.create({
        user: booking.user,
        title: "Booking Approved",
        message: `Your booking request for vehicle ${vehicleName} has been approved and confirmed.`,
        type: "booking_approved"
      });
    } catch (notifErr) {
      console.error("Failed to create mock success notifications:", notifErr);
    }

    res.json({ successUrl: `/payment/success?booking=${booking._id}&tx=${booking.transactionId}` });
  } catch (err) {
    console.error("Mock success error:", err);
    res.status(500).json({ msg: "Mock success error" });
  }
});

module.exports = router;
