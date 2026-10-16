"use client";

import Link from "next/link";
import Image from "next/image";
import { useDeferredValue, useState } from "react";

import { getMdDoctorId, getMdDoctorSignatureSource, type MdDoctor } from "./md-doctor-types";

export function MdDoctorsTable({ doctors }: Readonly<{ doctors: MdDoctor[] }>) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const filteredDoctors = doctors.filter((doctor) =>
    [
      doctor.doctorName,
      getMdDoctorId(doctor),
      doctor.doctorMailId,
      doctor.doctorMobileNumber,
      doctor.educationQulification,
      doctor.signPosition,
    ].some((value) => String(value ?? "").toLowerCase().includes(deferredSearch)),
  );

  return (
    <div className="md-doctors-table min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/45">
      <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="md-doctors-heading font-semibold text-white">MD doctors</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="md-doctors-count rounded-full bg-emerald-400/15 px-3 py-1 text-center text-xs font-semibold text-emerald-200">
            Showing {filteredDoctors.length} of {doctors.length}
          </span>
          <label className="md-doctors-search-shell flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <span className="sr-only">Search MD doctors</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search doctors"
              className="md-doctors-search-input min-w-0 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
            />
          </label>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="md-doctors-table-head text-slate-400">
            <tr className="text-xs uppercase tracking-[0.16em]">
              <th className="px-5 py-3 font-semibold">MD Doctor ID</th>
              <th className="px-5 py-3 font-semibold">Doctor</th>
              <th className="px-5 py-3 font-semibold">Contact</th>
              <th className="px-5 py-3 font-semibold">Qualification</th>
              <th className="px-5 py-3 font-semibold">Signature</th>
              <th className="px-5 py-3 font-semibold">Position</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {filteredDoctors.map((doctor) => {
              const mdDoctorId = getMdDoctorId(doctor);
              const signatureSource = getMdDoctorSignatureSource(doctor);
              return (
                <tr key={String(mdDoctorId)} className="md-doctors-row transition hover:bg-white/5">
                <td className="px-5 py-4">
                  {mdDoctorId !== undefined ? (
                    <Link
                      href={`/admin/settings/doctor-sign/edit/${encodeURIComponent(String(mdDoctorId))}`}
                      className="md-doctors-id font-semibold text-emerald-300 transition hover:text-emerald-200 hover:underline"
                    >
                      {String(mdDoctorId)}
                    </Link>
                  ) : (
                    <span className="text-slate-500">-</span>
                  )}
                </td>
                <td className="md-doctors-name px-5 py-4 font-semibold text-white">{doctor.doctorName ?? "-"}</td>
                <td className="md-doctors-cell px-5 py-4 text-slate-300">
                  <p>{doctor.doctorMobileNumber ?? "-"}</p>
                  <p className="mt-1 text-xs text-slate-500">{doctor.doctorMailId ?? "-"}</p>
                </td>
                <td className="md-doctors-cell px-5 py-4 text-slate-300">{doctor.educationQulification ?? "-"}</td>
                <td className="px-5 py-4">
                  <div className="flex h-16 w-32 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white p-2">
                    {signatureSource ? (
                      <Image
                        src={signatureSource}
                        alt={`${doctor.doctorName ?? "Doctor"} signature`}
                        width={112}
                        height={48}
                        unoptimized
                        className="max-h-12 w-auto max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-slate-500">Not uploaded</span>
                    )}
                  </div>
                </td>
                <td className="md-doctors-cell px-5 py-4 text-slate-300">{doctor.signPosition ?? "-"}</td>
                <td className="px-5 py-4">
                  <span className={`md-doctors-status ${doctor.active ? "is-active text-emerald-300" : "is-inactive text-slate-400"}`}>
                    {doctor.active ? "Active" : "Inactive"}
                  </span>
                </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredDoctors.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-300">
            {doctors.length === 0 ? "No MD doctors were found." : "No MD doctors match your search."}
          </p>
        )}
      </div>
    </div>
  );
}
