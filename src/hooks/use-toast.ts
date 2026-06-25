"use client";
import { useState, useCallback } from "react";

export interface ToastMessage { id: string; title: string; description?: string; variant?: "default" | "success" | "error"; duration?: number; }

const listeners: Array<(toasts: ToastMessage[]) => void> = [];
let toasts: ToastMessage[] = [];

function dispatch(toast: Omit<ToastMessage, "id">) {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { ...toast, id }];
  listeners.forEach((l) => l(toasts));
  setTimeout(() => { toasts = toasts.filter((t) => t.id !== id); listeners.forEach((l) => l(toasts)); }, toast.duration ?? 3000);
}

export function toast(msg: Omit<ToastMessage, "id">) { dispatch(msg); }

export function useToast() {
  const [currentToasts, setCurrentToasts] = useState<ToastMessage[]>(toasts);
  useState(() => { listeners.push(setCurrentToasts); return () => { const idx = listeners.indexOf(setCurrentToasts); if (idx >= 0) listeners.splice(idx, 1); }; });
  const dismiss = useCallback((id: string) => { toasts = toasts.filter((t) => t.id !== id); listeners.forEach((l) => l(toasts)); }, []);
  return { toasts: currentToasts, toast, dismiss };
}
