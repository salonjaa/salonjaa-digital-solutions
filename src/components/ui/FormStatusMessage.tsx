export type FormStatus = "idle" | "pending" | "success" | "error";

export function FormStatusMessage({ status }: { status: FormStatus }) {
  if (status === "success") {
    return (
      <p className="mt-4 rounded-lg border border-emerald/30 bg-emerald/10 px-4 py-3 text-sm font-medium text-emerald">
        Thanks — your message is in. Kumar or Saroj will get back to you shortly.
      </p>
    );
  }
  if (status === "error") {
    return (
      <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
        Something went wrong sending that — please try again, or reach us directly on WhatsApp.
      </p>
    );
  }
  return null;
}
