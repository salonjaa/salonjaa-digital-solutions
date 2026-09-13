import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";

export const metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-2xl font-semibold text-white">Reset your password</h1>
      <p className="mt-2 text-sm text-text-secondary">Enter your account email and we&apos;ll send you a reset link.</p>
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
