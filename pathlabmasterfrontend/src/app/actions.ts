"use server";

import { redirect } from "next/navigation";

import {
  clearSessionUser,
  getDashboardPath,
  loginWithApi,
  setSessionUser,
} from "@/lib/auth";

export async function login(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";

  const result = await loginWithApi(username, password);

  if (result.kind === "invalid") {
    redirect("/?error=invalid");
  }

  if (result.kind === "unsupported-role") {
    redirect("/?error=role");
  }

  if (result.kind === "unavailable") {
    redirect("/?error=server");
  }

  await setSessionUser(result.user, remember);
  redirect(getDashboardPath(result.user.userTypeName));
}

export async function logout() {
  await clearSessionUser();
  redirect("/");
}
