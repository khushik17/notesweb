
import { useEffect, useState } from "react";
import axios from "axios";

interface Note {
  _id: string;
  title: string;
  description: string;
}

export default function NotePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const token = localStorage.getItem("token");

 
  const fetchNotes = async () => {
    try {
      const res = await axios.get("http://localhost:3000/notes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotes(res.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };


  const handleAddNote = async () => {
    if (!title) return;

    try {
      await axios.post(
        "http://localhost:3000/notes",
        { title, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTitle("");
      setDescription("");
      fetchNotes();
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };


  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/notes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

 return (
  <div className="min-h-screen bg-background text-foreground px-6 py-12">

    <div className="max-w-3xl mx-auto space-y-10">

     
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">
          <span className="text-main">Your</span> Notes
        </h1>
        <p className="opacity-70 text-sm">
          Capture your ideas beautifully ✨
        </p>
      </div>

      
      <div className="bg-secondary-background border-2 border-border shadow-shadow rounded-base p-8 space-y-4">

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 border-2 border-border rounded-md bg-background outline-none"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 border-2 border-border rounded-md bg-background outline-none resize-none"
        />

        <button
          onClick={handleAddNote}
          className="px-6 py-3 rounded-full bg-main text-main-foreground shadow-shadow transition-all duration-200 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
        >
          Add Note
        </button>

      </div>

     
      <div className="grid gap-6">
        {notes.map((note) => (
          <div
            key={note._id}
            className="bg-secondary-background border-2 border-border shadow-shadow rounded-base p-6 space-y-3 transition-all duration-200 hover:-translate-y-1"
          >
            <h3 className="text-xl font-semibold text-main">
              {note.title}
            </h3>

            <p className="opacity-80">
              {note.description}
            </p>

            <button
              onClick={() => handleDelete(note._id)}
              className="text-sm px-4 py-2 rounded-full border-2 border-border hover:bg-main hover:text-main-foreground transition-all duration-200"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

    </div>

  </div>
);

}
