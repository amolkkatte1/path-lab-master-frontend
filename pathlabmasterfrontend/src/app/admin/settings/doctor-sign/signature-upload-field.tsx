"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { FiX } from "react-icons/fi";

type SignatureUploadFieldProps = {
  currentSignature?: string | null;
  doctorName?: string;
  required: boolean;
};

export function SignatureUploadField({
  currentSignature,
  doctorName,
  required,
}: Readonly<SignatureUploadFieldProps>) {
  const [preview, setPreview] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const previewRef = useRef<string | null>(null);
  const inputId = useId();

  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    [],
  );

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const file = event.currentTarget.files?.[0];
    if (!file) {
      previewRef.current = null;
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(file);
    previewRef.current = url;
    setPreview(url);
    setRemoved(false);
  }

  function removeImage() {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    setPreview(null);
    setRemoved(true);
    const input = document.getElementById(inputId);
    if (input instanceof HTMLInputElement) input.value = "";
  }

  const imageSource = removed ? null : preview ?? currentSignature;

  return (
    <div className="sm:col-span-2">
      <label htmlFor={inputId} className="mb-2 block text-sm font-semibold text-slate-300">
        Signature image {required ? <span className="text-red-500">*</span> : "(optional replacement)"}
      </label>
      <input
        id={inputId}
        name="signature"
        type="file"
        accept="image/*"
        required={required}
        onChange={handleFileChange}
        className="patient-filter-input block w-full rounded-lg border px-3 py-2.5 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-3 file:py-1.5 file:font-semibold file:text-white"
      />
      <input type="hidden" name="removeSignature" value={removed ? "true" : "false"} />
      <div className="mt-3 flex h-32 w-full max-w-sm items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white p-3">
        {imageSource ? (
          <div className="relative flex h-full w-full items-center justify-center">
            <Image
              src={imageSource}
              alt={`${doctorName ?? "Doctor"} signature preview`}
              width={360}
              height={100}
              unoptimized
              className="max-h-full w-auto max-w-full object-contain"
            />
            <button
              type="button"
              onClick={removeImage}
              aria-label="Remove signature image"
              title="Remove signature image"
              className="absolute right-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-white shadow transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
            >
              <FiX aria-hidden="true" />
            </button>
          </div>
        ) : (
          <span className="text-sm text-slate-500">No signature image available</span>
        )}
      </div>
    </div>
  );
}
