"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/login");
    } else {
      const role = (session.user as { role?: string }).role;
      if (role === "owner") {
        router.replace("/dashboard");
      } else if (role === "staff") {
        router.replace("/dashboard/staff-lookup");
      } else {
        router.replace("/browse");
      }
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-ivory">
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-wine text-white text-2xl font-bold shadow-lg">
          AT
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Loader2 size={16} className="animate-spin" />
          Loading...
        </div>
      </div>
    </div>
  );
}
