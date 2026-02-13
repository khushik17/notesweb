import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      localStorage.setItem("token", token);
      navigate("/notes");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      
      <div className="bg-secondary-background border-2 border-border shadow-shadow rounded-base p-12 w-full max-w-md text-center space-y-8 transition-all duration-300">

        <h1 className="text-4xl font-bold tracking-tight">
          <span className="text-main">Notes</span> App
        </h1>

        <p className="text-sm opacity-70">
          Organize your thoughts beautifully ✨
        </p>

        <button
          onClick={handleLogin}
          className="w-full py-3 rounded-full bg-main text-main-foreground 
          shadow-shadow transition-all duration-200
          hover:translate-x-[3px] hover:translate-y-[3px]
          hover:shadow-none"
        >
          Sign in with Google
        </button>

      </div>
    </div>
  );
}
