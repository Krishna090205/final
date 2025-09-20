// models/Project.js
const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  role: { type: String, default: '' },
}, { _id: false });

const projectSchema = new mongoose.Schema({
  // New rich fields
  title: { type: String, required: true, trim: true },
  domain: { type: String, default: '' },
  description: { type: String, default: '' },
  deadline: { type: Date, default: null },
  teamMembers: { type: [teamMemberSchema], default: [] },
  mentorName: { type: String, default: '' },
  mentorEmail: { type: String, default: '' },
  avgRating: { type: Number, default: 0 },
  ratingsCount: { type: Number, default: 0 },

  // Legacy fields kept for backward compatibility with existing routes
  projectName: { type: String, default: '' },
  menteeEmail: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
