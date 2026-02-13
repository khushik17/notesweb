import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import nodemailer from "nodemailer";
import verifyFirebaseToken from "./middleware/authMiddleware.js";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
import { User, Note } from "./db.js";



console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    
  },
  
});


app.post("/notes", verifyFirebaseToken, async (req, res) => {
  try {
    console.log("POST /notes hit");
    console.log("req.body:", req.body);
    console.log("req.user:", req.user);

    const { title, description } = req.body;

    const note = new Note({
      title,
      description,
      user: req.user._id,
    });

    console.log("Saving note...");
    await note.save();
    console.log("Note saved successfully");

    // Send email but DO NOT crash if it fails
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: req.user.email,
        subject: "New Note Created",
        text: `A new note titled "${title}" has been created.`,
      });
      console.log("Email sent successfully");
    } catch (emailError) {
      console.log("Email failed but note saved:", emailError.message);
    }

    res.status(201).json(note);

  } catch (error) {
    console.error("ACTUAL SAVE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/notes", verifyFirebaseToken, async (req, res)=>{
    try{
        const notes = await Note.find({user : req.user._id});
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }})

   app.put("/notes/:id", verifyFirebaseToken, async (req, res) => {
    try {
        const noteId = req.params.id;
        const { title, description } = req.body;
        const note = await Note.findOneAndUpdate(
            { _id: noteId, user: req.user._id },
            { title, description },
            { new: true }
        );
        if (!note) {
            return res.status(404).json({ error: "Note not found or unauthorized" });
        }
        res.status(200).json(note);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }})


 app.delete("/notes/:id", verifyFirebaseToken, async (req, res) => {
    try{
        const noteId = req.params.id;
        const note = await Note.findOneAndDelete({_id : noteId, user : req.user._id});
        if (!note) {
            return res.status(404).json({ error: "Note not found or unauthorized" });
        }
        res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }})

   const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});