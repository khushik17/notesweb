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
// Middleware
app.use(express.json());

// CORS - Allow all origins in development
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
// Helper function to send email with beautiful template

// Helper function to send email with PINK SOFT BRUTALISM template (final)
const sendNoteCreatedEmail = async (email, title, description, createdAt, userName) => {
  try {
    console.log("📧 Sending email to:", email);
    
    const info = await transporter.sendMail({
      from: `"📝 Notes App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Note Created: ${title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
              background-color: #fce7f3;
              padding: 40px 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #fff5f9;
              border: 4px solid #000000;
              border-radius: 16px;
              box-shadow: 8px 8px 0 #000000;
            }
            .header {
              background: #ec4899;
              padding: 48px 40px;
              border-bottom: 4px solid #000000;
              border-radius: 12px 12px 0 0;
            }
            .header-title {
              font-size: 18px;
              font-weight: 700;
              color: #000000;
              margin-bottom: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .header-main {
              font-size: 42px;
              font-weight: 900;
              color: #000000;
              margin-bottom: 8px;
              line-height: 1.1;
            }
            .header-subtitle {
              font-size: 16px;
              color: #000000;
              opacity: 0.8;
            }
            .content {
              padding: 40px;
            }
            .greeting {
              font-size: 20px;
              font-weight: 700;
              color: #000000;
              margin-bottom: 16px;
            }
            .message {
              font-size: 16px;
              line-height: 1.6;
              color: #1f2937;
              margin-bottom: 32px;
            }
            .note-card {
              background: #ffffff;
              border: 3px solid #000000;
              border-radius: 12px;
              padding: 32px;
              margin: 32px 0;
              box-shadow: 4px 4px 0 #ec4899;
            }
            .note-label {
              font-size: 12px;
              font-weight: 700;
              color: #ec4899;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              margin-bottom: 12px;
            }
            .note-title {
              font-size: 28px;
              font-weight: 900;
              color: #ec4899;
              margin-bottom: 20px;
              line-height: 1.3;
            }
            .note-divider {
              height: 2px;
              background: #000000;
              margin: 24px 0;
            }
            .note-description {
              font-size: 16px;
              color: #374151;
              line-height: 1.7;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            .note-empty {
              font-size: 16px;
              color: #9ca3af;
              font-style: italic;
            }
            .timestamp-box {
              background: #fff;
              border: 3px solid #000000;
              border-radius: 99px;
              padding: 12px 28px;
              display: inline-block;
              margin: 24px 0;
            }
            .timestamp-text {
              font-size: 14px;
              color: #000000;
              font-weight: 700;
              line-height: 1.4;
            }
            .button-container {
              text-align: center;
              margin: 40px 0 32px;
            }
            .cta-button {
              display: inline-block;
              padding: 18px 52px;
              background: #fbcfe8;
              color: #1e40af;
              text-decoration: none;
              font-weight: 900;
              font-size: 16px;
              text-transform: uppercase;
              letter-spacing: 1px;
              border: 3px solid #000000;
              border-radius: 99px;
              box-shadow: 4px 4px 0 #000000;
              transition: all 0.15s;
            }
            .cta-button:hover {
              transform: translate(2px, 2px);
              box-shadow: 2px 2px 0 #000000;
            }
            .footer-message {
              text-align: center;
              font-size: 16px;
              color: #6b7280;
              margin-top: 32px;
              padding: 24px;
              border-top: 2px solid #000000;
            }
            .footer {
              background: #fce7f3;
              padding: 32px 40px;
              border-top: 4px solid #000000;
              border-radius: 0 0 12px 12px;
              text-align: center;
            }
            .footer-brand {
              font-size: 20px;
              font-weight: 900;
              color: #000000;
              margin-bottom: 6px;
            }
            .footer-tagline {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 20px;
            }
            .footer-legal {
              font-size: 11px;
              color: #9ca3af;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .success-badge {
              display: inline-block;
              background: #000000;
              color: #ec4899;
              padding: 6px 16px;
              font-size: 12px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              border-radius: 99px;
              margin-bottom: 16px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="success-badge">✓ Saved</div>
              <div class="header-title">Your</div>
              <div class="header-main">Notes App</div>
              <div class="header-subtitle">Capture your ideas beautifully ✨</div>
            </div>
            
            <!-- Content -->
            <div class="content">
              <div class="greeting">Hey Thinker!</div>
              <div class="message">
                Your note has been successfully saved. Here's what you created:
              </div>
              
              <!-- Note Card -->
              <div class="note-card">
                <div class="note-label">Title</div>
                <div class="note-title">${title}</div>
                
                ${description ? `
                  <div class="note-divider"></div>
                  <div class="note-label">Description</div>
                  <div class="note-description">${description}</div>
                ` : `
                  <div class="note-divider"></div>
                  <div class="note-empty">No description added</div>
                `}
              </div>
              
              <!-- Timestamp (Clean Format) -->
              <div style="text-align: center;">
                <div class="timestamp-box">
                  <div class="timestamp-text">
                    📅 ${new Date(createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })} • ⏰ ${new Date(createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </div>
                </div>
              </div>
              
              <!-- CTA Button -->
              <div class="button-container">
                <a href="http://localhost:5173/notes" class="cta-button">
                  View All Notes
                </a>
              </div>
              
              <div class="footer-message">
                Keep capturing your brilliant ideas! ✨
              </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <div class="footer-brand">📝 Your Notes App</div>
              <div class="footer-tagline">Capture your ideas beautifully</div>
              <div class="footer-legal">Automated Email • Do Not Reply</div>
            </div>
          </div>
        </body>
        </html>
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

    // Send email notification with description (non-blocking)
    sendNoteCreatedEmail(req.user.email, note.title, note.description, note.createdAt);

    // Return the created note with all fields
    const createdNote = {
      _id: note._id,
      title: note.title,
      description: note.description,
      user: note.user,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };

    console.log("✅ Sending response:", createdNote);
    res.status(201).json(createdNote);

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
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});