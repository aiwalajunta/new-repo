import { BottomNav } from "@/components/layout/bottom-nav";
import { CustomerHeader } from "@/components/layout/customer-header";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <CustomerHeader />
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
