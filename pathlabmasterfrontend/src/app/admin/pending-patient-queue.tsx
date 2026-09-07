"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { FiChevronRight, FiSearch } from "react-icons/fi";

export type PendingPatient = {
  patientId?: number | string;
  id?: number | string;
  patientName?: string;
  name?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  testName?: string;
  testList?: Array<{ testName?: string; serviceName?: string }>;
  pendingTest?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

function patientName(patient: PendingPatient) {
  return (
    patient.patientName ||
    patient.name ||
    [patient.firstName, patient.middleName, patient.lastName]
      .filter(Boolean)
      .join(" ") ||
    "Unnamed patient"
  );
}

function patientTests(patient: PendingPatient) {
  if (patient.testName) return patient.testName;
  if (patient.testList?.length)
    return patient.testList
      .map((test) => test.testName || test.serviceName || "Test")
      .join(", ");
  if (patient.pendingTest) return Object.keys(patient.pendingTest).join(", ");
  return "Pending test";
}

function patientTime(patient: PendingPatient) {
  const value = patient.createdAt || patient.updatedAt;
  if (!value) return "-";
  const date = new Date(value.replace(" ", "T"));
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function matchesSearch(patient: PendingPatient, query: string) {
  return `${patientName(patient)} ${patient.patientId ?? patient.id ?? ""} ${patientTests(patient)}`
    .toLowerCase()
    .includes(query);
}

function pendingTestsHref(patient: PendingPatient) {
  const patientId = patient.patientId ?? patient.id;
  const params = new URLSearchParams({ patientName: patientName(patient) });
  return `/admin/pending-tests/${patientId}?${params.toString()}`;
}

export function PendingPatientQueue({
  patients,
  error,
}: Readonly<{ patients: PendingPatient[]; error: string | null }>) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const filteredPatients = useMemo(
    () =>
      patients.filter((patient) =>
        matchesSearch(patient, query.trim().toLowerCase()),
      ),
    [patients, query],
  );
  let queueContent: ReactNode;

  if (error) {
    queueContent = <p className="p-5 text-sm text-rose-200">{error}</p>;
  } else if (filteredPatients.length === 0) {
    queueContent = (
      <p className="p-5 text-sm text-slate-400">
        {query
          ? "No patients match your search."
          : "No patients with pending tests today."}
      </p>
    );
  } else {
    queueContent = (
      <div className="dashboard-queue-table-scroll max-w-full overflow-x-auto overflow-y-hidden">
        <table className="dashboard-queue-table w-full min-w-[680px] text-left text-sm">
          <thead className="dashboard-queue-table-head text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Patient</th>
              <th className="px-5 py-3 font-medium">Requested tests</th>
              <th className="px-5 py-3 font-medium">Received</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {filteredPatients.map((patient, index) => (
              <tr
                key={String(patient.patientId ?? patient.id ?? index)}
                onClick={() => {
                  const patientId = patient.patientId ?? patient.id;
                  if (patientId) router.push(pendingTestsHref(patient));
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    const patientId = patient.patientId ?? patient.id;
                      if (patientId) router.push(pendingTestsHref(patient));
                  }
                }}
                tabIndex={patient.patientId ?? patient.id ? 0 : undefined}
                className="dashboard-queue-row transition hover:bg-white/5"
              >
                <td className="px-5 py-4" data-label="Patient">
                  <p className="font-semibold text-white cursor-pointer transition hover:text-emerald-200">
                    {patientName(patient)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {String(patient.patientId ?? patient.id ?? "-")}
                  </p>
                </td>
                <td
                  className="px-5 py-4 text-slate-300"
                  data-label="Requested tests"
                >
                  {patientTests(patient)}
                </td>
                <td className="px-5 py-4 text-slate-400" data-label="Received">
                  {patientTime(patient)}
                </td>
                <td className="px-5 py-4" data-label="Status">
                  <span className="rounded-full bg-sky-400/15 px-2.5 py-1 text-xs font-medium text-sky-300">
                    Pending
                  </span>
                </td>
                <td className="px-5 py-4 text-right" data-label="">
                  <button
                    type="button"
                    aria-label={`Open ${patientName(patient)}`}
                    className="text-slate-400 transition hover:text-white"
                  >
                    <FiChevronRight />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Today&apos;s patient queue
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Samples received at the collection desk
          </p>
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400">
          <FiSearch />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent outline-none placeholder:text-slate-500 sm:w-44"
            placeholder="Search patients"
            aria-label="Search patients"
          />
        </label>
      </div>
      {queueContent}
    </>
  );
}
