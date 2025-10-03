require('dotenv').config(); // Load environment variables from .env file
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const multer = require("multer");
const { Readable } = require("stream");

const app = express();
const PORT = 5000;

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// Multer for memory storage for Supabase uploads
const upload = multer({ storage: multer.memoryStorage() });

/*************** USER ROUTES ***************/

// Signup
app.post("/api/signup", async (req, res) => {
  console.log("Received signup request:", req.body); // Added log
  try {
    const { name, email, role } = req.body; // Removed password and projectName
    const normalizedEmail = email.toLowerCase();

    const { data: existingUser, error: existingUserError } = await supabase
      .from("users")
      .select("*")
      .eq("email", normalizedEmail)
      .single();

    if (existingUserError && existingUserError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error("Supabase existing user check error:", existingUserError);
      return res.status(500).json({ success: false, message: `Internal server error: ${existingUserError.message}` });
    }

    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([{
        name,
        email: normalizedEmail,
        role,
        isVerified: false, // Added isVerified
        created_at: new Date().toISOString(), // Added created_at
        updated_at: new Date().toISOString() // Added updated_at
      }]);

    if (insertError) {
      console.error("Supabase signup error:", insertError);
      return res.status(500).json({ success: false, message: `Internal server error: ${insertError.message}` });
    }

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

/*************** REVIEW ROUTES ***************/

// Submit a review
app.post("/api/reviews", async (req, res) => {
  try {
    const { projectId, rating, comment, reviewerName = "Anonymous" } = req.body;

    if (!projectId || !rating) {
      return res.status(400).json({ success: false, message: "Project ID and rating are required" });
    }

    const { data: review, error: insertError } = await supabase
      .from("reviews")
      .insert([{
        projectId,
        rating,
        comment,
        reviewerName,
        createdAt: new Date().toISOString(),
      }])
      .select();

    if (insertError) {
      console.error("Supabase review insert error:", insertError);
      return res.status(500).json({ success: false, message: "Failed to submit review" });
    }

    // Update project's average rating and count
    const { data: existingReviews, error: fetchReviewsError } = await supabase
      .from("reviews")
      .select("rating")
      .eq("projectId", projectId);

    if (fetchReviewsError) {
      console.error("Supabase fetch existing reviews error:", fetchReviewsError);
      // Proceed without updating avg rating if fetching fails
    } else {
      const totalRating = existingReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalRating / existingReviews.length;
      const ratingsCount = existingReviews.length;

      const { error: updateProjectError } = await supabase
        .from("projects")
        .update({ avgRating, ratingsCount })
        .eq("id", projectId);

      if (updateProjectError) {
        console.error("Supabase project rating update error:", updateProjectError);
      }
    }

    res.status(201).json({ success: true, message: "Review submitted successfully", reviewId: review[0].id });
  } catch (err) {
    console.error("Submit review error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get reviews for a project
app.get("/api/reviews/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("projectId", projectId);

    if (error) {
      console.error("Supabase fetch reviews error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch reviews" });
    }
    res.json({ success: true, data: reviews });
  } catch (err) {
    console.error("Get reviews error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email } = req.body; // Removed password from destructuring
  const normalizedEmail = email.toLowerCase();

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", normalizedEmail)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Supabase login error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
    if (!user) return res.status(400).json({ success: false, message: "User not found" });
    // Removed password check: WARNING - This makes the login insecure.
    // It is highly recommended to use Supabase Authentication for secure user logins.

    res.json({ success: true, role: user.role, email: user.email, userId: user.id });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get mentors
app.get("/api/mentors", async (req, res) => {
  try {
    const { data: mentors, error } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("role", "mentor");

    if (error) {
      console.error("Supabase fetch mentors error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch mentors" });
    }
    res.json({ success: true, data: mentors });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch mentors" });
  }
});

// Get mentees
app.get("/api/mentees", async (req, res) => {
  try {
    const { data: mentees, error } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("role", "mentee");

    if (error) {
      console.error("Supabase fetch mentees error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch mentees" });
    }
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
    const { data: mentor, error: mentorError } = await supabase
      .from("users")
      .select("id")
      .eq("email", mentorEmail)
      .eq("role", "mentor")
      .single();

    const { data: mentee, error: menteeError } = await supabase
      .from("users")
      .select("id")
      .eq("email", menteeEmail)
      .eq("role", "mentee")
      .single();

    if (mentorError && mentorError.code !== 'PGRST116') {
      console.error("Supabase mentor check error:", mentorError);
      return res.status(500).json({ success: false, message: `Internal server error: ${mentorError.message}` });
    }
    if (menteeError && menteeError.code !== 'PGRST116') {
      console.error("Supabase mentee check error:", menteeError);
      return res.status(500).json({ success: false, message: `Internal server error: ${menteeError.message}` });
    }

    if (!mentor || !mentee) {
      return res.status(400).json({ success: false, message: "Invalid mentor or mentee email" });
    }

    const { data: project, error: insertError } = await supabase
      .from("projects")
      .insert([{
        projectName,
        mentorEmail,
        menteeEmail,
        createdAt: new Date().toISOString(),
      }])
      .select();

    if (insertError) {
      console.error("Supabase add project error:", insertError);
      return res.status(500).json({ success: false, message: `Server error while adding project: ${insertError.message}` });
    }

    res.json({ success: true, message: "Project added successfully", projectId: project[0].id });
  } catch (error) {
    console.error("Error adding project:", error);
    res.status(500).json({ success: false, message: `Server error while adding project: ${error.message}` });
  }
});

// Create a rich project document
app.post("/api/projects", async (req, res) => {
  try {
    const {
      title,
      domain,
      description = "",
      deadline, // ISO string or date
      teamMembers = [], // [{ name, role }]
      mentorName = "",
      mentorEmail = "",
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Project title is required" });
    }

    // Basic validation on teamMembers
    const normalizedTeam = Array.isArray(teamMembers)
      ? teamMembers
          .filter(tm => tm && (tm.name || tm.role))
          .map(tm => ({ name: tm.name || "", role: tm.role || "" }))
      : [];

    const now = new Date();
    const doc = {
      title,
      domain,
      description,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      teamMembers: normalizedTeam,
      mentorName,
      mentorEmail,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const { data: project, error: insertError } = await supabase
      .from("projects")
      .insert([doc])
      .select();

    if (insertError) {
      console.error("Supabase creating project error:", insertError);
      return res.status(500).json({ success: false, message: "Server error while creating project" });
    }
    return res.status(201).json({ success: true, message: "Project created", projectId: project[0].id });
  } catch (err) {
    console.error("Error creating project:", err?.message || err, err?.stack);
    return res.status(500).json({ success: false, message: "Server error while creating project" });
  }
});

// Get all projects
app.get("/api/projects", async (req, res) => {
  try {
    const { data: projects, error } = await supabase
      .from("projects")
      .select("*");

    if (error) {
      console.error("Supabase fetch projects error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch projects" });
    }
    res.json({ success: true, data: projects });
  } catch (err) {
    console.error("Error fetching projects:", err?.message || err, err?.stack);
    res.status(500).json({ success: false, message: "Failed to fetch projects" });
  }
});

// Get single project by id (compatibility with frontend details page)
app.get("/api/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data: proj, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Supabase fetch project by id error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch project" });
    }
    if (!proj) return res.status(404).json({ success: false, message: "Project not found" });
    return res.json({ success: true, data: proj });
  } catch (err) {
    console.error("Error fetching project by id:", err?.message || err, err?.stack);
    return res.status(500).json({ success: false, message: "Failed to fetch project" });
  }
});

// Explicit "/detail" endpoint
app.get("/api/projects/:id/detail", async (req, res) => {
  try {
    const { id } = req.params;
    const { data: proj, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Supabase fetch project detail error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch project" });
    }
    if (!proj) return res.status(404).json({ success: false, message: "Project not found" });
    return res.json({ success: true, data: proj });
  } catch (err) {
    console.error("Error fetching project detail:", err?.message || err, err?.stack);
    return res.status(500).json({ success: false, message: "Failed to fetch project" });
  }
});

// Get mentor's projects
app.get("/api/mentor-projects", async (req, res) => {
  const { mentorEmail } = req.query;
  if (!mentorEmail) {
    return res.status(400).json({ success: false, message: "Mentor email is required" });
  }

  try {
    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .eq("mentorEmail", mentorEmail);

    if (error) {
      console.error("Supabase fetch mentor's projects error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch mentor's projects" });
    }
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch mentor's projects" });
  }
});

