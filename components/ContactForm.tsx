"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

const eventTypes = [
  "Proposal Photography",
  "Graduation Shoot",
  "Event / Event Photography",
  "Studio Portrait Session",
  "Other",
];

export default function ContactForm() {
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get("service") || "";

  const serviceMap: Record<string, string> = {
    proposals: "Proposal Photography",
    graduations: "Graduation Shoot",
    events: "Event Photography",
    studio: "Studio Portrait Session",
  };

  const [form, setForm] = useState({
    name: "",
    email: "",
    eventType: serviceMap[serviceParam] || "",
    date: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  const inputClass =
    "w-full bg-transparent border-b border-[#B8A898] py-3 font-[var(--font-roboto)] text-sm text-[#1C2A5A] placeholder-[#B8A898] focus:outline-none focus:border-[#1C2A5A] transition-colors tracking-wide";
  const labelClass =
    "block font-[var(--font-roboto)] text-[10px] tracking-[0.2em] uppercase text-[#A85232] mb-2";

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-start justify-center h-full py-12"
      >
        <div className="w-12 h-px bg-[#1C2A5A] mb-8" />
        <h2 className="font-[var(--font-tenor)] text-4xl font-light text-[#1C2A5A] mb-4">
          Thank you, {form.name.split(" ")[0]}.
        </h2>
        <p className="font-[var(--font-roboto)] text-sm text-[#624332] leading-relaxed tracking-wide max-w-sm">
          Your message has been received. I&apos;ll be in touch within 48 hours
          to discuss your session. I&apos;m looking forward to hearing more
          about your story.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label htmlFor="name" className={labelClass}>
          Your Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Jane Smith"
          value={form.name}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="jane@example.com"
          value={form.email}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="eventType" className={labelClass}>
          Type of Session
        </label>
        <select
          id="eventType"
          name="eventType"
          required
          value={form.eventType}
          onChange={handleChange}
          className={`${inputClass} appearance-none bg-transparent cursor-pointer`}
        >
          <option value="" disabled>
            Select a session type
          </option>
          {eventTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="date" className={labelClass}>
          Approximate Date (if known)
        </label>
        <input
          id="date"
          name="date"
          type="text"
          placeholder="e.g. July 2025, or I&apos;m flexible"
          value={form.date}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Tell me about your occasion
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Share any details about your event, location ideas, or what you&apos;re hoping to capture..."
          value={form.message}
          onChange={handleChange}
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="font-[var(--font-roboto)] text-[11px] tracking-[0.2em] uppercase bg-[#1C2A5A] text-white px-10 py-4 hover:bg-[#2A3D7A] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Sending..." : "Send Enquiry"}
      </button>
    </form>
  );
}
