import { Badge } from "@/components/ui/badge";
import { getStockStatus } from "@/lib/utils/format";
import { useAppStore } from "@/store/app-store";

export function StockBadge({ stock }: { stock: number }) {
  const language = useAppStore((s) => s.language);
  const status = getStockStatus(stock);
  return <Badge variant={status.variant}>{language === "hi" ? status.labelHi : status.label}</Badge>;
}
