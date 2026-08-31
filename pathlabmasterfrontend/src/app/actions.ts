"use server";

import { redirect } from "next/navigation";

import { API_ENDPOINTS, parseApiResponse, stringifyApiPayload } from "@/lib/api";

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

export async function createPatient(formData: FormData) {
  const currentUser = await requireUserType("Administrator");
  const value = (name: string) => String(formData.get(name) ?? "").trim();
  const now = new Date().toISOString();
  const dateOfBirth = value("dateOfBirth").replace(
    /^(\d{4})-(\d{2})-(\d{2})$/,
    "$3/$2/$1",
  );
  const doctorIdValue = value("doctorId");
  const doctorNameValue = value("doctorName");

  const mobileNumberValue = value("mobileNumber");

  const payload = {
    firstName: value("firstName"),
    middleName: value("middleName"),
    lastName: value("lastName"),
    mobileNumber: mobileNumberValue ? Number(mobileNumberValue) : undefined,
    prefix: value("prefix"),
    mailId: value("mailId"),
    gender: value("gender"),
    dateOfBirth,
    doctorId: doctorIdValue ? String(doctorIdValue) : undefined,
    doctorName: doctorNameValue || undefined,
    year: Number(value("year")),
    month: Number(value("month")),
    days: Number(value("days")),
    adharNumber: Number(value("adharNumber")),
    labName: value("labName"),
    labId: String(value("labId") || currentUser.labId),
    updatedAt: now,
    updatedBy: String(currentUser.userId),
    createdAt: now,
    createdBy: String(currentUser.userId),
  };

  let response: Response;

  try {
    response = await fetch(API_ENDPOINTS.createPatient, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: stringifyApiPayload(payload, ["labId", "updatedBy", "createdBy"]),
      cache: "no-store",
    });
  } catch {
    redirect("/admin/patients/create?error=connection");
  }

  if (!response.ok) {
    redirect(`/admin/patients/create?error=${response.status}`);
  }

  redirect("/admin/patients?created=1");
}

export async function createDoctor(formData: FormData) {
  const currentUser = await requireUserType("Administrator");
  const value = (name: string) => String(formData.get(name) ?? "").trim();
  const now = new Date().toISOString();
  const doctorIdValue = value("doctorId");
  const sharingValue = value("shairingPercentage");
  const educationValue = value("educationQulification");

  const payload = {
    doctorId: doctorIdValue ? String(doctorIdValue) : undefined,
    doctorName: value("doctorName"),
    doctorMailId: value("doctorMailId") || undefined,
    doctorMobileNumber: String(value("doctorMobileNumber") || ""),
    shairingPercentage: sharingValue ? String(sharingValue) : undefined,
    labName: value("labName") || currentUser.labName,
    labId: String(value("labId") || currentUser.labId),
    educationQulification: educationValue || undefined,
    createdBy: String(currentUser.userId),
    updatedBy: String(currentUser.userId),
    createdAt: now,
    updatedAt: now,
  };

  let response: Response;

  try {
    response = await fetch(API_ENDPOINTS.createDoctor, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: stringifyApiPayload(payload, [
        "doctorId",
        "doctorMobileNumber",
        "shairingPercentage",
        "labId",
        "createdBy",
        "updatedBy",
      ]),
      cache: "no-store",
    });
  } catch {
    redirect("/admin/doctors/create?error=connection");
  }

  if (!response.ok) {
    redirect(`/admin/doctors/create?error=${response.status}`);
  }

  redirect("/admin/doctors?created=1");
}

type CreatedDoctorApiResult = {
  doctorId?: number | string;
  doctorName?: string;
  doctorMailId?: string;
  doctorMobileNumber?: number | string;
  labName?: string;
  labId?: number | string;
};

export async function createDoctorForPatientSelection({
  doctorName,
  doctorMailId,
  doctorMobileNumber,
  labName,
  labId,
  createdBy,
  updatedBy,
}: {
  doctorName: string;
  doctorMailId: string;
  doctorMobileNumber: string;
  labName: string;
  labId: number | string;
  createdBy: number | string;
  updatedBy: number | string;
}) {
  const payload = {
    doctorName,
    doctorMailId,
    doctorMobileNumber: String(doctorMobileNumber),
    labName,
    labId: String(labId),
    createdBy: String(createdBy),
    updatedBy: String(updatedBy),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const response = await fetch(API_ENDPOINTS.createDoctor, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: stringifyApiPayload(payload, [
        "doctorMobileNumber",
        "labId",
        "createdBy",
        "updatedBy",
      ]),
      cache: "no-store",
    });

    if (!response.ok) {
      return { ok: false as const, message: "Unable to create doctor. Please try again.", doctor: null };
    }

    const parsed = await parseApiResponse<{
      data?: CreatedDoctorApiResult | CreatedDoctorApiResult[];
      result?: CreatedDoctorApiResult | CreatedDoctorApiResult[];
      doctor?: CreatedDoctorApiResult | CreatedDoctorApiResult[];
      message?: string;
      statusCode?: number;
    }>(response);

    const candidate =
      (parsed?.data && (Array.isArray(parsed.data) ? parsed.data[0] : parsed.data)) ??
      (parsed?.result && (Array.isArray(parsed.result) ? parsed.result[0] : parsed.result)) ??
      (parsed?.doctor && (Array.isArray(parsed.doctor) ? parsed.doctor[0] : parsed.doctor)) ??
      null;

    return {
      ok: true as const,
      message: parsed?.message ?? "Doctor created successfully.",
      doctor: candidate,
    };
  } catch {
    return { ok: false as const, message: "Unable to create doctor. Please try again.", doctor: null };
  }
}

