import Link from "next/link";
import { FiPlus, FiUsers } from "react-icons/fi";

import { getPatientListByLabId, parseApiResponse } from "@/lib/api";
import { requireUserType } from "@/lib/auth";
import { PatientsTable, type Patient } from "./patients-table";

type PatientApiResponse = {
  data?: Patient[];
};

async function getPatients() {
  const currentUser = await requireUserType("Administrator");

  try {
    const response = await fetch(getPatientListByLabId(currentUser.labId), {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        patients: [],
        error: `The patient service returned ${response.status}.`,
      };
    }

    const payload = await parseApiResponse<PatientApiResponse>(response);
    return { patients: payload.data ?? [], error: null };
  } catch {
    return {
      patients: [],
      error: "Unable to connect to the patient service. Please try again.",
    };
  }
}

export default async function PatientsPage() {
  const { patients, error } = await getPatients();

  return (
    <section className="mx-auto min-w-0 max-w-7xl space-y-6">
      <header className="rounded-[20px] border border-white/10 bg-white/10 px-5 py-4 backdrop-blur sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                <FiUsers />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
                  Patient directory
                </p>
                <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                  All patients
                </h1>
              </div>
            </div>
          </div>
          <Link
            href="/admin/patients/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400"
          >
            <FiPlus /> Add patient
          </Link>
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-5 text-sm text-rose-100">
          {error}
        </div>
      ) : patients.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/8 p-8 text-center text-sm text-slate-300">
          No patients were found.
        </div>
      ) : (
        <PatientsTable patients={patients} />
      )}
    </section>
  );
}
