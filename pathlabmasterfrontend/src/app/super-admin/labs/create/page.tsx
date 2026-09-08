import Link from "next/link";

import { createLab } from "@/app/actions";

const fields = [
  ["labName", "Lab name", "text"],
  ["firstName", "First name", "text"],
  ["lastName", "Last name", "text"],
  ["personalMobileNumber", "Personal mobile", "tel"],
  ["workMobileNumber", "Work mobile", "tel"],
  ["mailId", "Email address", "email"],
  ["address", "Address", "text"],
  ["landmark", "Landmark", "text"],
  ["city", "City", "text"],
  ["distirct", "District", "text"],
  ["state", "State", "text"],
  ["country", "Country", "text"],
  ["pincode", "Pincode", "text"],
  ["sbuscriptionStartDate", "Subscription start date", "date"],
  ["sbuscriptionEndDate", "Subscription end date", "date"],
  ["patientCountAlloted", "Patient count allotted", "number"],
] as const;

type CreateLabPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function CreateLabPage({ searchParams }: CreateLabPageProps) {
  const { error } = await searchParams;

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-[20px] border border-emerald-300/20 bg-white/10 px-5 py-3 backdrop-blur sm:px-6 sm:py-4">
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-200">
          Lab Management
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Create Lab
        </h2>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
          {error === "connection"
            ? "Unable to connect to the lab service. Please try again."
            : `The lab service rejected the request (status ${error}).`}
        </div>
      )}

      <form action={createLab} className="rounded-[24px] bg-white p-6 text-slate-900 shadow-[0_22px_60px_rgba(15,23,42,0.14)] sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map(([name, label, type]) => (
            <label key={name} className={name === "address" ? "sm:col-span-2" : ""}>
              <span className="mb-2 block text-sm font-semibold">{label}</span>
              <input name={name} type={type} required className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
            </label>
          ))}
        </div>

        <button type="submit" className="create-action-button mt-7 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
          Create lab
        </button>
        <Link href="/super-admin/labs" className="create-action-button mt-7 ml-3 inline-block rounded-xl bg-gray-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800">
          Cancel
        </Link>
      </form>
    </section>
  );
}
