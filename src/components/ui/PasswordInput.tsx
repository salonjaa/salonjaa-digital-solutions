"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/icons/AdminIcons";
import { cn } from "@/lib/cn";

/**
 * Drop-in replacement for `<input type="password">` with a show/hide
 * toggle — same props, just renders the eye-icon button inside the field.
 * Used by LoginForm, ResetPasswordForm, and ChangePasswordForm.
 */
export function PasswordInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} className={cn(className, "pr-11")} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        data-cursor-hover
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-white"
      >
        {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
      </button>
    </div>
  );
}
