"use client";

import { useState } from "react";
import { FiSave, FiX } from "react-icons/fi";

import { updateLabConfiguration } from "@/app/actions";

import type { LabConfiguration, LabConfigurationValues } from "./configuration-types";

type ConfigurationEditorProps = {
  config: LabConfiguration | null;
  loadError: string | null;
};

type FormValues = {
  testKeys: string;
  reportTopSpace: string;
  reportBottomSpace: string;
  lineSpace: string;
  qrCodeHorizantalPosition: string;
  qrCodeVerticalPosition: string;
  columnCount: string;
  testKeyMapping: string;
  qrCodeRequired: boolean;
};

function toFormValues(config: LabConfiguration): FormValues {
  return {
    testKeys: JSON.stringify(config.testKeys, null, 2),
    reportTopSpace: String(config.reportTopSpace),
    reportBottomSpace: String(config.reportBottomSpace),
    lineSpace: config.lineSpace === null ? "" : String(config.lineSpace),
    qrCodeHorizantalPosition: String(config.qrCodeHorizantalPosition),
    qrCodeVerticalPosition: String(config.qrCodeVerticalPosition),
    columnCount: String(config.columnCount),
    testKeyMapping: JSON.stringify(config.testKeyMapping, null, 2),
    qrCodeRequired: config.qrCodeRequired,
  };
}

