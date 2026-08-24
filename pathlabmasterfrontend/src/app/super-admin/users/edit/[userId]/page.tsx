import Link from "next/link";
import { notFound } from "next/navigation";

import { updateUser } from "@/app/actions";
import {
  API_ENDPOINTS,
  parseApiResponse,
  stringifyApiPayload,
} from "@/lib/api";

type ApiUser = {
  userId: number | string;
  firstName?: string;
  lastName?: string;
  personalMobileNumber?: number | string;
  workMobileNumber?: number | string;
  mailId?: string;
  address?: string;
  landmark?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  pincode?: number | string;
  labName?: string;
  labId?: number | string;
  userTypeId?: number | string;
  userName?: string;
  userTypeName?: string;
  createdAt?: string;
  createdBy?: number | string;
};

type GetUserApiResponse = ApiUser | { data?: ApiUser };

type EditUserPageProps = {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ error?: string }>;
};

async function getUser(userId: string) {
  let response: Response;

  try {
    response = await fetch(API_ENDPOINTS.getUser, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: stringifyApiPayload({ userId }, ["userId"]),
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const payload = await parseApiResponse<GetUserApiResponse>(response);
  return "userId" in payload ? payload : payload.data ?? null;
}

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
] as const;

export default async function EditUserPage({
  params,
  searchParams,
}: EditUserPageProps) {
  const { userId } = await params;
  const { error } = await searchParams;
  const user = await getUser(userId);

  if (!user) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-[20px] border border-sky-300/20 bg-white/10 px-5 py-3 backdrop-blur sm:px-6 sm:py-4">
        {/* <Link href="/super-admin/users" className="text-sm text-sky-200 hover:text-white">
          ← Back to users
        </Link> */}
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.28em] text-sky-200">
          User Management
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Edit User
        </h2>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
          {error === "connection"
            ? "Unable to connect to the user service. Please try again."
            : `The user service rejected the request (status ${error}).`}
        </div>
      )}

      <form action={updateUser} className="rounded-[24px] bg-white p-6 text-slate-900 shadow-[0_22px_60px_rgba(15,23,42,0.14)] sm:p-8">
        <input type="hidden" name="userId" value={user.userId} />
        <input type="hidden" name="createdAt" value={user.createdAt ?? ""} />
        <input type="hidden" name="createdBy" value={user.createdBy ?? ""} />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map(([name, label, type]) => (
            <label key={name} className={name === "address" ? "sm:col-span-2" : ""}>
              <span className="mb-2 block text-sm font-semibold">{label}</span>
              <input
                name={name}
                type={type}
                defaultValue={String(user[name as keyof ApiUser] ?? "")}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </label>
          ))}

          <label>
            <span className="mb-2 block text-sm font-semibold">New password</span>
            <input name="password" type="password" required className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold">User role</span>
            <select name="userTypeName" defaultValue={user.userTypeName ?? "Administrator"} required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100">
              <option value="Administrator">Administrator</option>
              <option value="SuperAdmin">SuperAdmin</option>
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold">Role ID</span>
            <input name="userTypeId" type="text" defaultValue={String(user.userTypeId ?? "2")} required className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
          </label>
        </div>

        <button type="submit" className="mt-7 rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
          Update user
        </button>
        <Link href="/super-admin/users" className="mt-7 ml-3 rounded-xl bg-gray-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800">
          Cancel
        </Link>
      </form>
    </section>
  );
}
