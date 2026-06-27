"use client";
import { Bell, LogOut, Crown, Wrench } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export function DashboardHeader() {
  const { data: session } = useSession();
  const now = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const name = session?.user?.name ?? "User";
  const role = (session?.user as { role?: string } | undefined)?.role ?? "";
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 pl-16 md:pl-4">
      <div>
        <p className="text-xs text-gray-400 hidden md:block">{now}</p>
        <div className="flex items-center gap-2 md:hidden">
          <span className="text-sm font-medium text-gray-700">{name}</span>
          {role === "owner" && <span className="flex items-center gap-1 rounded-full bg-brand-wine/10 px-2 py-0.5 text-[10px] font-semibold text-brand-wine"><Crown size={10} /> Owner</span>}
          {role === "staff" && <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700"><Wrench size={10} /> Staff</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2">
          <span className="text-sm text-gray-600">{name}</span>
          {role === "owner" && <span className="flex items-center gap-1 rounded-full bg-brand-wine/10 px-2.5 py-1 text-xs font-semibold text-brand-wine"><Crown size={11} /> Owner</span>}
          {role === "staff" && <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"><Wrench size={11} /> Staff</span>}
        </div>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-wine text-white text-xs font-bold">{initials}</div>
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Sign out">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
