import { ChangePasswordForm } from "@/components/forms/ChangePasswordForm";

export const metadata = { title: "Settings — Admin" };

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-white">Settings</h1>
      <ChangePasswordForm />
    </div>
  );
}
