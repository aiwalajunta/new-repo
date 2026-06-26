"use client";
import { useState } from "react";
import { Search, Phone, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_CUSTOMERS } from "@/lib/sheets/mock-data";
import { formatRelativeDate } from "@/lib/utils/format";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const filtered = MOCK_CUSTOMERS.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-gray-900">Customers</h1><p className="text-sm text-gray-500">{MOCK_CUSTOMERS.length} registered</p></div>
        <Button size="sm">Add Customer</Button>
      </div>
      <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><Input placeholder="Search by name or phone..." className="pl-9 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      <div className="space-y-2">{filtered.map((c, i) => (
        <motion.div key={c.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <Card className="hover:shadow-sm transition-shadow"><CardContent className="flex items-center gap-3 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-wine text-white font-semibold text-sm">{c.name.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900">{c.name}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 text-xs text-gray-500"><Phone size={10} /> {c.phone}</span>
                <span className="text-xs text-gray-400">{c.totalVisits} visits</span>
                {c.lastVisitAt && <span className="text-xs text-gray-400">{formatRelativeDate(c.lastVisitAt)}</span>}
              </div>
              {c.notes && <p className="text-xs text-amber-600 mt-0.5 italic truncate">{c.notes}</p>}
            </div>
            <div className="shrink-0"><div className="flex items-center gap-1 text-xs font-medium text-brand-gold"><Star size={11} className="fill-brand-gold" />{c.loyaltyPoints}</div></div>
          </CardContent></Card>
        </motion.div>
      ))}</div>
    </div>
  );
}
