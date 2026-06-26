"use client";
import { Package, AlertTriangle, TrendingDown, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_PRODUCTS } from "@/lib/sheets/mock-data";
import { formatPrice } from "@/lib/utils/format";
import { STOCK_LOW_THRESHOLD, STOCK_CRITICAL_THRESHOLD } from "@/lib/constants";

export default function InventoryPage() {
  const totalValue = MOCK_PRODUCTS.reduce((sum, p) => sum + p.sellingPrice * p.stockTotal, 0);
  const lowStock = MOCK_PRODUCTS.filter((p) => p.stockAvailable > 0 && p.stockAvailable <= STOCK_LOW_THRESHOLD);
  const outOfStock = MOCK_PRODUCTS.filter((p) => p.stockAvailable === 0);

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl font-bold text-gray-900">Inventory</h1><p className="text-sm text-gray-500">Stock overview and alerts</p></div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total Products", value: MOCK_PRODUCTS.length, icon: Package, color: "bg-blue-500" },
          { label: "Low Stock", value: lowStock.length, icon: AlertTriangle, color: "bg-amber-500" },
          { label: "Out of Stock", value: outOfStock.length, icon: TrendingDown, color: "bg-red-500" },
          { label: "Inventory Value", value: formatPrice(totalValue), icon: BarChart3, color: "bg-emerald-600" },
        ].map((m) => (<Card key={m.label}><CardContent className="p-4 flex items-center gap-3"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${m.color}`}><m.icon size={18} className="text-white" /></div><div><p className="text-xs text-gray-500">{m.label}</p><p className="font-bold text-gray-900">{m.value}</p></div></CardContent></Card>))}
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">All Products — Stock Levels</CardTitle></CardHeader>
        <CardContent className="pt-0 space-y-2">
          {MOCK_PRODUCTS.map((p) => {
            const isOut = p.stockAvailable === 0;
            const isCrit = p.stockAvailable > 0 && p.stockAvailable <= STOCK_CRITICAL_THRESHOLD;
            const isLow = p.stockAvailable > 0 && p.stockAvailable <= STOCK_LOW_THRESHOLD;
            return (
              <div key={p.id} className={`flex items-center gap-3 rounded-xl border p-3 ${isOut ? "border-red-200 bg-red-50" : isCrit ? "border-amber-200 bg-amber-50" : "border-gray-100 bg-gray-50"}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">SKU: {p.sku}</span>
                    {p.rackLocation && <span className="text-xs font-medium text-blue-600">Rack {p.rackLocation}</span>}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`text-sm font-bold ${isOut ? "text-red-600" : isCrit ? "text-amber-600" : "text-gray-700"}`}>{isOut ? "OUT" : `${p.stockAvailable} avail`}</p>
                  <p className="text-xs text-gray-400">{p.stockReserved} reserved · {p.stockTotal} total</p>
                </div>
                <div className="w-16 shrink-0">
                  <div className="h-1.5 rounded-full bg-gray-200"><div className={`h-full rounded-full ${isOut ? "w-0" : isCrit ? "bg-red-500" : isLow ? "bg-amber-500" : "bg-green-500"}`} style={{ width: `${Math.min(100, (p.stockAvailable / Math.max(p.stockTotal, 1)) * 100)}%` }} /></div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
