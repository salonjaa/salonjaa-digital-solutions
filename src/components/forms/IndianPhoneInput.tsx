"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/** Reduces whatever is stored (`+91 90408 69749`, `09040869749`, …) to the 10-digit local part. */
function toLocalDigits(value: string | null | undefined) {
  const digits = (value ?? "").replace(/\D/g, "");
  const local = digits.length > 10 ? digits.replace(/^(91|0)+/, "") : digits;
  return local.slice(0, 10);
}

/**
 * Phone input with a fixed, non-editable `+91` — clients are all in India, so
 * the admin only types the 10 digits. A hidden input under `name` submits the
 * full `+91 XXXXXXXXXX` (or "" when empty), so forms read it like any other
 * field, and `waLinkFromPhone` gets a number with the country code.
 */
export function IndianPhoneInput({
  id,
  name,
  defaultValue,
  size = "md",
}: {
  id: string;
  name: string;
  defaultValue?: string | null;
  size?: "sm" | "md";
}) {
  const [digits, setDigits] = useState(() => toLocalDigits(defaultValue));
  const pad = size === "sm" ? "px-3 py-2 text-sm" : "px-4 py-2.5";

  return (
    <div className="flex items-stretch rounded-lg border border-white/10 bg-white/[0.03] transition-colors focus-within:border-cyan">
      <span className={cn("flex items-center border-r border-white/10 text-text-secondary", pad)}>+91</span>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        maxLength={10}
        pattern="[0-9]{10}"
        title="Enter a 10-digit mobile number"
        placeholder="90000 00000"
        value={digits}
        onChange={(e) => setDigits(e.target.value.replace(/\D/g, "").slice(0, 10))}
        className={cn("w-full min-w-0 bg-transparent text-white outline-none placeholder:text-text-muted", pad)}
      />
      <input type="hidden" name={name} value={digits ? `+91 ${digits}` : ""} />
    </div>
  );
}
