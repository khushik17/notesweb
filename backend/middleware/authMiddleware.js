import admin from "../firebaseAdmin.js";
import { User } from "../db.js";

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    const firebaseUID = decodedToken.uid;

    // Find or create user
    let user = await User.findOne({ firebaseUID });

    if (!user) {
      user = await User.create({
        firebaseUID,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email?.split('@')[0] || "User",
      });
    }

    req.user = user;
    next();
    
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ 
      message: "Unauthorized", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

export default verifyFirebaseToken;