
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });
const { Schema } = mongoose;


mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));



const userSchema = new Schema({
  name: {
    type: String,
  },
  firebaseUID: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
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
  },
  description: {
    type: String,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User", 
    required: true,
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


const User = mongoose.model("User", userSchema);
const Note = mongoose.model("Note", noteSchema);

export { User, Note };
