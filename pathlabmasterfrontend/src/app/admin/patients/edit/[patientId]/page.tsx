import Link from "next/link";
import { notFound } from "next/navigation";

import { updatePatient } from "@/app/actions";
import { API_ENDPOINTS, parseApiResponse, stringifyApiPayload } from "@/lib/api";
import { AgeFields } from "../../create/age-fields";

type Patient = {
  patientId: number | string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  mobileNumber?: number | string;
  prefix?: string;
  mailId?: string;
  gender?: string;
  dateOfBirth?: string;
  year?: number | string;
  month?: number | string;
  days?: number | string;
  adharNumber?: number | string;
  labName?: string;
  labId?: number | string;
  createdBy?: number | string;
  createdAt?: string;
};

type PatientApiResponse = { data?: Patient } | Patient;

type EditPatientPageProps = {
  params: Promise<{ patientId: string }>;
  searchParams: Promise<{ error?: string }>;
};

async function getPatient(patientId: string) {
  try {
    const response = await fetch(API_ENDPOINTS.getPatient, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: stringifyApiPayload({ patientId }, ["patientId"]),
      cache: "no-store",
    });

    if (!response.ok) return null;
    const payload = await parseApiResponse<PatientApiResponse>(response);
    return "patientId" in payload ? payload : payload.data ?? null;
  } catch {
    return null;
  }
}

function dateInputValue(dateOfBirth: string) {
  const match = dateOfBirth.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : dateOfBirth;
}

export default async function EditPatientPage({ params, searchParams }: EditPatientPageProps) {
  const { patientId } = await params;
  const { error } = await searchParams;
  const patient = await getPatient(patientId);

  if (!patient) notFound();

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-[20px] border border-white/10 bg-white/10 px-5 py-4 backdrop-blur sm:px-6">
        <Link href="/admin/patients" className="text-sm text-emerald-300 transition hover:text-emerald-200">Back to patients</Link>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Patient management</p>
        <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Edit patient</h1>
      </header>

      {error && <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100">{error === "connection" ? "Unable to connect to the patient service. Please try again." : `The patient service rejected the request (status ${error}).`}</div>}

      <form action={updatePatient} className="rounded-[24px] bg-white p-6 text-slate-900 shadow-[0_22px_60px_rgba(15,23,42,0.14)] sm:p-8">
        <input type="hidden" name="patientId" value={patient.patientId} />
        <input type="hidden" name="createdBy" value={patient.createdBy ?? ""} />
        <input type="hidden" name="createdAt" value={patient.createdAt ?? ""} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(["firstName", "middleName", "lastName", "mobileNumber", "mailId"] as const).map((name) => (
            <label key={name}>
              <span className="mb-2 block text-sm font-semibold">{name === "mailId" ? "Email address" : name === "mobileNumber" ? "Mobile number" : name.replace(/([A-Z])/g, " $1")}</span>
              <input name={name} type={name === "mailId" ? "email" : name === "mobileNumber" ? "tel" : "text"} defaultValue={String(patient[name] ?? "")} required className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
            </label>
          ))}
          <label>
            <span className="mb-2 block text-sm font-semibold">Prefix</span>
            <select name="prefix" defaultValue={patient.prefix ?? "Mr."} required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"><option>Mr.</option><option>Ms.</option><option>Mrs.</option><option>Dr.</option></select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold">Gender</span>
            <select name="gender" defaultValue={patient.gender ?? ""} required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"><option value="">Select gender</option><option>Male</option><option>Female</option><option>Other</option></select>
          </label>
          <AgeFields initialDateOfBirth={dateInputValue(patient.dateOfBirth ?? "")} initialAge={{ years: Number(patient.year ?? 0), months: Number(patient.month ?? 0), days: Number(patient.days ?? 0) }} />
          <label><span className="mb-2 block text-sm font-semibold">Aadhaar number</span><input name="adharNumber" type="number" defaultValue={String(patient.adharNumber ?? "")} required className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
          <label><span className="mb-2 block text-sm font-semibold">Lab name</span><input name="labName" type="text" defaultValue={patient.labName ?? ""} required className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
          <label><span className="mb-2 block text-sm font-semibold">Lab ID</span><input name="labId" type="number" defaultValue={String(patient.labId ?? "")} required className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
        </div>
        <div className="mt-7 flex flex-wrap gap-3"><button type="submit" className="create-action-button rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">Update patient</button><Link href="/admin/patients" className="create-action-button rounded-xl bg-slate-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">Cancel</Link></div>
      </form>
    </section>
  );
}
