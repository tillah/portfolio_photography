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
  proposals: "bg-rose-900/40 text-rose-300",
  graduations: "bg-blue-900/40 text-blue-300",
  birthdays: "bg-amber-900/40 text-amber-300",
  studio: "bg-violet-900/40 text-violet-300",
};

// ── Login screen ──────────────────────────────────────────────────────────────
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
    if (res.ok) {
      sessionStorage.setItem("admin_pw", pw);
      onLogin(pw);
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1117]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm px-8"
      >
        <p className="font-[var(--font-tenor)] text-2xl text-white mb-1 tracking-wide">Admin Portal</p>
        <p className="font-[var(--font-roboto)] text-xs text-white/40 tracking-widest uppercase mb-8">
          Elara Voss Photography
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Enter password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#A85232] transition-colors"
          />
          {error && (
            <p className="text-[#A85232] text-xs tracking-wide">Incorrect password.</p>
          )}
          <button
            type="submit"
            disabled={loading || !pw}
            className="w-full bg-[#A85232] text-white py-3 text-xs tracking-[0.2em] uppercase font-[var(--font-roboto)] hover:bg-[#8a4228] transition-colors disabled:opacity-40"
          >
            {loading ? "Checking…" : "Enter"}
          </button>
        </form>
        <p className="mt-6 text-center text-white/20 text-[10px] tracking-widest uppercase">
          Default password: <span className="text-white/40">admin123</span>
          <br />Set <code className="text-white/30">ADMIN_PASSWORD</code> env var to change
        </p>
      </motion.div>
    </div>
  );
}

