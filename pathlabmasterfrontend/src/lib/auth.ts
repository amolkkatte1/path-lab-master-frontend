import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { API_ENDPOINTS } from "@/lib/api";

export type UserTypeName = "Administrator" | "SuperAdmin";

export type SessionUser = {
  userId: number;
  firstName: string;
  lastName: string;
  labName: string;
  labId: number;
  userName: string;
  userTypeName: UserTypeName;
  mailId: string;
};

type LoginApiUser = {
  userId: number;
  firstName: string;
  lastName: string;
  labName: string;
  labId: number;
  userName: string;
  userTypeName: string;
  mailId: string;
};

type LoginApiResponse = LoginApiUser | { data?: LoginApiUser };

const SESSION_COOKIE = "pathlab-session";
function normalizeUserTypeName(userTypeName: string): UserTypeName | null {
  if (userTypeName === "Administrator" || userTypeName === "SuperAdmin") {
    return userTypeName;
  }

  return null;
}

function serializeSessionUser(user: SessionUser) {
  return encodeURIComponent(JSON.stringify(user));
}

function parseSessionUser(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as SessionUser;
    const normalizedRole = normalizeUserTypeName(parsed.userTypeName);

    if (!normalizedRole) {
      return null;
    }

    return {
      ...parsed,
      userTypeName: normalizedRole,
    };
  } catch {
    return null;
  }
}

function toSessionUser(user: LoginApiUser) {
  const normalizedRole = normalizeUserTypeName(user.userTypeName);

  if (!normalizedRole) {
    return null;
  }

  return {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    labName: user.labName,
    labId: user.labId,
    userName: user.userName,
    userTypeName: normalizedRole,
    mailId: user.mailId,
  } satisfies SessionUser;
}

function resolveApiUser(payload: LoginApiResponse) {
  if ("userId" in payload) {
    return payload;
  }

  return payload.data ?? null;
}

export function getDashboardPath(userTypeName: UserTypeName) {
  return userTypeName === "SuperAdmin" ? "/super-admin" : "/admin";
}

export async function loginWithApi(userName: string, password: string) {
  const response = await fetch(API_ENDPOINTS.login, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userName,
      password,
    }),
    cache: "no-store",
  });

  if (
    response.status === 401 ||
    response.status === 403 ||
    response.status === 404
  ) {
    return { kind: "invalid" as const };
  }

  if (!response.ok) {
    return { kind: "unavailable" as const };
  }

  const payload = (await response.json()) as LoginApiResponse;
  const resolvedUser = resolveApiUser(payload);

  if (!resolvedUser) {
    return { kind: "unavailable" as const };
  }

  const sessionUser = toSessionUser(resolvedUser);

  if (!sessionUser) {
    return { kind: "unsupported-role" as const };
  }

  return {
    kind: "success" as const,
    user: sessionUser,
  };
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  return parseSessionUser(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function setSessionUser(user: SessionUser, remember: boolean) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, serializeSessionUser(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: remember ? 60 * 60 * 24 * 30 : undefined,
  });
}

export async function clearSessionUser() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function redirectIfAuthenticated() {
  const user = await getSessionUser();

  if (user) {
    redirect(getDashboardPath(user.userTypeName));
  }
}

export async function requireUserType(userTypeName: UserTypeName) {
  const user = await getSessionUser();

  if (!user || user.userTypeName !== userTypeName) {
    redirect("/");
  }

  return user;
}
