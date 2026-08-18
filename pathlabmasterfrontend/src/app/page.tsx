import Image from "next/image";

import { login } from "@/app/actions";
import { redirectIfAuthenticated } from "@/lib/auth";

export default async function Home(props: PageProps<"/">) {
  await redirectIfAuthenticated();

  const searchParams = await props.searchParams;
  const hasInvalidCredentials = searchParams.error === "invalid";
  const hasUnsupportedRole = searchParams.error === "role";
  const hasServerError = searchParams.error === "server";

  return (
    <main className="relative h-screen overflow-hidden bg-slate-100">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/login_bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-white/35" />

      <section className="relative z-10 flex h-screen items-center justify-center px-4 py-6 sm:px-8 lg:justify-end lg:px-20">
        <div className="w-full max-w-[390px] rounded-[22px] bg-white/95 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-sm sm:p-6 lg:p-7">
          <div className="space-y-4">
            <div className="flex justify-center sm:justify-start">
              <Image
                src="/PM2.png"
                alt="Path Lab logo"
                width={132}
                height={30}
                priority
                className="h-auto"
              />
            </div>
            <h1 className="font-serif text-[1.9rem] leading-tight text-slate-950 sm:text-[2.2rem]">
              Log in to your Laboratory
            </h1>
            <p className="max-w-md text-sm leading-5 text-slate-600">
              Sign in to continue to your account and access the laboratory management system.
            </p>
          </div>

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
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                />
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
        </div>
      </section>
    </main>
  );
}
