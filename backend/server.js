const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const { MongoClient, ObjectId, GridFSBucket } = require("mongodb");
const { GridFsStorage } = require("multer-gridfs-storage");

const app = express();
const PORT = 5000;
const mongoURI = "mongodb+srv://durgeshpadwal729:sXJlfq3tzkf6cboD@cluster0.xsaskto.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0z";

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Setup
const client = new MongoClient(mongoURI);
let db, bucket, usersCollection, projectsCollection;

// Connect to MongoDB and Start Server
async function connectDB() {
  try {
    await client.connect();
    db = client.db("project_management");
    bucket = new GridFSBucket(db, { bucketName: "uploads" });
    usersCollection = db.collection("users");
    projectsCollection = db.collection("projects");
    console.log("✅ Connected to MongoDB with GridFS");

    // Start the server only after DB is ready
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}
connectDB();

// GridFS Storage
const storage = new GridFsStorage({
  url: mongoURI + "/project_management",
  file: (req, file) =>
    new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err);
        const filename = buf.toString("hex") + path.extname(file.originalname);
        resolve({
          filename,
          bucketName: "uploads",
          metadata: {
            projectId: req.body.projectId,
            projectName: req.body.projectName || "",
          },
        });
      });
    }),
});
const upload = multer({ storage });

/*************** USER ROUTES ***************/

// Signup
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password, role, projectName } = req.body;
    const normalizedEmail = email.toLowerCase();
    const existingUser = await usersCollection.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const newUser = { name, email: normalizedEmail, password, role, projectName };
    await usersCollection.insertOne(newUser);

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  try {
    const user = await usersCollection.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ success: false, message: "User not found" });
    if (user.password !== password) return res.status(400).json({ success: false, message: "Invalid password" });

    res.json({ success: true, role: user.role, email: user.email, userId: user._id });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get mentors
app.get("/api/mentors", async (req, res) => {
  try {
    const mentors = await usersCollection.find({ role: "mentor" }).toArray();
    res.json({ success: true, data: mentors });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch mentors" });
  }
});

// Get mentees
app.get("/api/mentees", async (req, res) => {
  try {
    const mentees = await usersCollection.find({ role: "mentee" }).project({ name: 1, email: 1 }).toArray();
    res.json({ success: true, data: mentees });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch mentees" });
  }
});

/*************** PROJECT ROUTES ***************/

// Add project and assign mentor + mentee
app.post("/api/add-project", async (req, res) => {
  const { projectName, mentorEmail, menteeEmail } = req.body;

  if (!projectName || !mentorEmail || !menteeEmail) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const mentor = await usersCollection.findOne({ email: mentorEmail, role: "mentor" });
    const mentee = await usersCollection.findOne({ email: menteeEmail, role: "mentee" });

    if (!mentor || !mentee) {
      return res.status(400).json({ success: false, message: "Invalid mentor or mentee email" });
    }

    const result = await projectsCollection.insertOne({
      projectName,
      mentorEmail,
      menteeEmail,
      createdAt: new Date(),
    });

    res.json({ success: true, message: "Project added successfully", projectId: result.insertedId });
  } catch (error) {
    console.error("Error adding project:", error);
    res.status(500).json({ success: false, message: "Server error while adding project" });
  }
});

// Get all projects
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await projectsCollection.find({}).toArray();
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch projects" });
  }
});

// Get mentor's projects
app.get("/api/mentor-projects", async (req, res) => {
  const { mentorEmail } = req.query;
  if (!mentorEmail) {
    return res.status(400).json({ success: false, message: "Mentor email is required" });
  }

  try {
    const projects = await projectsCollection.find({ mentorEmail }).toArray();
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch mentor's projects" });
  }
});

// HOD view: Project details with mentor + mentee
app.get("/api/hod/project-details", async (req, res) => {
  try {
    const projects = await projectsCollection.find({}).toArray();
    const detailed = await Promise.all(
      projects.map(async (proj) => {
        const mentor = await usersCollection.findOne({ email: proj.mentorEmail });
        const mentee = await usersCollection.findOne({ email: proj.menteeEmail });
        return {
          projectName: proj.projectName,
          mentor: mentor ? { name: mentor.name, email: mentor.email } : null,
          mentee: mentee ? { name: mentee.name, email: mentee.email } : null,
          createdAt: proj.createdAt,
        };
      })
    );
    res.json({ success: true, data: detailed });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch HOD project details" });
  }
});

/*************** FILE ROUTES ***************/

// Upload file
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "File upload failed" });
  }
  res.json({
    success: true,
    message: "File uploaded successfully",
    fileId: req.file.id,
  });
});

// Get all uploaded files
app.get("/api/files", async (req, res) => {
  try {
    const files = await db.collection("uploads.files").find({}).toArray();
    if (!files.length) return res.status(404).json({ success: false, message: "No files found" });

    const formattedFiles = files.map(file => ({
      fileId: file._id,
      filename: file.filename,
      metadata: file.metadata || {},
    }));

    res.json({ success: true, files: formattedFiles });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch files" });
  }
});

// Download file
app.get("/api/download/:fileId", async (req, res) => {
  const { fileId } = req.params;

  try {
    const file = await db.collection("uploads.files").findOne({ _id: new ObjectId(fileId) });
    if (!file) return res.status(404).json({ success: false, message: "File not found" });

    res.set("Content-Disposition", `attachment; filename="${file.filename}"`);
    bucket.openDownloadStream(new ObjectId(fileId)).pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, message: "Download failed" });
  }
});

// Get files by projectId
app.get("/api/project-files/:projectId", async (req, res) => {
  const { projectId } = req.params;

  try {
    const files = await db.collection("uploads.files")
      .find({ "metadata.projectId": projectId })
      .toArray();

    if (!files.length) {
      return res.status(404).json({ success: false, message: "No files found for this project" });
    }

    const formatted = files.map(file => ({
      fileId: file._id,
      filename: file.filename,
      metadata: file.metadata,
    }));

    res.json({ success: true, files: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch project files" });
  }
});

// Get files by projectName
app.get("/api/files/:projectName", async (req, res) => {
  const { projectName } = req.params;

  try {
    const files = await db.collection("uploads.files")
      .find({ "metadata.projectName": projectName })
      .toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ success: false, message: "No files found" });
    }

    res.status(200).json({ success: true, data: files });
  } catch (err) {
    console.error("Error fetching files by projectName:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
