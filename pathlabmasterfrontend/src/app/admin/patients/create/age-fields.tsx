"use client";

import { useState } from "react";

type Age = {
  years: number | "";
  months: number | "";
  days: number | "";
};

const emptyAge: Age = { years: "", months: "", days: "" };

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

  const days = Math.floor((todayDate.getTime() - monthiversary.getTime()) / 86400000);
  return { years, months, days };
}

type AgeFieldsProps = {
  initialDateOfBirth?: string;
  initialAge?: Partial<Age>;
};

export function AgeFields({ initialDateOfBirth = "", initialAge }: Readonly<AgeFieldsProps>) {
  const [dateOfBirth, setDateOfBirth] = useState(initialDateOfBirth);
  const [age, setAge] = useState<Age>({
    years: initialAge?.years ?? "",
    months: initialAge?.months ?? "",
    days: initialAge?.days ?? "",
  });

  function handleDateChange(value: string) {
    setDateOfBirth(value);
    setAge(calculateAge(value));
  }

  return (
    <>
      <label>
        <span className="mb-2 block text-sm font-semibold">Date of birth</span>
        <input name="dateOfBirth" type="date" value={dateOfBirth} required onChange={(event) => handleDateChange(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
      </label>
      {(["years", "months", "days"] as const).map((name) => (
        <label key={name}>
          <span className="mb-2 block text-sm font-semibold">Age {name}</span>
          <input name={name === "years" ? "year" : name === "months" ? "month" : "days"} type="number" min="0" value={age[name]} readOnly required className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2.5 outline-none" />
        </label>
      ))}
    </>
  );
}
