import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDC0taS_vLB0KeiAXaS41PPA8NXItKN0Ns",
  authDomain: "notes-website-8fc10.firebaseapp.com",
  projectId: "notes-website-8fc10",
  storageBucket: "notes-website-8fc10.firebasestorage.app",
  messagingSenderId: "757511460247",
  appId: "1:757511460247:web:d91ee7a08b2cf97beda0d2",
  measurementId: "G-HQR3C5P7HM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
