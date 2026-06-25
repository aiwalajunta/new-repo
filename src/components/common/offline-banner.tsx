"use client";
import { useEffect } from "react";
import { WifiOff } from "lucide-react";
import { useAppStore } from "@/store/app-store";

export function OfflineBanner() {
  const { isOffline, setIsOffline, language } = useAppStore();
  useEffect(() => {
    const on = () => setIsOffline(false);
    const off = () => setIsOffline(true);
    setIsOffline(!navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, [setIsOffline]);
  if (!isOffline) return null;
  return (
    <div className="sticky top-14 z-30 flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-sm text-amber-800">
      <WifiOff size={16} />
      <span>{language === "hi" ? "आप ऑफ़लाइन हैं। कैश्ड डेटा दिखा रहे हैं।" : "You are offline. Showing cached data."}</span>
    </div>
  );
}
