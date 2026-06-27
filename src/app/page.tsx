"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function RootPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/login");
    } else {
      const role = (session.user as { role?: string }).role;
      if (role === "owner" || role === "staff") {
        router.replace("/dashboard");
      } else {
        router.replace("/browse");
      }
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-ivory">
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-wine text-white text-2xl font-bold shadow-lg animate-pulse">
          AT
        </div>
        <p className="text-sm text-gray-400">Loading Aditya Textile...</p>
      </div>
    </div>
  );
}
