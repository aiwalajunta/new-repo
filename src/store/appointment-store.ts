"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MOCK_APPOINTMENTS } from "@/lib/sheets/mock-data";
import type { Appointment } from "@/lib/sheets/schemas";

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
      appointments: MOCK_APPOINTMENTS,
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      addAppointment: (a) => set((s) => ({ appointments: [a, ...s.appointments] })),
      updateAppointment: (id, updates) => set((s) => ({
        appointments: s.appointments.map((a) =>
          a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
        ),
      })),
      deleteAppointment: (id) => set((s) => ({ appointments: s.appointments.filter((a) => a.id !== id) })),
    }),
    {
      name: "aditya-textile-appointments",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => { if (state) state.setHydrated(true); },
    }
  )
);
