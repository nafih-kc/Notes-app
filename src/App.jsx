import { useMemo, useState } from "react";
import Header from "./components/Header";
import NoteForm from "./components/NoteForm";
import NoteList from "./components/NoteList";
import { useNotes } from "./NotesContext";

function App() {
  const { notes, loading, error, createNote, updateNote, deleteNote, toggleArchive,
    togglePin, searchNotes, fetchNotes } = useNotes();
  const [search, setSearch] = useState("");
  const [view, setView] = useState("active");
  const [sortBy, setSortBy] = useState("newest");
  const [editingNote, setEditingNote] = useState(null);

  async function saveNote(noteData) {
    const duplicate = notes.some((note) =>
      String(note.id) !== String(editingNote?.id) &&
      note.title.trim().toLowerCase() === noteData.title.trim().toLowerCase() &&
      note.content.trim().toLowerCase() === noteData.content.trim().toLowerCase()
    );
    if (duplicate) return "duplicate";
    const saved = editingNote
      ? await updateNote(editingNote.id, noteData)
      : await createNote({ ...noteData, stock: 0 });
    if (saved) setEditingNote(null);
    return saved;
  }

  async function handleDelete(id) {
    if (window.confirm("Delete this note?")) await deleteNote(id);
  }

  const visibleNotes = useMemo(() => searchNotes(search)
    .filter((note) => (view === "archive" ? note.archived : !note.archived))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return Number(b.pinned) - Number(a.pinned);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "color") return a.color.localeCompare(b.color);
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    }), [notes, search, view, sortBy, searchNotes]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-100 p-6 md:p-8">
        <NoteForm onSave={saveNote} editingNote={editingNote}
          onCancel={() => setEditingNote(null)} />

        {error && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
            <span>{error}</span>
            <button onClick={() => void fetchNotes()} className="font-medium underline">Retry</button>
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <input value={search} onChange={(event) => setSearch(event.target.value)}
            placeholder="Search notes..." aria-label="Search notes"
            className="rounded-lg border border-gray-300 bg-white p-2" />
          <select value={view} onChange={(event) => setView(event.target.value)}
            aria-label="Choose notes view" className="rounded-lg border border-gray-300 bg-white p-2">
            <option value="active">Active notes</option>
            <option value="archive">Archived notes</option>
          </select>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}
            aria-label="Sort notes" className="rounded-lg border border-gray-300 bg-white p-2">
            <option value="newest">Sort: newest</option>
            <option value="title">Sort: title</option>
            <option value="color">Sort: color</option>
          </select>
          {loading && (
            <span className="inline-flex items-center gap-2 text-sm text-gray-600" role="status">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              Saving…
            </span>
          )}
        </div>

        {loading && notes.length === 0 ? (
          <div className="flex items-center gap-3 py-8 text-gray-600" role="status">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            Loading your notes…
          </div>
        ) : (
          <NoteList notes={visibleNotes} onEdit={setEditingNote} onDelete={handleDelete}
            onArchive={toggleArchive} onPin={togglePin} />
        )}
      </main>
    </>
  );
}

export default App;

