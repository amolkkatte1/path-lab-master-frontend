import Link from "next/link";

import { createPatient } from "@/app/actions";
import { getDoctorListByLabId, parseApiResponse } from "@/lib/api";
import { requireUserType } from "@/lib/auth";
import { AgeFields } from "./age-fields";
import { DoctorSelector, type DoctorOption } from "../doctor-selector";

const fields = [
  ["firstName", "First name", "text"],
  ["middleName", "Middle name", "text"],
  ["lastName", "Last name", "text"],
  ["mobileNumber", "Mobile number", "tel"],
  ["mailId", "Email address", "email"],
] as const;

type CreatePatientPageProps = {
  searchParams: Promise<{ error?: string }>;
};

type DoctorApiResponse = DoctorOption[] | { data?: DoctorOption[] };

export default async function CreatePatientPage({ searchParams }: CreatePatientPageProps) {
  const user = await requireUserType("Administrator");
  const { error } = await searchParams;

  let doctors: DoctorOption[] = [];

  try {
    const response = await fetch(getDoctorListByLabId(user.labId), {
      cache: "no-store",
    });

    if (response.ok) {
      const payload = await parseApiResponse<DoctorApiResponse>(response);
      doctors = Array.isArray(payload) ? payload : payload.data ?? [];
    }
  } catch {
    doctors = [];
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-[20px] border border-white/10 bg-white/10 px-5 py-4 backdrop-blur sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Patient management</p>
        <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Add patient</h1>
      </header>

      {error && (
        <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100">
          {error === "connection" ? "Unable to connect to the patient service. Please try again." : `The patient service rejected the request (status ${error}).`}
        </div>
      )}

      <form action={createPatient} className="rounded-[24px] bg-white p-6 text-slate-900 shadow-[0_22px_60px_rgba(15,23,42,0.14)] sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Prefix <span className="text-red-500">*</span>
            </span>
            <select name="prefix" defaultValue="Mr." required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
              <option>Mr.</option>
              <option>Ms.</option>
              <option>Mrs.</option>
              <option>Dr.</option>
            </select>
          </label>
          {fields.map(([name, label, type]) => (
            <label key={name}>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
                {name === "firstName" && <span className="text-red-500"> *</span>}
              </span>
              <input
                name={name}
                type={type}
                required={name === "firstName"}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          ))}
          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Gender <span className="text-red-500">*</span>
            </span>
            <select name="gender" required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
              <option value="">Select gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </label>
          <AgeFields />
          <DoctorSelector
            initialDoctors={doctors}
            currentLabId={user.labId}
            currentLabName={user.labName}
            currentUserId={user.userId}
          />
          <label>
            <span className="mb-2 block text-sm font-semibold">Aadhaar number</span>
            <input name="adharNumber" type="number" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          </label>
          <label hidden>
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Lab name <span className="text-red-500">*</span>
            </span>
            <input name="labName" defaultValue={user.labName} required className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          </label>
          <label hidden>
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Lab ID <span className="text-red-500">*</span>
            </span>
            <input name="labId" type="number" defaultValue={String(user.labId)} required className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          </label>
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <button type="submit" className="create-action-button rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">Create patient</button>
          <Link href="/admin/patients" className="create-action-button rounded-xl bg-slate-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">Cancel</Link>
        </div>
      </form>
    </section>
  );
}
