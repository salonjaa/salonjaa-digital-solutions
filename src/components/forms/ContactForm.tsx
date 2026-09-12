"use client";

import { useState, type FormEvent } from "react";
import { contact } from "@/content/contact";
import { GradientButton } from "@/components/ui/GradientButton";
import { FormStatusMessage, type FormStatus } from "@/components/ui/FormStatusMessage";

const inputClasses =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white outline-none transition-colors focus:border-cyan placeholder:text-text-muted";

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("pending");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-glass space-y-4 p-6 sm:p-8">
      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-white">
          Name
        </label>
        <input id="contact-name" name="name" type="text" required className={inputClasses} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-phone" className="mb-1.5 block text-sm font-medium text-white">
            Phone <span className="text-text-muted">(optional)</span>
          </label>
          <input id="contact-phone" name="phone" type="tel" className={inputClasses} />
        </div>
        <div>
          <label htmlFor="contact-project-type" className="mb-1.5 block text-sm font-medium text-white">
            Project Type
          </label>
          <select id="contact-project-type" name="projectType" defaultValue="" className={inputClasses}>
            <option value="" disabled>
              Select one
            </option>
            {contact.projectTypes.map((type) => (
              <option key={type} value={type} className="bg-surface text-white">
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-white">
          Message
        </label>
        <textarea id="contact-message" name="message" rows={4} required className={inputClasses} />
      </div>
      {/* Honeypot — hidden from real visitors, catches bots */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <GradientButton type="submit" size="lg" disabled={status === "pending"} className="w-full disabled:opacity-60">
        {status === "pending" ? "Sending…" : "Send Message"}
      </GradientButton>
      <FormStatusMessage status={status} />
    </form>
  );
}
