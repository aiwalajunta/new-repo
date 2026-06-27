"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MOCK_APPOINTMENTS } from "@/lib/sheets/mock-data";
import type { Appointment } from "@/lib/sheets/schemas";

const STORAGE_KEY = "aditya-textile-appointments";

interface AppointmentStore {
  appointments: Appointment[];
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  addAppointment: (a: Appointment) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
}

export const useAppointmentStore = create<AppointmentStore>()(
  persist(
    (set) => ({
      appointments: [], // start empty — rehydrated from localStorage immediately
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      addAppointment: (a) => set((s) => ({ appointments: [a, ...s.appointments] })),
      updateAppointment: (id, updates) =>
        set((s) => ({
          appointments: s.appointments.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
          ),
        })),
      deleteAppointment: (id) =>
        set((s) => ({ appointments: s.appointments.filter((a) => a.id !== id) })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Only use mock data if localStorage is genuinely empty (very first use)
        if (!state.appointments || state.appointments.length === 0) {
          state.appointments = MOCK_APPOINTMENTS;
        }
        state.hydrated = true;
      },
    }
  )
);
