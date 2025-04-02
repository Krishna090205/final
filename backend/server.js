const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const { MongoClient, ObjectId, GridFSBucket } = require("mongodb");
const path = require("path");
const { GridFsStorage } = require("multer-gridfs-storage");
const crypto = require("crypto");

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);
let db, bucket;

client
  .connect()
  .then(() => {
    db = client.db("project_management");
    bucket = new GridFSBucket(db, { bucketName: "uploads" });
    console.log("Connected to MongoDB with GridFS");
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));

/** ************ GridFS File Upload Setup ************ */
const storage = new GridFsStorage({
  url: uri + "/project_management",
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err);
        const filename = buf.toString("hex") + path.extname(file.originalname);
        resolve({ filename, bucketName: "uploads", metadata: { projectId: req.body.projectId } });
      });
    });
  },
});

const upload = multer({ storage });

/** ************ File Upload API ************ */
app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "File upload failed" });
  }
  res.json({ success: true, message: "File uploaded successfully", fileId: req.file.id });
});

/** ************ Fetch & Download Files ************ */
app.get("/api/files", async (req, res) => {
  try {
    const files = await db.collection("uploads.files").find({}).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ error: "No files found" });
    }

    const formattedFiles = files.map(file => ({
      fileId: file._id,
      filename: file.filename,
      metadata: file.metadata || {}
    }));

    res.json({ success: true, files: formattedFiles });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

app.get("/api/download/:fileId", async (req, res) => {
  const { fileId } = req.params;
  try {
    const file = await db.collection("uploads.files").findOne({ _id: new ObjectId(fileId) });
    if (!file) return res.status(404).json({ success: false, message: "File not found" });

    res.set("Content-Disposition", `attachment; filename=${file.filename}`);
    res.set("Content-Type", file.contentType);

    const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));
    downloadStream.pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, message: "Download failed" });
  }
});

/** ************ Signup API ************ */
app.post("/api/signup", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const newUser = { name, email, password, role };
    const result = await db.collection("users").insertOne(newUser);
    res.json({ success: true, message: "Signup successful", userId: result.insertedId });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/** ************ Login API ************ */
app.post("/api/login", async (req, res) => {
    console.log("Login API hit");
    const { email, password } = req.body;
  
    try {
      const user = await db.collection("users").findOne({ email: email.toLowerCase() });
  
      if (!user) {
        return res.status(400).json({ success: false, message: "User not found" });
      }
  
      if (user.password !== password) {
        return res.status(400).json({ success: false, message: "Invalid password" });
      }
  
      res.json({ success: true, role: user.role, userId: user._id });
  
    } catch (err) {
      console.error("Login Error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });
  

/** ************ Get Mentors API ************ */
app.get("/api/mentors", async (req, res) => {
  try {
    const mentors = await db.collection("users").find({ role: "mentor" }).toArray();
    res.json({ success: true, data: mentors });
  } catch (error) {
    console.error("Error fetching mentors:", error);
    res.status(500).json({ error: "Failed to fetch mentors" });
  }
});

/** ************ Get Mentees API ************ */
app.get("/api/mentees", async (req, res) => {
  try {
    const mentees = await db.collection("users").find({ role: "mentee" }).toArray();
    res.json({ success: true, data: mentees });
  } catch (error) {
    console.error("Error fetching mentees:", error);
    res.status(500).json({ error: "Failed to fetch mentees" });
  }
});

/** ************ Get Projects API ************ */
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await db.collection("projects").find({}).toArray();
    res.json({ success: true, data: projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

/** ************ Assign Mentor API ************ */
app.post("/api/assign-mentor", async (req, res) => {
  const { mentorEmail, menteeEmail } = req.body;

  if (!mentorEmail || !menteeEmail) {
    return res.status(400).json({ success: false, message: "Mentor and Mentee are required" });
  }

  try {
    const mentor = await db.collection("users").findOne({ email: mentorEmail, role: "mentor" });
    const mentee = await db.collection("users").findOne({ email: menteeEmail, role: "mentee" });

    if (!mentor || !mentee) {
      return res.status(400).json({ success: false, message: "Invalid mentor or mentee email" });
    }

    await db.collection("assignments").insertOne({ mentorEmail, menteeEmail });
    res.json({ success: true, message: "Mentor assigned successfully" });
  } catch (error) {
    console.error("Error assigning mentor:", error);
    res.status(500).json({ error: "Failed to assign mentor" });
  }
});

/** ************ Start Server ************ */
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
