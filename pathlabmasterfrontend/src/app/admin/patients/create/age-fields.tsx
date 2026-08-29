"use client";

import { useRef, useState } from "react";
import { FiCalendar } from "react-icons/fi";

type Age = { years: number | ""; months: number | ""; days: number | "" };
const emptyAge: Age = { years: "", months: "", days: "" };

type AgeFieldsProps = { initialDateOfBirth?: string; initialAge?: Partial<Age> };

function calculateAge(dateValue: string): Age {
  if (!dateValue) return emptyAge;
  const [year, month, day] = dateValue.split("-").map(Number);
  const birthDate = new Date(Date.UTC(year, month - 1, day));
  const today = new Date();
  const todayDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  if (birthDate > todayDate) return emptyAge;

  let years = todayDate.getUTCFullYear() - birthDate.getUTCFullYear();
  let anniversary = new Date(birthDate);
  anniversary.setUTCFullYear(birthDate.getUTCFullYear() + years);
  if (anniversary > todayDate) {
    years -= 1;
    anniversary = new Date(birthDate);
    anniversary.setUTCFullYear(birthDate.getUTCFullYear() + years);
  }

  let months = (todayDate.getUTCFullYear() - anniversary.getUTCFullYear()) * 12 + todayDate.getUTCMonth() - anniversary.getUTCMonth();
  const monthiversary = new Date(anniversary);
  monthiversary.setUTCMonth(anniversary.getUTCMonth() + months);
  if (monthiversary > todayDate) {
    months -= 1;
    monthiversary.setUTCMonth(anniversary.getUTCMonth() + months);
  }

  return { years, months, days: Math.floor((todayDate.getTime() - monthiversary.getTime()) / 86400000) };
}

function calculateDateOfBirth(age: Age) {
  if (age.years === "" && age.months === "" && age.days === "") return "";
  const today = new Date();
  const date = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  date.setUTCFullYear(date.getUTCFullYear() - Number(age.years || 0));
  date.setUTCMonth(date.getUTCMonth() - Number(age.months || 0));
  date.setUTCDate(date.getUTCDate() - Number(age.days || 0));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function formatDateForDisplay(value: string) {
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : "";
}

export function AgeFields({ initialDateOfBirth = "", initialAge }: Readonly<AgeFieldsProps>) {
  const [dateOfBirth, setDateOfBirth] = useState(initialDateOfBirth);
  const [displayDate, setDisplayDate] = useState(formatDateForDisplay(initialDateOfBirth));
  const [age, setAge] = useState<Age>({ years: initialAge?.years ?? "", months: initialAge?.months ?? "", days: initialAge?.days ?? "" });
  const dateInputRef = useRef<HTMLInputElement>(null);

  function handleDateChange(value: string) {
    setDateOfBirth(value);
    setDisplayDate(formatDateForDisplay(value));
    setAge(calculateAge(value));
  }

  function handleDisplayDateChange(value: string) {
    setDisplayDate(value);
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) handleDateChange(`${match[3]}-${match[2]}-${match[1]}`);
  }

  function handleAgeChange(name: keyof Age, value: string) {
    const nextAge: Age = { ...age, [name]: value === "" ? "" : Math.max(0, Number(value)) };
    const nextDate = calculateDateOfBirth(nextAge);
    setAge(nextAge);
    setDateOfBirth(nextDate);
    setDisplayDate(formatDateForDisplay(nextDate));
  }

  function openDatePicker() {
    const input = dateInputRef.current;
    if (!input) return;
    if ("showPicker" in input && typeof input.showPicker === "function") input.showPicker();
    else input.click();
  }

  return (
    <>
      <label>
        <span className="mb-2 block text-sm font-semibold">Date of birth</span>
        <div className="relative">
          <input
            type="text"
            value={displayDate}
            placeholder="DD/MM/YYYY"
            inputMode="numeric"
            required
            onChange={(event) => handleDisplayDateChange(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 pr-11 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          <button type="button" onClick={openDatePicker} aria-label="Open date picker" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-emerald-600"><FiCalendar /></button>
          <input ref={dateInputRef} name="dateOfBirth" type="date" value={dateOfBirth} required aria-label="Date of birth" onChange={(event) => handleDateChange(event.target.value)} className="sr-only" />
        </div>
      </label>
      <div className="col-span-full grid grid-cols-3 gap-3">
        {(["years", "months", "days"] as const).map((name) => (
          <label key={name}>
            <span className="mb-2 block text-sm font-semibold">Age {name}</span>
            <input
              name={name === "years" ? "year" : name === "months" ? "month" : "days"}
              type="number"
              min="0"
              value={age[name]}
              required={name === "years"}
              onChange={(event) => handleAgeChange(name, event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
        ))}
      </div>
    </>
  );
}
