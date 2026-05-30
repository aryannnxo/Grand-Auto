const mongoose = require("mongoose");

const PendingUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    // store hashed password (so we never store plain password)
    passwordHash: { type: String, required: true },

    // store OTP as hash
    otpHash: { type: String, required: true },

    // expiry time
    expiresAt: { type: Date, required: true },

    // optional: limit attempts
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// TTL index: auto delete expired docs (Mongo deletes in background)
PendingUserSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("PendingUser", PendingUserSchema);
