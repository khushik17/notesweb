import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Note {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
}

export default function NotePage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const token = localStorage.getItem("token");

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  const fetchNotes = async () => {
    try {
      setError("");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/notes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotes(res.data);
    } catch (error: any) {
      console.error("Error fetching notes:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
      setError("Failed to load notes");
    }
  };

  const handleAddNote = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    // Prevent multiple submissions
    if (loading) {
      console.log(" Already submitting...");
      return;
    }

    const currentTitle = title.trim();
    const currentDescription = description.trim();

    setLoading(true);
    setError("");

    try {
      console.log("Creating note...");

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/notes`,
        { title: currentTitle, description: currentDescription },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 60000,
        }
      );

      console.log(" Note created:", response.data);

      // Verify response has data
      if (response.data && response.data._id) {
        // Add to beginning of notes array
        setNotes(prevNotes => [response.data, ...prevNotes]);
        
        // Clear form only after successful add
        setTitle("");
        setDescription("");
        
        console.log(" Note added to UI");
      } else {
        console.error(" Invalid response:", response.data);
        setError("Invalid response from server");
      }

    } catch (error: any) {
      console.error(" Add note error:", error);

      if (error.code === 'ECONNABORTED') {
        setError("Request timeout. Backend is slow - try again!");
      } else if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      } else {
        setError(error.response?.data?.error || "Failed to add note");
      }
    } finally {
      setLoading(false);
      console.log(" Request finished");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      console.log(" Deleting note:", id);

      await axios.delete(`${import.meta.env.VITE_API_URL}/notes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(" Note deleted");

      // Optimistically remove from UI
      setNotes(notes.filter(note => note._id !== id));

    } catch (error: any) {
      console.error("Delete error:", error.response?.data || error.message);
      setError(error.response?.data?.error || "Failed to delete note");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleAddNote();
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Header with Logout */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">
              <span className="text-main">Your</span> Notes
            </h1>
            <p className="opacity-70 text-sm">
              Capture your ideas beautifully ✨
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full border-2 border-border hover:bg-main hover:text-main-foreground transition-all duration-200"
          >
            Logout
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-base text-sm">
            {error}
          </div>
        )}

        {/* Add Note Form */}
        <div className="bg-secondary-background border-2 border-border shadow-shadow rounded-base p-8 space-y-4">
          <input
            type="text"
            placeholder="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full p-3 border-2 border-border rounded-md bg-background outline-none focus:border-main transition-colors"
            disabled={loading}
          />

          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={4}
            className="w-full p-3 border-2 border-border rounded-md bg-background outline-none resize-none focus:border-main transition-colors"
            disabled={loading}
          />

          <div className="flex items-center justify-between">
            <p className="text-xs opacity-60">Press Ctrl + Enter to add</p>
            <button
              onClick={handleAddNote}
              disabled={loading || !title.trim()}
              className="px-6 py-3 rounded-full bg-main text-main-foreground shadow-shadow transition-all duration-200 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
            >
              {loading ? "Adding..." : "Add Note"}
            </button>
          </div>
        </div>

        {/* Notes List */}
        {notes.length === 0 ? (
          <div className="text-center py-12 opacity-60">
            <p className="text-lg">No notes yet. Create your first note! 📝</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {notes.map((note) => (
              <div
                key={note._id}
                className="bg-secondary-background border-2 border-border shadow-shadow rounded-base p-6 space-y-3 transition-all duration-200 hover:-translate-y-1"
              >
                <h3 className="text-xl font-semibold text-main">
                  {note.title}
                </h3>

                {note.description && (
                  <p className="opacity-80 whitespace-pre-wrap">
                    {note.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2">
                  {note.createdAt && (
                    <p className="text-xs opacity-50">
                      {new Date(note.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                  <button
                    onClick={() => handleDelete(note._id)}
                    className="text-sm px-4 py-2 rounded-full border-2 border-border hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
