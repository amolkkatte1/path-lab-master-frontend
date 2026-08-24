"use server";

import { redirect } from "next/navigation";

import { API_ENDPOINTS, stringifyApiPayload } from "@/lib/api";

import {
  clearSessionUser,
  getDashboardPath,
  loginWithApi,
  requireUserType,
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

export async function createUser(formData: FormData) {
  const currentUser = await requireUserType("SuperAdmin");
  const value = (name: string) => String(formData.get(name) ?? "").trim();

  const payload = {
    firstName: value("firstName"),
    lastName: value("lastName"),
    personalMobileNumber: Number(value("personalMobileNumber")),
    workMobileNumber: Number(value("workMobileNumber")),
    mailId: value("mailId"),
    address: value("address"),
    landmark: value("landmark"),
    city: value("city"),
    district: value("district"),
    state: value("state"),
    country: value("country"),
    pincode: Number(value("pincode")),
    labName: value("labName"),
    labId: Number(value("labId")),
    userTypeId: Number(value("userTypeId")),
    userName: value("userName"),
    password: value("password"),
    userTypeName: value("userTypeName"),
    updatedAt: new Date().toISOString(),
    updatedBy: currentUser.userId,
    createdAt: new Date().toISOString(),
    createdBy: currentUser.userId,
  };

  let response: Response;

  try {
    response = await fetch(API_ENDPOINTS.createUser, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: stringifyApiPayload(payload, ["updatedBy", "createdBy"]),
      cache: "no-store",
    });
  } catch {
    redirect("/super-admin/users/create?error=connection");
  }

  if (!response.ok) {
    redirect(`/super-admin/users/create?error=${response.status}`);
  }

  redirect("/super-admin/users?created=1");
}

export async function updateUser(formData: FormData) {
  const currentUser = await requireUserType("SuperAdmin");
  const value = (name: string) => String(formData.get(name) ?? "").trim();
  const now = new Date().toISOString();

  const payload = {
    userId: value("userId"),
    firstName: value("firstName"),
    lastName: value("lastName"),
    personalMobileNumber: Number(value("personalMobileNumber")),
    workMobileNumber: Number(value("workMobileNumber")),
    mailId: value("mailId"),
    address: value("address"),
    landmark: value("landmark"),
    city: value("city"),
    district: value("district"),
    state: value("state"),
    country: value("country"),
    pincode: Number(value("pincode")),
    labName: value("labName"),
    labId: Number(value("labId")),
    userTypeId: Number(value("userTypeId")),
    userName: value("userName"),
    password: value("password"),
    userTypeName: value("userTypeName"),
    updatedAt: now,
    updatedBy: currentUser.userId,
    createdAt: value("createdAt"),
    createdBy: value("createdBy") || currentUser.userId,
  };

  let response: Response;

  try {
    response = await fetch(API_ENDPOINTS.updateUser, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: stringifyApiPayload(payload, ["userId", "updatedBy", "createdBy"]),
      cache: "no-store",
    });
  } catch {
    redirect(`/super-admin/users/edit/${payload.userId}?error=connection`);
  }

  if (!response.ok) {
    redirect(`/super-admin/users/edit/${payload.userId}?error=${response.status}`);
  }

  redirect("/super-admin/users?updated=1");
}

export async function deleteUser(formData: FormData) {
  await requireUserType("SuperAdmin");
  const userId = String(formData.get("userId") ?? "").trim();

  let response: Response;

  try {
    response = await fetch(API_ENDPOINTS.deleteUser, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: stringifyApiPayload({ userId }, ["userId"]),
      cache: "no-store",
    });
  } catch {
    redirect("/super-admin/users?error=connection");
  }

  if (!response.ok) {
    redirect(`/super-admin/users?error=${response.status}`);
  }

  redirect("/super-admin/users?deleted=1");
}
