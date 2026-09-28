"use client";

import { useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiCheckCircle, FiClock } from "react-icons/fi";
import type { ReportViewData } from "@/app/actions";
import { PendingTestsEditor, type PendingParameter, type ReportData } from "@/app/admin/pending-tests/pending-tests-editor";

function toTestGroups(tests: Record<string, PendingParameter[]>) {
  return Object.entries(tests).map(([key, parameters]) => ({
    key,
    code: key.replace(/_\d+$/, ""),
    category:
      parameters.find((parameter) => parameter.sequence === 1)?.parameterName ||
      parameters.find((parameter) => parameter.sequence === 1)?.value?.trim() ||
      "",
    parameters,
  }));
}

export default function PatientReportTests({ report, currentUserId }: Readonly<{ report: ReportViewData; currentUserId: string }>) {
  const [activeTab, setActiveTab] = useState<"completed" | "pending">("completed");
  const tests = activeTab === "completed" ? report.completedTests : report.pendingTests;
  const reportData: ReportData = {
    reportId: report.reportId,
    patientId: report.patientId,
    labId: report.labId,
    pendingTest: report.pendingTests,
    completedTest: report.completedTests,
    createdBy: report.createdBy,
    updatedBy: report.updatedBy,
    createdAt: report.reportCreatedAt,
    updatedAt: report.reportCreatedAt,
    status: report.status,
  };

  return (
    <main className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:px-6 lg:py-0">
      {/* <Link href="/admin/reports" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-500">
        <FiArrowLeft /> Back to Reports
      </Link> */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <header className="border-b border-slate-200 px-5 py-5 dark:border-slate-700 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">PathLab Reports</p>
          <h1 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{report.patientName || `Patient ${report.patientId}`}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Patient ID: {report.patientId}{report.reportId ? ` · Report ID: ${report.reportId}` : ""}</p>
        </header>

        <div className="border-b border-slate-200 px-5 dark:border-slate-700 sm:px-6">
          <div className="flex gap-6" role="tablist" aria-label="Report test status">
            {([
              { id: "completed", label: "Completed", count: Object.keys(report.completedTests).length, icon: FiCheckCircle },
              { id: "pending", label: "Pending", count: Object.keys(report.pendingTests).length, icon: FiClock },
            ] as const).map(({ id, label, count, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activeTab === id}
                onClick={() => setActiveTab(id)}
                className={`inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-semibold transition ${activeTab === id ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
              >
                <Icon className="h-4 w-4" /> {label}
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">{count}</span>
              </button>
            ))}
          </div>
        </div>

        <div role="tabpanel">
          {Object.keys(tests).length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700">No {activeTab} tests for this report.</p>
          ) : (
            <PendingTestsEditor
              key={activeTab}
              tests={toTestGroups(tests)}
              reportData={reportData}
              currentUserId={currentUserId}
              labName={report.labName}
              patientInfo={{
                patientName: report.patientName,
                gender: report.gender,
                age: report.age,
                doctorName: report.doctorName,
                createdAt: report.patientCreatedAt,
              }}
              reportTopSpace={report.reportTopSpace}
              reportBottomSpace={report.reportBottomSpace}
            />
          )}
        </div>
      </section>
    </main>
  );
}
