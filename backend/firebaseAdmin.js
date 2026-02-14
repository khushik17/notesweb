import dotenv from "dotenv";
dotenv.config();

import admin from "firebase-admin";

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_project_id,
      clientEmail: process.env._client_email,
      privateKey: process.env.FIREBASE_private_key?.replace(/\\n/g, "\n"),
    }),
  });
  console.log("✅ Firebase Admin initialized");
} catch (error) {
  console.error("❌ Firebase Admin initialization error:", error.message);
  process.exit(1);
}

export default admin;