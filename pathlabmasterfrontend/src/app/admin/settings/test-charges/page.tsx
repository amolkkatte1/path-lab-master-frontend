import { saveTestCharges } from "@/app/actions";
import { getTestListByLabId, parseApiResponse } from "@/lib/api";
import { requireUserType } from "@/lib/auth";

import { TestChargesEditor, type TestChargeTest } from "./test-charges-editor";

type TestListResponse =
  | TestChargeTest[]
  | { data?: TestChargeTest[] | null };

async function getLabTests(labId: number) {
  const response = await fetch(getTestListByLabId(labId), {
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      tests: [] as TestChargeTest[],
      error: `The test service returned status ${response.status}.`,
    };
  }

  const payload = await parseApiResponse<TestListResponse>(response);
  const tests = Array.isArray(payload) ? payload : payload.data ?? [];

  return { tests, error: null };
}

export default async function TestChargesPage() {
  const user = await requireUserType("Administrator");
  let tests: TestChargeTest[] = [];
  let error: string | null = null;

  try {
    ({ tests, error } = await getLabTests(user.labId));
  } catch {
    error = "Unable to connect to the test service. Please try again.";
  }

  return (
    <TestChargesEditor
      initialTests={tests}
      loadError={error}
      saveAction={saveTestCharges}
    />
  );
}
