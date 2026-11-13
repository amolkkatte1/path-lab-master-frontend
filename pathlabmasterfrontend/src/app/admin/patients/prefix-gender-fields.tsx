"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type PrefixGenderContextValue = {
  prefix: string;
  gender: string;
  setPrefix: (prefix: string) => void;
  setGender: (gender: string) => void;
};

type PrefixGenderProviderProps = {
  children: ReactNode;
  initialPrefix: string;
};

type FieldProps = {
  inputClassName: string;
  labelClassName: string;
};

const PrefixGenderContext = createContext<PrefixGenderContextValue | null>(null);

function genderForPrefix(prefix: string) {
  return prefix === "Mr." ? "Male" : "Female";
}

function usePrefixGender() {
  const context = useContext(PrefixGenderContext);
  if (!context) throw new Error("Prefix and gender fields must be inside PrefixGenderProvider.");
  return context;
}

export function PrefixGenderProvider({
  children,
  initialPrefix,
}: PrefixGenderProviderProps) {
  const [prefix, setPrefix] = useState(initialPrefix);
  const [gender, setGender] = useState(genderForPrefix(initialPrefix));

  function updatePrefix(value: string) {
    setPrefix(value);
    setGender(genderForPrefix(value));
  }

  return (
    <PrefixGenderContext.Provider value={{ prefix, gender, setPrefix: updatePrefix, setGender }}>
      {children}
    </PrefixGenderContext.Provider>
  );
}

export function PrefixField({ inputClassName, labelClassName }: FieldProps) {
  const { prefix, setPrefix } = usePrefixGender();

  return (
    <label>
      <span className={labelClassName}>
        Prefix <span className="text-red-500">*</span>
      </span>
      <select
        name="prefix"
        value={prefix}
        onChange={(event) => setPrefix(event.target.value)}
        required
        className={inputClassName}
      >
        <option>Mr.</option>
        <option>Ms.</option>
        <option>Mrs.</option>
        <option>Dr.</option>
      </select>
    </label>
  );
}

export function GenderField({ inputClassName, labelClassName }: FieldProps) {
  const { gender, setGender } = usePrefixGender();

  return (
    <label>
      <span className={labelClassName}>
        Gender <span className="text-red-500">*</span>
      </span>
      <select
        name="gender"
        value={gender}
        onChange={(event) => setGender(event.target.value)}
        required
        className={inputClassName}
      >
        <option value="">Select gender</option>
        <option>Male</option>
        <option>Female</option>
        <option>Other</option>
      </select>
    </label>
  );
}
