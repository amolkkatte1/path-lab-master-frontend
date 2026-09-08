import Link from "next/link";
import { notFound } from "next/navigation";

import { updateLab } from "@/app/actions";
import { API_ENDPOINTS, parseApiResponse, stringifyApiPayload } from "@/lib/api";

type ApiLab = {
  labId?: number | string;
  labName?: string;
  firstName?: string;
  lastName?: string;
  personalMobileNumber?: number | string;
  workMobileNumber?: number | string;
  mailId?: string;
  address?: string;
  landmark?: string;
  city?: string;
  distirct?: string;
  state?: string;
  country?: string;
  pincode?: number | string;
  sbuscriptionStartDate?: string;
  sbuscriptionEndDate?: string;
  patientCountAlloted?: number | string;
  createdBy?: number | string;
  updatedBy?: number | string;
  createdAt?: string;
  updatedAt?: string;
};

type GetLabApiResponse =
  | ApiLab
  | { data?: ApiLab | ApiLab[]; result?: ApiLab | ApiLab[]; lab?: ApiLab | ApiLab[] };

type EditLabPageProps = {
  params: Promise<{ labId: string }>;
  searchParams: Promise<{ error?: string }>;
};

function normalizeSingleLab(payload: GetLabApiResponse | null | undefined): ApiLab | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if ("labId" in payload) {
    return payload as ApiLab;
  }

  const candidate =
    "data" in payload
      ? payload.data
      : "result" in payload
        ? payload.result
        : "lab" in payload
          ? payload.lab
          : undefined;

  if (!candidate) {
    return null;
  }

  if (Array.isArray(candidate)) {
    return candidate[0] ?? null;
  }

  if (typeof candidate === "object" && "labId" in candidate) {
    return candidate as ApiLab;
  }

  return null;
}

async function getLab(labId: string) {
  let response: Response;

  try {
    response = await fetch(API_ENDPOINTS.getLab, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: stringifyApiPayload({ labId }, ["labId"]),
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const payload = await parseApiResponse<GetLabApiResponse>(response);
  return normalizeSingleLab(payload);
}

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

export default async function EditLabPage({ params, searchParams }: EditLabPageProps) {
  const { labId } = await params;
  const { error } = await searchParams;
  const lab = await getLab(labId);

  if (!lab) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-[20px] border border-sky-300/20 bg-white/10 px-5 py-3 backdrop-blur sm:px-6 sm:py-4">
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.28em] text-sky-200">
          Lab Management
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Edit Lab
        </h2>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
          {error === "connection"
            ? "Unable to connect to the lab service. Please try again."
            : `The lab service rejected the request (status ${error}).`}
        </div>
      )}

      <form action={updateLab} className="rounded-[24px] bg-white p-6 text-slate-900 shadow-[0_22px_60px_rgba(15,23,42,0.14)] sm:p-8">
        <input type="hidden" name="labId" value={lab.labId ?? labId} />
        <input type="hidden" name="createdAt" value={lab.createdAt ?? ""} />
        <input type="hidden" name="createdBy" value={lab.createdBy ?? ""} />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map(([name, label, type]) => (
            <label key={name} className={name === "address" ? "sm:col-span-2" : ""}>
              <span className="mb-2 block text-sm font-semibold">{label}</span>
              <input
                name={name}
                type={type}
                defaultValue={String(lab[name as keyof ApiLab] ?? "")}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </label>
          ))}
        </div>

        <button type="submit" className="mt-7 rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
          Update lab
        </button>
        <Link href="/super-admin/labs" className="mt-7 ml-3 rounded-xl bg-gray-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800">
          Cancel
        </Link>
      </form>
    </section>
  );
}
