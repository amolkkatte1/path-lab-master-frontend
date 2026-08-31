"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FiPlus, FiSearch, FiX } from "react-icons/fi";

import { createDoctorForPatientSelection } from "@/app/actions";
import { getDoctorListByLabId, parseApiResponse } from "@/lib/api";

export type DoctorOption = {
  doctorId: number | string;
  doctorName?: string;
  doctorMailId?: string;
  doctorMobileNumber?: number | string;
  labName?: string;
  labId?: number | string;
};

type DoctorSelectorProps = {
  initialDoctors: DoctorOption[];
  currentLabId: number | string;
  currentLabName: string;
  currentUserId: string;
};

export function DoctorSelector({
  initialDoctors,
  currentLabId,
  currentLabName,
  currentUserId,
}: DoctorSelectorProps) {
  const [doctorList, setDoctorList] = useState(initialDoctors);
  const [query, setQuery] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [selectedDoctorName, setSelectedDoctorName] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDoctorName, setNewDoctorName] = useState("");
  const [newDoctorMobile, setNewDoctorMobile] = useState("");
  const [newDoctorEmail, setNewDoctorEmail] = useState("");
  const [isCreatingDoctor, setIsCreatingDoctor] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setDoctorList(initialDoctors);
  }, [initialDoctors]);

  useEffect(() => {
    if (!isDropdownOpen) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node | null;
      const root = document.querySelector("[data-doctor-selector-root]");

      if (!root || !target || root.contains(target)) {
        return;
      }

      setIsDropdownOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isDropdownOpen]);

  const filteredDoctors = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return doctorList;

    return doctorList.filter((doctor) => {
      const searchable = [
        doctor.doctorName,
        String(doctor.doctorId ?? ""),
        doctor.doctorMailId,
        String(doctor.doctorMobileNumber ?? ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalized);
    });
  }, [doctorList, query]);

  async function refreshDoctors() {
    try {
      const response = await fetch(getDoctorListByLabId(currentLabId), {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const payload = await parseApiResponse<DoctorOption[] | { data?: DoctorOption[] }>(response);
      const nextDoctors = Array.isArray(payload) ? payload : payload.data ?? [];
      setDoctorList(nextDoctors);
      return nextDoctors;
    } catch {
      return null;
    }
  }

  async function handleCreateDoctor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = newDoctorName.trim();
    const mobile = newDoctorMobile.trim();
    const email = newDoctorEmail.trim();

    if (!name || !mobile || !email) {
      setErrorMessage("Doctor name, mobile number, and email are required.");
      return;
    }

    setIsCreatingDoctor(true);
    setErrorMessage("");

    try {
      const result = await createDoctorForPatientSelection({
        doctorName: name,
        doctorMailId: email,
        doctorMobileNumber: mobile,
        labName: currentLabName,
        labId: currentLabId,
        createdBy: currentUserId,
        updatedBy: currentUserId,
      });

      if (!result.ok || !result.doctor) {
        throw new Error(result.message || "Unable to create doctor.");
      }

      const refreshed = (await refreshDoctors()) ?? doctorList;
      const createdDoctor =
        refreshed.find((doctor) => {
          const sameName = (doctor.doctorName ?? "").toLowerCase() === name.toLowerCase();
          const sameEmail = (doctor.doctorMailId ?? "").toLowerCase() === email.toLowerCase();
          return sameName && sameEmail;
        }) ??
        refreshed.find((doctor) => String(doctor.doctorId) === String(result.doctor?.doctorId)) ??
        {
          doctorId: result.doctor.doctorId,
          doctorName: result.doctor.doctorName ?? name,
          doctorMailId: result.doctor.doctorMailId ?? email,
          doctorMobileNumber: result.doctor.doctorMobileNumber ?? mobile,
          labName: result.doctor.labName ?? currentLabName,
          labId: result.doctor.labId ?? currentLabId,
        };

      if (createdDoctor) {
        setSelectedDoctorId(String(createdDoctor.doctorId));
        setSelectedDoctorName(createdDoctor.doctorName ?? "");
        setQuery(createdDoctor.doctorName ?? "");
      }

      setNewDoctorName("");
      setNewDoctorMobile("");
      setNewDoctorEmail("");
      setIsModalOpen(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create doctor. Please try again.");
    } finally {
      setIsCreatingDoctor(false);
    }
  }

  return (
    <div className="sm:col-span-2" data-doctor-selector-root>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">Ref. doctor</span>
        <div className="relative">
          <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 shadow-sm transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
            <FiSearch className="h-4 w-4 text-slate-400" />
            <input
              value={query}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(event) => {
                setQuery(event.target.value);
                setIsDropdownOpen(true);
              }}
              placeholder="Search doctor by name or ID"
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              aria-label="Add doctor"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white transition hover:bg-emerald-600"
            >
              <FiPlus className="h-4 w-4" />
            </button>
          </div>

          {isDropdownOpen && filteredDoctors.length > 0 && (
            <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
              {filteredDoctors.slice(0, 8).map((doctor) => (
                <button
                  key={String(doctor.doctorId)}
                  type="button"
                  onClick={() => {
                    setSelectedDoctorId(String(doctor.doctorId));
                    setSelectedDoctorName(doctor.doctorName ?? "");
                    setQuery(doctor.doctorName ?? String(doctor.doctorId));
                    setIsDropdownOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  <span>{doctor.doctorName ?? "Unnamed doctor"}</span>
                  <span className="text-xs text-slate-500">ID: {doctor.doctorId}</span>
                </button>
              ))}
            </div>
          )}

          {isDropdownOpen && filteredDoctors.length === 0 && (
            <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-lg">
              No doctors found for this lab.
            </div>
          )}
        </div>
      </label>

      <input type="hidden" name="doctorId" value={selectedDoctorId} />
      <input type="hidden" name="doctorName" value={selectedDoctorName} />

      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/60 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Add doctor</h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                  aria-label="Close add doctor modal"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateDoctor} className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">Doctor name</span>
                  <input
                    value={newDoctorName}
                    onChange={(event) => setNewDoctorName(event.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">Mobile number</span>
                  <input
                    type="tel"
                    value={newDoctorMobile}
                    onChange={(event) => setNewDoctorMobile(event.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">Email</span>
                  <input
                    type="email"
                    value={newDoctorEmail}
                    onChange={(event) => setNewDoctorEmail(event.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                {errorMessage && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {errorMessage}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingDoctor}
                    className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isCreatingDoctor ? "Saving..." : "Save doctor"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
