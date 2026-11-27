import axios from "axios";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Note = {
  id: number | string;
  title: string;
  content: string;
  color: string;
  tags: string[];
  archived: boolean;
  stock: number;
  pinned?: boolean;
  createdAt: string;
  updatedAt: string;
};
export type NoteInput =
  Pick<Note, "title" | "content" | "color" | "tags"> &
  Partial<Pick<Note, "archived" | "stock" | "pinned">>;
export type NoteUpdates = Partial<Omit<Note, "id" | "createdAt" | "updatedAt">>;
type ToastMessage = { id: number; message: string; tone: "success" | "error" };
type NotesContextValue = {
  notes: Note[];
  loading: boolean;
  error: string | null;
  toasts: ToastMessage[];
  createNote: (note: NoteInput) => Promise<boolean>;
  updateNote: (id: Note["id"], updates: NoteUpdates) => Promise<boolean>;
  deleteNote: (id: Note["id"]) => Promise<boolean>;
  toggleArchive: (id: Note["id"]) => Promise<boolean>;
  togglePin: (id: Note["id"]) => Promise<boolean>;
  searchNotes: (query: string) => Note[];
  fetchNotes: () => Promise<void>;
  dismissToast: (id: number) => void;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const notesApi = axios.create({ baseURL: `${API_URL.replace(/\/$/, "")}/notes` });
const NotesContext = createContext<NotesContextValue | undefined>(undefined);

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || "The server request failed.";
  }
  return error instanceof Error ? error.message : "Something went wrong.";
}

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, tone: ToastMessage["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3200);
  }, []);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await notesApi.get<Note[]>("/");
      setNotes(response.data);
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setError(message);
      showToast(`Could not load notes: ${message}`, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { void fetchNotes(); }, [fetchNotes]);

  const createNote = useCallback(async (note: NoteInput) => {
    setLoading(true);
    setError(null);
    const now = new Date().toISOString();
    try {
      const response = await notesApi.post<Note>("/", {
        ...note, archived: false, pinned: note.pinned ?? false, stock: note.stock ?? 0,
        createdAt: now, updatedAt: now,
      });
      setNotes((current) => [response.data, ...current]);
      showToast("Note created.");
      return true;
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setError(message);
      showToast(`Could not create note: ${message}`, "error");
      return false;
    } finally { setLoading(false); }
  }, [showToast]);

  const updateNote = useCallback(async (id: Note["id"], updates: NoteUpdates) => {
    const existing = notes.find((note) => String(note.id) === String(id));
    if (!existing) return false;
    setLoading(true);
    setError(null);
    try {
      const updatedNote = { ...existing, ...updates, updatedAt: new Date().toISOString() };
      const response = await notesApi.put<Note>(`/${id}`, updatedNote);
      setNotes((current) => current.map((note) =>
        String(note.id) === String(id) ? response.data : note
      ));
      showToast("Note updated.");
      return true;
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setError(message);
      showToast(`Could not update note: ${message}`, "error");
      return false;
    } finally { setLoading(false); }
  }, [notes, showToast]);

  const deleteNote = useCallback(async (id: Note["id"]) => {
    setLoading(true);
    setError(null);
    try {
      await notesApi.delete(`/${id}`);
      setNotes((current) => current.filter((note) => String(note.id) !== String(id)));
      showToast("Note deleted.");
      return true;
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setError(message);
      showToast(`Could not delete note: ${message}`, "error");
      return false;
    } finally { setLoading(false); }
  }, [showToast]);

  const toggleArchive = useCallback(async (id: Note["id"]) => {
    const note = notes.find((item) => String(item.id) === String(id));
    if (!note) return false;
    const archived = !note.archived;
    setLoading(true);
    setError(null);
    try {
      const response = await notesApi.patch<Note>(`/${id}`, {
        archived, updatedAt: new Date().toISOString(),
      });
      setNotes((current) => current.map((item) =>
        String(item.id) === String(id) ? response.data : item
      ));
      showToast(archived ? "Note archived." : "Note restored.");
      return true;
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setError(message);
      showToast(`Could not change archive status: ${message}`, "error");
      return false;
    } finally { setLoading(false); }
  }, [notes, showToast]);

  const togglePin = useCallback(async (id: Note["id"]) => {
    const note = notes.find((item) => String(item.id) === String(id));
    if (!note) return false;
    return updateNote(id, { pinned: !note.pinned });
  }, [notes, updateNote]);

  const searchNotes = useCallback((query: string) => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return notes;
    return notes.filter((note) =>
      [note.title, note.content, ...note.tags].join(" ").toLocaleLowerCase().includes(normalizedQuery)
    );
  }, [notes]);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);
  const value = useMemo(() => ({
    notes, loading, error, toasts, createNote, updateNote, deleteNote, toggleArchive,
    togglePin, searchNotes, fetchNotes, dismissToast,
  }), [notes, loading, error, toasts, createNote, updateNote, deleteNote, toggleArchive,
    togglePin, searchNotes, fetchNotes, dismissToast]);

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) throw new Error("useNotes must be used inside NotesProvider.");
  return context;
}

