const express = require("express");
const Project = require("../models/project");
const Review = require("../models/review");
const Contact = require("../models/contact");

const router = express.Router();

// Add Project
router.post("/add-project", async (req, res) => {
  const { projectName, menteeEmail } = req.body;

  try {
    const newProject = new Project({ projectName, menteeEmail });
    await newProject.save();
    res.json({ success: true, message: "Project added successfully", project: newProject });
  } catch (err) {
    res.status(500).json({ message: "Failed to add project" });
  }
});

// Create a rich project (title/domain/description/deadline/teamMembers/mentor)
router.post("/projects", async (req, res) => {
  try {
    const {
      title,
      domain,
      description = "",
      deadline, // string date
      teamMembers = [],
      mentorName = "",
      mentorEmail = "",
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Project title is required" });
    }

    const normalizedTeam = Array.isArray(teamMembers)
      ? teamMembers
          .filter((tm) => tm && (tm.name || tm.role))
          .map((tm) => ({ name: tm.name || "", role: tm.role || "" }))
      : [];

    const doc = new Project({
      title,
      domain,
      description,
      deadline: deadline ? new Date(deadline) : null,
      teamMembers: normalizedTeam,
      mentorName,
      mentorEmail,
    });

    await doc.save();
    return res.status(201).json({ success: true, message: "Project created", projectId: doc._id });
  } catch (err) {
    console.error("Create project error:", err);
    return res.status(500).json({ success: false, message: "Server error while creating project" });
  }
});

// Fetch Projects for a Mentee (legacy route kept for compatibility but names corrected)
router.get("/projects/by-mentee/:menteeEmail", async (req, res) => {
  try {
    const projects = await Project.find({ menteeEmail: req.params.menteeEmail });
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all projects (rich projects list for Projects page)
router.get("/projects", async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search && String(search).trim()) {
      const term = String(search).trim();
      query = {
        $or: [
          { title: { $regex: term, $options: "i" } },
          { domain: { $regex: term, $options: "i" } },
        ],
      };
    }
    const projects = await Project.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch projects" });
  }
});

// Get project by id (details)
router.get("/projects/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch project" });
  }
});

// Get project details by id
router.get("/projects/:id/detail", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch project" });
  }
});

// List reviews for a project
router.get("/projects/:id/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({ projectId: req.params.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
});

// Create a review and update project's average rating
router.post("/projects/:id/reviews", async (req, res) => {
  try {
    const { reviewerId = null, rating, comment = "" } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    const review = await Review.create({ projectId: project._id, reviewerId, rating, comment });

    // Update rolling average
    const total = project.avgRating * project.ratingsCount + rating;
    const count = project.ratingsCount + 1;
    project.avgRating = Number((total / count).toFixed(2));
    project.ratingsCount = count;
    await project.save();

    res.status(201).json({ success: true, data: review, avgRating: project.avgRating, ratingsCount: project.ratingsCount });
  } catch (err) {
    console.error("Create review error:", err);
    res.status(500).json({ success: false, message: "Failed to create review" });
  }
});

// Standardized reviews endpoints per spec
router.get("/reviews", async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ success: false, message: "projectId is required" });
    const reviews = await Review.find({ projectId }).sort({ createdAt: -1 });
    return res.json({ success: true, data: reviews });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
});

router.post("/reviews", async (req, res) => {
  try {
    const { projectId, reviewerId = null, rating, comment = "" } = req.body;
    if (!projectId) return res.status(400).json({ success: false, message: "projectId is required" });
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    const review = await Review.create({ projectId, reviewerId, rating, comment });

    // Update rolling average
    const total = project.avgRating * project.ratingsCount + rating;
    const count = project.ratingsCount + 1;
    project.avgRating = Number((total / count).toFixed(2));
    project.ratingsCount = count;
    await project.save();

    return res.status(201).json({ success: true, data: review, avgRating: project.avgRating, ratingsCount: project.ratingsCount });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to create review" });
  }
});

// Contacts endpoint per spec
router.post("/contacts", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "name, email and message are required" });
    }
    const doc = await Contact.create({ name, email, message });
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to store contact" });
  }
});

module.exports = router;

