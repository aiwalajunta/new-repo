"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Reservation, CreateReservation } from "@/lib/sheets/schemas";
import { toast } from "./use-toast";

export function useReservations() {
  const qc = useQueryClient();
  const { data: reservations = [], isLoading } = useQuery<Reservation[]>({
    queryKey: ["reservations"],
    queryFn: async () => {
      const res = await fetch("/api/reservations");
      if (!res.ok) return [];
      const data = (await res.json()) as { data: Reservation[] };
      return data.data ?? [];
    },
  });
  const createMutation = useMutation({
    mutationFn: async (data: CreateReservation) => {
      const res = await fetch("/api/reservations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to create reservation");
      return ((await res.json()) as { data: Reservation }).data;
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["reservations"] }); toast({ title: "Reservation confirmed!", description: "We'll notify you when ready.", variant: "success" }); },
    onError: () => toast({ title: "Couldn't create reservation. Try again.", variant: "error" }),
  });
  return { reservations, isLoading, createReservation: createMutation.mutate, isPending: createMutation.isPending };
}
