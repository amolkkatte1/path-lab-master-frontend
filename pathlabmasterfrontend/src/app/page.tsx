import Image from "next/image";

import { LoginForm } from "@/app/login-form";
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

          <LoginForm
            hasInvalidCredentials={hasInvalidCredentials}
            hasUnsupportedRole={hasUnsupportedRole}
            hasServerError={hasServerError}
          />
        </div>
      </section>
    </main>
  );
}
