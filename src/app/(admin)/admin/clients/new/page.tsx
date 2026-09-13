import { NewClientForm } from "@/components/forms/NewClientForm";

export const metadata = { title: "New Client — Admin" };

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">New Client</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Creates their login and, optionally, an initial plan. You&apos;ll send the password to them yourself
          afterward — there&apos;s no automatic welcome email yet.
        </p>
      </div>
      <NewClientForm />
    </div>
  );
}
