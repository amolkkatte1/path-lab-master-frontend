import Link from "next/link";
import { notFound } from "next/navigation";

import { updateDoctor } from "@/app/actions";
import { API_ENDPOINTS, parseApiResponse, stringifyApiPayload } from "@/lib/api";

type Doctor = {
  doctorId: number | string;
  doctorName?: string;
  doctorMailId?: string;
  doctorMobileNumber?: number | string;
  shairingPercentage?: number | string;
  labName?: string;
  labId?: number | string;
  educationQulification?: string;
  createdBy?: number | string;
  createdAt?: string;
};

type DoctorApiResponse = { data?: Doctor } | Doctor;

type EditDoctorPageProps = {
  params: Promise<{ doctorId: string }>;
  searchParams: Promise<{ error?: string }>;
};

async function getDoctor(doctorId: string) {
  try {
    const response = await fetch(API_ENDPOINTS.getDoctor, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: stringifyApiPayload({ doctorId }, ["doctorId"]),
      cache: "no-store",
    });

    if (!response.ok) return null;
    const payload = await parseApiResponse<DoctorApiResponse>(response);
    return "doctorId" in payload ? payload : payload.data ?? null;
  } catch {
    return null;
  }
}

const fields = [
  ["doctorName", "Doctor name", "text"],
  ["doctorMailId", "Email address", "email"],
  ["doctorMobileNumber", "Mobile number", "tel"],
  ["shairingPercentage", "Sharing percentage", "number"],
  ["educationQulification", "Education qualification", "text"],
] as const;

export default async function EditDoctorPage({ params, searchParams }: EditDoctorPageProps) {
  const { doctorId } = await params;
  const { error } = await searchParams;
  const doctor = await getDoctor(doctorId);

  if (!doctor) notFound();

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-[20px] border border-white/10 bg-white/10 px-5 py-4 backdrop-blur sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Doctor management</p>
        <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Edit doctor</h1>
      </header>

      {error && <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100">{error === "connection" ? "Unable to connect to the doctor service. Please try again." : `The doctor service rejected the request (status ${error}).`}</div>}

      <form action={updateDoctor} className="rounded-[24px] bg-white p-6 text-slate-900 shadow-[0_22px_60px_rgba(15,23,42,0.14)] sm:p-8">
        <input type="hidden" name="doctorId" value={doctor.doctorId} />
        <input type="hidden" name="createdBy" value={doctor.createdBy ?? ""} />
        <input type="hidden" name="createdAt" value={doctor.createdAt ?? ""} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map(([name, label, type]) => (
            <label key={name} className={name === "educationQulification" ? "sm:col-span-2" : ""}>
              <span className="mb-2 block text-sm font-semibold">{label}</span>
              <input
                name={name}
                type={type}
                defaultValue={String(doctor[name] ?? "")}
                min={name === "shairingPercentage" ? "0" : undefined}
                max={name === "shairingPercentage" ? "100" : undefined}
                step={name === "shairingPercentage" ? "0.01" : undefined}
                required={name === "doctorName" || name === "doctorMailId" || name === "doctorMobileNumber"}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          ))}
          <label><span className="mb-2 block text-sm font-semibold">Lab name</span><input name="labName" defaultValue={doctor.labName ?? ""} required className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
          <label><span className="mb-2 block text-sm font-semibold">Lab ID</span><input name="labId" type="number" defaultValue={String(doctor.labId ?? "")} required className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
        </div>
        <div className="mt-7 flex flex-wrap gap-3"><button type="submit" className="create-action-button rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">Update doctor</button><Link href="/admin/doctors" className="create-action-button rounded-xl bg-slate-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">Cancel</Link></div>
      </form>
    </section>
  );
}
