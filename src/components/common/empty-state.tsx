import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps { icon: LucideIcon; title: string; description: string; actionLabel?: string; actionHref?: string; }

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-rose">
        <Icon size={28} className="text-brand-wine" />
      </div>
      <h3 className="mb-2 font-display text-lg font-semibold text-brand-text">{title}</h3>
      <p className="mb-6 max-w-xs text-sm text-brand-text-muted">{description}</p>
      {actionLabel && actionHref && (<Button asChild><Link href={actionHref}>{actionLabel}</Link></Button>)}
    </div>
  );
}
