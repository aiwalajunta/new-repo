"use client";
import { useState } from "react";
import { Users, Search, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/empty-state";
import { formatRelativeDate } from "@/lib/utils/format";

const MOCK_CUSTOMERS = [
  { id: "usr_001", name: "Priya Sharma", phone: "+91 98765 43210", lastLoginAt: new Date(Date.now() - 86400000).toISOString(), reservations: 3, loyaltyPoints: 245 },
  { id: "usr_002", name: "Meena Gupta", phone: "+91 87654 32109", lastLoginAt: new Date(Date.now() - 3 * 86400000).toISOString(), reservations: 1, loyaltyPoints: 80 },
  { id: "usr_003", name: "Asha Patel", phone: "+91 76543 21098", lastLoginAt: new Date(Date.now() - 7 * 86400000).toISOString(), reservations: 5, loyaltyPoints: 510 },
  { id: "usr_004", name: "Sunita Joshi", phone: "+91 65432 10987", lastLoginAt: new Date(Date.now() - 14 * 86400000).toISOString(), reservations: 2, loyaltyPoints: 120 },
];

export default function OwnerCustomersPage() {
  const [search, setSearch] = useState("");
  const filtered = MOCK_CUSTOMERS.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
  return (
    <div className="space-y-5 px-4 py-4 pb-24">
      <div><h1 className="font-display text-2xl font-bold text-brand-text">Customers</h1><p className="text-sm text-brand-text-muted">{MOCK_CUSTOMERS.length} registered</p></div>
      <div className="relative"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-text-light" /><Input placeholder="Search by name or phone..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      <div className="grid grid-cols-3 gap-3 text-center">{[{ label: "Total", value: MOCK_CUSTOMERS.length },{ label: "This week", value: 2 },{ label: "Active", value: 3 }].map(({ label, value }) => (<div key={label} className="rounded-xl border border-brand-border bg-white p-3 shadow-sm"><p className="font-display text-xl font-bold text-brand-wine">{value}</p><p className="text-xs text-brand-text-muted">{label}</p></div>))}</div>
      {filtered.length === 0 ? (<EmptyState icon={Users} title="No customers found" description="No customers match your search" />) : (
        <div className="space-y-2">{filtered.map((customer, i) => {
          const initials = customer.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
          return (<motion.div key={customer.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-3 rounded-2xl border border-brand-border bg-white p-4 shadow-sm">
            <Avatar className="h-11 w-11 shrink-0 border border-brand-border"><AvatarFallback className="text-sm">{initials}</AvatarFallback></Avatar>
            <div className="flex-1 min-w-0"><p className="font-medium text-brand-text">{customer.name}</p><p className="flex items-center gap-1 text-xs text-brand-text-muted"><Phone size={11} /> {customer.phone}</p></div>
            <div className="shrink-0 text-right"><p className="text-xs text-brand-text-muted">{formatRelativeDate(customer.lastLoginAt)}</p><div className="mt-1 flex items-center justify-end gap-1.5"><Badge variant="outline" className="text-[10px]">{customer.reservations} visits</Badge><Badge variant="secondary" className="text-[10px]">⭐ {customer.loyaltyPoints}</Badge></div></div>
          </motion.div>);
        })}</div>
      )}
    </div>
  );
}
