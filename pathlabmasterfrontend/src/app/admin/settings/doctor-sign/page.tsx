import "server-only";

import Link from "next/link";
import { FiPlus, FiUserCheck } from "react-icons/fi";

import { getMdDoctorListByLabId, parseApiResponse } from "@/lib/api";
import { requireUserType } from "@/lib/auth";

import { MdDoctorsTable } from "./md-doctors-table";
import { resolveMdDoctorList, type MdDoctor, type MdDoctorListResponse } from "./md-doctor-types";

type DoctorSignPageProps = {
  searchParams: Promise<{ updated?: string }>;
};

export default async function DoctorSignPage({ searchParams }: DoctorSignPageProps) {
  const user = await requireUserType("Administrator");
  const { updated } = await searchParams;
  let doctors: MdDoctor[] = [];
  let error: string | null = null;

  try {
    const response = await fetch(getMdDoctorListByLabId(user.labId), { cache: "no-store" });
    if (!response.ok) {
      error = `The MD doctor service returned ${response.status}.`;
    } else {
      const payload = await parseApiResponse<MdDoctorListResponse>(response);
      doctors = resolveMdDoctorList(payload);
    }
  } catch {
    error = "Unable to connect to the MD doctor service. Please try again.";
  }

  return (
    <section className="mx-auto min-w-0 max-w-7xl space-y-6">
      <header className="rounded-[20px] border border-white/10 bg-white/10 px-5 py-4 backdrop-blur sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300"><FiUserCheck /></div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Doctor sign management</p>
              <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">MD doctors</h1>
            </div>
          </div>
          <Link href="/admin/settings/doctor-sign/create" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400"><FiPlus /> Add MD doctor</Link>
        </div>
      </header>

      {updated && !error && <div role="status" className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">MD doctor saved successfully.</div>}
      {error ? (
        <div role="alert" className="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-5 text-sm text-rose-100">{error}</div>
      ) : (
        <MdDoctorsTable doctors={doctors} />
      )}
    </section>
  );
}
