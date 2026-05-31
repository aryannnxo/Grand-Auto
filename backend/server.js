// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require("./routes/userRoutes");
const carRoutes = require('./routes/carRoutes');
const vehicleRoutes = require("./routes/vehicleRoutes");
const path = require("path");
const ownerApplicationRoutes = require("./routes/ownerApplicationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const mechanicRoutes = require("./routes/mechanicRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const chatRoutes = require("./routes/chatRoutes");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // for parsing JSON

// Test API route
app.get('/', (req, res) => {
  res.send('Car Rental API is running...');
});

// Car routes
app.use('/api/cars', carRoutes);

// Auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

app.use("/api/users", userRoutes);

const fs = require('fs');

// Ensure uploads directory exists
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'));
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/vehicles", vehicleRoutes);
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/owner-applications", ownerApplicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/mechanics", mechanicRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/chats", chatRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.message);
  res.status(err.status || 500).json({
    msg: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {}
  });
});

// Server listening port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
