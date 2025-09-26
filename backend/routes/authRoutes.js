const express = require("express");
const User = require("../models/user");

const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: "email, password and role are required" });
    }
    const normalizedEmail = String(email).toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }
    const user = await User.create({ email: normalizedEmail, password, role });
    return res.status(201).json({ success: true, message: "User registered successfully", userId: user._id });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const normalizedEmail = String(email || "").toLowerCase();
    const user = await User.findOne({ email: normalizedEmail, password });
    if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const payload = { success: true, role: user.role, userId: user._id };
    if (user.role === "mentor") {
      payload.mentorId = user._id; // frontend expects mentorId for mentors
    }
    res.json(payload);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
