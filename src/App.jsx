import { useEffect, useState } from "react";
import Header from "./components/Header";
import NoteForm from "./components/NoteForm";
import NoteList from "./components/NoteList";

const STORAGE_KEY = "my-notes";

function App() {
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem(STORAGE_KEY);
    return savedNotes ? JSON.parse(savedNotes) : [];
  });

  const [search, setSearch] = useState("");
  const [view, setView] = useState("active");
  const [sortBy, setSortBy] = useState("newest");
  const [editingNote, setEditingNote] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  function saveNote(noteData) {
    const duplicate = notes.some(
      (note) =>
        note.id !== editingNote?.id &&
        note.title.trim().toLowerCase() === noteData.title.trim().toLowerCase() &&
        note.content.trim().toLowerCase() === noteData.content.trim().toLowerCase()
    );

    if (duplicate) {
      setError("A note with the same title and content already exists.");
      return;
    }

    setError("");

    if (editingNote) {
      setNotes((currentNotes) =>
        currentNotes.map((note) =>
          note.id === editingNote.id
            ? { ...note, ...noteData, updatedAt: new Date().toISOString() }
            : note
        )
      );
      setEditingNote(null);
    } else {
      const now = new Date().toISOString();
      setNotes((currentNotes) => [
        {
          ...noteData,
          id: Date.now(),
          createdAt: now,
          updatedAt: now,
          archived: false,
          pinned: false,
        },
        ...currentNotes,
      ]);
    }
  }

  function deleteNote(id) {
    if (window.confirm("Delete this note?")) {
      setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
    }
  }

  function toggleArchive(id) {
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === id
          ? { ...note, archived: !note.archived, updatedAt: new Date().toISOString() }
          : note
      )
    );
  }

  function togglePin(id) {
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === id ? { ...note, pinned: !note.pinned } : note
      )
    );
  }

  const visibleNotes = notes
    .filter((note) => (view === "archive" ? note.archived : !note.archived))
    .filter((note) => {
      const text = `${note.title} ${note.content} ${note.tags}`.toLowerCase();
      return text.includes(search.toLowerCase());
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return Number(b.pinned) - Number(a.pinned);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "color") return a.color.localeCompare(b.color);
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-100 p-6 md:p-8">
        <NoteForm
          onSave={saveNote}
          editingNote={editingNote}
          onCancel={() => setEditingNote(null)}
        />

        {error && <p className="mb-4 text-red-600">{error}</p>}

        <div className="mb-6 flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search notes..."
            className="rounded-lg border border-gray-300 bg-white p-2"
          />

          <select
            value={view}
            onChange={(event) => setView(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white p-2"
          >
            <option value="active">Active notes</option>
            <option value="archive">Archived notes</option>
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white p-2"
          >
            <option value="newest">Sort: newest</option>
            <option value="title">Sort: title</option>
            <option value="color">Sort: color</option>
          </select>
        </div>

        <NoteList
          notes={visibleNotes}
          onEdit={setEditingNote}
          onDelete={deleteNote}
          onArchive={toggleArchive}
          onPin={togglePin}
        />
      </main>
    </>
  );
}

export default App;