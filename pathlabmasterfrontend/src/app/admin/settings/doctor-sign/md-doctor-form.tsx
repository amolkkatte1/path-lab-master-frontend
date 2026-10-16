import Link from "next/link";

import { getMdDoctorSignatureSource, type MdDoctor } from "./md-doctor-types";
import { SignatureUploadField } from "./signature-upload-field";

type MdDoctorFormProps = {
  action: (formData: FormData) => Promise<void>;
  doctor?: MdDoctor;
  error?: string;
  labName: string;
  labId: number | string;
};

function errorMessage(error: string) {
  if (error === "connection") return "Unable to connect to the MD doctor service. Please try again.";
  if (error === "invalid") return "Complete all required fields with valid values before saving.";
  if (error === "signature-preserve") return "The existing signature could not be preserved. Please choose the signature image again before saving.";
  return `The MD doctor service rejected the request (status ${error}).`;
}

export function MdDoctorForm({ action, doctor, error, labName, labId }: Readonly<MdDoctorFormProps>) {
  const editing = Boolean(doctor);
  const signatureSource = doctor ? getMdDoctorSignatureSource(doctor) : null;

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-[20px] border border-white/10 bg-white/10 px-5 py-3 backdrop-blur sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Doctor sign management</p>
        <h1 className="mt-1 text-xl font-semibold text-white">{editing ? "Edit MD doctor" : "Add MD doctor"}</h1>
      </header>

      {error && (
        <div role="alert" className="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100">
          {errorMessage(error)}
        </div>
      )}

      <form
        action={action}
        className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200 sm:p-6"
      >
        {doctor && (
          <>
            <input type="hidden" name="mdDoctorId" value={doctor.mdDoctorId ?? doctor.doctorId ?? ""} />
            <input type="hidden" name="createdBy" value={doctor.createdBy ?? ""} />
            <input type="hidden" name="signUrl" value={doctor.signUrl ?? ""} />
            <input type="hidden" name="existingSignImage" value={JSON.stringify(doctor.signImage ?? null)} />
          </>
        )}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-300">Doctor name <span className="text-red-500">*</span></span>
            <input name="doctorName" defaultValue={doctor?.doctorName ?? ""} required className="patient-filter-input w-full rounded-lg border px-3 py-2.5" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-300">Email address <span className="text-red-500">*</span></span>
            <input name="doctorMailId" type="email" defaultValue={doctor?.doctorMailId ?? ""} required className="patient-filter-input w-full rounded-lg border px-3 py-2.5" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-300">Mobile number <span className="text-red-500">*</span></span>
            <input name="doctorMobileNumber" type="tel" inputMode="numeric" defaultValue={doctor?.doctorMobileNumber ?? ""} required className="patient-filter-input w-full rounded-lg border px-3 py-2.5" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-300">Education qualification</span>
            <input name="educationQulification" defaultValue={doctor?.educationQulification ?? ""} className="patient-filter-input w-full rounded-lg border px-3 py-2.5" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-300">Signature position <span className="text-red-500">*</span></span>
            <input name="signPosition" type="number" min="1" defaultValue={doctor?.signPosition ?? "1"} required className="patient-filter-input w-full rounded-lg border px-3 py-2.5" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-300">Status</span>
            <select name="isActive" defaultValue={(doctor?.active ?? doctor?.isActive) === false ? "false" : "true"} className="patient-filter-input w-full rounded-lg border px-3 py-2.5">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
          <SignatureUploadField
            currentSignature={signatureSource}
            doctorName={doctor?.doctorName}
            required={!editing}
          />
          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-300">Lab name</span>
            <input value={doctor?.labName ?? labName} readOnly className="patient-filter-input w-full cursor-not-allowed rounded-lg border px-3 py-2.5 opacity-70" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-300">Lab ID</span>
            <input value={String(doctor?.labId ?? labId)} readOnly className="patient-filter-input w-full cursor-not-allowed rounded-lg border px-3 py-2.5 opacity-70" />
          </label>
        </div>
        <div className="flex flex-wrap justify-end gap-3 border-t border-white/10 pt-4">
          <Link href="/admin/settings/doctor-sign" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10">
            Cancel
          </Link>
          <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400">
            {editing ? "Update MD doctor" : "Create MD doctor"}
          </button>
        </div>
      </form>
    </section>
  );
}
