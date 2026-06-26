export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function getStockStatus(stock: number): { label: string; variant: "success" | "warning" | "danger" } {
  if (stock <= 0) return { label: "Out of Stock", variant: "danger" };
  if (stock <= 3) return { label: `Only ${stock} left`, variant: "warning" };
  return { label: "In Stock", variant: "success" };
}

export function calcDiscount(base: number, final: number): number {
  if (base <= 0) return 0;
  return Math.round(((base - final) / base) * 100);
}
