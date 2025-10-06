import express from "express";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

router.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const { error } = await supabase
      .from("contacts")
      .insert([{ name, email, message, created_at: new Date().toISOString() }]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ success: false, message: "Failed to submit contact form" });
    }

    res.json({ success: true, message: "Message successfully received!" });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
