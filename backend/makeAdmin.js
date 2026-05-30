const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/car-rental").then(async () => {
  try {
    const users = await User.find();
    console.log("Current users in DB:");
    users.forEach(u => console.log(`- ${u.email} (Role: ${u.role})`));

    // Make all users admin for ease of use in local development
    await User.updateMany({}, { role: "admin" });
    console.log("\nSuccess: Elevated all existing users to Admin role for testing.");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
});
