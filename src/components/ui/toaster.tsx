"use client";
import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, X, Info } from "lucide-react";
import { useToast, type ToastMessage } from "@/hooks/use-toast";

function ToastItem({ t, onDismiss }: { t: ToastMessage; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const s = setTimeout(() => setVisible(true), 10); return () => clearTimeout(s); }, []);
  const icon = t.variant === "success" ? <CheckCircle size={18} className="text-emerald-600 shrink-0" />
    : t.variant === "error" ? <AlertCircle size={18} className="text-red-500 shrink-0" />
    : <Info size={18} className="text-brand-wine shrink-0" />;
  const bg = t.variant === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800"
    : t.variant === "error" ? "bg-red-50 border-red-200 text-red-800"
    : "bg-white border-gray-200 text-gray-800";
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all duration-300 ${bg} ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">{t.title}</p>
        {t.description && <p className="text-xs mt-0.5 opacity-80">{t.description}</p>}
      </div>
      <button onClick={() => onDismiss(t.id)} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"><X size={14} /></button>
    </div>
  );
}

export function Toaster() {
  const { toasts, dismiss } = useToast();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-20 left-0 right-0 z-[200] flex flex-col gap-2 px-4 pb-2 sm:bottom-6 sm:right-4 sm:left-auto sm:w-96 sm:px-0">
      {toasts.map((t) => <ToastItem key={t.id} t={t} onDismiss={dismiss} />)}
    </div>
  );
}
