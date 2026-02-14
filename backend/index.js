import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import verifyFirebaseToken from "./middleware/authMiddleware.js";
import { User, Note } from "./db.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ["https://notesweb-two.vercel.app"]
    : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.log("⚠️ Email configuration error:", error.message);
  } else {
    console.log("✅ Email server ready");
  }
});

// Helper function to send email
const sendNoteCreatedEmail = async (email, title) => {
  try {
    console.log("📧 Sending email to:", email);
    
    const info = await transporter.sendMail({
      from: `"Lead Notes App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "New Note Created 📝",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Note Created Successfully!</h2>
          <p>Your note titled <strong>"${title}"</strong> has been created.</p>
          <p style="color: #666;">Date: ${new Date().toLocaleString()}</p>
          <hr style="border: 1px solid #ddd;">
          <p style="font-size: 12px; color: #999;">This is an automated email from Lead Notes App</p>
        </div>
      `,
    });
    
    console.log("✅ Email sent successfully:", info.messageId);
  } catch (error) {
    console.log("⚠️ Email failed:", error.message);
  }
};

// Routes

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Lead Notes API is running!", status: "OK" });
});

// Create Note
app.post("/notes", verifyFirebaseToken, async (req, res) => {
  try {
    console.log("📝 POST /notes - Creating note");
    console.log("User:", req.user.email);
    console.log("Body:", req.body);

    const { title, description } = req.body;

    if (!title || !title.trim()) {
      console.log("❌ Title missing");
      return res.status(400).json({ error: "Title is required" });
    }

    const note = new Note({
      title: title.trim(),
      description: description?.trim() || "",
      user: req.user._id,
    });

    await note.save();
    console.log("✅ Note saved to DB:", note._id);

    // IMPORTANT: Return the created note with all fields FIRST
    const createdNote = {
      _id: note._id,
      title: note.title,
      description: note.description,
      user: note.user,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };

    console.log("✅ Sending response");
    res.status(201).json(createdNote);

    // Send email AFTER response (completely non-blocking)
    process.nextTick(() => {
      sendNoteCreatedEmail(req.user.email, title);
    });

  } catch (error) {
    console.error("❌ Error creating note:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get All Notes
app.get("/notes", verifyFirebaseToken, async (req, res) => {
  try {
    console.log("📋 GET /notes - Fetching notes for user:", req.user.email);
    
    const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    console.log(`✅ Found ${notes.length} notes`);
    res.status(200).json(notes);
  } catch (error) {
    console.error("❌ Error fetching notes:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update Note
app.put("/notes/:id", verifyFirebaseToken, async (req, res) => {
  try {
    console.log("✏️ PUT /notes/:id - Updating note:", req.params.id);
    
    const { id } = req.params;
    const { title, description } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { title, description, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!note) {
      console.log("❌ Note not found or unauthorized");
      return res.status(404).json({ error: "Note not found or unauthorized" });
    }

    console.log("✅ Note updated");
    res.status(200).json(note);
  } catch (error) {
    console.error("❌ Error updating note:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete Note
app.delete("/notes/:id", verifyFirebaseToken, async (req, res) => {
  try {
    console.log("🗑️ DELETE /notes/:id - Deleting note:", req.params.id);
    
    const { id } = req.params;

    const note = await Note.findOneAndDelete({ _id: id, user: req.user._id });

    if (!note) {
      console.log("❌ Note not found or unauthorized");
      return res.status(404).json({ error: "Note not found or unauthorized" });
    }

    console.log("✅ Note deleted");
    res.status(200).json({ message: "Note deleted successfully", note });
  } catch (error) {
    console.error("❌ Error deleting note:", error);
    res.status(500).json({ error: error.message });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});