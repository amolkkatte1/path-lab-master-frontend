"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type FlashMessageProps = {
  clearKey: string;
  message: string;
  searchParams: Record<string, string | undefined>;
  tone: "success" | "info" | "warning" | "error";
};

const toneClasses = {
  success: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
  info: "border-sky-300/20 bg-sky-400/10 text-sky-100",
  warning: "border-amber-300/20 bg-amber-400/10 text-amber-100",
  error: "border-red-300/20 bg-red-400/10 text-red-100",
} as const;

export function FlashMessage({
  clearKey,
  message,
  searchParams,
  tone,
}: FlashMessageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setVisible(false);

      const nextParams = new URLSearchParams();

      for (const [key, value] of Object.entries(searchParams)) {
        if (key !== clearKey && value) {
          nextParams.set(key, value);
        }
      }

      const nextUrl = nextParams.size > 0 ? `${pathname}?${nextParams.toString()}` : pathname;
      router.replace(nextUrl, { scroll: false });
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [clearKey, pathname, router, searchParams]);

  if (!visible) {
    return null;
  }

  return (
    <div className={`rounded-2xl border p-4 text-sm transition ${toneClasses[tone]}`}>
      {message}
    </div>
  );
}