function parseRecord(value: string, label: string) {
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${label} must be a JSON object.`);
  }
  return parsed;
}

function isTestKeys(value: unknown): value is Record<string, string[]> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every(
      (keys) => Array.isArray(keys) && keys.every((key) => typeof key === "string"),
    )
  );
}

function isTestKeyMapping(
  value: unknown,
): value is Record<string, Record<string, string>> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every(
      (mapping) =>
        typeof mapping === "object" &&
        mapping !== null &&
        !Array.isArray(mapping) &&
        Object.values(mapping).every((key) => typeof key === "string"),
    )
  );
}

export function ConfigurationEditor({ config, loadError }: ConfigurationEditorProps) {
  const [formValues, setFormValues] = useState<FormValues | null>(
    () => (config ? toFormValues(config) : null),
  );
  const [baselineValues, setBaselineValues] = useState<FormValues | null>(
    () => (config ? toFormValues(config) : null),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function updateField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setFormValues((current) => current ? { ...current, [key]: value } : current);
    setError(null);
    setSaved(false);
  }

  async function saveChanges() {
    if (!config || !formValues || saving) return;

    let values: LabConfigurationValues;
    try {
      const testKeys = parseRecord(formValues.testKeys, "Test keys");
      const testKeyMapping = parseRecord(formValues.testKeyMapping, "Test key mapping");
      if (!isTestKeys(testKeys)) {
        throw new Error("Test keys must map test names to arrays of strings.");
      }
      if (!isTestKeyMapping(testKeyMapping)) {
        throw new Error("Test key mapping must contain objects with string values.");
      }
      values = {
        testKeys,
        testKeyMapping,
        reportTopSpace: Number(formValues.reportTopSpace),
        reportBottomSpace: Number(formValues.reportBottomSpace),
        lineSpace: formValues.lineSpace.trim() === "" ? null : Number(formValues.lineSpace),
        qrCodeHorizantalPosition: Number(formValues.qrCodeHorizantalPosition),
        qrCodeVerticalPosition: Number(formValues.qrCodeVerticalPosition),
        columnCount: Number(formValues.columnCount),
        qrCodeRequired: formValues.qrCodeRequired,
      };
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Enter valid JSON configuration values.");
      return;
    }

    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const result = await updateLabConfiguration(config.configId, values);
      if (!result.success) {
        setError(result.error);
        return;
      }
      const savedValues = toFormValues({ ...config, ...values });
      setBaselineValues(savedValues);
      setFormValues(savedValues);
      setSaved(true);
    } catch {
      setError("Unable to save the configuration. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function cancelChanges() {
    if (!baselineValues) return;
    setFormValues(baselineValues);
    setError(null);
    setSaved(false);
  }

  return (
    <section className="mx-auto max-w-7xl space-y-5">
      <header className="rounded-[20px] border border-white/10 bg-white/10 px-5 py-4 backdrop-blur sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
          Settings
        </p>
        <h1 className="mt-1 text-xl font-semibold text-white">Configuration</h1>
        <p className="mt-1 text-sm text-slate-300">
          Edit report layout and OCR settings for this laboratory.
        </p>
      </header>

      {loadError && (
        <p role="alert" className="rounded-xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100">
          {loadError}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          Configuration saved successfully.
        </p>
      )}

      {config && formValues && (
        <div className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1.5 text-sm text-slate-300">
              <span>Report top space</span>
              <input
                type="number"
                min="0"
                step="any"
                value={formValues.reportTopSpace}
                onChange={(event) => updateField("reportTopSpace", event.target.value)}
                className="patient-filter-input w-full rounded-lg border px-3 py-2"
              />
            </label>
            <label className="space-y-1.5 text-sm text-slate-300">
              <span>Report bottom space</span>
              <input
                type="number"
                min="0"
                step="any"
                value={formValues.reportBottomSpace}
                onChange={(event) => updateField("reportBottomSpace", event.target.value)}
                className="patient-filter-input w-full rounded-lg border px-3 py-2"
              />
            </label>
            <label className="space-y-1.5 text-sm text-slate-300">
              <span>Line space (optional)</span>
              <input
                type="number"
                min="0"
                step="any"
                value={formValues.lineSpace}
                onChange={(event) => updateField("lineSpace", event.target.value)}
                className="patient-filter-input w-full rounded-lg border px-3 py-2"
              />
            </label>
            <label className="space-y-1.5 text-sm text-slate-300">
              <span>QR code horizontal position</span>
              <input
                type="number"
                min="0"
                step="1"
                value={formValues.qrCodeHorizantalPosition}
                onChange={(event) => updateField("qrCodeHorizantalPosition", event.target.value)}
                className="patient-filter-input w-full rounded-lg border px-3 py-2"
              />
            </label>
            <label className="space-y-1.5 text-sm text-slate-300">
              <span>QR code vertical position</span>
              <input
                type="number"
                min="0"
                step="1"
                value={formValues.qrCodeVerticalPosition}
                disabled
                className="patient-filter-input w-full cursor-not-allowed rounded-lg border px-3 py-2 opacity-60"
              />
            </label>
            <label className="space-y-1.5 text-sm text-slate-300">
              <span>Column count</span>
              <input
                type="number"
                min="1"
                step="1"
                value={formValues.columnCount}
                onChange={(event) => updateField("columnCount", event.target.value)}
                className="patient-filter-input w-full rounded-lg border px-3 py-2"
              />
            </label>
          </div>

          <label className="flex items-center gap-3 text-sm font-medium text-slate-200">
            <input
              type="checkbox"
              checked={formValues.qrCodeRequired}
              onChange={(event) => updateField("qrCodeRequired", event.target.checked)}
              className="h-4 w-4 accent-emerald-500"
            />
            Require QR code
          </label>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-1.5 text-sm text-slate-300">
              <span>Test keys (JSON object: test name to key list)</span>
              <textarea
                rows={10}
                value={formValues.testKeys}
                onChange={(event) => updateField("testKeys", event.target.value)}
                spellCheck={false}
                className="patient-filter-input w-full rounded-lg border px-3 py-2 font-mono text-xs"
              />
            </label>
            <label className="space-y-1.5 text-sm text-slate-300">
              <span>Test key mapping (JSON object)</span>
              <textarea
                rows={10}
                value={formValues.testKeyMapping}
                onChange={(event) => updateField("testKeyMapping", event.target.value)}
                spellCheck={false}
                className="patient-filter-input w-full rounded-lg border px-3 py-2 font-mono text-xs"
              />
            </label>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={cancelChanges}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10 disabled:opacity-50"
            >
              <FiX aria-hidden="true" />
              Cancel
            </button>
            <button
              type="button"
              onClick={saveChanges}
              disabled={saving || Boolean(loadError)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiSave aria-hidden="true" />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
