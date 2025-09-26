const express = require("express");
const User = require("../models/user");
const Project = require("../models/project");

const router = express.Router();

// Get all mentors
router.get("/mentors", async (req, res) => {
  try {
    const mentors = await User.find({ role: "mentor" }).select("-password");
    res.json({ success: true, data: mentors });
  } catch (error) {
    console.error("Error fetching mentors:", error);
    res.status(500).json({ success: false, message: "Failed to fetch mentors" });
  }
});

// Get all mentees
router.get("/mentees", async (req, res) => {
  try {
    const mentees = await User.find({ role: "mentee" }).select("-password");
    res.json({ success: true, data: mentees });
  } catch (error) {
    console.error("Error fetching mentees:", error);
    res.status(500).json({ success: false, message: "Failed to fetch mentees" });
  }
});

// Get project details for HOD
router.get("/project-details", async (req, res) => {
  try {
    const projects = await Project.find()
      .populate({
        path: 'menteeEmail',
        select: 'email',
        model: 'User'
      })
      .populate({
        path: 'mentorEmail',
        select: 'email',
        model: 'User'
      });

    res.json({ success: true, data: projects });
  } catch (error) {
    console.error("Error fetching project details:", error);
    res.status(500).json({ success: false, message: "Failed to fetch project details" });
  }
});

module.exports = router;
