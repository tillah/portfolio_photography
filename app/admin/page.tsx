"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Photo, Category } from "@/lib/photos";

const CATEGORIES: Category[] = ["proposals", "graduations", "events", "studio"];
const CAT_LABELS: Record<Category, string> = {
  proposals: "Proposals",
  graduations: "Graduations",
  events: "Events",
  studio: "Studio",
};
const CAT_COLOURS: Record<Category, string> = {
  proposals: "bg-rose-900/40 text-rose-300 border-rose-800/40",
  graduations: "bg-blue-900/40 text-blue-300 border-blue-800/40",
  events: "bg-amber-900/40 text-amber-300 border-amber-800/40",
  studio: "bg-violet-900/40 text-violet-300 border-violet-800/40",
};

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (pw: string) => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await fetch("/api/admin/photos", { headers: { "x-admin-password": pw } });
    setLoading(false);
    if (res.ok) { sessionStorage.setItem("admin_pw", pw); onLogin(pw); }
    else setError(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1117]">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm px-8">
        <p className="font-[var(--font-tenor)] text-2xl text-white mb-1 tracking-wide">Admin Portal</p>
        <p className="font-[var(--font-roboto)] text-xs text-white/40 tracking-widest uppercase mb-8">Tehillah Photography</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" placeholder="Enter password" value={pw} onChange={(e) => setPw(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#A85232] transition-colors" />
          {error && <p className="text-[#A85232] text-xs tracking-wide">Incorrect password.</p>}
          <button type="submit" disabled={loading || !pw}
            className="w-full bg-[#A85232] text-white py-3 text-xs tracking-[0.2em] uppercase font-[var(--font-roboto)] hover:bg-[#8a4228] transition-colors disabled:opacity-40">
            {loading ? "Checking…" : "Enter"}
          </button>
        </form>
        <p className="mt-6 text-center text-white/20 text-[10px] tracking-widest uppercase">
          Default: <span className="text-white/40">admin123</span> · set <code className="text-white/30">ADMIN_PASSWORD</code> env var to change
        </p>
      </motion.div>
    </div>
  );
}

// ── Queued file item for the upload drawer ────────────────────────────────────
interface QueuedFile {
  id: string;
  file: File;
  preview: string;
  alt: string;
  category: Category;
  status: "pending" | "uploading" | "done" | "error";
}

