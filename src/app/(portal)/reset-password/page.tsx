import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";

export const metadata = { title: "Set New Password" };

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-2xl font-semibold text-white">Set a new password</h1>
      <div className="mt-8">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
