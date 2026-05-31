"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Photo, Category } from "@/lib/photos";

const CATEGORIES: Category[] = ["proposals", "graduations", "birthdays", "studio"];
const CAT_LABELS: Record<Category, string> = {
  proposals: "Proposals",
  graduations: "Graduations",
  birthdays: "Birthdays",
  studio: "Studio",
};
const CAT_COLOURS: Record<Category, string> = {
  proposals: "bg-rose-900/40 text-rose-300 border-rose-800/40",
  graduations: "bg-blue-900/40 text-blue-300 border-blue-800/40",
  birthdays: "bg-amber-900/40 text-amber-300 border-amber-800/40",
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

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_pw");
    if (stored) {
      fetch("/api/admin/photos", { headers: { "x-admin-password": stored } })
        .then((r) => r.ok ? r.json() : Promise.reject())
        .then((data) => { setPassword(stored); setPhotos(data); })
        .catch(() => sessionStorage.removeItem("admin_pw"));
    }
  }, []);

  const handleLogin = useCallback((pw: string) => {
    setPassword(pw);
    fetch("/api/admin/photos", { headers: { "x-admin-password": pw } })
      .then((r) => r.json()).then(setPhotos);
  }, []);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(filtered.map((p) => p.id)));
  const clearSelection = () => { setSelected(new Set()); setSelectMode(false); };

  const handleDeleteSelected = async () => {
    if (!password || selected.size === 0) return;
    setDeleting(true);
    for (const id of Array.from(selected)) {
      await fetch(`/api/admin/photos/${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": password },
      });
    }
    // Refresh
    const res = await fetch("/api/admin/photos", { headers: { "x-admin-password": password } });
    const data = await res.json();
    setPhotos(data);
    setSelected(new Set());
    setSelectMode(false);
    setDeleting(false);
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
              <button
                onClick={handleDeleteSelected}
                disabled={selected.size === 0 || deleting}
                className="text-[10px] tracking-[0.15em] uppercase bg-red-700 text-white hover:bg-red-600 px-5 py-2 rounded transition-colors disabled:opacity-30"
              >
                {deleting ? "Deleting…" : `Delete ${selected.size > 0 ? `${selected.size} ` : ""}selected`}
              </button>
            </>
          )}
        </div>

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

                    {/* Meta */}
                    <div className="p-2.5">
                      <p className="text-white/60 text-[11px] truncate mb-1.5">{photo.alt}</p>
                      <span className={`text-[9px] tracking-wide px-2 py-0.5 rounded-full border ${CAT_COLOURS[photo.category]}`}>
                        {CAT_LABELS[photo.category]}
                      </span>
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
    </div>
  );
}