function UploadDrawer({
  password,
  onUploaded,
  onClose,
}: {
  password: string;
  onUploaded: (photos: Photo[]) => void;
  onClose: () => void;
}) {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [defaultCat, setDefaultCat] = useState<Category>("proposals");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | File[]) => {
    const newItems: QueuedFile[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({
        id: `${Date.now()}_${Math.random()}`,
        file: f,
        preview: URL.createObjectURL(f),
        alt: f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        category: defaultCat,
        status: "pending",
      }));
    setQueue((q) => [...q, ...newItems]);
  };

  const removeFromQueue = (id: string) =>
    setQueue((q) => q.filter((item) => item.id !== id));

  const updateItem = (id: string, patch: Partial<QueuedFile>) =>
    setQueue((q) => q.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const handleUploadAll = async () => {
    setUploading(true);
    let lastPhotos: Photo[] = [];
    for (const item of queue.filter((i) => i.status === "pending")) {
      updateItem(item.id, { status: "uploading" });
      try {
        const fd = new FormData();
        fd.append("file", item.file);
        fd.append("alt", item.alt || item.file.name);
        fd.append("category", item.category);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "x-admin-password": password },
          body: fd,
        });
        const data = await res.json();
        if (res.ok) {
          updateItem(item.id, { status: "done" });
          lastPhotos = data.photos;
        } else {
          updateItem(item.id, { status: "error" });
        }
      } catch {
        updateItem(item.id, { status: "error" });
      }
    }
    setUploading(false);
    if (lastPhotos.length) onUploaded(lastPhotos);
  };

  const pendingCount = queue.filter((i) => i.status === "pending").length;
  const doneCount = queue.filter((i) => i.status === "done").length;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      className="fixed inset-y-0 right-0 w-full max-w-xl bg-[#12151f] border-l border-white/10 z-50 flex flex-col shadow-2xl"
    >
      {/* Drawer header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
        <div>
          <p className="font-[var(--font-tenor)] text-lg text-white">Upload Photos</p>
          <p className="text-xs text-white/30 mt-0.5">
            {queue.length === 0 ? "Add images below" : `${doneCount}/${queue.length} uploaded`}
          </p>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none transition-colors">✕</button>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        className={`mx-6 mt-5 border-2 border-dashed rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center py-8 shrink-0 ${
          dragging ? "border-[#A85232] bg-[#A85232]/5" : "border-white/10 hover:border-white/25"
        }`}
      >
        <p className="text-3xl mb-2">↑</p>
        <p className="text-sm text-white/50">Drop images here or <span className="text-[#A85232]">browse</span></p>
        <p className="text-xs text-white/25 mt-1">Select multiple files at once</p>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => { if (e.target.files) addFiles(e.target.files); }} />
      </div>

      {/* Default category */}
      <div className="px-6 mt-4 shrink-0">
        <p className="text-[10px] tracking-[0.2em] uppercase text-white/30 mb-2">Default category for new additions</p>
        <div className="flex gap-2">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setDefaultCat(c)}
              className={`flex-1 py-1.5 text-[10px] tracking-wide rounded border transition-all ${
                defaultCat === c ? "border-[#A85232] bg-[#A85232]/15 text-white" : "border-white/10 text-white/35 hover:text-white"
              }`}>
              {CAT_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Queue */}
      <div className="flex-1 overflow-y-auto px-6 mt-4 pb-4 space-y-3">
        <AnimatePresence initial={false}>
          {queue.map((item) => (
            <motion.div key={item.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }}
              className={`flex gap-3 items-start bg-white/5 rounded-lg p-3 border transition-colors ${
                item.status === "done" ? "border-emerald-700/40" :
                item.status === "error" ? "border-red-700/40" :
                item.status === "uploading" ? "border-[#A85232]/40" : "border-white/10"
              }`}
            >
              {/* Thumb */}
              <div className="relative w-14 h-14 rounded overflow-hidden shrink-0 bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.preview} alt="" className="w-full h-full object-cover" />
                {item.status === "uploading" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
                {item.status === "done" && (
                  <div className="absolute inset-0 bg-emerald-900/60 flex items-center justify-center text-emerald-300 text-lg">✓</div>
                )}
                {item.status === "error" && (
                  <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center text-red-300 text-lg">✕</div>
                )}
              </div>

              {/* Fields */}
              <div className="flex-1 min-w-0 space-y-2">
                <input
                  type="text"
                  value={item.alt}
                  onChange={(e) => updateItem(item.id, { alt: e.target.value })}
                  placeholder="Description / alt text"
                  disabled={item.status !== "pending"}
                  className="w-full bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#A85232] transition-colors disabled:opacity-50"
                />
                <div className="flex gap-1.5">
                  {CATEGORIES.map((c) => (
                    <button key={c} type="button"
                      disabled={item.status !== "pending"}
                      onClick={() => updateItem(item.id, { category: c })}
                      className={`flex-1 py-1 text-[9px] tracking-wide rounded border transition-all disabled:opacity-50 ${
                        item.category === c ? "border-[#A85232] bg-[#A85232]/15 text-white" : "border-white/10 text-white/30 hover:text-white"
                      }`}>
                      {CAT_LABELS[c].slice(0, 4)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remove */}
              {item.status === "pending" && (
                <button onClick={() => removeFromQueue(item.id)} className="text-white/20 hover:text-red-400 transition-colors text-sm shrink-0 mt-1">✕</button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {queue.length === 0 && (
          <p className="text-center text-white/15 text-sm py-8">No images queued yet</p>
        )}
      </div>

      {/* Footer actions */}
      <div className="px-6 py-4 border-t border-white/10 shrink-0 flex gap-3">
        {queue.some((i) => i.status === "done") && (
          <button onClick={() => setQueue((q) => q.filter((i) => i.status !== "done"))}
            className="text-xs text-white/30 hover:text-white transition-colors tracking-wide">
            Clear done
          </button>
        )}
        <button
          onClick={handleUploadAll}
          disabled={uploading || pendingCount === 0}
          className="flex-1 bg-[#A85232] text-white py-3 text-xs tracking-[0.2em] uppercase font-[var(--font-roboto)] hover:bg-[#8a4228] transition-colors disabled:opacity-30 rounded"
        >
          {uploading ? "Uploading…" : `Upload ${pendingCount > 0 ? `${pendingCount} ` : ""}Photo${pendingCount !== 1 ? "s" : ""}`}
        </button>
      </div>
    </motion.div>
  );
}

// ── Edit modal ────────────────────────────────────────────────────────────────
function EditModal({
  photo,
  password,
  onSaved,
  onClose,
}: {
  photo: Photo;
  password: string;
  onSaved: (photos: Photo[]) => void;
  onClose: () => void;
}) {
  const [alt,       setAlt]       = useState(photo.alt);
  const [category,  setCategory]  = useState<Category>(photo.category);
  const [featured,  setFeatured]  = useState(photo.featured  ?? false);
  const [published, setPublished] = useState(photo.published ?? true);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    const res = await fetch(`/api/admin/photos/${photo.id}`, {
      method: "PATCH",
      headers: { "x-admin-password": password, "Content-Type": "application/json" },
      body: JSON.stringify({ alt, category, featured, published }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) { onSaved(data.photos); onClose(); }
    else setSaveError(data.error ?? "Save failed");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#12151f] border border-white/10 rounded-xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <p className="font-[var(--font-tenor)] text-lg text-white">Edit Photo</p>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">✕</button>
        </div>

        {/* Preview */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-white/5 mb-5">
          <Image src={photo.src} alt={photo.alt} fill className="object-cover"
            unoptimized={photo.src.startsWith("/uploads/")} />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 mb-1.5">Description / Alt Text</label>
            <input type="text" value={alt} onChange={(e) => setAlt(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#A85232] transition-colors" />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 mb-1.5">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((c) => (
                <button key={c} type="button" onClick={() => setCategory(c)}
                  className={`py-2 text-xs tracking-wide rounded border transition-all ${
                    category === c ? "border-[#A85232] bg-[#A85232]/15 text-white" : "border-white/10 text-white/40 hover:text-white"
                  }`}>
                  {CAT_LABELS[c]}
                </button>
              ))}
            </div>
          </div>

          {/* Featured + Published toggles */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setFeatured((v) => !v)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs tracking-wide rounded border transition-all ${
                featured ? "border-amber-600/60 bg-amber-900/20 text-amber-300" : "border-white/10 text-white/30 hover:text-white"
              }`}>
              <span>{featured ? "★" : "☆"}</span> Featured
            </button>
            <button type="button" onClick={() => setPublished((v) => !v)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs tracking-wide rounded border transition-all ${
                published ? "border-emerald-700/50 bg-emerald-900/20 text-emerald-300" : "border-red-700/50 bg-red-900/15 text-red-400"
              }`}>
              <span>{published ? "✓" : "✕"}</span> {published ? "Published" : "Hidden"}
            </button>
          </div>
        </div>

        {saveError && (
          <p className="mt-3 text-red-400 text-xs tracking-wide">{saveError}</p>
        )}

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-white/10 text-white/40 hover:text-white py-2.5 text-xs tracking-[0.15em] uppercase rounded transition-all">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !alt.trim()}
            className="flex-1 bg-[#A85232] text-white hover:bg-[#8a4228] py-2.5 text-xs tracking-[0.15em] uppercase rounded transition-colors disabled:opacity-30">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Blob status banner ────────────────────────────────────────────────────────
type BlobStatus = { initialized: boolean; count: number; source: string } | null;

function BlobStatusBanner({
  status,
  password,
  onSynced,
}: {
  status: BlobStatus;
  password: string;
  onSynced: (photos: Photo[]) => void;
}) {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/sync", {
        method: "POST",
        headers: { "x-admin-password": password },
      });
      if (!res.ok) throw new Error(await res.text());
      // Reload photos after sync
      const photosRes = await fetch("/api/admin/photos", {
        headers: { "x-admin-password": password },
        cache: "no-store",
      });
      if (photosRes.ok) onSynced(await photosRes.json());
    } catch (e) {
      setError(String(e));
    } finally {
      setSyncing(false);
    }
  };

  if (!status) return null;

  // All good — show a subtle connected badge
  if (status.initialized) {
    return (
      <div className="mb-6 flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-emerald-400/60">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
        Database synced · {status.count} photos
      </div>
    );
  }

  // Not initialised — show warning + sync button
  return (
    <div className="mb-6 bg-amber-900/20 border border-amber-700/40 rounded-lg px-4 py-4">
      <div className="flex items-start gap-3">
        <span className="text-amber-400 text-lg shrink-0">⚠</span>
        <div className="flex-1">
          <p className="text-amber-300 text-xs font-medium mb-1 tracking-wide">
            Database not initialised
          </p>
          <p className="text-amber-300/60 text-xs leading-relaxed mb-3">
            The database hasn&apos;t been set up yet. Click below to initialise it —
            this seeds it from the backup file and won&apos;t affect photos you&apos;ve
            already uploaded.
          </p>
          {error && (
            <p className="text-red-400 text-xs mb-2">Error: {error}</p>
          )}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="text-[10px] tracking-[0.2em] uppercase bg-amber-600 text-white hover:bg-amber-500 px-4 py-2 rounded transition-colors disabled:opacity-40"
          >
            {syncing ? "Syncing…" : "Sync database now"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main admin page ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const [password, setPassword] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Photo | null>(null);
  const [blobStatus, setBlobStatus] = useState<BlobStatus>(null);
  const [syncing, setSyncing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const checkBlobStatus = useCallback(async (pw: string) => {
    try {
      const res = await fetch("/api/admin/sync", {
        headers: { "x-admin-password": pw },
        cache: "no-store",
      });
      if (res.ok) setBlobStatus(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_pw");
    if (stored) {
      fetch("/api/admin/photos", {
        headers: { "x-admin-password": stored },
        cache: "no-store",
      })
        .then((r) => r.ok ? r.json() : Promise.reject())
        .then((data) => {
          setPassword(stored);
          setPhotos(data);
          checkBlobStatus(stored);
        })
        .catch(() => sessionStorage.removeItem("admin_pw"));
    }
  }, [checkBlobStatus]);

  const handleLogin = useCallback((pw: string) => {
    setPassword(pw);
    fetch("/api/admin/photos", {
      headers: { "x-admin-password": pw },
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((data) => {
        setPhotos(data);
        checkBlobStatus(pw);
      });
  }, [checkBlobStatus]);

  // Manual sync from toolbar
  const handleManualSync = useCallback(async () => {
    if (!password) return;
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/sync", {
        method: "POST",
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        const photosRes = await fetch("/api/admin/photos", {
          headers: { "x-admin-password": password },
          cache: "no-store",
        });
        if (photosRes.ok) setPhotos(await photosRes.json());
        checkBlobStatus(password);
      }
    } finally {
      setSyncing(false);
    }
  }, [password, checkBlobStatus]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(filtered.map((p) => p.id)));
  const clearSelection = () => { setSelected(new Set()); setSelectMode(false); setConfirmingDelete(false); };

  const handleDeleteSelected = async () => {
    if (!password || selected.size === 0) return;
    setDeleting(true);
    setDeleteError(null);

    // null = no successful delete yet; avoids wiping UI if every request fails
    let updatedPhotos: Photo[] | null = null;
    let failCount = 0;

    for (const id of Array.from(selected)) {
      const res = await fetch(`/api/admin/photos/${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": password },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        updatedPhotos = data.photos; // server returns the full updated list
      } else {
        failCount++;
      }
    }

    // Only update UI if at least one delete succeeded
    if (updatedPhotos !== null) {
      setPhotos(updatedPhotos);
    }

    if (failCount > 0) {
      setDeleteError(
        `${failCount} photo${failCount > 1 ? "s" : ""} could not be deleted. Check the server logs for details.`
      );
    }

    setSelected(new Set());
    setSelectMode(false);
    setDeleting(false);
    setConfirmingDelete(false);
  };

  if (!password) return <LoginScreen onLogin={handleLogin} />;

  const filtered = photos
    .filter((p) => filter === "all" || p.category === filter)
    .filter((p) => !search || p.alt.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0f1117]/95 backdrop-blur z-40">
        <div className="flex items-center gap-4">
          <p className="font-[var(--font-tenor)] text-lg tracking-wide">Admin Portal</p>
          <span className="text-white/20 text-xs hidden sm:block">Tehillah Photography</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors border border-white/10 px-3 py-1.5 rounded hover:border-white/30">
            View Site ↗
          </a>
          <button onClick={() => { sessionStorage.removeItem("admin_pw"); setPassword(null); }}
            className="text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors">
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Blob status banner */}
        {password && (
          <BlobStatusBanner
            status={blobStatus}
            password={password}
            onSynced={(updatedPhotos) => {
              setPhotos(updatedPhotos);
              checkBlobStatus(password);
            }}
          />
        )}

        {/* Stat chips */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-1">
          {([["all", "All"] as const, ...CATEGORIES.map((c) => [c, CAT_LABELS[c]] as const)]).map(([cat, label]) => {
            const count = cat === "all" ? photos.length : photos.filter((p) => p.category === cat).length;
            return (
              <button key={cat} onClick={() => { setFilter(cat); clearSelection(); }}
                className={`flex items-center gap-2.5 rounded-lg px-4 py-3 border transition-all shrink-0 ${
                  filter === cat ? "border-[#A85232] bg-[#A85232]/10" : "border-white/10 bg-white/5 hover:border-white/20"
                }`}>
                <span className="text-xl font-[var(--font-tenor)] text-white leading-none">{count}</span>
                <span className="text-[10px] tracking-widest uppercase text-white/40">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <input type="search" placeholder="Search by description…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[180px] bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#A85232] transition-colors" />

          <span className="text-white/20 text-xs tracking-wide">{filtered.length} photos</span>

          {/* Select mode toggle */}
          {!selectMode ? (
            <>
              <button onClick={() => setSelectMode(true)}
                className="text-[10px] tracking-[0.15em] uppercase border border-white/15 text-white/50 hover:text-white hover:border-white/30 px-4 py-2 rounded transition-all">
                Select
              </button>
              <button onClick={() => setShowUpload(true)}
                className="text-[10px] tracking-[0.15em] uppercase bg-[#A85232] text-white hover:bg-[#8a4228] px-5 py-2 rounded transition-colors">
                + Upload Photos
              </button>
              <button
                onClick={handleManualSync}
                disabled={syncing}
                title="Clean up old blob versions (safe — does not change your photos)"
                className="text-[10px] tracking-[0.15em] uppercase border border-white/15 text-white/40 hover:text-white hover:border-white/30 px-4 py-2 rounded transition-all disabled:opacity-30"
              >
                {syncing ? "Cleaning…" : "↺ Clean up"}
              </button>
            </>
          ) : (
            <>
              <button onClick={selectAll}
                className="text-[10px] tracking-[0.15em] uppercase border border-white/15 text-white/50 hover:text-white px-4 py-2 rounded transition-all">
                Select all ({filtered.length})
              </button>
              <button onClick={clearSelection}
                className="text-[10px] tracking-[0.15em] uppercase border border-white/15 text-white/50 hover:text-white px-4 py-2 rounded transition-all">
                Cancel
              </button>
              {!confirmingDelete ? (
                <button
                  onClick={() => selected.size > 0 && setConfirmingDelete(true)}
                  disabled={selected.size === 0 || deleting}
                  className="text-[10px] tracking-[0.15em] uppercase bg-red-700 text-white hover:bg-red-600 px-5 py-2 rounded transition-colors disabled:opacity-30"
                >
                  {`Delete ${selected.size > 0 ? `${selected.size} ` : ""}selected`}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-red-300 tracking-wide">
                    Delete {selected.size} photo{selected.size !== 1 ? "s" : ""}?
                  </span>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={deleting}
                    className="text-[10px] tracking-[0.15em] uppercase bg-red-600 text-white hover:bg-red-500 px-4 py-2 rounded transition-colors disabled:opacity-40"
                  >
                    {deleting ? "Deleting…" : "Yes, delete"}
                  </button>
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    className="text-[10px] tracking-[0.15em] uppercase border border-white/15 text-white/50 hover:text-white px-3 py-2 rounded transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Delete error banner */}
        {deleteError && (
          <div className="mb-4 flex items-start gap-3 bg-red-900/20 border border-red-700/40 rounded-lg px-4 py-3">
            <span className="text-red-400 text-sm shrink-0">⚠</span>
            <p className="text-red-300 text-xs leading-relaxed flex-1">{deleteError}</p>
            <button onClick={() => setDeleteError(null)} className="text-red-400/50 hover:text-red-300 text-sm shrink-0 transition-colors">✕</button>
          </div>
        )}

        {/* Grid */}
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-32 text-white/20 text-sm tracking-wide">
              No photos found
            </motion.div>
          ) : (
            <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filtered.map((photo) => {
                const isSelected = selected.has(photo.id);
                return (
                  <motion.div key={photo.id} layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => selectMode && toggleSelect(photo.id)}
                    className={`group relative rounded-lg overflow-hidden border transition-all ${
                      selectMode ? "cursor-pointer" : ""
                    } ${
                      isSelected
                        ? "border-[#A85232] ring-2 ring-[#A85232]/50"
                        : "border-white/10 hover:border-white/25"
                    }`}
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] bg-white/5">
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        className={`object-cover transition-transform duration-500 ${!selectMode ? "group-hover:scale-105" : ""}`}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        unoptimized={photo.src.startsWith("/uploads/")}
                      />
                      {/* Select overlay */}
                      {selectMode && (
                        <div className={`absolute inset-0 transition-colors ${isSelected ? "bg-[#A85232]/25" : "bg-black/0 group-hover:bg-black/20"}`}>
                          <div className={`absolute top-2 right-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected ? "bg-[#A85232] border-[#A85232]" : "border-white/50 bg-black/30"
                          }`}>
                            {isSelected && <span className="text-white text-xs leading-none">✓</span>}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Featured / hidden badges */}
                    {(photo.featured || photo.published === false) && (
                      <div className="absolute top-2 left-2 flex gap-1">
                        {photo.featured && (
                          <span className="text-[9px] bg-amber-500/80 text-white px-1.5 py-0.5 rounded">★</span>
                        )}
                        {photo.published === false && (
                          <span className="text-[9px] bg-black/70 text-white/60 px-1.5 py-0.5 rounded">Hidden</span>
                        )}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="p-2.5">
                      <p className="text-white/60 text-[11px] truncate mb-1.5">{photo.alt}</p>
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[9px] tracking-wide px-2 py-0.5 rounded-full border ${CAT_COLOURS[photo.category]}`}>
                          {CAT_LABELS[photo.category]}
                        </span>
                        {!selectMode && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditing(photo); }}
                            className="text-[9px] tracking-wide text-white/20 hover:text-[#A85232] transition-colors px-1"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Upload drawer */}
      <AnimatePresence>
        {showUpload && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40" onClick={() => setShowUpload(false)} />
            <UploadDrawer
              password={password}
              onUploaded={(photos) => { setPhotos(photos); }}
              onClose={() => setShowUpload(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* Edit modal */}
      <AnimatePresence>
        {editing && password && (
          <EditModal
            photo={editing}
            password={password}
            onSaved={(photos) => setPhotos(photos)}
            onClose={() => setEditing(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
