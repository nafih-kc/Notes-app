import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { NotesProvider, useNotes } from "./NotesContext";
import "./index.css";

function ToastViewport() {
  const { toasts, dismissToast } = useNotes();
  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id}
          className={`flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${toast.tone === "error" ? "bg-red-700" : "bg-gray-900"}`}
          role={toast.tone === "error" ? "alert" : "status"}>
          <span>{toast.message}</span>
          <button type="button" onClick={() => dismissToast(toast.id)}
            className="font-semibold text-white/80 hover:text-white" aria-label="Dismiss notification">×</button>
        </div>
      ))}
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NotesProvider>
      <App />
      <ToastViewport />
    </NotesProvider>
  </StrictMode>
);

