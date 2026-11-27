import { useEffect, useState } from "react";

const emptyForm = { title: "", content: "", color: "bg-white", tags: "" };

function NoteForm({ onSave, editingNote, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingNote) {
      setForm({
        title: editingNote.title,
        content: editingNote.content,
        color: editingNote.color,
        tags: Array.isArray(editingNote.tags) ? editingNote.tags.join(", ") : editingNote.tags,
      });
    } else {
      setForm(emptyForm);
    }
    setError("");
  }, [editingNote]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.content.trim()) {
      setError("Note content is required.");
      return;
    }
    if (form.title.length > 100) {
      setError("Title must be 100 characters or fewer.");
      return;
    }
    setError("");
    const saved = await onSave({
      ...form,
      title: form.title.trim(),
      content: form.content.trim(),
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 10),
    });
    if (saved === true) setForm(emptyForm);
    else if (saved === "duplicate") setError("A note with the same title and content already exists.");
  }

  return (
    <form onSubmit={handleSubmit}
      className="mb-6 max-w-xl rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <label htmlFor="note-title" className="mb-1 block font-medium">Title (optional)</label>
      <input id="note-title" name="title" value={form.title} onChange={handleChange}
        maxLength={100} placeholder="Title"
        className="mb-1 w-full rounded-lg border border-gray-300 p-2" />
      <p className="mb-4 text-right text-sm text-gray-500">{form.title.length}/100</p>

      <label htmlFor="note-content" className="mb-1 block font-medium">Content *</label>
      <textarea id="note-content" name="content" value={form.content} onChange={handleChange}
        maxLength={5000} rows="4" placeholder="Write your note..."
        className="mb-4 w-full rounded-lg border border-gray-300 p-2" />

      <label htmlFor="note-tags" className="mb-1 block font-medium">Tags (optional)</label>
      <input id="note-tags" name="tags" value={form.tags} onChange={handleChange}
        maxLength={200} placeholder="For example: work, planning"
        className="mb-4 w-full rounded-lg border border-gray-300 p-2" />

      <label htmlFor="note-color" className="mb-1 block font-medium">Pick a color</label>
      <select id="note-color" name="color" value={form.color} onChange={handleChange}
        className="mb-4 rounded-lg border border-gray-300 p-2">
        <option value="bg-white">White</option>
        <option value="bg-yellow-100">Yellow</option>
        <option value="bg-green-100">Green</option>
        <option value="bg-blue-100">Blue</option>
        <option value="bg-pink-100">Rose</option>
      </select>

      {error && <p className="mb-3 text-sm text-red-600" role="alert">{error}</p>}
      <button className="rounded-lg bg-blue-600 px-4 py-2 text-white">
        {editingNote ? "Save changes" : "Add note"}
      </button>
      {editingNote && (
        <button type="button" onClick={onCancel} className="ml-2 rounded-lg border px-4 py-2">
          Cancel
        </button>
      )}
    </form>
  );
}

export default NoteForm;

