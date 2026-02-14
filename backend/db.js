import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const { Schema } = mongoose;


mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });


const userSchema = new Schema({
  name: {
    type: String,
    default: "User",
  },
  firebaseUID: {
    type: String,
    required: true,
    unique: true,
    index: true, 
  },
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const noteSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true, 
  },
  description: {
    type: String,
    trim: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User", 
    required: true,
    index: true, 
  },
 
  fileUrl: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});


noteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model("User", userSchema);
const Note = mongoose.model("Note", noteSchema);

export { User, Note };