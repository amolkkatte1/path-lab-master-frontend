"use client";

import { useEffect, useState } from "react";
import { FiClock } from "react-icons/fi";

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function TopbarClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-xs text-slate-100">
      <FiClock className="h-3.5 w-3.5 shrink-0 text-sky-200" />
      <div className="flex flex-col leading-tight">
        <span className="font-medium">{formatTime(now)}</span>
        <span className="text-[10px] text-slate-300">{formatDate(now)}</span>
      </div>
    </div>
  );
}
