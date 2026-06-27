"use client";
import { useEffect } from "react";
import { useProductStore } from "@/store/product-store";
import { useAppointmentStore } from "@/store/appointment-store";

/**
 * Forces Zustand stores to rehydrate from localStorage immediately on mount.
 * Placed in the dashboard layout so all pages always have fresh persisted data.
 */
export function StoreHydrator() {
  useEffect(() => {
    const productState = useProductStore.getState();
    if (!productState.hydrated) {
      useProductStore.persist.rehydrate();
    }
    const apptState = useAppointmentStore.getState();
    if (!apptState.hydrated) {
      useAppointmentStore.persist.rehydrate();
    }
  }, []);

  return null;
}
