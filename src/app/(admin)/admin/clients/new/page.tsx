import { NewClientForm } from "@/components/forms/NewClientForm";

export const metadata = { title: "New Client — Admin" };

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">New Client</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Creates their login and, optionally, an initial plan. A welcome email with their password is sent
          automatically.
        </p>
      </div>
      <NewClientForm />
    </div>
  );
}
