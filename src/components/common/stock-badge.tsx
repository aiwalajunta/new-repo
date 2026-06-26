import { Badge } from "@/components/ui/badge";
import { getStockStatus } from "@/lib/utils/format";

export function StockBadge({ stock }: { stock: number }) {
  const status = getStockStatus(stock);
  return <Badge variant={status.variant}>{status.label}</Badge>;
}
