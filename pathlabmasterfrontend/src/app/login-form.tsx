"use client";

import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

import { login } from "@/app/actions";

type LoginFormProps = {
  hasInvalidCredentials: boolean;
  hasUnsupportedRole: boolean;
  hasServerError: boolean;
};

export function LoginForm({
  hasInvalidCredentials,
  hasUnsupportedRole,
  hasServerError,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={login} className="mt-6 space-y-4">
      <div className="space-y-4">
        <label className="block">
          <span className="sr-only">Username</span>
          <input
            type="text"
            name="username"
            placeholder="UserName"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />
        </label>

        <label className="block">
          <span className="sr-only">Password</span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-slate-500 transition hover:text-slate-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <FiEyeOff className="h-5 w-5" />
              ) : (
                <FiEye className="h-5 w-5" />
              )}
            </button>
          </div>
        </label>
      </div>

      {hasInvalidCredentials ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Invalid username or password. Please check your credentials and try again.
        </p>
      ) : null}

      {hasUnsupportedRole ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          This account role is not supported yet. Only `Administrator` and `SuperAdmin` can sign in right now.
        </p>
      ) : null}

      {hasServerError ? (
        <p className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700">
          The login service could not be reached. Please try again in a moment.
        </p>
      ) : null}

      <div className="flex flex-col gap-3 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="remember"
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span className="text-sm">Remember me</span>
        </label>

        <a
          href="#"
          className="text-sm font-medium text-sky-700 transition hover:text-sky-900"
        >
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        className="h-11 w-full rounded-xl bg-emerald-600 text-base font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
      >
        Login
      </button>
    </form>
  );
}
