const express = require('express');
const Project = require('../models/project');
const User = require('../models/user');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all projects for a mentor
router.get('/mentor/:mentorId/projects', auth, async (req, res) => {
  try {
    // Verify the requesting user is the mentor or an admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.mentorId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access these projects' 
      });
    }

    const projects = await Project.find({ mentorId: req.params.mentorId })
      .populate('createdBy', 'email name')
      .populate('mentorId', 'email name')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      data: projects 
    });
  } catch (error) {
    console.error('Error fetching mentor projects:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch projects',
      error: error.message 
    });
  }
});

// Get a single project with all details
router.get('/projects/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('createdBy', 'email name')
      .populate('mentorId', 'email name');

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    // Verify the requesting user has access to this project
    if (req.user.role !== 'admin' && 
        project.mentorId.toString() !== req.user._id.toString() &&
        project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this project' 
      });
    }

    res.json({ 
      success: true, 
      data: project 
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch project',
      error: error.message 
    });
  }
});

module.exports = router;
