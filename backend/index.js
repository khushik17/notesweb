import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import verifyFirebaseToken from "./middleware/authMiddleware.js";
import { User, Note } from "./db.js";

const app = express();

/* -------------------- MIDDLEWARE -------------------- */

app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* -------------------- NODEMAILER (BREVO SMTP) -------------------- */

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

// Verify SMTP connection
transporter.verify((error) => {
  if (error) {
    console.log("❌ Email configuration error:", error.message);
  } else {
    console.log("✅ Email server ready (Brevo SMTP connected)");
  }
});

/* -------------------- EMAIL FUNCTION -------------------- */

const sendNoteCreatedEmail = async (
  email,
  title,
  description,
  createdAt
) => {
  try {
    await transporter.sendMail({
      from: `"📝 Notes App" <${process.env.BREVO_USER}>`,
      to: email,
      subject: `Note Created: ${title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; padding:20px;">
          <h2>📝 Note Created Successfully!</h2>
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Description:</strong> ${
            description || "No description added"
          }</p>
          <p><strong>Date:</strong> ${new Date(createdAt).toLocaleString(
            "en-IN"
          )}</p>
          <br/>
          <a href="https://notesweb-two.vercel.app/" 
             style="padding:10px 20px;background:#ec4899;color:white;text-decoration:none;border-radius:5px;">
             View All Notes
          </a>
          <br/><br/>
          <small>This is an automated email.</small>
        </body>
        </html>
      `,
    });

    console.log("✅ Email sent successfully");
  } catch (error) {
    console.log("❌ Email failed:", error.message);
  }
};

/* -------------------- ROUTES -------------------- */

// Health Check
app.get("/", (req, res) => {
  res.json({ message: "Lead Notes API is running!", status: "OK" });
});

// Create Note
app.post("/notes", verifyFirebaseToken, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const note = new Note({
      title: title.trim(),
      description: description?.trim() || "",
      user: req.user._id,
    });

    await note.save();

    // Send email (non-blocking)
    sendNoteCreatedEmail(
      req.user.email,
      note.title,
      note.description,
      note.createdAt
    );

    res.status(201).json(note);
  } catch (error) {
    console.error("❌ Error creating note:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get Notes
app.get("/notes", verifyFirebaseToken, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Note
app.put("/notes/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { title, description, updatedAt: Date.now() },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Note
app.delete("/notes/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* -------------------- START SERVER -------------------- */

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
