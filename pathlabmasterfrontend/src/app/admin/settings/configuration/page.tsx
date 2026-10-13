import "server-only";

import { getConfigByLabId, parseApiResponse } from "@/lib/api";
import { requireUserType } from "@/lib/auth";

import { ConfigurationEditor } from "./configuration-editor";
import type {
  ConfigurationApiResponse,
  LabConfiguration,
} from "./configuration-types";

function isLabConfiguration(value: unknown): value is LabConfiguration {
  return (
    typeof value === "object" &&
    value !== null &&
    "configId" in value &&
    "labId" in value &&
    "testKeys" in value &&
    "testKeyMapping" in value
  );
}

export default async function ConfigurationPage() {
  const user = await requireUserType("Administrator");
  let config: LabConfiguration | null = null;
  let error: string | null = null;

  try {
    const response = await fetch(getConfigByLabId(user.labId), {
      cache: "no-store",
    });
    if (!response.ok) {
      error = `The configuration service returned status ${response.status}.`;
    } else {
      const payload =
        await parseApiResponse<ConfigurationApiResponse>(response);
      const candidate = "data" in payload ? payload.data : payload;
      config = isLabConfiguration(candidate) ? candidate : null;
      if (!config) {
        error = "The configuration service did not return laboratory configuration.";
      } else if (
        "statusCode" in payload &&
        payload.statusCode !== undefined &&
        payload.statusCode !== 1
      ) {
        error = payload.message ?? "Unable to load laboratory configuration.";
        config = null;
      }
    }
  } catch {
    error = "Unable to connect to the configuration service. Please try again.";
  }

  return <ConfigurationEditor config={config} loadError={error} />;
}
