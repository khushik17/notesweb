import admin from "../firebaseAdmin.js";
import { User } from "../db.js";

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decodedToken = await admin.auth().verifyIdToken(token);

    const firebaseUID = decodedToken.uid;

    
    let user = await User.findOne({ firebaseUID });

    if (!user) {
      user = await User.create({
        firebaseUID,
        email: decodedToken.email,
        name: decodedToken.name || "",
      });
    }

    req.user = user; 

    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized", error: error.message });
  }
};

export default verifyFirebaseToken;
