// models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectName: String,
  mentorEmail: String,
  menteeEmail: String,
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
