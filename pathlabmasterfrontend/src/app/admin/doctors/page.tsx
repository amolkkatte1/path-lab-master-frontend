import Link from "next/link";
import { FiPlus, FiUserCheck } from "react-icons/fi";

import { getDoctorListByLabId, parseApiResponse } from "@/lib/api";
import { requireUserType } from "@/lib/auth";

import { DoctorsTable, type Doctor } from "./doctors-table";

type DoctorApiResponse = {
  data?: Doctor[];
};

async function getDoctors() {
  const currentUser = await requireUserType("Administrator");

  try {
    const response = await fetch(getDoctorListByLabId(currentUser.labId), {
      cache: "no-store",
    });

    if (!response.ok) {
      return { doctors: [], error: `The doctor service returned ${response.status}.` };
    }

    const payload = await parseApiResponse<DoctorApiResponse>(response);
    return { doctors: payload.data ?? [], error: null };
  } catch {
    return { doctors: [], error: "Unable to connect to the doctor service. Please try again." };
  }
}

export default async function DoctorsPage() {
  const { doctors, error } = await getDoctors();

  return (
    <section className="mx-auto min-w-0 max-w-7xl space-y-6">
      <header className="rounded-[20px] border border-white/10 bg-white/10 px-5 py-4 backdrop-blur sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
              <FiUserCheck />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Doctor directory</p>
              <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">All doctors</h1>
            </div>
          </div>
          <Link href="/admin/doctors/create" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400"><FiPlus /> Add doctor</Link>
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-5 text-sm text-rose-100">{error}</div>
      ) : doctors.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/8 p-8 text-center text-sm text-slate-300">No doctors were found.</div>
      ) : (
        <DoctorsTable doctors={doctors} />
      )}
    </section>
  );
}
