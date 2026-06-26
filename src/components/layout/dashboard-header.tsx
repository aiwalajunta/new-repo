"use client";
import { Bell, Search } from "lucide-react";

export function DashboardHeader() {
  const now = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 pl-16 md:pl-4">
      <p className="text-xs text-gray-400 hidden md:block">{now}</p>
      <div className="flex items-center gap-2 ml-auto">
        <button className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors" aria-label="Search"><Search size={18} /></button>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-wine text-white text-xs font-bold cursor-pointer">A</div>
      </div>
    </header>
  );
}
