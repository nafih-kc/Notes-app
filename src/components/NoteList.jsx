function NoteList({ notes, onEdit, onDelete, onArchive, onPin }) {
  if (notes.length === 0) {
    return <p className="text-gray-600">No notes found. Add a note above.</p>;
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <article
          key={note.id}
          className={`rounded-xl border border-gray-200 p-4 shadow-sm ${note.color}`}
        >
          <div className="mb-3 flex items-start justify-between gap-2">
            <h2 className="font-semibold text-gray-800">
              {note.title || "Untitled"}
            </h2>
            <button
              onClick={() => onPin(note.id)}
              className="text-sm"
              title="Pin or unpin"
            >
              {note.Pinned ? "pinned" : "Pin"}
            </button>
          </div>

          <p className="mb-3 whitespace-pre-wrap break-words text-gray-700">
            {note.content}
          </p>

          {note.tags && (
            <p className="mb-3 text-sm text-gray-500">Tag: {note.tags}</p>
          )}

          <p className="mb-3 text-xs text-gray-500">
            Updated: {new Date(note.updatedAt).toLocaleString()}
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onEdit(note)}
              className="rounded border px-3 py-1 text-sm"
            >
              Change
            </button>
            <button
              onClick={() => onArchive(note.id)}
              className="rounded border px-3 py-1 text-sm"
            >
              {note.archived ? "Unarchive" : "Archive"}
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="rounded border border-red-300 px-3 py-1 text-sm text-red-700"
            >
              Remove
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}

export default NoteList;