export async function updateDoctor(formData: FormData) {
  const currentUser = await requireUserType("Administrator");
  const value = (name: string) => String(formData.get(name) ?? "").trim();
  const now = new Date().toISOString();
  const sharingValue = value("shairingPercentage");
  const educationValue = value("educationQulification");

  const payload = {
    doctorId: String(value("doctorId")),
    doctorName: value("doctorName"),
    doctorMailId: value("doctorMailId") || undefined,
    doctorMobileNumber: value("doctorMobileNumber") || undefined,
    shairingPercentage: sharingValue ? String(sharingValue) : undefined,
    labName: value("labName") || currentUser.labName,
    labId: String(value("labId") || currentUser.labId),
    educationQulification: educationValue || undefined,
    createdBy: String(value("createdBy") || currentUser.userId),
    updatedBy: String(currentUser.userId),
    createdAt: value("createdAt") || now,
    updatedAt: now,
  };

  let response: Response;

  try {
    response = await fetch(API_ENDPOINTS.updateDoctor, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: stringifyApiPayload(payload, [
        "doctorId",
        "doctorMobileNumber",
        "shairingPercentage",
        "labId",
        "createdBy",
        "updatedBy",
      ]),
      cache: "no-store",
    });
  } catch {
    redirect(`/admin/doctors/edit/${payload.doctorId}?error=connection`);
  }

  if (!response.ok) {
    redirect(`/admin/doctors/edit/${payload.doctorId}?error=${response.status}`);
  }

  redirect("/admin/doctors?updated=1");
}

export async function deleteDoctor(formData: FormData) {
  await requireUserType("Administrator");
  const doctorId = String(formData.get("doctorId") ?? "").trim();

  let response: Response;

  try {
    response = await fetch(API_ENDPOINTS.deleteDoctor, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: stringifyApiPayload({ doctorId }, ["doctorId"]),
      cache: "no-store",
    });
  } catch {
    redirect("/admin/doctors?error=connection");
  }

  if (!response.ok) {
    redirect(`/admin/doctors?error=${response.status}`);
  }

  redirect("/admin/doctors?deleted=1");
}

export async function updatePatient(formData: FormData) {
  const currentUser = await requireUserType("Administrator");
  const value = (name: string) => String(formData.get(name) ?? "").trim();
  const now = new Date().toISOString();
  const dateOfBirth = value("dateOfBirth").replace(
    /^(\d{4})-(\d{2})-(\d{2})$/,
    "$3/$2/$1",
  );
  const mobileNumberValue = value("mobileNumber");
  const doctorIdValue = value("doctorId");
  const doctorNameValue = value("doctorName");
  const adharNumberValue = value("adharNumber");

  const payload = {
    patientId: String(value("patientId")),
    firstName: value("firstName"),
    middleName: value("middleName"),
    lastName: value("lastName"),
    mobileNumber: mobileNumberValue ? Number(mobileNumberValue) : undefined,
    prefix: value("prefix"),
    mailId: value("mailId"),
    gender: value("gender"),
    dateOfBirth,
    doctorId: doctorIdValue ? String(doctorIdValue) : undefined,
    doctorName: doctorNameValue || undefined,
    year: Number(value("year")) || 0,
    month: Number(value("month")) || 0,
    days: Number(value("days")) || 0,
    adharNumber: adharNumberValue ? Number(adharNumberValue) : undefined,
    labName: value("labName"),
    labId: String(value("labId")),
    createdBy: String(value("createdBy")),
    updatedBy: String(currentUser.userId),
    createdAt: value("createdAt"),
    updatedAt: now,
  };

  let response: Response;

  try {
    response = await fetch(API_ENDPOINTS.updatePatient, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: stringifyApiPayload(payload, ["patientId", "labId", "createdBy", "updatedBy"]),
      cache: "no-store",
    });
  } catch {
    redirect(`/admin/patients/edit/${payload.patientId}?error=connection`);
  }

  if (!response.ok) {
    redirect(`/admin/patients/edit/${payload.patientId}?error=${response.status}`);
  }

  redirect("/admin/patients?updated=1");
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