// HOD view: Project details with mentor + mentee
app.get("/api/hod/project-details", async (req, res) => {
  try {
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("*");

    if (projectsError) {
      console.error("Supabase fetch HOD projects error:", projectsError);
      return res.status(500).json({ success: false, message: "Failed to fetch HOD project details" });
    }

    const detailed = await Promise.all(
      projects.map(async (proj) => {
        const { data: mentor, error: mentorError } = await supabase
          .from("users")
          .select("name, email")
          .eq("email", proj.mentorEmail)
          .single();

        const { data: mentee, error: menteeError } = await supabase
          .from("users")
          .select("name, email")
          .eq("email", proj.menteeEmail)
          .single();

        if (mentorError && mentorError.code !== 'PGRST116') console.error("Supabase HOD mentor fetch error:", mentorError);
        if (menteeError && menteeError.code !== 'PGRST116') console.error("Supabase HOD mentee fetch error:", menteeError);

        return {
          projectName: proj.projectName,
          mentor: mentor || null,
          mentee: mentee || null,
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
app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const { projectId, projectName } = req.body;
  const fileBuffer = req.file.buffer;
  const fileName = `${Date.now()}-${req.file.originalname}`;
  const bucketName = "uploads"; // Supabase bucket name

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: req.file.mimetype,
        upsert: false,
        metadata: { projectId, projectName },
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return res.status(500).json({ success: false, message: "File upload failed" });
    }

    // Store file metadata in a 'files' table in Supabase
    const { data: fileRecord, error: recordError } = await supabase
      .from("files")
      .insert([{
        name: fileName,
        path: data.path,
        projectId: projectId,
        projectName: projectName,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date().toISOString(),
      }])
      .select();

    if (recordError) {
      console.error("Supabase file record insert error:", recordError);
      // Optionally, delete the uploaded file from storage if metadata insertion fails
      await supabase.storage.from(bucketName).remove([data.path]);
      return res.status(500).json({ success: false, message: "Failed to record file metadata" });
    }

    res.json({
      success: true,
      message: "File uploaded successfully",
      fileId: fileRecord[0].id, // Use the ID from the 'files' table
      filePath: data.path,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, message: "Internal server error during upload" });
  }
});

// Get all uploaded files
app.get("/api/files", async (req, res) => {
  try {
    const { data: files, error } = await supabase
      .from("files")
      .select("*");

    if (error) {
      console.error("Supabase fetch all files error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch files" });
    }
    if (!files || files.length === 0) {
      return res.status(404).json({ success: false, message: "No files found" });
    }

    const formattedFiles = files.map(file => ({
      fileId: file.id,
      filename: file.name,
      metadata: {
        projectId: file.projectId,
        projectName: file.projectName,
        mimeType: file.mimeType,
        size: file.size,
        uploadedAt: file.uploadedAt,
      },
      filePath: file.path,
    }));

    res.json({ success: true, files: formattedFiles });
  } catch (err) {
    console.error("Error fetching all files:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Download file
app.get("/api/download/:fileId", async (req, res) => {
  const { fileId } = req.params;
  const bucketName = "uploads";

  try {
    const { data: fileRecord, error: recordError } = await supabase
      .from("files")
      .select("name, path, mimeType")
      .eq("id", fileId)
      .single();

    if (recordError && recordError.code !== 'PGRST116') {
      console.error("Supabase file record fetch error:", recordError);
      return res.status(500).json({ success: false, message: "Failed to retrieve file information" });
    }
    if (!fileRecord) {
      return res.status(404).json({ success: false, message: "File not found in database" });
    }

    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(fileRecord.path);

    if (error) {
      console.error("Supabase download error:", error);
      return res.status(500).json({ success: false, message: "File download failed" });
    }

    res.set("Content-Type", fileRecord.mimeType);
    res.set("Content-Disposition", `attachment; filename="${fileRecord.name}"`);
    // Convert ArrayBuffer to Buffer for piping
    const buffer = Buffer.from(data);
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    stream.pipe(res);

  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ success: false, message: "Internal server error during download" });
  }
});

// Get files by projectId
app.get("/api/project-files/:projectId", async (req, res) => {
  const { projectId } = req.params;

  try {
    const { data: files, error } = await supabase
      .from("files")
      .select("*")
      .eq("projectId", projectId);

    if (error) {
      console.error("Supabase fetch project files error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch project files" });
    }
    if (!files || files.length === 0) {
      return res.status(404).json({ success: false, message: "No files found for this project" });
    }

    const formatted = files.map(file => ({
      fileId: file.id,
      filename: file.name,
      metadata: {
        projectId: file.projectId,
        projectName: file.projectName,
        mimeType: file.mimeType,
        size: file.size,
        uploadedAt: file.uploadedAt,
      },
      filePath: file.path,
    }));

    res.json({ success: true, files: formatted });
  } catch (err) {
    console.error("Error fetching project files:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get files by projectName
app.get("/api/files/:projectName", async (req, res) => {
  const { projectName } = req.params;

  try {
    const { data: files, error } = await supabase
      .from("files")
      .select("*")
      .eq("projectName", projectName);

    if (error) {
      console.error("Supabase fetch files by projectName error:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch files by project name" });
    }
    if (!files || files.length === 0) {
      return res.status(404).json({ success: false, message: "No files found" });
    }

    res.status(200).json({ success: true, data: files.map(file => ({
      fileId: file.id,
      filename: file.name,
      metadata: {
        projectId: file.projectId,
        projectName: file.projectName,
        mimeType: file.mimeType,
        size: file.size,
        uploadedAt: file.uploadedAt,
      },
      filePath: file.path,
    })) });
  } catch (err) {
    console.error("Error fetching files by projectName:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
