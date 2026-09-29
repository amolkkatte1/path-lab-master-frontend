"use client";

import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { AgeFields } from "@/app/admin/patients/create/age-fields";
import { DoctorSelector, type DoctorOption } from "@/app/admin/patients/doctor-selector";
import { updatePatientClient } from "@/app/actions";
import {
  API_ENDPOINTS,
  getDoctorListByLabId,
  parseApiResponse,
  stringifyApiPayload,
} from "@/lib/api";

type PatientData = {
  patientId: string | number;
  prefix?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  mobileNumber?: string | number;
  mailId?: string;
  gender?: string;
  dateOfBirth?: string;
  year?: number | string;
  month?: number | string;
  days?: number | string;
  adharNumber?: string | number;
  labName?: string;
  labId?: string | number;
  createdBy?: string | number;
  createdAt?: string;
  doctorId?: string | number;
  doctorName?: string;
};

type Props = {
  patientId: string;
  labId: string;
  labName: string;
  currentUserId: string;
  onClose: () => void;
  onSaved: () => void;
};

const TEXT_FIELDS = [
  ["firstName", "First name", "text", true],
  ["middleName", "Middle name", "text", false],
  ["lastName", "Last name", "text", false],
  ["mobileNumber", "Mobile number", "tel", false],
  ["mailId", "Email address", "email", false],
] as const;

function dateToInput(raw: string | undefined) {
  if (!raw) return "";
  const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : raw;
}

export function EditPatientDialog({ patientId, labId, labName, currentUserId, onClose, onSaved }: Props) {
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [patientRes, doctorRes] = await Promise.all([
          fetch(API_ENDPOINTS.getPatient, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: stringifyApiPayload({ patientId }, ["patientId"]),
            cache: "no-store",
          }),
          fetch(getDoctorListByLabId(labId), { cache: "no-store" }),
        ]);

        const patientPayload = await parseApiResponse<{ data?: PatientData } | PatientData>(patientRes);
        const patientData = "patientId" in patientPayload
          ? patientPayload as PatientData
          : (patientPayload as { data?: PatientData }).data ?? null;

        const doctorPayload = await parseApiResponse<DoctorOption[] | { data?: DoctorOption[] }>(doctorRes);
        const doctorData = Array.isArray(doctorPayload) ? doctorPayload : doctorPayload.data ?? [];

        setPatient(patientData);
        setDoctors(doctorData);
      } catch {
        setError("Failed to load patient data.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [patientId, labId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!patient) return;
    setSaving(true);
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const val = (name: string) => String(fd.get(name) ?? "").trim();

    const result = await updatePatientClient({
      patientId: String(patient.patientId),
      prefix: val("prefix"),
      firstName: val("firstName"),
      middleName: val("middleName"),
      lastName: val("lastName"),
      mobileNumber: val("mobileNumber"),
      mailId: val("mailId"),
      gender: val("gender"),
      dateOfBirth: val("dateOfBirth"),
      doctorId: val("doctorId"),
      doctorName: val("doctorName"),
      year: Number(val("year")) || 0,
      month: Number(val("month")) || 0,
      days: Number(val("days")) || 0,
      adharNumber: val("adharNumber"),
      labName: val("labName") || labName,
      labId: val("labId") || labId,
      createdBy: String(patient.createdBy ?? ""),
      createdAt: patient.createdAt ?? "",
    });

    setSaving(false);

    if (!result.ok) {
      setError(result.error);
    } else {
      onSaved();
    }
  }

  const inputCls = "edit-patient-dialog-input w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition";
  const labelCls = "edit-patient-dialog-label mb-1.5 block text-xs font-semibold";

  return (
    <div
      className="edit-patient-dialog-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Edit patient"
    >
      <div className="edit-patient-dialog-shell pending-test-dialog w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border shadow-2xl flex flex-col">

        {/* Header */}
        <div className="edit-patient-dialog-header pending-test-dialog-header flex items-center justify-between border-b px-5 py-4 rounded-t-2xl">
          <div>
            <p className="edit-patient-dialog-eyebrow text-xs font-semibold uppercase tracking-[0.2em]">Patient management</p>
            <h2 className="mt-0.5 text-base font-semibold">Edit patient</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="pending-test-dialog-close rounded-full border p-1.5 transition"
          >
            <FiX />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="edit-patient-dialog-muted flex items-center justify-center py-16 text-sm">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white mr-3" />
              Loading…
            </div>
          )}

          {!loading && error && !patient && (
            <div className="edit-patient-dialog-error p-6 text-sm">{error}</div>
          )}

          {!loading && patient && (
            <form id="edit-patient-form" onSubmit={handleSubmit} className="p-5">
              <input type="hidden" name="labName" value={String(patient.labName ?? labName)} />
              <input type="hidden" name="labId" value={String(patient.labId ?? labId)} />

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Prefix */}
                <label>
                  <span className={labelCls}>Prefix <span className="text-red-500">*</span></span>
                  <select name="prefix" defaultValue={patient.prefix ?? "Mr."} required className={inputCls}>
                    <option>Mr.</option>
                    <option>Ms.</option>
                    <option>Mrs.</option>
                    <option>Dr.</option>
                  </select>
                </label>

                {/* Text fields */}
                {TEXT_FIELDS.map(([name, label, type, required]) => (
                  <label key={name}>
                    <span className={labelCls}>
                      {label}{required && <span className="text-red-500"> *</span>}
                    </span>
                    <input
                      name={name}
                      type={type}
                      defaultValue={String(patient[name] ?? "")}
                      required={required}
                      className={inputCls}
                    />
                  </label>
                ))}

                {/* Gender */}
                <label>
                  <span className={labelCls}>Gender <span className="text-red-500">*</span></span>
                  <select name="gender" defaultValue={patient.gender ?? ""} required className={inputCls}>
                    <option value="">Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </label>

                {/* Age / DOB */}
                <AgeFields
                  initialDateOfBirth={dateToInput(patient.dateOfBirth)}
                  initialAge={{
                    years: Number(patient.year ?? 0),
                    months: Number(patient.month ?? 0),
                    days: Number(patient.days ?? 0),
                  }}
                />

                {/* Doctor */}
                <DoctorSelector
                  initialDoctors={doctors}
                  currentLabId={labId}
                  currentLabName={labName}
                  currentUserId={currentUserId}
                  initialDoctorId={patient.doctorId}
                  initialDoctorName={patient.doctorName}
                />

                {/* Aadhaar */}
                <label>
                  <span className={labelCls}>Aadhaar number</span>
                  <input
                    name="adharNumber"
                    type="number"
                    defaultValue={String(patient.adharNumber ?? "")}
                    className={inputCls}
                  />
                </label>
              </div>

              {error && (
                <div className="edit-patient-dialog-error mt-4 rounded-xl border px-4 py-3 text-sm">
                  {error}
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        {!loading && patient && (
          <div className="edit-patient-dialog-footer pending-test-dialog-footer flex items-center justify-end gap-3 border-t px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="edit-patient-dialog-cancel pending-test-dialog-close-button rounded-xl border px-4 py-2 text-sm font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-patient-form"
              disabled={saving}
              className="edit-patient-dialog-submit flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:opacity-50"
            >
              {saving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              Update patient
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
