import Link from "next/link";

import { createUser } from "@/app/actions";

const fields = [
  ["firstName", "First name", "text"],
  ["lastName", "Last name", "text"],
  ["personalMobileNumber", "Personal mobile", "tel"],
  ["workMobileNumber", "Work mobile", "tel"],
  ["mailId", "Email address", "email"],
  ["address", "Address", "text"],
  ["landmark", "Landmark", "text"],
  ["city", "City", "text"],
  ["district", "District", "text"],
  ["state", "State", "text"],
  ["country", "Country", "text"],
  ["pincode", "Pincode", "text"],
  ["labName", "Lab name", "text"],
  ["labId", "Lab ID", "text"],
  ["userName", "Username", "text"],
  ["password", "Password", "password"],
] as const;

type CreateUserPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function CreateUserPage({ searchParams }: CreateUserPageProps) {
  const { error } = await searchParams;

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-[20px] border border-emerald-300/20 bg-white/10 px-5 py-3 backdrop-blur sm:px-6 sm:py-4">
        <Link href="/super-admin/users" className="text-sm text-sky-200 hover:text-white">
          ← Back to users
        </Link>
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-200">
          User Management
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Create User
        </h2>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
          {error === "connection"
            ? "Unable to connect to the user service. Please try again."
            : `The user service rejected the request (status ${error}).`}
        </div>
      )}

      <form action={createUser} className="rounded-[24px] bg-white p-6 text-slate-900 shadow-[0_22px_60px_rgba(15,23,42,0.14)] sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map(([name, label, type]) => (
            <label key={name} className={name === "address" ? "sm:col-span-2" : ""}>
              <span className="mb-2 block text-sm font-semibold">{label}</span>
              <input name={name} type={type} required className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
            </label>
          ))}

          <label>
            <span className="mb-2 block text-sm font-semibold">User role</span>
            <select name="userTypeName" required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100">
              <option value="Administrator">Administrator</option>
              <option value="SuperAdmin">SuperAdmin</option>
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold">Role ID</span>
            <input name="userTypeId" type="text" defaultValue="2" required className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
          </label>
        </div>

        <button type="submit" className="mt-7 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
          Create user
        </button>
      </form>
    </section>
  );
}