// ── Add-photo panel ───────────────────────────────────────────────────────────
function AddPanel({
  password,
  onAdded,
}: {
  password: string;
  onAdded: (photos: Photo[]) => void;
}) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [category, setCategory] = useState<Category>("proposals");
  const [alt, setAlt] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  };

  const reset = () => {
    setAlt("");
    setUrl("");
    setFile(null);
    setPreview(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let res: Response;
    if (tab === "upload" && file) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("alt", alt);
      fd.append("category", category);
      res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-password": password },
        body: fd,
      });
    } else {
      res = await fetch("/api/admin/photos", {
        method: "POST",
        headers: { "x-admin-password": password, "Content-Type": "application/json" },
        body: JSON.stringify({ src: url, alt, category }),
      });
    }

    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
    } else {
      onAdded(data.photos);
      reset();
    }
  };

  const canSubmit = alt.trim() && (tab === "upload" ? !!file : !!url.trim());

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <p className="font-[var(--font-tenor)] text-lg text-white mb-5">Add Photo</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-white/5 rounded-lg p-1">
        {(["upload", "url"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); reset(); }}
            className={`flex-1 py-2 text-xs tracking-[0.15em] uppercase font-[var(--font-roboto)] rounded-md transition-all ${
              tab === t ? "bg-[#A85232] text-white" : "text-white/40 hover:text-white"
            }`}
          >
            {t === "upload" ? "Upload File" : "Paste URL"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File drop zone */}
        {tab === "upload" && (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg cursor-pointer transition-colors flex flex-col items-center justify-center text-center overflow-hidden ${
              dragging ? "border-[#A85232] bg-[#A85232]/5" : "border-white/10 hover:border-white/25"
            } ${preview ? "h-48" : "h-32"}`}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-70" />
            ) : (
              <div className="py-6">
                <p className="text-2xl mb-2">↑</p>
                <p className="text-xs text-white/40 tracking-wide">Drop image here or click to browse</p>
              </div>
            )}
            {preview && (
              <div className="relative z-10 bg-black/50 px-3 py-1 rounded text-xs text-white/70">
                {file?.name}
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        )}

        {/* URL input */}
        {tab === "url" && (
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-white/40 mb-1.5">Image URL</label>
            <input
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#A85232] transition-colors"
            />
            {url && (
              <div className="mt-2 relative h-32 rounded overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover opacity-70" onError={(e) => (e.currentTarget.style.display = "none")} />
              </div>
            )}
          </div>
        )}

        {/* Alt text */}
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-white/40 mb-1.5">Description / Alt Text</label>
          <input
            type="text"
            placeholder="e.g. Couple at Tower Bridge proposal"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#A85232] transition-colors"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-white/40 mb-1.5">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setCategory(c)}
                className={`py-2 text-xs tracking-wide rounded border transition-all ${
                  category === c
                    ? "border-[#A85232] bg-[#A85232]/15 text-white"
                    : "border-white/10 text-white/40 hover:text-white"
                }`}
              >
                {CAT_LABELS[c]}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-[#A85232] text-xs">{error}</p>}

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="w-full bg-[#A85232] text-white py-3 text-xs tracking-[0.2em] uppercase font-[var(--font-roboto)] hover:bg-[#8a4228] transition-colors disabled:opacity-30 rounded"
        >
          {loading ? "Saving…" : "Add to Gallery"}
        </button>
      </form>
    </div>
  );
}

// ── Photo card ────────────────────────────────────────────────────────────────
function PhotoCard({
  photo,
  onDelete,
  onPreview,
}: {
  photo: Photo;
  onDelete: (id: string) => void;
  onPreview: (photo: Photo) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25 }}
      className="group relative bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-white/20 transition-colors"
    >
      {/* Image */}
      <div
        className="relative aspect-[4/3] cursor-pointer"
        onClick={() => onPreview(photo)}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, 25vw"
          unoptimized={photo.src.startsWith("/uploads/")}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <p className="text-white text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
            Preview
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="p-3">
        <p className="text-white/70 text-xs truncate mb-2">{photo.alt}</p>
        <div className="flex items-center justify-between">
          <span className={`text-[10px] tracking-wide px-2 py-0.5 rounded-full ${CAT_COLOURS[photo.category]}`}>
            {CAT_LABELS[photo.category]}
          </span>

          {confirmDelete ? (
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-[10px] text-white/40 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setDeleting(true);
                  await onDelete(photo.id);
                }}
                disabled={deleting}
                className="text-[10px] text-red-400 hover:text-red-300 transition-colors disabled:opacity-40"
              >
                {deleting ? "…" : "Confirm"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-[10px] text-white/25 hover:text-red-400 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Preview modal ─────────────────────────────────────────────────────────────
function PreviewModal({ photo, onClose }: { photo: Photo | null; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full max-h-[85vh] rounded-xl overflow-hidden"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              width={1200}
              height={900}
              className="w-full h-auto object-contain max-h-[75vh] rounded-xl"
              unoptimized={photo.src.startsWith("/uploads/")}
            />
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-white text-sm">{photo.alt}</p>
                <span className={`text-[10px] tracking-wide px-2 py-0.5 rounded-full ${CAT_COLOURS[photo.category]}`}>
                  {CAT_LABELS[photo.category]}
                </span>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white text-xs tracking-widest uppercase transition-colors">
                Close ✕
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Main admin page ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const [password, setPassword] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [preview, setPreview] = useState<Photo | null>(null);
  const [search, setSearch] = useState("");

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
      .then((r) => r.json())
      .then(setPhotos);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!password) return;
    const res = await fetch(`/api/admin/photos/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    const data = await res.json();
    if (res.ok) setPhotos(data.photos);
  }, [password]);

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
          <span className="text-white/20 text-xs hidden sm:block">Elara Voss Photography</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors border border-white/10 px-3 py-1.5 rounded hover:border-white/30"
          >
            View Site ↗
          </a>
          <button
            onClick={() => { sessionStorage.removeItem("admin_pw"); setPassword(null); }}
            className="text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* Left — gallery */}
        <div>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {([["all", "All"] as const, ...CATEGORIES.map((c) => [c, CAT_LABELS[c]] as const)]).map(
              ([cat, label]) => {
                const count = cat === "all" ? photos.length : photos.filter((p) => p.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`rounded-lg p-4 text-left border transition-all ${
                      filter === cat
                        ? "border-[#A85232] bg-[#A85232]/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <p className="text-2xl font-[var(--font-tenor)] text-white">{count}</p>
                    <p className="text-[10px] tracking-widest uppercase text-white/40 mt-1">{label}</p>
                  </button>
                );
              }
            )}
          </div>

          {/* Search + filter row */}
          <div className="flex items-center gap-3 mb-6">
            <input
              type="search"
              placeholder="Search by description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#A85232] transition-colors"
            />
            <p className="text-white/30 text-xs tracking-wide shrink-0">
              {filtered.length} shown
            </p>
          </div>

          {/* Grid */}
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24 text-white/25 text-sm tracking-wide"
              >
                No photos found
              </motion.div>
            ) : (
              <motion.div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    onDelete={handleDelete}
                    onPreview={setPreview}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right — add panel */}
        <div className="lg:sticky lg:top-24 self-start">
          <AddPanel password={password} onAdded={setPhotos} />
        </div>
      </div>

      <PreviewModal photo={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
